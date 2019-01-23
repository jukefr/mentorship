import { Handler, Context, Callback } from "aws-lambda";
import { inspect } from "util";
import { DynamoDB } from "aws-sdk";
import Ajv from "ajv";
import jwt from "jsonwebtoken";

import User from "./models/User";

const AUTH0_CLIENT_ID = process.env.AUTH0_CLIENT_ID || "";
const AUTH0_CLIENT_PUBLIC_KEY = process.env.AUTH0_CLIENT_PUBLIC_KEY || "";
const USERS_TABLE = process.env.USERS_TABLE || "";
const dynamoDB = new DynamoDB.DocumentClient();
const ajv = new Ajv({ allErrors: true });

const cors = {
  "Access-Control-Allow-Credentials": true,
  "Access-Control-Allow-Origin": "*",
  "Content-Type": "application/json"
};

// Policy helper function
const generatePolicy = (principalId: any, effect: any, resource: any) => {
  const authResponse: any = {};
  authResponse.principalId = principalId;
  if (effect && resource) {
    const policyDocument: any = {};
    policyDocument.Version = "2012-10-17";
    policyDocument.Statement = [];
    const statementOne: any = {};
    statementOne.Action = "execute-api:Invoke";
    statementOne.Effect = effect;
    statementOne.Resource = resource;
    policyDocument.Statement[0] = statementOne;
    authResponse.policyDocument = policyDocument;
  }
  return authResponse;
};

const auth: Handler = (event, context, callback) => {
  console.log("event", event);
  if (!event.authorizationToken) {
    return callback("Unauthorized");
  }

  const tokenParts = event.authorizationToken.split(" ");
  const tokenValue = tokenParts[1];

  if (!(tokenParts[0].toLowerCase() === "bearer" && tokenValue)) {
    // no auth token!
    return callback("Unauthorized");
  }
  const options = {
    audience: AUTH0_CLIENT_ID
  };

  try {
    jwt.verify(
      tokenValue,
      AUTH0_CLIENT_PUBLIC_KEY,
      options,
      (verifyError, decoded) => {
        if (verifyError) {
          console.log("verifyError", verifyError);
          // 401 Unauthorized
          console.log(`Token invalid. ${verifyError}`);
          return callback("Unauthorized");
        }
        // is custom authorizer function
        console.log("valid from customAuthorizer", decoded);
        return callback(
          null,
          // @ts-ignore
          generatePolicy(decoded.sub, "Allow", event.methodArn)
        );
      }
    );
  } catch (err) {
    console.log("catch error. Invalid token", err);
    return callback("Unauthorized");
  }
};

const getUser: Handler = async event => {
  const test = ajv.compile(User);
  const isValid = test(event.queryStringParameters);

  if (!isValid)
    return {
      body: inspect(test.errors),
      statusCode: 500,
      headers: cors
    };

  const params = {
    TableName: USERS_TABLE,
    Key: event.queryStringParameters
  };

  const result = await dynamoDB.get(params).promise();
  return { body: inspect(result), statusCode: 200, headers: cors };
};

const createUser: Handler = async event => {
  const test = ajv.compile(User);
  const isValid = test(JSON.parse(event.body));

  if (!isValid)
    return {
      body: inspect(test.errors),
      statusCode: 500,
      headers: cors
    };

  const params = {
    TableName: USERS_TABLE,
    Item: JSON.parse(event.body)
  };

  const result = await dynamoDB.put(params).promise();
  return {
    statusCode: 200,
    headers: cors,
    body: inspect(result)
  };
};

export { auth, createUser, getUser };

import { Handler, Context, Callback } from "aws-lambda";
import { DynamoDB } from "aws-sdk";
import jwt from "jsonwebtoken";
import middy from "middy";
import { cors, urlEncodeBodyParser, jsonBodyParser } from "middy/middlewares";

const AUTH0_CLIENT_ID = process.env.AUTH0_CLIENT_ID || "";
const AUTH0_CLIENT_PUBLIC_KEY = process.env.AUTH0_CLIENT_PUBLIC_KEY || "";
const USERS_TABLE = process.env.USERS_TABLE || "";
const dynamoDB = new DynamoDB.DocumentClient();

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

let auth: Handler = (event, context, callback) => {
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
auth = middy(auth)
  .use(jsonBodyParser())
  .use(urlEncodeBodyParser())
  .use(cors());

let list: Handler = async (event, _, cb) => {
  const { userId } = event.body;

  if (typeof userId !== "string") {
    throw new Error("userId must be of type string.");
  }

  const params = {
    TableName: USERS_TABLE,
    Key: {
      userId
    }
  };

  await dynamoDB.get(params);
  return cb(null, "works")
};
list = middy(list)
  .use(jsonBodyParser())
  .use(urlEncodeBodyParser())
  .use(cors());

let post: Handler = async event => {
  const { userId, name } = JSON.parse(event.body);

  if (typeof userId !== "string") {
    throw new Error("userId must be of type string.");
  } else if (typeof name !== "string") {
    throw new Error("name must be of type string.");
  }

  const params = {
    TableName: USERS_TABLE,
    Item: {
      userId,
      name
    }
  };

  return dynamoDB.put(params);
};
post = middy(post)
  .use(jsonBodyParser())
  .use(urlEncodeBodyParser())
  .use(cors());

export { auth, post, list };

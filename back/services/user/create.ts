import { inspect } from "util";
import { DynamoDB } from "aws-sdk";
import Ajv from "ajv";

import User from "../../models/User";

const USERS_TABLE = process.env.USERS_TABLE || "";
const dynamoDB = new DynamoDB.DocumentClient();
const ajv = new Ajv({ allErrors: true });

const cors = {
  "Access-Control-Allow-Credentials": true,
  "Access-Control-Allow-Origin": "*",
  "Content-Type": "application/json"
};

export const create = async (event: any) => {
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

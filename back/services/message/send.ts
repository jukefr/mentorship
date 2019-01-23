import { inspect } from "util";
import {v1 as uuid} from "uuid"
import { DynamoDB } from "aws-sdk";
import Ajv from "ajv";

import Message from "../../models/Message";

const MESSAGES_TABLE = process.env.MESSAGES_TABLE || "";
const dynamoDB = new DynamoDB.DocumentClient();
const ajv = new Ajv({ allErrors: true });

const cors = {
  "Access-Control-Allow-Credentials": true,
  "Access-Control-Allow-Origin": "*",
  "Content-Type": "application/json"
};

export const send = async (event: any) => {
  const test = ajv.compile(Message);
  const isValid = test(JSON.parse(event.body));

  if (!isValid)
    return {
      body: inspect(test.errors),
      statusCode: 500,
      headers: cors
    };

  const params = {
    TableName: MESSAGES_TABLE,
    Item: {
      ...JSON.parse(event.body),
      id: uuid()
    }
  };

  const result = await dynamoDB.put(params).promise();
  return {
    statusCode: 200,
    headers: cors,
    body: inspect(result)
  };
};

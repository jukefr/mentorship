"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("util");
const aws_sdk_1 = require("aws-sdk");
const ajv_1 = __importDefault(require("ajv"));
const Message_1 = __importDefault(require("../../models/Message"));
const MESSAGES_TABLE = process.env.MESSAGES_TABLE || "";
const dynamoDB = new aws_sdk_1.DynamoDB.DocumentClient();
const ajv = new ajv_1.default({ allErrors: true });
const cors = {
    "Access-Control-Allow-Credentials": true,
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json"
};
exports.send = (event) => __awaiter(this, void 0, void 0, function* () {
    const test = ajv.compile(Message_1.default);
    const isValid = test(JSON.parse(event.body));
    if (!isValid)
        return {
            body: util_1.inspect(test.errors),
            statusCode: 500,
            headers: cors
        };
    const params = {
        TableName: MESSAGES_TABLE,
        Item: JSON.parse(event.body)
    };
    const result = yield dynamoDB.put(params).promise();
    return {
        statusCode: 200,
        headers: cors,
        body: util_1.inspect(result)
    };
});

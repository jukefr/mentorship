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
const aws_sdk_1 = require("aws-sdk");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const AUTH0_CLIENT_ID = process.env.AUTH0_CLIENT_ID || "";
const AUTH0_CLIENT_PUBLIC_KEY = process.env.AUTH0_CLIENT_PUBLIC_KEY || "";
const USERS_TABLE = process.env.USERS_TABLE || "";
const dynamoDB = new aws_sdk_1.DynamoDB.DocumentClient();
const cors = {
    "Access-Control-Allow-Credentials": true,
    "Access-Control-Allow-Origin": "*"
};
// Policy helper function
const generatePolicy = (principalId, effect, resource) => {
    const authResponse = {};
    authResponse.principalId = principalId;
    if (effect && resource) {
        const policyDocument = {};
        policyDocument.Version = "2012-10-17";
        policyDocument.Statement = [];
        const statementOne = {};
        statementOne.Action = "execute-api:Invoke";
        statementOne.Effect = effect;
        statementOne.Resource = resource;
        policyDocument.Statement[0] = statementOne;
        authResponse.policyDocument = policyDocument;
    }
    return authResponse;
};
const auth = (event, context, callback) => {
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
        jsonwebtoken_1.default.verify(tokenValue, AUTH0_CLIENT_PUBLIC_KEY, options, (verifyError, decoded) => {
            if (verifyError) {
                console.log("verifyError", verifyError);
                // 401 Unauthorized
                console.log(`Token invalid. ${verifyError}`);
                return callback("Unauthorized");
            }
            // is custom authorizer function
            console.log("valid from customAuthorizer", decoded);
            return callback(null, 
            // @ts-ignore
            generatePolicy(decoded.sub, "Allow", event.methodArn));
        });
    }
    catch (err) {
        console.log("catch error. Invalid token", err);
        return callback("Unauthorized");
    }
};
exports.auth = auth;
const list = (event) => __awaiter(this, void 0, void 0, function* () {
    const { userId } = event.body;
    if (typeof userId !== "string") {
        return { body: "userId must be of type string", statusCode: 500, headers: cors };
    }
    const params = {
        TableName: USERS_TABLE,
        Key: {
            userId
        }
    };
    const result = yield dynamoDB.get(params);
    return { body: result, statusCode: 200, headers: cors };
});
exports.list = list;
const post = (event) => __awaiter(this, void 0, void 0, function* () {
    const { userId, name } = JSON.parse(event.body);
    if (typeof userId !== "string") {
        return { body: "userId must be of type string", statusCode: 500, headers: cors };
    }
    else if (typeof name !== "string") {
        return { body: "name must be of type string", statusCode: 500, headers: cors };
    }
    const params = {
        TableName: USERS_TABLE,
        Item: {
            userId,
            name
        }
    };
    yield dynamoDB.put(params);
    return {
        statusCode: 200,
        headers: cors,
        body: {
            userId: userId,
            name: name
        }
    };
});
exports.post = post;

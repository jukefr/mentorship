import jwt from "jsonwebtoken";

const AUTH0_CLIENT_ID = process.env.AUTH0_CLIENT_ID || "";
const AUTH0_CLIENT_PUBLIC_KEY = process.env.AUTH0_CLIENT_PUBLIC_KEY || "";

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

export const auth = (event:any, context:any, callback:any) => {
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


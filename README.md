# mentorship
a platform for blooming developers who seek mentorship to up their carreer

** VERY EARLY STAGE, NOTHING IS DONE YET APPART FROM BASE INFRASTRUCTURE **

## infrastructure
- **API** : Serverless microservices, with DynamoDB, Auth0 JWT, deployed to AWS Lambda with API Gateway
- **frontend** : Next.js SPA, Auth0, deployed to Github Pages


## development
1. you will need to create a `secrets.json` file at the root of the project :
```json
{
  "AUTH0_CLIENT_ID": "xxxxxxx"
}
```
2. you will need to download your auth0 `public key` as `.pem` and save it at the root of the project as `public_key.pem`
3. you will need to create a `config.json` file in the `docs/` folder (for the frontend configuration) :
```json
{
  "AUTH0_CLIENT_ID": "xxxxxxx",
  "AUTH0_CLIENT_DOMAIN": "xxxxxxx.xx.auth0.com"
}
```

## deployment
- **API**: manually for now
- **frontend**: Github Actions worklow (coming very soon)


## contributing
This is very early WIP so please wait a bit to contribute.

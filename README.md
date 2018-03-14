# GranCentral MVP Client

This web app uses [AWS Amplify](https://github.com/aws/aws-amplify) to access the AWS Mobile Hub project [grancentral-mvp](https://console.aws.amazon.com/mobilehub/home?region=us-east-2#/4eb8b899-bc2c-44b5-b8b7-f925fd26e269/build) and the AppSync project [GranCentral MVP](https://us-east-2.console.aws.amazon.com/appsync/home?region=us-east-2#/z6ilk6cmyrbinh4sbax7acdqjq/v1/home).

## Authentication

The AppSync API requires Cognito User Pool authentication,
and although the User Pool defined by Mobile Hub supports federated login,
AWS Amplify does not. Please use the Sign Up feature of AWS Amplify to define
a user for yourself in the User Pool.

## Schema

Please review the schema in the AppSync project.

## To-do
- Support federated logins to the user pool
  - Requires waiting for [AWS Amplify support](https://github.com/aws/aws-amplify/issues/45)
  - May also require freeing our stack from MobileHub's constraints,
    which would suggest moving to CloudFormation for sanity's sake.
- AppSync project
  - Add business rules for queries and mutations
  - Add subscription support
  - Pull the API definition out of the console, and into a GitHub project

## Build

- Use `awsmobile pull` (`npm install -g awsmobile-cli`) to download `src/aws-exports.js`.
- Use the AppSync console (link above) to download the `AppSync.js` file to `src` also.
- Use `yarn install; yarn start` to run locally.

## Publish

- Use `awsmobile publish -f` to push the client to Cloudfront.

## React reference

This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app).

You can find the most recent version of the React guide [here](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md).

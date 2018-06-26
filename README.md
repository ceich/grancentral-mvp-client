# GranCentral MVP Client

This web app uses [AWS Amplify](https://github.com/aws/aws-amplify) to access
the AWS Mobile Hub project [grancentral-mvp](https://console.aws.amazon.com/mobilehub/home?region=us-east-2#/4eb8b899-bc2c-44b5-b8b7-f925fd26e269/build) and
the AppSync project [GranCentral MVP](https://us-east-2.console.aws.amazon.com/appsync/home?region=us-east-2#/z6ilk6cmyrbinh4sbax7acdqjq/v1/home)
(if you don't see this project when you click the link,
make sure you've selected the **us-east-2 Ohio** region in the upper right of the AWS page).

## Authentication

The AppSync API requires Cognito User Pool authentication,
and AWS Amplify supports federated login,
using Facebook, Google or Amazon as identity providers.
The app must use the Cognito [hosted login UI](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-app-integration.html) to create a User Pool entry; app-side federated login creates only an [identity pool](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-identity.html) entry which is not persistent.

### Relation between Cognito User Pool and DynamoDB UserTable

Signing *up*, or federated login, creates a user in the Cognito *User Pool*.
When a user signs *in*,
there are three possible states of DynamoDB's *UserTable*:
1. First sign-in by a brand-new user: no item exists in UserTable
   with either an `id` matching the Cognito `sub`, or a matching `email`.
1. First sign-in by an invited user, or by a previously-signed-in user
   who changed User Pool `sub` value while retaining the same email
   (e.g. by changing social identity providers):
   no item has a matching `id`, but an item exists with a matching `email`.
1. Subsequent sign-ins:
   an item exists whose `id` matches the User Pool `sub` attribute.

An account owner can invite additional users by providing name and email for each.
Again there are three possibilities:
1. There is no user in the UserTable with that email.
1. The user with that email has already been invited,
but has not yet signed in.
1. The user with that email has already signed in.

To handle all these cases uniformly,
the app calls the `findOrCreateUser` mutation,
passing as the `id` either the Cognito `sub` (at sign-in)
or the email address (when inviting users).
The mutation creates a User if necessary,
else updates it if necessary,
and in all cases returns it.

## Schema

Please review the schema in the AppSync project.

## To-do
- AppSync project
  - Add business rules for queries and mutations,
    including referential integrity and access control
  - Add subscription support
  - Pull the API definition out of this repo, and into its own repo
    (built via CloudFormation, perhaps)

## Build

- Use `yarn; yarn start` to run locally.

## Publish

- Use `awsmobile publish -f` to push the client to Cloudfront.

## React reference

This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app).

You can find the most recent version of the React guide [here](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md).

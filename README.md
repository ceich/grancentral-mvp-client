# GranCentral MVP Client

## Architecture

This web app uses [AWS Amplify SDK](https://github.com/aws-amplify/amplify-js)
to access the AWS Mobile Hub project [grancentral-mvp-2018-06-13](https://console.aws.amazon.com/mobilehub/home?region=us-west-2#/3bfcbdb3-45fc-4cf9-a3f2-8ec61282ed89/build) and
the AppSync API [GranCentral MVP](https://us-west-2.console.aws.amazon.com/appsync/home?region=us-west-2#/eqsy3qtavnhuxkwcnvunhwzvyq/v1/home)
(if you don't see this project when you click the link,
make sure you've selected the **us-west-2 Oregon** region
in the upper right of the AWS page).

## Authentication

The AppSync API requires Cognito User Pool authentication,
and AWS Amplify supports federated login,
using Facebook, Google or Amazon as identity providers.
The app must use the Cognito [hosted login UI](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-app-integration.html) to create a User Pool entry; app-local federated login creates only an [identity pool](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-identity.html) entry, which is not persistent.

The Cognito hosted login screens are defined by settings in the User Pool.
The UI was customized in two ways:
- Logo: `hosted-logo.jpg` (in this folder)
- Banner background color: white

### Relation between Cognito User Pool and DynamoDB UserTable

Signing *up*, or federated login, creates a user in the Cognito *User Pool*.
When a user signs *in*,
there are three possible states of DynamoDB's *UserTable*:
1. First sign-in by a brand-new user: no item exists in UserTable
   with either an `id` matching the Cognito `sub`, or a matching `email`.
1. First sign-in by an invited user:
   no item has a matching `id`, but an item exists with a matching `email`.
   - Note, that this case also occurs when a previously-signed-in user
     changes social identity providers, thus changing User Pool `sub`
     value while retaining the same email. Ignore this for now....
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

Please review the schema in the `awsmobilejs/backend/appsync` folder.

## Files in S3
Files in S3 need to be organized by key, using the following conventions.
For now, all files will be under the `public` storage level;
even though they are unprotected against modification by other users,
the use of a UUID prefix will keep them separated.

See the [AWS demo app](https://github.com/aws-samples/aws-amplify-graphql)
for sample code that uploads and downloads photos.
Note that the Appsync SDK handles upload automatically for
variables matching the S3ObjectInput signature,
but download must be done in application code.

### User Avatar and Photo Album
The app sets a prop `s3Opts` with `bucket` and `region` fields
on all children.
For example:
```
# App.js
  import aws_exports from './aws-exports';
  ...
  s3Opts = {
    bucket: aws_exports.aws_user_files_s3_bucket,
    region: aws_exports.aws_user_files_s3_bucket_region
  }
  ...
  <Component s3Opts={...s3Opts} ... />

# Component.js
  // Use the prop to build S3ObjectInput variables
  const s3ObjectInput = {
    ...this.props.s3Opts,
    key: name,
    imageUri: file,
    mimeType: type
  }
```
The `key` should be `level/prefix/name`, with the following meaning:
- Level: `"public"` (this corresponds to Amplify's default storage level)
- Prefix: `user.id`
- Name: _basename of the original file_

The `localUri` and `mimeType` fields come from the selected file.

### Elder Name Pronunciation

TBD

### Event Media

Created by elder tablet app; bucket, key and region TBD.

## To-do
- AppSync API
  - Add business rules for queries and mutations,
    including referential integrity and access control
  - Add subscription support for changes to accounts and new events
  - Use [amplify-cli](https://github.com/aws-amplify/amplify-cli)
    to define the API in this repo and build it via CloudFormation;
    `amplify-cli` was released on 2018-08-27 and needs to mature.

## Development

- Use `yarn` to install packages, not `npm`.
- Use `env HTTPS=true yarn start` to run locally. You'll have to
acknowledge the browser's complaints about the unsafe certificate.

## Publish

- Use `awsmobile publish -f` to publish the client to S3,
which is the source for a CloudFront distribution that serves
https://app.grancentral.ai.
This also opens a browser directly to the S3 hosting bucket,
but that uses HTTP and is not compatible with the hosted auth,
so you'll see an error.
- To force an update of the CF distribution:
  - Use the CloudFront console to create a new invalidation for `index.html`
  - Wait a few minutes for the new code to appear at the above URL.

## React reference

This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app).

You can find the most recent version of the React guide [here](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md).

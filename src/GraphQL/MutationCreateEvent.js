import gql from "graphql-tag";

export default gql(`
mutation($accountId: ID! $text: String $userId: ID! $media:S3ObjectInput) {
  createEvent(
    input: {
      accountId: $accountId
      text: $text
      userId: $userId
      media: $media
    }
  ) {
    event {
      id
      accountId
      userId
      text
      createdAt
      media {
        bucket
        region
        key
      }
    }
  }
}`);
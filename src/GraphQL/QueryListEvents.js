import gql from "graphql-tag";

/*
  type Event {
    accountId: ID!
    createdAt: String!
    id: ID!
    text: String
    userId: ID
    referenceId: ID
    media: S3Object
  }
  listEvents(accountId: ID!, limit: Int, nextToken: String): EventConnection


*/

export default gql(`
query($accountId: ID!) {
  listEvents(
    accountId: $accountId
  ) {
    items {
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
import gql from "graphql-tag";

export default gql(`
mutation($accountId: ID! $userId: ID!) {
  deleteMember(
    input: {
      accountId: $accountId
      userId: $userId
    }
  ) {
    member {
      account { id }
      user { id }
      role
    }
  }
}`);

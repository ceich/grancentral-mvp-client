import gql from "graphql-tag";

export default gql(`
mutation($accountId: ID! $userId: ID! $role: String!) {
  createMember(
    input: {
      accountId: $accountId
      userId: $userId
      role: $role
    }
  ) {
    member {
      account { id }
      user { id name email }
      role
    }
  }
}`);

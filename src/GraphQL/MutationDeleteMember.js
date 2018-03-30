import gql from "graphql-tag";

export default gql(`
mutation($account_id: ID! $user_id: ID!) {
  deleteMember(
    input: {
      account_id: $account_id
      user_id: $user_id
    }
  ) {
    account { id }
    user { id }
    role
  }
}`);

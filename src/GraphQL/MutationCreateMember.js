import gql from "graphql-tag";

export default gql(`
mutation($account_id: ID! $user_id: ID! $role: Role!) {
  createMember(
    input: {
      account_id: $account_id
      user_id: $user_id
      role: $role
    }
  ) {
    account { id }
    user { id name email }
    role
  }
}`);

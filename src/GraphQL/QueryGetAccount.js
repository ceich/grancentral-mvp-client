import gql from "graphql-tag";

export default gql(`
query($id: ID!) {
  getAccount(
    id: $id
  ) {
    id
    created_at
    name
    members {
      role
      account { id }
      user {
        id
        name
        email
      }
    }
  }
}`);

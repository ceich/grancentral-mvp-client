import gql from "graphql-tag";

export default gql(`
query($id: ID!) {
  getAccount(
    id: $id
  ) {
    id
    createdAt
    name
    members {
      role
      user {
        id
        name
        email
      }
    }
  }
}`);

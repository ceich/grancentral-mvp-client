import gql from "graphql-tag";

export default gql(`
mutation UpdateUser($id: ID! $name: String!) {
  updateUser(
    input: {
      id: $id
      name: $name
    }
  ) {
    user {
      id
      name
      email
    }
  }
}`);

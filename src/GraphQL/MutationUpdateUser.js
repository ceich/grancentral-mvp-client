import gql from "graphql-tag";

export default gql(`
mutation UpdateUser($id: ID! $name: String! $avatar: String) {
  updateUser(
    input: {
      id: $id
      name: $name
      avatar: $avatar
    }
  ) {
    id
    name
    email
    avatar
  }
}`);

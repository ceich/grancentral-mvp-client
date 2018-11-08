import gql from "graphql-tag";

export default gql(`
mutation UpdateUser($id: ID! $name: String! $avatar: S3ObjectInput) {
  updateUser(
    input: {
      id: $id
      name: $name
      avatar: $avatar
    }
  ) {
    user {
      id
      name
      avatar { region bucket key }
    }
  }
}`);

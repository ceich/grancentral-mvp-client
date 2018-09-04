import gql from "graphql-tag";

export default gql(`
mutation($name: String! $ownerId: ID!) {
  createAccount(
    input: {
      name: $name
      ownerId: $ownerId
    }
  ) {
    account {
      id
      createdAt
      name
      members { role user { id } }
    }
  }
}`);

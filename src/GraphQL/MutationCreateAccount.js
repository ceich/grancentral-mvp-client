import gql from "graphql-tag";

export default gql(`
mutation($name: String! $owner_id: ID!) {
  createAccount(
    input: {
      name: $name
      owner_id: $owner_id
    }
  ) {
    id
    created_at
    name
    members { role user { id } }
  }
}`);

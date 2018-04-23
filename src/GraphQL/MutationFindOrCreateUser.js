import gql from "graphql-tag";

export default gql(`
mutation FindOrCreateUser($id: ID! $name: String! $email: String!) {
  findOrCreateUser(
    input: {
      id: $id
      name: $name
      email: $email    
    }
  ) {
    id
    name
    email
    avatar
  }
}`);

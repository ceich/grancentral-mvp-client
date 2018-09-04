import gql from "graphql-tag";

export default gql(`
mutation FindOrCreateUser($id: ID! $name: String! $email: AWSEmail!) {
  findOrCreateUser(
    input: {
      id: $id
      name: $name
      email: $email    
    }
  ) {
    user {
      id
      name
      email
    }
  }
}`);

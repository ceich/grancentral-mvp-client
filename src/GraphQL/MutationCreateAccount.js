import gql from "graphql-tag";

export default gql(`
mutation($name: String! $ownerId: ID! $role:String! $birthday:AWSDate!) {
  createAccount(
    input: {
      name: $name
      ownerId: $ownerId
      role: $role
      elders: [ { name: $name birthday: $birthday } ]
    }
  ) {
    account {
      id
      createdAt
      name
      ownerId
      elders { name birthday }
      members { role user { id } }
    }
  }
}`);

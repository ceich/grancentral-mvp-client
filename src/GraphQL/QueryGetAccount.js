import gql from "graphql-tag";

export default gql(`
query($id: ID!) {
  getAccount(
    id: $id
  ) {
    id
    createdAt
    name
    ownerId
    members {
      role
      user {
        id
        name
        avatar { key bucket region }
      }
    }
  }
}`);

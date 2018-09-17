import gql from "graphql-tag";

export default gql(`
query MeTrial {
  me {
    id
    name
    members {
      role
      account {
        id
        name
        createdAt
      }
    }
  }
}`);

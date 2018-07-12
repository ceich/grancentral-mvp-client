import gql from "graphql-tag";

export default gql(`
query Signin {
  me {
    id
    name
    avatar
    members {
      role
      account { id }
    }
  }
}`);

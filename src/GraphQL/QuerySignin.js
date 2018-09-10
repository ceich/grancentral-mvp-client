import gql from "graphql-tag";

export default gql(`
query Signin {
  me {
    id
    name
    #avatar { region bucket key }
    members {
      role
      account { id }
    }
  }
}`);

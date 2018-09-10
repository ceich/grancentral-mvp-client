import gql from "graphql-tag";

export default gql(`
query Me {
  me {
    id
    name
    #email
    #avatar
  }
}`);

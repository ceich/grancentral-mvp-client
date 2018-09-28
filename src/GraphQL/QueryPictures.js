import gql from "graphql-tag";

export default gql(`
query Pictures {
  me {
    id
    pictures { region bucket key }
  }
}`);

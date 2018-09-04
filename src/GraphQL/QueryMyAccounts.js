import gql from "graphql-tag";

export default gql(`
query MyAccounts {
  me {
    id
    members {
			role
      account {
        id
        createdAt
        name
        members {
          role
        }
      }
    }
  }
}`);

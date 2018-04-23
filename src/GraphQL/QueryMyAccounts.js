import gql from "graphql-tag";

export default gql(`
query MyAccounts {
  me {
    id
    members {
			role
      account {
        id
        created_at
        name
        members {
          role
        }
      }
    }
  }
}`);

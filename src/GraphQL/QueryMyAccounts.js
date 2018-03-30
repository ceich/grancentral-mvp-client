import gql from "graphql-tag";

export default gql(`
query MyAccounts {
  me {
    members {
			role
      account {
        id
        created_at
        name
        members {
          user { id name email }
          role
        }
      }
    }
  }
}`);

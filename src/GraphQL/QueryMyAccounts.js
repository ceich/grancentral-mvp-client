import gql from "graphql-tag";

export default gql(`
query MyAccounts {
  me {
    id
    name
    avatar { key bucket region }
    members {
			role
      account {
        id
        createdAt
        name
        elders { name birthday }
        members {
          role
        }
      }
    }
  }
}`);

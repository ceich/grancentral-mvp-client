import gql from "graphql-tag";

export default gql(`
mutation FindOrCreateUser($id: ID! $name: String! $email: AWSEmail!) {
  findOrCreateUser(
    input: {
      id: $id
      name: $name
      email: $email    
    }
  ) {
    user {
      id
      name
      email
      avatar { key bucket region }
      members {
  			role
        account {
          id
          createdAt
          name
          ownerId
          elders { name birthday }
          album { region bucket key }
          members {
            role
            user { id name email avatar { region bucket key } }
          }
        }
      }
    }
  }
}`);

import gql from "graphql-tag";

export default gql(`
mutation UpdatePictures($id: ID! $pictures: [S3ObjectInput!]) {
  updateUser(
    input: {
      id: $id
      pictures: $pictures
    }
  ) {
    user {
      id
      pictures { region bucket key }
    }
  }
}`);

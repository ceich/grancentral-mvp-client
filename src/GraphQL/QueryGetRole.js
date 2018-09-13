import gql from "graphql-tag";

export default gql(`
query enumValuesOfRoles {
  __type(name: "Role") {
    name
    enumValues {
      name
    }
  }
}`);

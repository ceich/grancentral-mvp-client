import React from "react";
import { Query } from "react-apollo";

class RelationshipToElderDropdown extends React.Component {
  render() {
      const {queryProps, onChange} = this.props;

      return (
        <Query query={queryProps}>
          {
            ({ data, loading, error }) => {
              if(loading) {
                return('loading');
              } else if(error) {
                console.log('error : ' + JSON.stringify(error));
                return('error');
              } else {
                const { __type } = data;
                //console.log('Role : ' + JSON.stringify(__type));
                //console.log('name : ' + JSON.stringify(data.__type.enumValues[0].name));
                //console.log('trial : ' + __type.name);

                return(
                  <div>
                    <select placeholder="Relationship to Elder" id="relationship" onChange={(event) => onChange(event)}>
                      <option></option>
                      {
                        __type.enumValues.map((mydata) =>
                          <option key={mydata.name}>
                            {mydata.name}
                          </option>
                        )
                      }
                    </select>
                  </div>
                );
              }
            }
          }
        </Query>
      );
  }
}

export default RelationshipToElderDropdown;
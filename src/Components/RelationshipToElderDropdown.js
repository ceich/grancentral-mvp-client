import React from "react";
import { Query } from "react-apollo";

class RelationshipToElderDropdown extends React.Component {
  render() {
      const {queryProps, onChange, valueSelect, valueRoleOther} = this.props;

      return (
        <Query query={queryProps} >
          {
            ({ data, loading, error }) => {
              if(loading || !data.__type || data === null) {
                return('loading');
              } else if(error) {
                return('error');
              } else {
                const { __type } = data;

                return(
                  <div>
                    <select placeholder="please select" id="relationship" value={valueSelect} onChange={(event) => onChange('role', event)}>
                      <option>please select</option>
                      {
                        __type.enumValues.map((mydata) =>{
                            return(
                              <option key={mydata.name} value={mydata.name}>
                                {mydata.name.toLowerCase().replace(/_/g, "-")}
                              </option>
                            );
                          }
                        )
                      }
                    </select>
                    {
                    (valueSelect === 'OTHER') ?
                        <input placeholder="Role" type="text" id="roleOther" value={valueRoleOther} onChange={(event) => onChange('roleOther', event)}/> :
                        ''
                    }
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
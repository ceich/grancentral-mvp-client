import React from "react";
import { Query } from "react-apollo";

class RelationshipToElderDropdown extends React.Component {
  render() {
      const {queryProps, onChange, valueSelect, valueRoleOther} = this.props;
      console.log('RelationshipToElderDropdown got called');

      return (
        <Query query={queryProps} >
          {
            ({ data, loading, error }) => {
              if(loading || !data.__type || data === null) {
                console.log('loading');
                return('loading');
              } else if(error) {
                console.log('error : ' + JSON.stringify(error));
                return('error');
              } else {
                const { __type } = data;
                //console.log('Data : ' + JSON.stringify(data));
                //console.log('Role : ' + JSON.stringify(__type));
                //console.log('name : ' + JSON.stringify(data.__type.enumValues[0].name));
                //console.log('trial : ' + __type.name);

                /*
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
                */

                return(
                  <div>
                    <select placeholder="please select" id="relationship" value={valueSelect} onChange={(event) => onChange('role', event)}>
                      <option>please select</option>
                      {
                        __type.enumValues.map((mydata) =>{
                            //console.log('key : ' + mydata.name);
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
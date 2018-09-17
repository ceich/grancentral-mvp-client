import React, {Component} from "react";
import {graphql} from "react-apollo";
import { Query, Mutation } from "react-apollo";

import QueryGetAccounts from "../GraphQL/QueryGetAccount";
import QueryMyAccounts from "../GraphQL/QueryMyAccounts";
import MutationDeleteMember from "../GraphQL/MutationDeleteMember";
import QueryTrial from "../GraphQL/QueryTrial";




class Devtrial extends React.Component{
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    /*
    const {deleteMember, result} = this.props;

    const input = {
      accountId: '2f22667f-56e3-4c88-b116-542bca8ab0d3',
      userId: '75405c2a-a5ec-49f1-baf4-bf6a521077ba'
    }

    deleteMember({
      variables: input
    });
    */
  }

  render() {

    //<Query query={QueryTrial} variables={{ id : 'a14a91fd-e492-446b-9bb2-a91575af3f99' }}>

    return(
      <Query query={QueryMyAccounts}>
      {
        ({ data, loading, error }) => {
          if(loading) {
            return('loading');
          } else if(error) {
            console.log('error : ' + JSON.stringify(error));
            return('error');
          } else {
            //console.log('data : ' + );
            var jsonstr = JSON.stringify(data, null, 4);
            return(
              <div id="jsonwriter">
                query succeed...
                <pre id="json">
                {
                  jsonstr
                  //document.getElementById("json").innerHTML = (jsonstr) ? jsonstr : ''
                }
                </pre>
              </div>
            );
          }
        }
      }
      </Query>
    );
  }
}


const AppWithMutation = () => (

      <Mutation mutation={MutationDeleteMember}>
        {
          (deleteMember, result) => (
            <Devtrial deleteMember={deleteMember} result={result}/>
          )
        }
      </Mutation>

);


export default Devtrial;


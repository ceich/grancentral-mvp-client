import React, {Component} from "react";
import {graphql} from "react-apollo";
import { Query, Mutation } from "react-apollo";

import QueryGetAccounts from "../GraphQL/QueryGetAccount";
import QueryMyAccounts from "../GraphQL/QueryMyAccounts";
import QueryTrial from "../GraphQL/QueryTrial";




class Devtrial extends React.Component{
  constructor(props) {
    super(props);
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
            console.log('data : ' + JSON.stringify(data, null, 4));
            return('query succeed...');
          }
        }
      }
      </Query>
    );
  }
}


export default Devtrial;


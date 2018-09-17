import React, { Component } from "react";
import { graphql } from "react-apollo";
import { Link } from "react-router-dom";

import moment from 'moment';

import QueryGetAccount from "../GraphQL/QueryGetAccount";
import AccountMembers from "./AccountMembers";

class ViewAccount extends Component {
  render() {
    const { account, loading } = this.props;
    console.log('viewaccount.render');

    //console.log('account : ' + JSON.stringify(account, null, 4));
    console.log('loading on viewaccount : ' + JSON.stringify(loading, null, 4));


    return (
      <div>
        <div className={`ui container raised very padded segment backToAcc ${loading ? 'loading' : ''}`}>
          <Link to="/" className="ui button">Back to accounts</Link>
        </div>
        <div className={`ui container raised very padded segment`}>
          {account && <div className="content">
            <h1 className="ui header">{account.name}'s Caring Circle</h1>
            <div className="extra">
              <AccountMembers accountId={account.id} members={account.members} />
            </div>
          </div>}

        </div>
      </div>
    );
  }
}

export default graphql(QueryGetAccount, {
  options: ({ match: { params: { id } } }) => {
    return ({
      variables: { id },
      fetchPolicy: 'cache-and-network'
    })
  },
  props: ({ data: { getAccount: account }, loading }) => ({account, loading})
},)(ViewAccount);

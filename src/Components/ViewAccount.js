import React, { Component } from "react";
import { graphql } from "react-apollo";
import { Link } from "react-router-dom";

import moment from 'moment';

import QueryGetAccount from "../GraphQL/QueryGetAccount";
import AccountMembers from "./AccountMembers";

class ViewAccount extends Component {
  render() {
    const { account, loading } = this.props;

    return (
      <div className={`ui container raised very padded segment ${loading ? 'loading' : ''}`}>
        <Link to="/" className="ui button">Back to accounts</Link>
        <div className="ui items">
          <div className="item">
            {account && <div className="content">
              <div className="header">{account.name}</div>
              <div className="extra">
                <i className="icon calendar"></i>
                Created: {moment(account.createdAt, 'x').format('l LTS')}
              </div>
              <div className="card blue">
                <Link to={"/account/"+account.id+"/member/new"} className="new-member content center aligned">
                  <i className="icon add massive"></i>
                  <p>Create a new member</p>
                </Link>
              </div>
              <div className="extra">
                <AccountMembers accountId={account.id} members={account.members} />
              </div>
            </div>}
          </div>
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

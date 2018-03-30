import React, { Component } from "react";
import { Link } from "react-router-dom";
import { graphql, compose } from "react-apollo";
import "semantic-ui-css/semantic.min.css";

import QueryMyAccounts from "../GraphQL/QueryMyAccounts";

import moment from "moment";

class MyAccounts extends Component {
  static defaultProps = {
    accounts: [],
    deleteAccount: () => null
  }

  async handleDeleteClick(account, e) {
    e.preventDefault();

    if (window.confirm(`Are you sure you want to delete account ${account.name}`)) {
      const {deleteAccount} = this.props;

      await deleteAccount(account);
    }
  }

  renderAccount = (account) => (
    <Link to={`/account/${account.id}`} className="card" key={account.id}>
      <div className="content">
        <div className="header">{account.name}</div>
      </div>
      <div className="content">
        <p>
          <i className="icon calendar"></i>
          {moment(account.created_at, 'x').format('l LTS')}
        </p>
      </div>
      <div className="content">
        <div className="description">
          <i className="icon info circle"></i>Member count: {account.members.length}</div>
      </div>
      {/* {account.mutable && account.members.length===0 &&
      <button className="ui bottom attached button" onClick={this.handleDeleteClick.bind(this, account)}>
        <i className="trash icon"></i>
        Delete
      </button>} */}
    </Link>
  );

  render() {
    const {accounts} = this.props;

    return (
      <div className="ui link cards">
        <div className="card blue">
          <Link to="/account/new" className="new-account content center aligned">
            <i className="icon add massive"></i>
            <p>Create new account</p>
          </Link>
        </div>
        {accounts.map(this.renderAccount)}
      </div>
    );
  }

}

export default compose(
  graphql(QueryMyAccounts, {
    alias: 'QueryMyAccounts',
    options: { fetchPolicy: 'cache-and-network' },
    props: ({ data: { me = { members: [] } } }) => {
      return ({
        accounts: me.members.map((m) =>
          Object.assign({}, m.account, { mutable: m.role==='owner' })
        )
      })
    }
  }),
)(MyAccounts);

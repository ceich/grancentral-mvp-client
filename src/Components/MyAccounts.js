import React, { Component } from "react";
import { Link } from "react-router-dom";
import { Query } from "react-apollo";
import "semantic-ui-css/semantic.min.css";

import S3Photo from "./S3Photo";
import QueryMyAccounts from "../GraphQL/QueryMyAccounts";

import moment from "moment";
import heart from './../heart.svg';

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
          {moment(account.createdAt, 'x').format('l LTS')}
        </p>
      </div>
      <div className="content">
        <div className="description">
          <i className="icon info circle"></i>Member count: {account.members ? account.members.length : 0}</div>
      </div>
      {/* {account.mutable && account.members.length===0 &&
      <button className="ui bottom attached button" onClick={this.handleDeleteClick.bind(this, account)}>
        <i className="trash icon"></i>
        Delete
      </button>} */}
    </Link>
  );

  render() {
    const { accounts, me } = this.props;

    return (
      <div>
        <header className="App-header">
          <img className="App-logo" src={heart} alt="heart" />
        </header>
        <div className="ui link cards">
          <div className="card blue">
            <Link to="/account/new" className="new-account content center aligned">
              <i className="icon add massive"></i>
              <p>Create new account</p>
            </Link>
          </div>
          {accounts.map(this.renderAccount)}
          <div className="card green">
            <Link to={`/profile`} className="card" key={me}>
              <div className="content avatar">
                <div className="header">Edit Profile</div>
                <S3Photo photo={me.avatar} />
              </div>
            </Link>
          </div>
        </div>
      </div>
    );
  }
}

export default (props) => (
  <Query query={QueryMyAccounts}>
    {({ data, loading, error }) => {
      if (loading) { return "Loading..."; }
      if (error) { return "Error:" + error; }
      const accounts = (data.me && data.me.members) ?
        data.me.members.map(m => Object.assign({}, m.account, { mutable: m.role==='owner' })) :
        [];
      return <MyAccounts me={data.me} accounts={accounts} {...props} />
    }}
  </Query>
);

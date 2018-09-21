import React, { Component } from "react";
import { graphql } from "react-apollo";
import { Link } from "react-router-dom";

import QueryGetAccount from "../GraphQL/QueryGetAccount";
import AccountMembers from "./AccountMembers";
import BtnSubmit from './BtnSubmit';


class ViewAccount extends Component {
  constructor(props) {
    super(props);

    this.handleSave = this.handleSave.bind(this);
  }

  handleSave() {
    const { account, history } = this.props;

    history.push("/account/" + account.id+"/member/new");
  }

  checkLink() {
    console.log("check link");
  }

  render() {
    const { account, loading } = this.props;
    //console.log('viewaccount.render');

    //console.log('account : ' + JSON.stringify(account, null, 4));
    //console.log('loading on viewaccount : ' + JSON.stringify(loading, null, 4));


    return (
      <div>
        {
           account && <h1 className="ui header viewAccount">{account.name}'s Caring Circle</h1>
        }
        <div className={`ui container raised very padded segment backToAcc ${loading ? 'loading' : ''}`}>
          <Link to="/" className="ui button" onClick={() => this.checkLink()}>Back to accounts</Link>
        </div>
        <div className={`ui container raised very padded segment viewAccount`}>
          {account && <div className="content">
            <div className="extra">
              <AccountMembers accountId={account.id} members={account.members} />
            </div>
          </div>}

          <div className="ui buttons caringCircle">
            <BtnSubmit text="Invite Someone Else" disabled='' onClick={this.handleSave}/>
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

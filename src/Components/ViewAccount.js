import React, { Component } from "react";
import { Query } from "react-apollo";
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

  render() {
    const { account, loading } = this.props;

    return (
      <div>
        {
           account && <h1 className="ui header viewAccount">{account.name}'s Caring Circle</h1>
        }
        <div className={`ui container raised very padded segment backToAcc ${loading ? 'loading' : ''}`}>
          <Link to="/" className="ui button">Back to accounts</Link>
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

export default (props) => (
  <Query query={QueryGetAccount} variables={{ id: props.match.params.id }}>
    {({ data, loading, error }) => (
      (loading) ? "Loading..." :
      (error) ? error :
      <ViewAccount account={data.getAccount} {...props} />
    )}
  </Query>
);

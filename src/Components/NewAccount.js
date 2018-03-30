import React, {Component} from "react";
import {Link} from "react-router-dom";
import {graphql} from "react-apollo";
import { v4 as uuid } from "uuid";

import QueryMyAccounts from "../GraphQL/QueryMyAccounts";
import MutationCreateAccount from "../GraphQL/MutationCreateAccount";

class NewAccount extends Component {
  static defaultProps = { createAccount: () => null }

  state = { account: { name: '' } }

  handleChange(field, {target: { value }}) {
    const {account} = this.state;
    account[field] = value;
    this.setState({account});
  }

  handleSave = async (e) => {
    e.stopPropagation();
    e.preventDefault();

    const { createAccount, history, user } = this.props;
    const { account} = this.state;
    account.owner_id = user.id;

    await createAccount(account);

    history.push('/');
  }

  render() {
    const {account} = this.state;

    return (<div className="ui container raised very padded segment">
      <h1 className="ui header">Create an account</h1>
      <div className="ui form">
        <div className="field required eight wide">
          <label htmlFor="name">Account Name</label>
          <input type="text" id="name" value={account.name} onChange={this.handleChange.bind(this, 'name')}/>
        </div>
        <div className="ui buttons">
          <Link to="/" className="ui button">Cancel</Link>
          <div className="or"></div>
          <button className="ui positive button" onClick={this.handleSave}>Save</button>
        </div>
      </div>
    </div>);
  }
}

export default graphql(
  MutationCreateAccount, {
    options: {
      refetchQueries: [{ query: QueryMyAccounts }],
      update: (proxy, { data: { createAccount } }) => {
        const query = QueryMyAccounts;
        const data = proxy.readQuery({ query });
        var members = data.me.members;
        // Guard against multiple calls with optimisticResponse:
        // https://github.com/awslabs/aws-mobile-appsync-sdk-js/issues/65
        if (members.length === 0 ||
            members[members.length-1].account.id !== createAccount.id) {
          members.push({
            __typename: 'Member',
            role: 'owner',
            account: createAccount
          });
        }

        proxy.writeQuery({ query, data });
      }
    },
    props: (props) => ({
      createAccount: (account) => {
        return props.mutate({
          variables: account,
          optimisticResponse: () => ({
            createAccount: {
              __typename: 'Account',
              id: uuid(),
              created_at: Date.now(),
              name: account.name,
              members: [{
                __typename: 'Member',
                user: {
                  __typename: 'User',
                  id: account.owner_id
                },
                role: 'owner'
              }]
            }
          })
        })
      }
    })
  }
)(NewAccount);

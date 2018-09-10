import React, {Component} from "react";
import {Link} from "react-router-dom";
import {graphql} from "react-apollo";
import { v4 as uuid } from "uuid";

import QueryMyAccounts from "../GraphQL/QueryMyAccounts";
import MutationCreateAccount from "../GraphQL/MutationCreateAccount";

import './../CSS/Profile.css';
import imgvoice from './../img/imgvoice.png';

class NewAccount extends Component {
  static defaultProps = { createAccount: () => null }

  state = { account: { name: '' } }

  handleChange(field, {target: { value }}) {
    const {account} = this.state;
    account[field] = value;
    this.setState({account});
  }

  handleClick() {
    alert("Sound Right ?");
  }

  handleSave = async (e) => {
    e.stopPropagation();
    e.preventDefault();

    const { createAccount, history, user } = this.props;
    const { account} = this.state;
    account.ownerId = user.id;
    account.role = 'son-in-law';    // TODO: add UI for owner's relation to elder
    account.birthday = '1948-12-23'; // TODO: add UI for birthday selection

    await createAccount(account);

    //history.push('/');
    history.push('/familyAlbum');
  }

  render() {
    const {account} = this.state;

    return (<div className="ui container raised very padded segment">
      <h1 className="ui header">About your elder...</h1>
      <div className="ui form">
        <div className="field twelve wide">
          <label htmlFor="name">Elder's Name</label>
          <input type="text" placeholder="Enter Elder's Full Name" id="name" value={account.name} onChange={this.handleChange.bind(this, 'name')}/>
        </div>
        <div className="field twelve wide">
          <input id="nameSound" className="nameSound" type="image" alt="Name Pronunciation" src={imgvoice} onClick={this.handleClick.bind(this)}/>
          <label htmlFor="nameSound">Tap to hear how GranCentral will say ""</label>
        </div>
        <div className="field twelve wide">
          <label htmlFor="name">Birthday</label>
          <input placeholder="Select Date" type="text" id="birthday" />
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
      update: (proxy, { data: { createAccount: { account } } }) => {
        const query = QueryMyAccounts;
        const data = proxy.readQuery({ query });
        var members = data.me.members;
        // Guard against multiple calls with optimisticResponse:
        // https://github.com/awslabs/aws-mobile-appsync-sdk-js/issues/65
        if (members.length === 0 ||
            members[members.length-1].account.id !== account.id) {
          members.push({
            __typename: 'Member',
            role: 'owner', // TODO: should not be hardcoded
            account: account
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
              __typename: 'CreateAccountResult',
              account: {
                __typename: 'Account',
                id: uuid(),
                createdAt: Date.now(),
                name: account.name,
                ownerId: account.ownerId,
                elders: [{
                  __typename: 'Elder',
                  name: account.name,
                  birthday: account.birthday
                }],
                members: [{
                  __typename: 'Member',
                  user: {
                    __typename: 'User',
                    id: account.ownerId
                  },
                  role: account.role
                }]
              }
            }
          })
        })
      }
    })
  }
)(NewAccount);

import React, { Component } from "react";
import { Query, Mutation } from "react-apollo";

import QueryGetAccount from "../GraphQL/QueryGetAccount";
import MutationFindOrCreateUser from '../GraphQL/MutationFindOrCreateUser';
import MutationCreateMember from "../GraphQL/MutationCreateMember";

import './../CSS/Style.css';
import BtnSubmit from './BtnSubmit';
import QueryGetRole from "../GraphQL/QueryGetRole";
import RelationshipToElderDropdown from './RelationshipToElderDropdown';

class NewMember extends Component {
  static defaultProps = {
    findOrCreateUser: () => null,
    createMember: () => null
  }

  constructor(props) {
    super(props);

    this.state = {
        member: {
          name: '',
          email: '',
          role: '',
          roleOther: ''
        },
        isDisabled : 'disabled'
    };

    this.handleRoleChange = this.handleRoleChange.bind(this);
    this.checkAllInput = this.checkAllInput.bind(this);
  }

  handleChange(field, {target: { value }}) {
    const tmpvalue = (field === 'role' && value === "please select") ? '' : value;

    const {member} = this.state;
    member[field] = tmpvalue;

    if ((field === 'role') && (value !== "OTHER")) {
      member["roleOther"] = "";
    }

    this.setState({member}, () => this.checkAllInput());
  }

  handleRoleChange(field, event) {
    this.handleChange(field, event);
  }

  checkAllInput() {
    const {email, role, name, roleOther} = this.state.member;

    const isDisabled = (role === "" || (role === 'OTHER' && roleOther === "") || name === "" || email === "") ? 'disabled' : '';
    this.setState({isDisabled : isDisabled});
  }

  handleSave = async (e) => {
    // e.stopPropagation();
    e.preventDefault();

    const { account, findOrCreateUser, createMember, history } = this.props;
    const { member: { name, email, role, roleOther } } = this.state;

    const finalRole = (role === 'OTHER') ? role + "_" + roleOther : role;

    if (name.length === 0 || email.length < 5) {
      alert('invalid name or email');
      return;
    }

    if (account.members.find((m) => (m.user.email === email))) {
      history.goBack();
      return;
    }

    // In-app user creation uses a placeholder id === email
    const { data: { findOrCreateUser: { user } } } = await findOrCreateUser({
      variables: {
        id: email,
        name,
        email
      }
    });

    if (user && user.id) {
      const variables = {
        accountId: account.id,
        userId: user.id,
        role: finalRole
      }

      await createMember({ variables, update: this.createMemberUpdate });
      
      history.push("/account/" + account.id);
    } // else remain on this page
  }
  
  createMemberUpdate = (proxy, { data: { createMember: { member } } }) => {
    const { account: { id }, user: { id: userId } } = member;

    const query = QueryGetAccount;
    const variables = { id };
    const data = proxy.readQuery({ query, variables });

    const members = data.getAccount.members;
    // Guard against multiple calls with optimisticResponse:
    // https://github.com/awslabs/aws-mobile-appsync-sdk-js/issues/65
    if (members.length === 0 ||
        members[members.length-1].user.id !== userId) {
      members.push(member);
    }

    proxy.writeQuery({ query, data });
  }

  render() {
    const { member, isDisabled } = this.state;
    const { account } = this.props;

    return (
      <div className="ui container raised very padded segment">
        <h1 className="ui header">Create a Caring Circle</h1>
        <div className="ui form">
          <div className="field twelve wide">
            <div className="intro">
              Invite family members, friends, and caregivers who want to share updates about
              {
                (account) ? ' ' + account.name : ''
              }
            </div>
          </div>
          <div className="field twelve wide">
            <label htmlFor="name">Name</label>
            <input type="text" id="name" value={member.name} onChange={this.handleChange.bind(this, 'name')}/>
          </div>
          <div className="field twelve wide">
            <label htmlFor="email">Email</label>
            <input type="text" id="email" value={member.email} onChange={this.handleChange.bind(this, 'email')}/>
          </div>
          <div className="field twelve wide">
            <label htmlFor="relationship">Relationship To Elder</label>
            <RelationshipToElderDropdown valueSelect={member.role} queryProps={QueryGetRole} onChange={this.handleRoleChange} />
          </div>
          <div className="ui buttons medium">
            <BtnSubmit text="Invite" disabled={isDisabled} onClick={this.handleSave}/>
          </div>
        </div>
      </div>
    );
  }
}

export default (props) => (
  <Query query={QueryGetAccount} variables={{ id: props.match.params.id }}>
    {({ data: { getAccount }, loading, error }) => (
      (loading) ? "Loading..." :
      (error) ? "Error:" + error :
      <Mutation mutation={MutationFindOrCreateUser} ignoreResults={true}>
        {(findOrCreateUser) => (
          <Mutation mutation={MutationCreateMember} ignoreResults={true}>
            {(createMember) => (
              <NewMember {...props} account={getAccount}
                findOrCreateUser={findOrCreateUser}
                createMember={createMember} />
            )}
          </Mutation>
        )}
      </Mutation>
    )}
  </Query>
);

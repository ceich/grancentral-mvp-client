import React, { Component } from "react";
import { compose, graphql } from "react-apollo";

import QueryGetAccount from "../GraphQL/QueryGetAccount";
import MutationFindOrCreateUser from '../GraphQL/MutationFindOrCreateUser';
import MutationCreateMember from "../GraphQL/MutationCreateMember";

class NewMember extends Component {
  static defaultProps = {
    findOrCreateUser: () => null,
    createMember: () => null
  }

  state = { member: { name: '', email: '', role: 'family' } }

  handleChange(field, {target: { value }}) {
    const {member} = this.state;
    member[field] = value;
    this.setState({member});
  }

  handleSave = async (e) => {
    // e.stopPropagation();
    e.preventDefault();

    const { account, findOrCreateUser, createMember, history } = this.props;
    const { member: { name, email, role } } = this.state;

    if (name.length === 0 || email.length < 5) {
      alert('invalid name or email');
      return;
    }

    if (account.members.find((m) => (m.user.email === email))) {
      console.log('skipping existing member');
      history.goBack();
      return;
    }

    // In-app user creation uses a placeholder id === email
    const { data: { findOrCreateUser: user } } = await findOrCreateUser({
      id: email,
      name,
      email
    });

    if (user && user.id) {
      const member = {
        name,
        email,
        account_id: account.id,
        user_id: user.id,
        role: role
      }

      await createMember(member);
    }

    history.push("/account/" + account.id);
  }

  render() {
    const { history } = this.props;
    const { member } = this.state;

    return (<div className="ui container raised very padded segment">
      <h1 className="ui header">Create a member</h1>
      <div className="ui form">
        <div className="field required eight wide">
          <label htmlFor="name">Name</label>
          <input type="text" id="name" value={member.name} onChange={this.handleChange.bind(this, 'name')}/>
        </div>
        <div className="field required eight wide">
          <label htmlFor="email">Email</label>
          <input type="text" id="email" value={member.email} onChange={this.handleChange.bind(this, 'email')}/>
        </div>
        <div className="field required eight wide">
          <label htmlFor="role">Role</label>
          <select id="role" value={member.role} onChange={this.handleChange.bind(this, 'role')}>
            {'owner elder family neighbor caregiver'.split(' ').map((r,i) => (
              <option value={r} key={i}>{r}</option>
            ))}
          </select>
        </div>
        <div className="ui buttons">
          <button className="ui button" onClick={history.goBack}>Cancel</button>
          <div className="or"></div>
          <button className="ui positive button" onClick={this.handleSave}>Save</button>
        </div>
      </div>
    </div>);
  }
}

export default compose(
  graphql(
    QueryGetAccount,
    {
      options: ({ match: { params: { id } } }) => {
        return ({
          variables: { id },
          fetchPolicy: 'cache-and-network'
        })
      },
      props: ({ data: { getAccount: account } }) => ({account})
    }
  ),
  graphql(
    MutationCreateMember,
    {
      options: {
        refetchQueries: ({ data: { createMember: { account: { id } } } }) => (
          [{ query: QueryGetAccount, variables: { id } }]
        ),
        update: (proxy, { data: { createMember } }) => {
          const { account: { id }, user: { id: user_id } } = createMember;
          const query = QueryGetAccount;
          const variables = { id };
          const data = proxy.readQuery({ query, variables });

          const members = data.getAccount.members;
          // Guard against multiple calls with optimisticResponse:
          // https://github.com/awslabs/aws-mobile-appsync-sdk-js/issues/65
          if (members.length === 0 ||
              members[members.length-1].user.id !== user_id) {
            members.push(createMember);
          }

          proxy.writeQuery({ query, data });
        }
      },
      props: (props) => ({
        createMember: ({ name, email, ...input }) => {
          return props.mutate({
            variables: input,
            optimisticResponse: {
              createMember: {
                __typename: 'Member',
                account: {
                  __typename: 'Account',
                  id: input.account_id
                },
                user: {
                  __typename: 'User',
                  id: input.user_id,
                  name,
                  email
                },
                role: input.role
              }
            }
          })
        }
      })
    }
  ),
  graphql(
    MutationFindOrCreateUser,
    {
      props: (props) => ({
        findOrCreateUser: (input) => {
          return props.mutate({
            variables: input,
            optimisticResponse: {
              findOrCreateUser: { ...input, __typename: 'User' }
            }
          });
        }
      })
    }
  )
)(NewMember);

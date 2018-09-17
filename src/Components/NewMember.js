import React, { Component } from "react";
import { compose, graphql } from "react-apollo";

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

  //state = { member: { name: '', email: '', role: 'family' } }

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

    console.log('props on NewMember : ' + JSON.stringify(this.props, null, 4));

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
    //console.log('handleRoleChange got called');
    this.handleChange(field, event);
  }

  checkAllInput() {
    //console.log('checkAllInput got called');
    const {email, role, name, roleOther} = this.state.member;

    console.log("state : " + JSON.stringify(this.state.member, null, 4));

    const isDisabled = (role === "" || (role === 'OTHER' && roleOther === "") || name === "" || email === "") ? 'disabled' : '';
    this.setState({isDisabled : isDisabled});
  }

  handleSave = async (e) => {
    // e.stopPropagation();
    e.preventDefault();

    const { account, findOrCreateUser, createMember, history } = this.props;
    const { member: { name, email, role, roleOther } } = this.state;

    console.log('account on handleSave : ' + JSON.stringify(account, null, 4));

    const finalRole = (role === 'OTHER') ? role + "_" + roleOther : role;


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
    const { data: { findOrCreateUser: { user } } } = await findOrCreateUser({
      id: email,
      name,
      email
    });

    console.log('account after findOrCreateUser : ' + JSON.stringify(user, null, 4));

    if (user && user.id) {
      const member = {
        name,
        email,
        accountId: account.id,
        userId: user.id,
        role: finalRole
      }

      console.log('member before createMember : ' + JSON.stringify(member, null, 4));

      await createMember(member);

      console.log('create Member completed');
    }

    history.push("/account/" + account.id);
  }

  render() {
    const { history } = this.props;
    const { member, isDisabled } = this.state;

    /*
          <select id="role" value={member.role} onChange={this.handleChange.bind(this, 'role')}>
            {'owner elder family neighbor caregiver'.split(' ').map((r,i) => (
              <option value={r} key={i}>{r}</option>
            ))}
          </select>
    */
    return (<div className="ui container raised very padded segment">
      <h1 className="ui header">Create a Caring Circle</h1>
      <div className="ui form">
        <div className="field twelve wide">
          <div className="intro">
            Invite family members, friends, and caregivers who want to share updates about Yvonne
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
    </div>);
  }
}

export default compose(
  graphql(
    QueryGetAccount,
    {
      options: ({ match: { params: { id } } }) => {
        console.log('query options running');
        return ({
          variables: { id },
          fetchPolicy: 'cache-and-network'
        })
      },
      props: ({ data: { getAccount: account } }) => {
        console.log('query props running');
        return({account});
      }
    }
  ),
  graphql(
    MutationCreateMember,
    {
      options: {
        refetchQueries: ({ data: { createMember: { member : { account: { id } } } } }) => (
          [{ query: QueryGetAccount, variables: { id } }]
        ),
        update: (proxy, { data: { createMember } }) => {
          console.log('create Member on update MutationCreateMember : ' + JSON.stringify(createMember, null, 4));
          const { account: { id }, user: { id: userId } } = createMember.member;

          const query = QueryGetAccount;
          const variables = { id };
          const data = proxy.readQuery({ query, variables });

          console.log('data on cache after MutationCreateMember' + JSON.stringify(data, null, 4));

          const members = data.getAccount.members;
          // Guard against multiple calls with optimisticResponse:
          // https://github.com/awslabs/aws-mobile-appsync-sdk-js/issues/65

          console.log('members before adding element : ' + JSON.stringify(members, null, 4));

          if (members.length === 0 ||
              members[members.length-1].user.id !== userId) {
            members.push(createMember);
          }

          console.log('members before writeQuery to cache : ' + JSON.stringify(members, null, 4));

          proxy.writeQuery({ query, data });

          console.log('proses updating completed : ' + JSON.stringify(data, null, 4));
        }
      },
      props: (props) => ({
        createMember: ({ name, email, ...input }) => {

          console.log('running mutate createMember : ' + JSON.stringify(input, null, 4));

          return props.mutate({
            variables: input,
            optimisticResponse: () => {

              console.log('optimisticResponse on CreateMember running');

              return({
                    createMember: {
                      __typename: 'CreateMemberResult',
                      member: {
                        __typename: 'Member',
                        account: {
                          __typename: 'Account',
                          id: input.accountId
                        },
                        user: {
                          __typename: 'User',
                          id: input.userId,
                          name,
                          email
                        },
                        role: input.role
                      }
                    }
                  });
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

          console.log('running mutate findOrCreateUser : ' + JSON.stringify(input, null, 4));

          return props.mutate({
            variables: input,
            optimisticResponse: {
              findOrCreateUser: {
                __typename: 'FindOrCreateUserResult',
                user: { ...input, __typename: 'User' }
              }
            }
          });
        }
      })
    }
  )
)(NewMember);

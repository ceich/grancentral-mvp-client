import React, { Component } from "react";
import { Mutation } from "react-apollo";

import S3Photo from "./S3Photo";
import MutationDeleteMember from "../GraphQL/MutationDeleteMember";
// import SubscriptionAccountMembers from "../GraphQL/SubscriptionAccountMembers";

class AccountMembers extends Component {
  // subscription;
  //
  // componentDidMount() {
  //   this.subscription = this.props.subscribeToMembers();
  // }
  //
  // componentWillUnmount() {
  //   this.subscription();
  // }

  async handleDeleteClick(member, e) {
    e.preventDefault();

    if (window.confirm(`Are you sure you want to delete member ${member.user.name}?`)) {
      const { deleteMember, account } = this.props;
      await deleteMember({
        variables: { accountId: account.id, userId: member.user.id },
        update: this.deleteMemberUpdate
      });
    }
  }
  
  deleteMemberUpdate = (proxy, { data: { deleteMember: { member } } }) => {
    const { account, setAccount } = this.props;
    const { user: { id: userId } } = member;

    const members = account.members.filter(m => m.user.id !== userId);
    const newAccount = Object.assign({}, account);
    newAccount.members = members;
    setAccount(newAccount);
  }

  toTitleCase(phrase) {
    return phrase
      .replace('OTHER_', '')
      .toLowerCase()
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('-')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  renderMember = (member) => {
    return (<div className="member" key={member.user.id}>
      <div className="avatar">
        <S3Photo photo={member.user.avatar} />
      </div>
      <div className="contentData">
        <div className="content">
          <div className="text">
            <b>{member.user.name}</b>
            {this.props.user.id === member.user.id && " (you)"}
            <br/>{this.toTitleCase(member.role)}
            <br/>{this.props.account.ownerId === member.user.id && "Account Owner"}
          </div>
        </div>
      </div>
      {(this.props.user.id === member.user.id) ? // Provide profile link to everyone
        <button className="ui bottom attached button" onClick={() => this.props.history.push('/profile')}>
          <i className="setting icon" />
        </button>
        :
        (this.props.user.id === this.props.account.ownerId) ? // Owner can delete others
        <button className="ui bottom attached button" onClick={this.handleDeleteClick.bind(this, member)}>
          <i className="trash icon"></i>
        </button>
        : null
      }
    </div>);
  }

  render() {
    const { members } = this.props.account;

    return (<div className="ui items">
      <div className="item">
        <div className="ui members">
          <div className="ui members inner">
            {members.map(this.renderMember)}
          </div>
        </div>
      </div>
    </div>);
  }
}

export default (props) => (
  <Mutation mutation={MutationDeleteMember} ignoreResults={true}>
    {(deleteMember) => (
      <AccountMembers {...props} deleteMember={deleteMember} />
    )}
  </Mutation>
);

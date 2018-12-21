import React, { Component } from "react";
import { Mutation } from "react-apollo";

import S3Photo from "./S3Photo";
import QueryGetAccount from "../GraphQL/QueryGetAccount";
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
    const { accountId } = this.props;
    const userId = member.user.id;

    if (window.confirm(`Are you sure you want to delete member ${member.user.name}?`)) {
      const { deleteMember } = this.props;
      await deleteMember({
        variables: { accountId, userId },
        update: this.deleteMemberUpdate
      });
    }
  }
  
  deleteMemberUpdate(proxy, { data: { deleteMember: { member } } }) {
    const query = QueryGetAccount;
    const variables = { id: member.account.id };
    const data = proxy.readQuery({ query, variables });
    data.getAccount.members = data.getAccount.members.filter(m => m.user.id !== member.user.id);
    proxy.writeQuery({ query, data });
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
          </div>
        </div>
        <div className="content">
          <div className="text">
            {this.toTitleCase(member.role)}
          </div>
        </div>
      </div>
      <button className="ui bottom attached button" onClick={this.handleDeleteClick.bind(this, member)}>
        <i className="trash icon"></i>
      </button>
    </div>);
  }

  render() {
    const { members } = this.props;

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

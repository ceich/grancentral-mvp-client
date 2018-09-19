import React, { Component } from "react";
import { compose, graphql } from "react-apollo";

import Avatar from "./Avatar";
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

    if (window.confirm(`Are you sure you want to delete member ${member.user.name}?`)) {
      const { deleteMember } = this.props;
      await deleteMember(member);
    }
  }

  renderMember = (member) => {
    String.prototype.toCamelCase = function() {
      return this.replace(/\b(\w)/g, function(match, capture) {
        return capture.toUpperCase();
      });
    }



    //console.log('member on renderMember : ' + JSON.stringify(member, null, 4));
    return (<div className="member" key={member.user.id}>
      <div className="avatar">
        <Avatar user={member.user} />
      </div>
      <div className="contentData">
        <div className="content">
          <div className="text">
            <b>{member.user.name}</b>
          </div>
        </div>
        <div className="content">
          <div className="text">
            {member.role.replace("OTHER_", "").toLowerCase().toCamelCase().replace(/_/g, "-")}
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

    //console.log('members : ' + JSON.stringify(members, null, 4));


    return (<div className="ui items">
      <div className="item">
        <div className="ui members">
          <div className="ui members inner">
            {members.map(this.renderMember)}
            {/* <NewMember accountId={accountId} members={members} /> */}
          </div>
        </div>
      </div>
    </div>);
  }
}

export default compose(
  graphql(QueryGetAccount, {
    alias: 'QueryGetAccount',
    options: ({ accountId: id }) => ({
      fetchPolicy: 'cache-first',
      variables: { id }
    }),
    props: ({ data: { getAccount = { members: [] } } }) => ({
      members: getAccount.members
    }),
    // props: props => ({
    //   members: props.data.getAccount.members,
    //   subscribeToMembers: () => props.data.subscribeToMore({
    //     document: SubscriptionAccountMembers,
    //     variables: {
    //       accountId: props.ownProps.accountId,
    //     },
    //     updateQuery: (prev, { subscriptionData: { data: { subscribeToAccountMembers } } }) => {
    //       const res = {
    //           ...prev,
    //           ...{
    //               getAccount: {
    //                   ...prev.getAccount,
    //                   members: {
    //                       __typename: 'MemberConnections',
    //                       items: [
    //                           ...prev.getAccount.members.items.filter(c => {
    //                               return (
    //                                   c.content !== subscribeToAccountMembers.content &&
    //                                   c.createdAt !== subscribeToAccountMembers.createdAt &&
    //                                   c.memberId !== subscribeToAccountMembers.memberId
    //                               );
    //                           }),
    //                           subscribeToAccountMembers,
    //                       ]
    //                   }
    //               }
    //           },
    //       };
    //
    //       return res;
    //     }
    //   })
    // }),
  }),
  graphql(MutationDeleteMember, {
    alias: 'MutationDeleteMember',
    options: {
      refetchQueries: ({ data: { deleteMember: { member: { account: { id } } } } }) => (
        [{ query: QueryGetAccount, variables: { id } }]
      ),
      update: (proxy, { data: { deleteMember: { member } } }) => {
        const query = QueryGetAccount;
        const variables = { id: member.account.id };
        const data = proxy.readQuery({ query, variables });
        data.getAccount.members = data.getAccount.members.filter(m => m.user.id !== member.user.id);
        proxy.writeQuery({ query, data });
      }
    },
    props: (props) => ({
      deleteMember: (member) => {
        return props.mutate({
          variables: {
            accountId: member.account.id,
            userId: member.user.id
          },
          optimisticResponse: () => ({
            deleteMember: {
              __typename: 'DeleteMemberResult',
              member: {
                __typename: 'Member',
                ...member
              }
            }
          })
        })
      }
    })
  })
)(AccountMembers);

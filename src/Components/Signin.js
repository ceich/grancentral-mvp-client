import React from "react";
import { Redirect } from 'react-router-dom';
import { Query } from "react-apollo";
import "semantic-ui-css/semantic.min.css";

import QuerySignin from "../GraphQL/QuerySignin";

const Signin = (props) => {
  const { me } = props;
  if (!me) return null;
  const { name, avatar, members } = me;
  const profileComplete = name && avatar;
  const originalRole = (members && members.length) ? members[0].role : '';

  // console.log('Signin: me=', me);

  if (!profileComplete) {
    // Prompt to complete profile
    return (<Redirect push to={{ pathname: "/profile", state: { originalRole }}} />);
  } else if (members.length === 0) {
    // Prompt to create new account
    return (<Redirect to="/account/new" />);
  } else if (members.length === 1) {
    // Only one account, go there
    return (<Redirect to={"/account/" + members[0].account.id} />)
  } else {
    // Redirect to MyAccounts
    return (<Redirect to="/" />);
  }
}

export default (props) => (
  <Query query={QuerySignin} fetchPolicy="network-only">
    {({ data, loading, error }) => (
      loading ? "Loading..." :
      error ? "Error" :
      <Signin {...props} me={data.me} />
    )}
  </Query>
);

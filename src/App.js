import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { ApolloProvider, Mutation } from 'react-apollo';
import Amplify, { Auth } from 'aws-amplify';
import { withAuthenticator } from 'aws-amplify-react';
import AWSAppSyncClient from 'aws-appsync';
import { Rehydrated } from 'aws-appsync-react';

import appSyncConfig from './AppSync';
import aws_exports from './aws-exports';
import heart from './heart.svg';
import './App.css';

import QueryMe from "./GraphQL/QueryMe";
import MutationFindOrCreateUser from './GraphQL/MutationFindOrCreateUser';

import MyAccounts from './Components/MyAccounts';
import ViewAccount from './Components/ViewAccount';
import NewAccount from './Components/NewAccount';
import NewMember from './Components/NewMember';
import Profile from './Components/Profile';

Amplify.configure(aws_exports);

// const hostedSignin = 'https://grancentral-ai-mvp.auth.us-east-2.amazoncognito.com/login?response_type=code&client_id=2gmaeoe97rv6o61006g3mp1hqu&redirect_uri=https://app.grancentral.ai/signin';

// const logger = new Amplify.Logger('App');
// Amplify.Logger.LOG_LEVEL = 'DEBUG';
// logger.LOG_LEVEL = 'DEBUG';

// See https://developers.google.com/identity/sign-in/ios/start-integrating and
// https://developers.google.com/identity/sign-in/android/start when time to do
// Google sign-in for mobile apps.
// export const FederatedProps = {
//   federated: {
//     amazon_client_id: 'amzn1.application-oa2-client.1b3a84b5d8f3430fa25244de70d08ab8',
//     facebook_app_id: '325521941271540',
//     google_client_id: '1062276029031-mu7ksht2e4e98ofg5o4r2tc6ohhtj6jt.apps.googleusercontent.com'
//   }
// }

class App extends React.Component {
  // Call the mutation when the user authenticates,
  // to bootstrap the GraphQL User from Cognito.
  async componentDidMount() {
    const {
      authData: { signInUserSession: { idToken: { payload }}},
      findOrCreateUser,
      result: { loading, error, called }
    } = this.props;

    if (loading || error || called) return;

    const input = {
      id: payload.sub,
      name: payload.name || payload['cognito:username'],
      email: payload.email
    };

    await findOrCreateUser({
      variables: input,
      optimisticResponse: {
        // First approximation to server response
        findOrCreateUser: {  __typename: 'User', ...input }
      },
      update: (proxy, { data: { findOrCreateUser } }) => {
        if (!findOrCreateUser) return;
        // Write the response into the cache for "me" Query
        proxy.writeQuery({ query: QueryMe, data: { me: findOrCreateUser } });
        // Update the state with the server response
        this.setState({ user: findOrCreateUser });
      }
    });
  }

  componentWillUnmount() {
    this.setState({user: null});
  }

  render() {
    return (
      <Router>
        <div className="App">
          <header className="App-header">
            <img className="App-logo" src={heart} alt="heart" />
            <h1 className="App-title">GranCentral</h1>
          </header>
          <Route exact={true} path="/"
                 render={(props) => <MyAccounts {...props} {...this.state} />} />
          <Route path="/account/new"
                 render={(props) => <NewAccount {...props} {...this.state} />} />
          <Route exact={true} path="/account/:id"
                 render={(props) => <ViewAccount {...props} {...this.state} />} />
          <Route path="/account/:id/member/new"
                 render={(props) => <NewMember {...props} {...this.state} />} />
          <Route path="/profile"
                 render={(props) => <Profile {...props} {...this.state} />} />
        </div>
      </Router>
    );
  }
}

const WithProvider = (props) => (
  <ApolloProvider client={new AWSAppSyncClient(
    {
  	  url: appSyncConfig.graphqlEndpoint,
  	  region: appSyncConfig.region,
  	  auth: {
    		type: appSyncConfig.authenticationType,
    		jwtToken: async () => (await Auth.currentSession()
          .then(data => {
            return data
          })
          .catch(err => {
            return err
          })).getIdToken().getJwtToken()
  	  }
  	}
  )}>
    <Rehydrated>
      <Mutation mutation={MutationFindOrCreateUser}>
        {(findOrCreateUser, result) => (
          <App {...props} findOrCreateUser={findOrCreateUser} result={result} />
        )}
      </Mutation>
    </Rehydrated>
  </ApolloProvider>
)

export default withAuthenticator(WithProvider, true);

import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { ApolloProvider, Mutation } from 'react-apollo';
import Amplify, { Auth } from 'aws-amplify';
import { withOAuth, withAuthenticator } from 'aws-amplify-react';
import AWSAppSyncClient from 'aws-appsync';
import { Rehydrated } from 'aws-appsync-react';

import appSyncConfig from './AppSync';
import aws_exports from './aws-exports';
import './CSS/App.css';

import MutationFindOrCreateUser from './GraphQL/MutationFindOrCreateUser';

import MyAccounts from './Components/MyAccounts';
import ViewAccount from './Components/ViewAccount';
import NewAccount from './Components/NewAccount';
import NewMember from './Components/NewMember';
import Profile from './Components/Profile';
import Signin from './Components/Signin';
import CreateFamilyAlbum from './Components/CreateFamilyAlbum';
import MyPictures from './Components/MyPictures';
import Timeline from './Components/Timeline';
import TimelineDetail from './Components/TimelineDetail';
import Redirector from './Components/Redirector';

Amplify.configure(aws_exports);

// Hosted login configuration
const oauth = {
  domain: 'auth.grancentral.ai',
  label: 'Sign in',  // default label for OAuthButton
  redirectSignIn: window.location.origin + '/signin',
  redirectSignOut: window.location.origin + '/signout', // unused AFAICT
  responseType: 'code',
  scope: [ 'email', 'profile' ] // hosted auth uses User Pool settings
}
Amplify.configure({ oauth });

// Amplify.Logger.LOG_LEVEL = 'DEBUG';
const logger = new Amplify.Logger('App');
// logger.LOG_LEVEL = 'DEBUG';

class App extends React.Component {
  state = {
    user: null // NB: AppSync user, not Cognito user
  };

  // Dead code for now; may be needed when logout added
  // componentWillUnmount() {
  //   logger.debug('componentWillUnmount: calling OAuthSignIn');
  //   this.props.OAuthSignIn();
  // }

  // Call the mutation when the user authenticates,
  // to bootstrap the GraphQL User from Cognito.
  async componentDidMount() {
    logger.debug('componentDidMount: calling findOrCreateUser');

    const {
      findOrCreateUser,
      result: { loading, error, called }
    } = this.props;
    if (loading || error || called) return;

    const { idToken: { payload } } = await Auth.currentSession();

    const input = {
      id: payload.sub,
      name: payload.name || payload['cognito:username'],
      email: payload.email,
      avatar: null
    };

    await findOrCreateUser({
      variables: input,
      optimisticResponse: {
        // First approximation to server response
        findOrCreateUser: {
          __typename: 'FindOrCreateUserResult',
          user: { __typename: 'User', ...input }
        }
      },
      update: (proxy, { data: { findOrCreateUser: { user } } }) => {
        if (!user) return;
        logger.debug('Setting user to', user);
        // Update the state with the server response
        this.setState({ user });
      }
    });
  }

  render() {
    return (
      <Router>
        <div className="App">
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
          <Route path="/signin"
                 render={(props) => <Signin {...props} {...this.state} />} />
          <Route path="/createFamilyAlbum"
                 render={(props) => <CreateFamilyAlbum {...props} {...this.state} />} />
          <Route path="/myPictures"
                 render={(props) => <MyPictures {...props} {...this.state} />} />
          <Route path="/timeline"
                 render={(props) => <Timeline {...props} {...this.state} />} />
          <Route path="/timelineDetail"
                 render={(props) => <TimelineDetail {...props} {...this.state} />} />
          <Route path="/signout"
                 render={() => { Auth.signOut(); return null; }} />
        </div>
      </Router>
    );
  }
}

// Wrap the app in:
// - OAuth wrapper to provide hosted signin via props.OAuthSignin()
// - Apollo client, incorporating AppSync client and Cognito identity
// - idempotent FindOrCreateUser mutation to establish AppSync user
const WithProvider = withOAuth((props) => (
  <ApolloProvider client={new AWSAppSyncClient(
    {
      url: appSyncConfig.graphqlEndpoint,
      region: appSyncConfig.region,
      auth: {
        type: appSyncConfig.authenticationType,
        jwtToken: async () => (await Auth.currentSession()
          .then(data => { return data })
          .catch(err => {
            logger.warn('no current session, redirect to hosted UI');
            props.OAuthSignIn();
          })
        ).getAccessToken().getJwtToken()
       },
      complexObjectsCredentials: () => Auth.currentCredentials(),
      disableOffline : true
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
));

// Do not put an Amplify Greetings header above the application
// Navigate to /signout to force sign out
const withGreetings = false;

// Use only one component when not logged in, to redirect to the hosted UI
const authComps = [ <Redirector label={oauth.label} /> ];

export default withAuthenticator(WithProvider, withGreetings, authComps);

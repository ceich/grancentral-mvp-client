import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { ApolloProvider, Mutation } from 'react-apollo';
import Amplify, { Auth, Hub } from 'aws-amplify';
import { withOAuth, Greetings } from 'aws-amplify-react';
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
import Signin from './Components/Signin';

Amplify.configure(aws_exports);

const oauth = {
  domain: 'auth.grancentral.ai',
  label: 'Hosted Login',  // default label for OAuthButton (unused)
  redirectSignIn: window.location.origin + '/signin',
  redirectSignOut: window.location.origin + '/signout', // unused AFAICT
  responseType: 'code',
  scope: [ 'email', 'profile' ] // hosted auth uses User Pool settings
}

Amplify.configure({ oauth });

// Amplify.Logger.LOG_LEVEL = 'DEBUG';
// const logger = new Amplify.Logger('App');
// logger.LOG_LEVEL = 'DEBUG';

class App extends React.Component {
  // These methods imitate aws-amplify-react's Greetings.jsx
  // in order to react to authentication events.
  constructor(props) {
    super(props);

    // Listen for 'auth' channel events from Amplify
    this.checkUser = this.checkUser.bind(this);
    this.onHubCapsule = this.onHubCapsule.bind(this);
    Hub.listen('auth', this);

    this.state = {
      user: null // NB: AppSync user, not Cognito user
    };
  }

  checkUser() {
    Auth.currentAuthenticatedUser().catch(err => {
      this.props.OAuthSignIn();
    });
  }

  onHubCapsule(capsule) {
    const {channel} = capsule;
    if (channel === 'auth') {
      this.checkUser();
    }
  }

  // Call the mutation when the user authenticates,
  // to bootstrap the GraphQL User from Cognito.
  async componentDidMount() {
    const {
      findOrCreateUser,
      result: { loading, error, called }
    } = this.props;
    if (loading || error || called) return;

    const { accessToken: { payload } } = await Auth.currentSession();

    const input = {
      id: payload.sub,
      name: payload.name || payload['cognito:username'],
      email: payload.email
    };

    await findOrCreateUser({
      variables: input,
      optimisticResponse: {
        // First approximation to server response
        findOrCreateUser: { user: { __typename: 'User', ...input } }
      },
      update: (proxy, { data: { findOrCreateUser: { user } } }) => {
        if (!user) return;
        console.log('Setting user to:', user);
        // Write the response into the cache for "me" Query
        proxy.writeQuery({ query: QueryMe, data: { me: user } });
        // Update the state with the server response
        this.setState({ user });
      }
    });
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
          <Route path="/signin"
                 render={(props) => <Signin {...props} {...this.state} />} />
          <Route path="/signout" render={this.props.OAuthSignIn} />
          <Greetings />
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
          .then(data => { return data })
          .catch(err => { props.OAuthSignIn() })
        ).getAccessToken().getJwtToken()
  	  },
      complexObjectsCredentials: () => Auth.currentCredentials()
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

export default withOAuth(WithProvider);

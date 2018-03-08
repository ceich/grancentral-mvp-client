import React from 'react';
import Amplify from 'aws-amplify';
import { withAuthenticator } from 'aws-amplify-react';

import aws_exports from './aws-exports';
import heart from './heart.svg';
import './App.css';

Amplify.configure(aws_exports);

// const hostedSignin = 'https://grancentral-ai-mvp.auth.us-east-2.amazoncognito.com/login?response_type=code&client_id=2gmaeoe97rv6o61006g3mp1hqu&redirect_uri=https://app.grancentral.ai/signin';

// const logger = new Amplify.Logger('App');
// Amplify.Logger.LOG_LEVEL = 'DEBUG';
// logger.LOG_LEVEL = 'DEBUG';

// See https://developers.google.com/identity/sign-in/ios/start-integrating and
// https://developers.google.com/identity/sign-in/android/start when time to do
// Google sign-in for mobile apps.
// const FederatedProps = {
//   federated: {
//     amazon_client_id: 'amzn1.application-oa2-client.1b3a84b5d8f3430fa25244de70d08ab8',
//     facebook_app_id: '325521941271540',
//     google_client_id: '1062276029031-mu7ksht2e4e98ofg5o4r2tc6ohhtj6jt.apps.googleusercontent.com'
//   }
// }

const Body = ({authData}) => (
  <div className="App-intro">
    {authData.username || authData.name}
  </div>
)

const App = (props) => (
  <div className="App">
    <header className="App-header">
      <img className="App-logo" src={heart} alt="heart" />
      <h1 className="App-title">GranCentral</h1>
    </header>
    <Body {...props}/>
  </div>
)

export default withAuthenticator(App, true);

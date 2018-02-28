import React, { Component } from 'react';
import Amplify from 'aws-amplify';
import {
  Authenticator,
  FederatedSignIn,
  SignIn,
  ConfirmSignIn,
  RequireNewPassword,
  SignUp,
  ConfirmSignUp,
  VerifyContact,
  ForgotPassword
 } from 'aws-amplify-react';

import aws_exports from './aws-exports';
import heart from './heart.svg';
import './App.css';

Amplify.configure(aws_exports);

const logger = new Amplify.Logger('App');
// Amplify.Logger.LOG_LEVEL = 'DEBUG';
// logger.LOG_LEVEL = 'DEBUG';

// Hide everything but Greetings in the Authenticator
const AuthenticatorProps = {
  hide: [
    SignIn,
    ConfirmSignIn,
    RequireNewPassword,
    SignUp,
    ConfirmSignUp,
    VerifyContact,
    ForgotPassword
  ],
}

// See https://developers.google.com/identity/sign-in/ios/start-integrating and
// https://developers.google.com/identity/sign-in/android/start when time to do
// Google sign-in for mobile apps.
const FederatedProps = {
  federated: {
    amazon_client_id: 'amzn1.application-oa2-client.1b3a84b5d8f3430fa25244de70d08ab8',
    facebook_app_id: '325521941271540',
    google_client_id: '1062276029031-mu7ksht2e4e98ofg5o4r2tc6ohhtj6jt.apps.googleusercontent.com'
  }
}

class Body extends Component {
  render() {
    logger.debug('Body.render');
    if (this.props.authState === 'signedIn') {
      const user = this.props.authData;
      return (
        <div className="App-intro">
          {user ?
            ['id', 'email', 'name'].map((a) =>
              <div key={a}>{[a, user[a]].join(': ')}</div>
            ) :
            'Loading'}
        </div>
      );
    } else {
      return null;
      (
        <p className="App-intro">
          Please sign in to GranCentral!
        </p>
      );
    }
  }
}

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img className="App-logo" src={heart} alt="heart" />
          <h1 className="App-title">GranCentral</h1>
        </header>
        <Authenticator {...AuthenticatorProps}>
          <FederatedSignIn {...FederatedProps} />
          <Body />
        </Authenticator>
      </div>
    );
  }
}

export default App;

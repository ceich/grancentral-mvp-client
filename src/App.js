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

const FederatedProps = {
  federated: { facebook_app_id: '325521941271540' }
}

function Body(props) {
  // As a child of Authenticator it gets authState
  if (['signIn', 'signedOut'].includes(props.authState)) {
    return null;
  }
  return(
    <p className="App-intro">
      To get started, edit <code>src/App.js</code> and save to reload.
    </p>
  );
}
class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={heart} className="App-logo" alt="heart" />
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
// export default withFacebook(App);
// export default withAuthenticator(App, true);
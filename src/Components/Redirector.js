import React from 'react';
import { AuthPiece, OAuthButton, withOAuth } from 'aws-amplify-react';

class Redirector extends AuthPiece {
  state = {
    timer: null
  }

  constructor(props) {
    super(props);
    this._validAuthStates = ['signIn'];
  }
  
  componentDidMount() {
    // React can call componentDidMount twice in a row;
    // start a timer only on the first call
    if (!this.state.timer) {
      const delay = this.props.delay || 1500;
      this.setState({timer: setTimeout(this.props.OAuthSignIn, delay)});
    }
  }
  
  componentWillUnmount() {
    if (this.state.timer) {
      clearTimeout(this.state.timer);
      this.setState({timer: null});
    }
  }

  showComponent = (theme) => (
    <OAuthButton label={this.props.label} theme={theme} />
  );
}

export default withOAuth(Redirector);
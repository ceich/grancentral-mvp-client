import React, { Component } from "react";

import AccountMembers from "./AccountMembers";
import BtnSubmit from './BtnSubmit';

class CaringCircle extends Component {
  constructor(props) {
    super(props);

    this.handleSave = this.handleSave.bind(this);
  }

  handleSave() {
    const { history } = this.props;

    history.push("/newMember");
  }

  render() {
    const { account } = this.props;
    const firstName = account ? account.name.split(' ')[0] : 'Gran'

    return (
      !account ? null :
      <div>
        <h1 className="ui header viewAccount">{firstName}'s Caring Circle</h1>
        <div className={`ui container raised very padded segment viewAccount`}>
          <div className="content">
            <div className="extra">
              <AccountMembers {...this.props} />
            </div>
          </div>

          <div className="ui buttons caringCircle">
            <BtnSubmit text="Invite Someone Else" disabled='' onClick={this.handleSave}/>
          </div>
        </div>
      </div>
    );
  }
}

export default CaringCircle;
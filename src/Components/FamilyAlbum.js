import React, {Component} from "react";

import './../CSS/Style.css';
import BtnSubmit from './BtnSubmit';

class FamilyAlbum extends Component {
  constructor(props) {
    super(props);

    this.handleUpload = this.handleUpload.bind(this);
  }

  handleUpload() {
    alert("clicked detected...");
  }

  handleSave() {
    //history.push({pathname : '/account/'+id+'/member/new', state : {account : history.location.state.account}});
  }

  render() {
    return (
      <div className="ui container raised very padded segment">
        <h1 className="ui header">Family Album</h1>
        <div className="ui buttons">
            <BtnSubmit text="Add More Photos" disabled='' onClick={this.handleUpload}/>
          </div>
      </div>
    );
  }

}

export default FamilyAlbum;
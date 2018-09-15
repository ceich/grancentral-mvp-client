import React, {Component} from "react";

import './../CSS/Style.css';
import imgupload from './../img/imgupload.png';
import BtnSubmit from './BtnSubmit';

class FamilyAlbum extends Component {
  constructor(props) {
    super(props);

    //console.log('name elder : ' + this.props.location.state.name);
    console.log('props : ' + JSON.stringify(this.props, null, 4));

    this.handleSave = this.handleSave.bind(this);
  }
  handleClick() {
    alert("clicked detected...");
  }

  handleSave() {
    const { history } = this.props;
    //history.push('/inviteOthers');

    const id = history.location.state.account.id;

    //history.push();
    history.push({pathname : '/account/'+id+'/member/new', state : {account : history.location.state.account}});
    ///
    //alert("clicked detected...");
  }

  render() {
    return (<div className="ui container raised very padded segment">
      <h1 className="ui header">Create Family Album</h1>
      <div className="ui form">
        <div className="field twelve wide">
          <div className="intro">
            When not in use, GranCentral will display a slideshow of images uploaded by you and your family
          </div>
        </div>
        <div className="field twelve wide">
          <input id="imgUpload" className="nameSound" type="image" alt="Photo Upload" src={imgupload} onClick={this.handleClick.bind(this)}/>
          <label htmlFor="imgUpload">Upload a few images now to get started</label>
        </div>
        <div className="field twelve wide link">
          <BtnSubmit text="skip this step" disabled='' customClass='link' onClick={this.handleSave}/>
        </div>
      </div>
    </div>);
  }

}

export default FamilyAlbum;
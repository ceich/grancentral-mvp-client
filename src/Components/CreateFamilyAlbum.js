import React, {Component} from "react";
import { Link } from "react-router-dom";

import './../CSS/Style.css';
import imgupload from './../img/imgupload.png';
import BtnSubmit from './BtnSubmit';
import heart from './../heart.svg';

class CreateFamilyAlbum extends Component {
  constructor(props) {
    super(props);

    this.handleSave = this.handleSave.bind(this);
  }
  handleClick() {
    const { history } = this.props;

    history.push({pathname : '/myPictures', state : {account : history.location.state.account}});
  }

  handleSave() {
    const { history } = this.props;

    const id = history.location.state.account.id;

    history.push({pathname : '/account/'+id+'/member/new', state : {account : history.location.state.account}});
  }

  render() {
    const { history } = this.props;
    return (
      <div>
        <header className="App-header">
          <Link to={{pathname : '/timeline', state : {account : history.location.state.account}}}>
            <img className="App-logo" src={heart} alt="heart" />
          </Link>
        </header>
        <div className="ui container raised very padded segment">
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
        </div>
      </div>
    );
  }

}

export default CreateFamilyAlbum;
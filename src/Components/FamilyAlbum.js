import React, {Component} from "react";
import {Link} from "react-router-dom";
import {graphql} from "react-apollo";

import './../CSS/Style.css';
import imgupload from './../img/imgupload.png';

class FamilyAlbum extends Component {

  handleClick() {
    alert("clicked detected...");
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
          <a href="javascript:none">skip this step</a>
        </div>
      </div>
    </div>);
  }

}

export default FamilyAlbum;
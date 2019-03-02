import React from "react";
import { Link } from "react-router-dom";

import './../CSS/Style.css';
// import imgupload from './../img/imgupload.png';
import plus from './../img/plus1.png';

const FamilyAlbum = (props) => {
  const { account, album } = props;
  
  if (!account || !album) {
    return (
      <div className="ui container raised very padded segment">
        <h1 className="ui header">Create Family Album</h1>
        <div className="ui form">
          <div className="field twelve wide">
            <div className="intro">
              When not in use, GranCentral will display a slideshow of images uploaded by you and your family.
            </div>
          </div>
          <div className="field twelve wide">
            <Link to="/myPictures">
              <img id="imgUpload" src={plus} alt="add to family album"/>
              <label htmlFor="imgUpload">Upload a few images now to get started</label>
            </Link>
          </div>
          <div className="field twelve wide link">
            <Link to='/newMember'>Skip this step</Link>
          </div>
        </div>
      </div>
    )
  } else {
    return (
      <div className="ui container raised very padded segment">
        <h1 className="ui header">Family Album</h1>
        <div className="field twelve wide">
          {"TODO: render account.album"}
        </div>
        <div className="field twelve wide">
          <Link to="/myPictures">
            <img id="imgUpload" src={plus} alt="add to family album"/>
            <label htmlFor="imgUpload">Upload a few images now to get started</label>
          </Link>
        </div>
      </div>
    )
  }
}

export default FamilyAlbum;
import React from "react";
import { Link } from "react-router-dom";

import './../CSS/Style.css';
// import imgupload from './../img/imgupload.png';
import plus from './../img/plus1.png';
import S3Photo from './S3Photo';

const FamilyAlbum = (props) => {
  const { account } = props;
  if (!account) return null;
  const { album } = account;
  
  if (!album) {
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
              <label htmlFor="imgUpload">Upload some photos now to get started</label>
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
        <div className="field twelve wide album">
          {album.map((p) => <S3Photo key={p.key} photo={p} />)}
        </div>
        <div className="field twelve wide">
          <Link to="/myPictures">
            <img id="imgUpload" src={plus} alt="add to family album"/>
            <label htmlFor="imgUpload">Manage your photos</label>
          </Link>
        </div>
      </div>
    )
  }
}

export default FamilyAlbum;
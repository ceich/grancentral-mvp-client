import React, {Component} from "react";
import { Mutation, Query } from "react-apollo";

import './../CSS/Style.css';
import BtnSubmit from './BtnSubmit';
import S3PhotoAlbum from './S3PhotoAlbum';
import QueryPictures from "../GraphQL/QueryPictures";
import MutationUpdatePictures from "../GraphQL/MutationUpdatePictures";

class MyPictures extends Component {
  handleDone = () => {
    const { history } = this.props;
    history.goBack();
  }

  // Called by S3PhotoAlbum after successful upload
  handleUpload = (photo) => {
    const { me } = this.props;
    const pictures = [
      ...me.pictures.slice().map((p) => {delete p.__typename; return p}),
      photo
    ];

    this.updatePicturesField(pictures);
  }
  
  handleDelete = (deletedItems) => {
    const { me } = this.props;
    const deletedKeys = new Map(deletedItems.map(i => [i.key, i]));
    const pictures = me.pictures
      .filter(p => !deletedKeys.has(p.key))
      .map((p) => {delete p.__typename; return p});
    this.updatePicturesField(pictures);
  }
  
  updatePicturesField = async (pictures) => {
    const { me: { id }, updatePictures } = this.props;

    const variables = { id, pictures };
    const update = this.updatePicturesUpdate;

    await updatePictures({variables, update});
  }
  
  updatePicturesUpdate = (proxy, { data: { updateUser: { user } } }) => {
    const query = QueryPictures;
    const data = proxy.readQuery({query})
    data.me.pictures = user.pictures;
    proxy.writeQuery({query, data});
  }

  render() {
    const { me, s3Opts } = this.props;

    return me ? (
      <div className="ui container raised very padded segment">
        <h1 className="ui header">Your Pictures</h1>
        <div className="field twelve wide">
          <div className="album">
            <S3PhotoAlbum {...s3Opts} level="protected"
             onLoad={this.handleUpload} onDelete={this.handleDelete} />
          </div>
        </div>
        <div className="ui buttons myPictures">
          <BtnSubmit text="Done" customClass='link' onClick={this.handleDone}/>
        </div>
      </div>
    ) : null;
  }
}

export default (props) => (
  <Query query={QueryPictures} fetchPolicy={'network-only'}>
    {({ data, loading, error }) => (
      (loading) ? "Loading..." :
      (error) ? "Error:" + error :
      <Mutation mutation={MutationUpdatePictures} ignoreResults={true}>
        {(updatePictures) => (
          <MyPictures {...props} me={data.me} updatePictures={updatePictures} />
        )}
      </Mutation>
    )}
  </Query>
);

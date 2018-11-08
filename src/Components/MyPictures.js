import React, {Component} from "react";
import { Link } from "react-router-dom";
import { Mutation, Query } from "react-apollo";
import { v4 as uuid } from 'uuid';
import { Auth } from "aws-amplify";

//Get configs
import awsmobile from './../aws-exports';

import './../CSS/Style.css';
import BtnSubmit from './BtnSubmit';
import ItemImg from './ItemImg';
import QueryPictures from "../GraphQL/QueryPictures";
import MutationUpdatePictures from "../GraphQL/MutationUpdatePictures";
import heart from './../heart.svg';

class MyPictures extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedFile : null
    }

    this.myRef = React.createRef();
    this.formRef = React.createRef();
    this.handleClick = this.handleClick.bind(this);
    this.handleUpload = this.handleUpload.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleRedirect = this.handleRedirect.bind(this);
  }

  handleRedirect() {
    const { history } = this.props;
    history.goBack();
  }

  handleClick() {
    this.myRef.current.click();
  }

  async handleSubmit(event) {
    const { me, updatePictures } = this.props;
    const { selectedFile } = this.state;

    const { identityId } = await Auth.currentCredentials();

    if (selectedFile) {
        const { name: fileName, type: mimeType } = selectedFile;

        const [, , , extension] = /([^.]+)(\.(\w+))?$/.exec(fileName);

        const key = `public/${identityId}/${uuid()}${extension && '.'}${extension}`;
        const bucket = awsmobile.aws_user_files_s3_bucket;
        const region = awsmobile.aws_user_files_s3_bucket_region;

        const file = {
            bucket,
            region,
            key,
            localUri: selectedFile,
            mimeType
        };
        
        const variables = {
          id: me.id,
          pictures: [...me.pictures, file]
        };

        await updatePictures({variables, update: this.updatePicturesUpdate});
    }
  }
  
  updatePicturesUpdate(proxy, { data: { updateUser: { user } } }) {
    const query = QueryPictures;
    const data = proxy.readQuery({query})
    data.me.pictures = user.pictures;
    proxy.writeQuery({query, data});
  }

  handleUpload(event) {
      const { target: { value, files } } = event;
      const [file,] = files || [];

      this.setState({
          selectedFile: file || value
      }, () => this.formRef.current.dispatchEvent(new Event("submit")));
  }

  render() {
    const { /*user: {id}, history,*/ me } = this.props;
    if (!me || !me.pictures) return null;
    const pictures = me.pictures;

    return (
      <div>
        <header className="App-header">
          <Link to={'/signin'}>
            <img className="App-logo" src={heart} alt="heart" />
          </Link>
        </header>
        <div className="ui container raised very padded segment">
          <h1 className="ui header">Your Pictures</h1>
          <div className="field twelve wide">
            <div className="album">
              {pictures.map((pic, index) =>
                <ItemImg key={index} propType="image" propImgKey={pic.key} />
              )}
            </div>
          </div>
          <form onSubmit={this.handleSubmit} ref={this.formRef}>
            <div className="ui buttons myPictures">
              <BtnSubmit text="Add More Photos" disabled='' onClick={this.handleClick} />
              <input className="fileUpload" label="File to upload" type="file" onChange={this.handleUpload} ref={this.myRef}/>
            </div>
            <div className="ui buttons myPictures">
              <BtnSubmit text="Done" customClass='link' onClick={this.handleRedirect}/>
            </div>
          </form>
        </div>
      </div>
    );
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

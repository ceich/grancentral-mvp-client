import React from 'react';
import { Auth, Storage } from 'aws-amplify';
import { S3Album, AmplifyTheme } from 'aws-amplify-react';
import { v4 as uuid } from 'uuid';

import BtnSubmit from './BtnSubmit';

/**
 S3PhotoAlbum displays a photo album from S3.
 S3PhotoAlbum takes the following props:
 - region : S3 region
 - bucket : S3 bucket
 - level : one of Amplify's Storage levels: public|protected|private;
   defaults to public
 - path: S3 path prefix for photos; default is "pictures"
 These props allow a client to keep AppSync data in sync:
 - onLoad : called when a new photo is uploaded, with an S3Object arg;
            if not provided, no Add a Photo button is rendered.
 - onDelete : called when photo(s) deleted, with an [S3Object] arg;
              if not provided, no selection / deletion UI is rendered.
 */
class S3PhotoAlbum extends React.Component{
  theme = Object.assign({}, AmplifyTheme, {
    overlaySelected: {
      borderStyle: 'solid',
      borderWidth: 'thick',
      borderColor: 'red',
      position: 'absolute',
      left: 0,
      top: 0,
      width: '100%',
      height: '100%'
    },
    pickerPicker: { position: 'relative' } // Work around bug in Amplify Picker
  });
  
  state = {
    identityId: null,
    selectedItems: [],
    ts: 0
  };
  
  async componentDidMount() {
    // OK to cache due to hosted login....
    const { identityId } = await Auth.currentCredentials();
    this.setState({ identityId });
  }

  // Called by S3Album when about to upload a file
  fileToKey = ({name}) => {
    // Preserve the file extension (if any), including the dot
    // cf. https://www.jstips.co/en/javascript/get-file-extension/
    const ext = name.slice((name.lastIndexOf(".") - 1 >>> 0) + 1);
    // Use a UUID instead of the file name, which may contain private info
    const key = ext ? uuid() + ext : uuid();
    // console.log('fileToKey', name, ' => ', key);
    return key;
  }

  // Put back the level-dependent prefixes that Storage stripped from key
  toS3Object = (data) => {
    const name = data.key;
    const level = this.props.level || 'public';
    let key;
    switch (level) {
      default:
        console.log('handlePick: unexpected level:', level);
        // FALLTHROUGH
      case "public":
        key = [ level, name ].join('/');
        break;
      case "protected":
      case "private":
        const { identityId } = this.state;
        // console.log('handlePick: non-public path:', level, identityId);
        key = [ level, identityId, name ].join('/');
        break;
    }

    const { region, bucket } = this.props;
    return({ region, bucket, key });
  }

  handleUpload = (data) => {
    // Notify the client on successful load
    const { onLoad } = this.props;
    if (onLoad) {
      onLoad(this.toS3Object(data));
    }
  }
  
  handleSelect = (_clickedItem, selectedItems) => {
    this.setState({selectedItems});
  }
  
  handleDelete = (event) => {
    const { onDelete, level } = this.props;
    if (!onDelete) return;

    const { selectedItems } = this.state;
    const that = this;

    Promise.all(selectedItems.map(item => {
      return Storage.remove(item.key, { level })
      .then(data => that.toS3Object(item))
      .catch(error => error);
    }))
    .then(deletedItems => {
      onDelete(deletedItems);      
      that.setState({
        selectedItems: [],
        ts: new Date().getTime()
      });
    })
    .catch(error => alert(error));

  }

  s3AlbumProps = ({level, path}) => ({
    // Addition support
    picker: !!this.props.onLoad,
    accept: 'image/*', // BUG: ignored by S3Album
    pickerTitle: 'Add a Photo',
    fileToKey: this.fileToKey,
    onLoad: this.handleUpload,
    // Deletion support
    select: !!this.props.onDelete,
    onSelect: this.handleSelect,
    // Basic props
    level: level,
    path: `${path}/`,
    theme: this.theme,
    ts: this.state.ts // update to force a refresh of the album from S3
  });

  render() {
    const level = this.props.level || 'public';
    const path = this.props.path || 'pictures';
    const deleteDisabled = this.state.selectedItems.length === 0;
    return (
      <div>
        <S3Album {...this.s3AlbumProps({level, path})} />
        {(this.props.onDelete &&
          <BtnSubmit text={'Delete Selected'} customClass={'destructive'}
            onClick={this.handleDelete} disabled={deleteDisabled} />
        )}
      </div>
    );
  }
}

export default S3PhotoAlbum;

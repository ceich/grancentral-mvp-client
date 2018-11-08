import React from 'react';
import { Auth, Storage } from 'aws-amplify';
import { Picker, S3Image } from 'aws-amplify-react';
import blank from '../img/BlankProfilePic.png';

const s3ImagePath = (photo) => {
  let path;
  const parts = (photo && photo.key) ? photo.key.split('/') : [];
  const [level, ...rest] = parts;
  switch (level) {
    case "public":
      path = rest.join('/');
      break;
    case "protected":
    case "private":
      const [ /*identityId*/, ...remainder ] = rest;
      // console.log('non-public path', level, identityId);
      path = remainder.join('/');
      break;
    default:
      path = photo && photo.key;
  }
  return path;
};

const s3ImageOptions = (photo) => {
  const level = (photo && photo.key) ? photo.key.split('/')[0] : null;
  switch (level) {
    case "public":
    case "protected":
    case "private":
      return { level };
    default:
      console.log('s3ImageOptions: unexpected key in photo:', photo);
      return {};
  }
};

/**
 S3Photo displays a photo from S3 (specified as an AppSync S3Object).
 A placeholder image is used when photo is null, or can't be loaded.
 S3Photo takes the following props:
 - region : S3 region
 - bucket : S3 bucket
 - level : one of Amplify's S3Image levels: public|protected|private;
   defaults to public
 - photo : nullable S3Object; photo.key should be /-delimited, and
   begin with one of Amplify's S3Image levels: public|protected|private
 - onPick : called when a photo selected, with an S3ObjectInput arg.
   If given, clicking on the photo allows selection of a new image.
   Upload and deletion are the job of S3Photo's parent component, e.g.
   using AppSync's auto-upload and this file's deleteS3Photo, respectively.
 */
class S3Photo extends React.Component{
  state = {
    src: null,
    key: 0  // Use to force S3Image to update when src changes
  }

  handlePick = async (data) => {
    const that = this;
    const { file, name, type } = data;
    // console.log('handlePick:', data);
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
        const { identityId } = await Auth.currentCredentials();
        // console.log('handlePick: non-public path:', level, identityId);
        key = [ level, identityId, name ].join('/');
        break;
    }

    const reader = new FileReader();
    reader.onerror = (e) => {
      console.log('reader.onError:', e);
    };
    reader.onload = (e) => {
      // console.log('reader.onLoad:', e);
      that.setState((state) => {
        state.src = e.target.result;
        state.key = state.key + 1;
        return state;
      });
      
      // Notify the client on successful load
      const { onPick, region, bucket } = that.props;
      if (onPick && region && bucket) {
        onPick({
          region,
          bucket,
          key,
          localUri: file,
          mimeType: type
        });
      }
    }
    reader.readAsDataURL(file);
  }

  s3ImageProps() {
    const { photo } = this.props;
    const { src, key } = this.state;

    if (src) {
      return { key, src };
    } else if (photo) {
      return {
        key,
        imgKey: s3ImagePath(photo),
        ...s3ImageOptions(photo)
      };
    } else {
      return { src: blank };
    }
  }

  pickerProps() {
    return {
      accept: 'image/*',
      onPick: this.handlePick,
      title: this.props.photo ? 'Change Photo' : 'Pick a Photo',
      theme: {
        photoPickerButton: { display: 'none' },
        pickerInput: { height: '40%' } // TODO: figure out how to make this fit
      }
    };
  }

  render() {
    return (
      <div>
        <S3Image {...this.s3ImageProps()} />
        { this.props.onPick &&
          <Picker {...this.pickerProps()} />
        }
      </div>
    );
  }
}

/**
`deleteS3Photo` is a helper to delete unneeded photos. Argument:
- photo : S3Object
 */
const deleteS3Photo = (photo) => {
  Storage.remove(s3ImagePath(photo), s3ImageOptions(photo))
  // .then(result => console.log(result))
  .catch(error => console.log(error));
}

export { deleteS3Photo };
export default S3Photo;

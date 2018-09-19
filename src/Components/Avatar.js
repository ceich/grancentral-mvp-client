import React from 'react';
import { Storage } from 'aws-amplify';
import { S3Image } from 'aws-amplify-react';
import imgvoice from './../img/imgvoice.png';

const avatarPath = (user) => ('avatar/' + user.id);

const avatarOptions = (user) => {};


class Avatar extends React.Component{
  constructor(props) {
    super(props);

    this.state = {
      imgFound : false
    }

    this.checkImg = this.checkImg.bind(this);
  }

  componentDidMount() {
    this.checkImg(this.props.user);
  }

  checkImg = async(user) => {
    await Storage.list(avatarPath(user))
      .then(result => {
        if (result[0]) {
          console.log('succeed on checkImg, imgKey(' + avatarPath(user) + ') : ' + JSON.stringify(result));
          this.setState({imgFound : true});
        } else {
          console.log('image not found, imgKey(' + avatarPath(user) + ')');
          this.setState({imgFound : false});
        }
      })
      .catch(err => console.log('error, imgKey(' + avatarPath(user) + ') : ' + err));
  }

  render() {
    const {imgFound} = this.state;
    const {user, ...props} = this.props;

    Storage.get(avatarPath(user))
      .then(result => {
        console.log('succeed on checkImg, imgKey(' + avatarPath(user) + ') : ' + JSON.stringify(result));
      })
      .catch(err => console.log('error, imgKey(' + avatarPath(user) + ') : ' + err));


    if (imgFound) {
      //console.log('imgFound true, re-render');
      return(
        <S3Image imgKey={avatarPath(user)} onError={(e) => {console.log('image not found : ' + avatarPath(user));}} {...props} />
      );
    } else {
      return (
        <img src={imgvoice} alt="member's " />
      );
    }
  }

}


const deleteAvatar = (user) => {
  Storage.remove(avatarPath(user), avatarOptions(user))
  .then(result => console.log(result))
  .catch(error => console.log(error));
}

export { deleteAvatar };
export default Avatar;

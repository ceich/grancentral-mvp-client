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
    if(user.id) {
      await Storage.list(avatarPath(user))
        .then(result => {
          if (result[0]) {
            this.setState({imgFound : true});
          } else {
            this.setState({imgFound : false});
          }
        })
        .catch(err => console.log('error, imgKey(' + avatarPath(user) + ') : ' + err));
    }
  }

  render() {
    const {imgFound} = this.state;
    const {user, ...props} = this.props;

    if (imgFound) {
      return(
        <S3Image imgKey={avatarPath(user)} {...props} />
      );
    } else {
      return (
        <S3Image src={imgvoice} {...props} />
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

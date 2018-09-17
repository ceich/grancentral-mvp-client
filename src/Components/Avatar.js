import React from 'react';
import { Storage } from 'aws-amplify';
import { S3Image } from 'aws-amplify-react';
import imgvoice from './../img/imgvoice.png';

const avatarPath = (user) => ('avatar/' + user.id);

const avatarOptions = (user) => {};

const Avatar = ({user, ...props}) => {
  console.log('user : ' + JSON.stringify(user, null, 4));
  console.log('props : ' + JSON.stringify(avatarPath(user), null, 4));

  /*
  let params = {
    Bucket: config.get('s3bucket'),
    Key: path
  };

  s3.waitFor('objectExists', params, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else     console.log(data);           // successful response
  });

  <S3Image imgKey={avatarPath(user)} onError={(e) => {e.target.src={imgvoice};}} {...props} />
  */

  return (
    <S3Image imgKey={avatarPath(user)} onError={(e) => {console.log('image not found : ' + avatarPath(user));}} {...props} />
  )
};

const deleteAvatar = (user) => {
  Storage.remove(avatarPath(user), avatarOptions(user))
  .then(result => console.log(result))
  .catch(error => console.log(error));
}

export { deleteAvatar };
export default Avatar;

import React from 'react';
import { Storage } from 'aws-amplify';
import { S3Image } from 'aws-amplify-react';

const avatarPath = (user) => ('avatar/' + user.id);

const avatarOptions = (user) => {};

const Avatar = ({user, ...props}) => (
  <S3Image imgKey={avatarPath(user)} {...props} />
);

const deleteAvatar = (user) => {
  Storage.remove(avatarPath(user), avatarOptions(user))
  .then(result => console.log(result))
  .catch(error => console.log(error));
}

export { deleteAvatar };
export default Avatar;

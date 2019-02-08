import React from 'react';
import { Switch, Route } from 'react-router';
import { Auth } from 'aws-amplify';

import MyAccounts from './Components/MyAccounts';
import ViewAccount from './Components/ViewAccount';
import NewAccount from './Components/NewAccount';
import NewMember from './Components/NewMember';
import Profile from './Components/Profile';
import Signin from './Components/Signin';
import CreateFamilyAlbum from './Components/CreateFamilyAlbum';
import MyPictures from './Components/MyPictures';
import Timeline from './Components/Timeline';
import TimelineDetail from './Components/TimelineDetail';

const routes = (props) => {
  const state = props;
  return (
    <Switch>
      <Route exact={true} path="/"
             render={(props) => <MyAccounts {...props} {...state} />} />
      <Route path="/account/new"
             render={(props) => <NewAccount {...props} {...state} />} />
      <Route exact={true} path="/account/:id"
             render={(props) => <ViewAccount {...props} {...state} />} />
      <Route path="/account/:id/member/new"
             render={(props) => <NewMember {...props} {...state} />} />
      <Route path="/profile"
             render={(props) => <Profile {...props} {...state} />} />
      <Route path="/signin"
             render={(props) => <Signin {...props} {...state} />} />
      <Route path="/createFamilyAlbum"
             render={(props) => <CreateFamilyAlbum {...props} {...state} />} />
      <Route path="/myPictures"
             render={(props) => <MyPictures {...props} {...state} />} />
      <Route path="/timeline"
             render={(props) => <Timeline {...props} {...state} />} />
      <Route path="/timelineDetail"
             render={(props) => <TimelineDetail {...props} {...state} />} />
      <Route path="/signout"
             render={() => { Auth.signOut(); return null; }} />
    </Switch>
  );
}

export default routes;

import React from 'react';
import { Switch, Route } from 'react-router';
import { BrowserRouter as Router } from 'react-router-dom';
import { Auth } from 'aws-amplify';

import Menu from './Menu';
import SelectAccount from './SelectAccount';
import CaringCircle from './CaringCircle';
import NewAccount from './NewAccount';
import NewMember from './NewMember';
import Profile from './Profile';
import Signin from './Signin';
import FamilyAlbum from './FamilyAlbum';
import MyPictures from './MyPictures';
import Timeline from './Timeline';
import TimelineDetail from './TimelineDetail';

const router = (appProps) => (
  <Router>
    <div className="App">
      <Menu {...appProps} />
      <Switch>
        <Route path="/selectAccount"
               render={(props) => <SelectAccount {...props} {...appProps} />} />
        <Route path="/newAccount"
               render={(props) => <NewAccount {...props} {...appProps} />} />
        <Route path="/caringCircle"
               render={(props) => <CaringCircle {...props} {...appProps} />} />
        <Route path="/newMember"
               render={(props) => <NewMember {...props} {...appProps} />} />
        <Route path="/profile"
               render={(props) => <Profile {...props} {...appProps} />} />
        <Route path="/signin"
               render={(props) => <Signin {...props} {...appProps} />} />
        <Route path="/familyAlbum"
               render={(props) => <FamilyAlbum {...props} {...appProps} />} />
        <Route path="/myPictures"
               render={(props) => <MyPictures {...props} {...appProps} />} />
        <Route path="/timeline"
               render={(props) => <Timeline {...props} {...appProps} />} />
        <Route path="/timelineDetail"
               render={(props) => <TimelineDetail {...props} {...appProps} />} />
        <Route path="/signout"
               render={() => { Auth.signOut(); return null; }} />
      </Switch>
    </div>
  </Router>
)

export default router;

import React from "react";
import { Query, Mutation } from "react-apollo";
import "semantic-ui-css/semantic.min.css";

import S3Photo, { deleteS3Photo } from "./S3Photo";
import QueryMe from "../GraphQL/QueryMe";
import QueryGetRole from "../GraphQL/QueryGetRole";
import MutationUpdateUser from "../GraphQL/MutationUpdateUser";

import RelationshipToElderDropdown from './RelationshipToElderDropdown';
import './../CSS/Style.css';
import BtnSubmit from './BtnSubmit';
import heart from './../heart.svg';

class Profile extends React.Component {
  state = {
    profile: {
      ...this.props.me,
      role: '',
      roleOther: '',
    },
    isDisabled: 'disabled'
  }

  constructor(props) {
    super(props);
  
    this.onPick = this.onPick.bind(this);
    this.handleSave = this.handleSave.bind(this);
    this.handleRoleChange = this.handleRoleChange.bind(this);
    this.checkAllInput = this.checkAllInput.bind(this);
  // }
  // 
  // componentWillMount() {
    let origRole = '';
    let tmpRole = '';
    let tmpRoleOther = '';
    // if ((this.props.me.members) && (this.props.me.members.length > 0)) {
    //   origRole = this.props.me.members[0].role;
    //   tmpRole = (origRole.substring(0,5) === 'OTHER') ? 'OTHER' : origRole;
    //   tmpRoleOther = (tmpRole === 'OTHER') ? origRole.substring(6,origRole.length) : '';
    // }
  
    const profile = Object.assign({ deleteS3Photo: false, role : tmpRole }, this.props.me);
    this.state = {
        profile,
        newAvatar : null,
        roleOther : tmpRoleOther,
        originalRole : origRole,
        isDisabled : 'disabled'
    };
  
  }

  onPick(avatar) {
    console.log('Profile.onPick', avatar);
    this.setState({avatar}, () => this.checkAllInput());
  }

  handleChange(field, {target: { value }}) {
    const tmpvalue = (field === 'role' && value === "please select") ? '' : value;

    if ((field === 'role') && (value !== "OTHER")) {
      this.setState({roleOther : ""});
    }

    this.setState(state => ({profile: { ...state.profile, [field]: tmpvalue }}), () => this.checkAllInput());
  }

  handleRoleChange(field, event) {
    if (field === 'role') {
      this.handleChange('role', event);
    } else {
      this.setState({roleOther : event.target.value}, () => this.checkAllInput());
    }
  }

  checkAllInput() {
    const {role, name, avatar} = this.state.profile;
    const {roleOther, newAvatar} = this.state;
    const isDisabled = (role === "" || (role === 'OTHER' && roleOther === "") ||
                        name === "" ||
                        (avatar === null && newAvatar === null)) ? 'disabled' : '';

    this.setState({isDisabled});
  }

  async handleSave(e) {
    e.preventDefault();

    const { updateUser, history } = this.props;
    const { profile, roleOther, originalRole, newAvatar } = this.state;

    const finalRole = (profile.role === 'OTHER') ? profile.role + "_" + roleOther : profile.role;

    if (profile.deleteS3Photo) {
      deleteS3Photo(profile.avatar);
      profile.avatar = null;
    } else if (newAvatar) {
      deleteS3Photo(profile.avatar);
      profile.avatar = newAvatar;
    }

    await updateUser({
      variables: { ...profile },
      optimisticResponse: { updateUser: {
        __typename: 'UpdateUserResult',
        user: { __typename: 'User', ...profile }
      } },
      update: (proxy, { data: { updateUser: { user } }}) => {
        const query = QueryMe;
        const data = proxy.readQuery({ query });
        data.me = Object.assign({}, data.me, user);
        proxy.writeQuery({ query, data });
      }
    })
    .then(() => {
      if (originalRole === "") {
        history.push({pathname : '/account/new', state : {role : finalRole}});
      } else {
        history.goBack();
      }
    })
    .catch(err => console.log(err));
  }

  render() {
    const { me, history } = this.props;
    const { profile, roleOther, originalRole, isDisabled } = this.state;
    
    if (!me) return null;
    const { avatar } = me;

    let customClass = (originalRole === "") ? "" : "hide";

    return profile && (
      <div>
        <header className="App-header">
          <img className="App-logo" src={heart} alt="heart" />
        </header>
        <div className="ui container raised very padded segment containerClass">
          <h1 className="ui header">About you...</h1>
          <div className="ui form">
            <div className="field twelve wide avatar">
              <S3Photo photo={avatar} level={"protected"}
                {...this.props.s3Opts} onPick={this.onPick} />
            </div>
            {/* <div className="field twelve wide deleteImage">
              <input type="checkbox" id="deleteS3Photo" disabled={!profile.avatar}
                value={profile.deleteS3Photo}
                onChange={this.handleChange.bind(this, 'deleteS3Photo')}
              />
              <label htmlFor="deleteS3Photo">Delete Image</label>
            </div> */}
            <div className="field twelve wide">
              <label htmlFor="name">Name</label>
              <input placeholder="Your Name" type="text" id="name" value={profile.name} onChange={this.handleChange.bind(this, 'name')}/>
            </div>
            <div className={"field twelve wide " + customClass}>
              <label htmlFor="relationship">Relationship To Elder</label>
              <RelationshipToElderDropdown
                  valueRoleOther={roleOther}
                  valueSelect={profile.role}
                  queryProps={QueryGetRole}
                  onChange={this.handleRoleChange} />
            </div>

            {(originalRole === "") ?
              <div className="ui buttons">
                <BtnSubmit text="Next" disabled={isDisabled} onClick={this.handleSave}/>
              </div>
            :
              <div className="ui buttons">
                <button className="ui button" onClick={history.goBack}>Cancel</button>
                <div className="or"></div>
                <button className="ui positive button" onClick={this.handleSave}>Save</button>
              </div>
            }
          </div>
        </div>
      </div>
    );

  }
}

export default (props) => (
  <Query query={QueryMe} fetchPolicy={"cache-and-network"}>
    {({ data, loading, error }) => (
        loading ? "Loading..." :
        error ? "Error" :
        <Mutation mutation={MutationUpdateUser} ignoreResults={true}>
          {(updateUser, { loading, error }) => (
            loading ? "Loading..." :
            error ? "Error" :
            <Profile {...props} me={data.me} updateUser={updateUser} />
          )}
        </Mutation>
    )}
  </Query>
);

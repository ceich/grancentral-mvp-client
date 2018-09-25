import React from "react";
import { Query, Mutation } from "react-apollo";
import "semantic-ui-css/semantic.min.css";

import Avatar, { deleteAvatar } from "./Avatar";
import QueryMe from "../GraphQL/QueryMe";
import QueryGetRole from "../GraphQL/QueryGetRole";
import QueryMyAccounts from "../GraphQL/QueryMyAccounts";
import MutationUpdateUser from "../GraphQL/MutationUpdateUser";

import RelationshipToElderDropdown from './RelationshipToElderDropdown';
import './../CSS/Style.css';
import BtnSubmit from './BtnSubmit';
import heart from './../heart.svg';

class Profile extends React.Component {
  static defaultProps = {
    me: {},
    updateUser: () => null
  }

  constructor(props) {
    super(props);

    this.onImageLoad = this.onImageLoad.bind(this);
    this.handleSave = this.handleSave.bind(this);
    this.handleRoleChange = this.handleRoleChange.bind(this);
    this.checkAllInput = this.checkAllInput.bind(this);
  }

  componentWillMount() {
    let origRole = '';
    let tmpRole = '';
    let tmpRoleOther = '';
    if ((this.props.me.members) && (this.props.me.members.length > 0)) {
      origRole = this.props.me.members[0].role;
      tmpRole = (origRole.substring(0,5) === 'OTHER') ? 'OTHER' : origRole;
      tmpRoleOther = (tmpRole === 'OTHER') ? origRole.substring(6,origRole.length) : '';
    }

    const profile = Object.assign({ deleteAvatar: false, role : tmpRole }, this.props.me);
    this.setState({
        profile,
        roleOther : tmpRoleOther,
        originalRole : origRole,
        isDisabled : 'disabled'
    });

  }

  onImageLoad(url) {
    this.setState({ imageLoaded: url.startsWith('https://') }, () => this.checkAllInput());
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
    const {role, name} = this.state.profile;
    const {roleOther, imageLoaded} = this.state;
    const isDisabled = (role === "" || (role === 'OTHER' && roleOther === "") || name === "" || imageLoaded === null) ? 'disabled' : '';

    this.setState({isDisabled : isDisabled});
  }

  async handleSave(e) {
    e.preventDefault();

    const { updateUser, history } = this.props;
    const { profile, imageLoaded, roleOther, originalRole } = this.state;

    const finalRole = (profile.role === 'OTHER') ? profile.role + "_" + roleOther : profile.role;

    if (profile.deleteAvatar) {
      deleteAvatar(profile);
      profile.avatar = false;
    } else {
      profile.avatar = imageLoaded;
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
    const { result, history } = this.props;
    const { profile, roleOther, originalRole, imageLoaded, isDisabled } = this.state;

    if (result.loading) return('Loading...');
    if (result.error) return('Error: ' + result.error);

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
              <Avatar user={profile} onLoad={this.onImageLoad} picker />
            </div>
            <div className="field twelve wide deleteImage">
              <input type="checkbox" id="deleteAvatar" disabled={!imageLoaded}
                value={profile.deleteAvatar}
                onChange={this.handleChange.bind(this, 'deleteAvatar')}
              />
              <label htmlFor="deleteAvatar">Delete Image</label>
            </div>
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

            {
              (originalRole === "") ?
                  <div className="ui buttons">
                    <BtnSubmit text="Next" disabled={isDisabled} onClick={this.handleSave}/>
                  </div> :
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
  <Query query={QueryMyAccounts}>
    {({ data, loading, error }) => {
      return (
        loading ? "Loading..." :
        error ? "Error" :
        <Mutation mutation={MutationUpdateUser} ignoreResults={true}>
          {(updateUser, result) => (
            <Profile {...props} me={data.me} updateUser={updateUser} result={result} />
          )}
        </Mutation>
      )
    }}
  </Query>
);

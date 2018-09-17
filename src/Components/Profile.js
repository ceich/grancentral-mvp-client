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

class Profile extends React.Component {
  static defaultProps = {
    me: {},
    updateUser: () => null
  }

  constructor(props) {
    super(props);

    console.log('me : ' + JSON.stringify(this.props.me));

    this.onImageLoad = this.onImageLoad.bind(this);
    this.handleSave = this.handleSave.bind(this);
    this.handleRoleChange = this.handleRoleChange.bind(this);
    this.checkAllInput = this.checkAllInput.bind(this);
  }

  componentWillMount() {
    //console.log('componentWillMount got called');
    //OTHER_aa

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
        isDisabled : 'disabled'
    });

  }

  onImageLoad(url) {
    //console.log('onImageLoad got called');
    this.setState({ imageLoaded: url.startsWith('https://') }, () => this.checkAllInput());
  }

  handleChange(field, {target: { value }}) {
    //console.log('handleChange got called');

    const tmpvalue = (field === 'role' && value === "please select") ? '' : value;

    if ((field === 'role') && (value !== "OTHER")) {
      this.setState({roleOther : ""});
    }

    this.setState(state => ({profile: { ...state.profile, [field]: tmpvalue }}), () => this.checkAllInput());
  }

  handleRoleChange(field, event) {
    //console.log('handleRoleChange got called');
    if (field === 'role') {
      this.handleChange('role', event);
    } else {
      this.setState({roleOther : event.target.value}, () => this.checkAllInput());
    }
  }

  checkAllInput() {
    //console.log('checkAllInput got called');
    const {role, name} = this.state.profile;
    const {roleOther, imageLoaded} = this.state;
    const isDisabled = (role === "" || (role === 'OTHER' && roleOther === "") || name === "" || imageLoaded === null) ? 'disabled' : '';

    //console.log('isDisabled : ' + isDisabled);
    //console.log('role : ' + role);
    //console.log('roleOther : ' + roleOther);

    this.setState({isDisabled : isDisabled});
  }

  async handleSave(e) {
    e.preventDefault();

    const { updateUser, history } = this.props;
    const { profile, imageLoaded, roleOther } = this.state;

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
    .then(() => history.push({pathname : '/account/new', state : {role : finalRole}}))
    //.then(() => history.goBack())
    .catch(err => console.log(err));
  }

  render() {
    const { result } = this.props;
    const { profile, roleOther, imageLoaded, isDisabled } = this.state;

    //console.log('profile.render() got called');
    //console.log('profile on profile.render : ' + JSON.stringify(profile, null, 4));

    if (result.loading) return('Loading...');
    if (result.error) return('Error: ' + result.error);

    return profile && (
      <div className="ui container raised very padded segment containerClass">
        <h1 className="ui header">About you...</h1>
        <div className="ui form">
          <div className="field twelve wide avatar">
            <Avatar user={profile} picker onLoad={this.onImageLoad} />
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
          <div className="field twelve wide">
            <label htmlFor="relationship">Relationship To Elder</label>
            <RelationshipToElderDropdown
                valueRoleOther={roleOther}
                valueSelect={profile.role}
                queryProps={QueryGetRole}
                onChange={this.handleRoleChange} />
          </div>
          <div className="ui buttons">
            <BtnSubmit text="Next" disabled={isDisabled} onClick={this.handleSave}/>
          </div>
        </div>
      </div>
    );

  }
}

export default (props) => (
  <Query query={QueryMyAccounts}>
    {({ data, loading, error }) => {
      //console.log('data at profile : ' + JSON.stringify(data));
      //console.log('error at profile : ' + JSON.stringify(error));
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

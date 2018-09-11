import React from "react";
import { Query, Mutation } from "react-apollo";
import "semantic-ui-css/semantic.min.css";

import Avatar, { deleteAvatar } from "./Avatar";
import QueryMe from "../GraphQL/QueryMe";
import QueryGetRole from "../GraphQL/QueryGetRole";
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
    this.onImageLoad = this.onImageLoad.bind(this);
    this.handleSave = this.handleSave.bind(this);
    this.handleRoleChange = this.handleRoleChange.bind(this);
    this.checkAllInput = this.checkAllInput.bind(this);
  }

  componentWillMount() {
    const profile = Object.assign({ deleteAvatar: false, role : '' }, this.props.me);
    this.setState({
        profile,
        isDisabled : 'disabled'
    });
  }

  onImageLoad(url) {
    this.setState({ imageLoaded: url.startsWith('https://') });
    this.checkAllInput();
  }

  handleChange(field, {target: { value }}) {
    this.setState(state => ({profile: { ...state.profile, [field]: value }}));
    this.checkAllInput();
  }

  handleRoleChange(event) {
    this.handleChange('role', event);
  }

  checkAllInput() {
    const {role, name} = this.state.profile;
    const isDisabled = (role === "" || name === "" || this.state.imageLoaded === null) ? 'disabled' : '';
    this.setState({isDisabled : isDisabled});
  }

  async handleSave(e) {
    e.preventDefault();

    const { updateUser, history } = this.props;
    const { profile, imageLoaded } = this.state;

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
    .then(() => history.goBack())
    .catch(err => console.log(err));
  }

  render() {
    const { history, result } = this.props;
    const { profile, imageLoaded, isDisabled } = this.state;

    console.log('profile : ' + JSON.stringify(profile));

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
          <RelationshipToElderDropdown queryProps={QueryGetRole} onChange={this.handleRoleChange} />
        </div>
        <div className="ui buttons">
          <BtnSubmit text="Next" disabled={isDisabled} onClick={this.handleSave}/>
        </div>
      </div>
    </div>);

  }
}

export default (props) => (
  <Query query={QueryMe}>
    {({ data, loading, error }) => (
      //loading ? "Loading..." :
      //error ? "Error" :
      <Mutation mutation={MutationUpdateUser} ignoreResults={true}>
        {(updateUser, result) => (
          <Profile {...props} me={data.me} updateUser={updateUser} result={result} />
        )}
      </Mutation>
    )}
  </Query>
);

import React from "react";
import { Query, Mutation } from "react-apollo";
import "semantic-ui-css/semantic.min.css";

import Avatar, { deleteAvatar } from "./Avatar";
import QueryMe from "../GraphQL/QueryMe";
import MutationUpdateUser from "../GraphQL/MutationUpdateUser";

class Profile extends React.Component {
  static defaultProps = {
    me: {},
    updateUser: () => null
  }

  constructor(props) {
    super(props);
    this.onImageLoad = this.onImageLoad.bind(this);
    this.handleSave = this.handleSave.bind(this);
  }

  componentWillMount() {
    const profile = Object.assign({ deleteAvatar: false }, this.props.me);
    this.setState({profile});
  }

  onImageLoad(url) {
    this.setState({ imageLoaded: url.startsWith('https://') });
  }

  handleChange(field, {target: { value }}) {
    this.setState(state => ({profile: { ...state.profile, [field]: value }}));
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
      optimisticResponse: { updateUser: { user: { __typename: 'User', ...profile } } },
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
    const { profile, imageLoaded } = this.state;

    if (result.loading) return('Loading...');
    if (result.error) return('Error: ' + result.error);

    return profile && (
    <div className="ui container raised very padded segment">
      <h1 className="ui header">Update your profile</h1>
      <div className="ui form">
        <div className="field twelve wide">
          <label htmlFor="name">Name</label>
          <input type="text" id="name" value={profile.name} onChange={this.handleChange.bind(this, 'name')}/>
        </div>
        <div className="field twelve wide">
          <Avatar user={profile} picker onLoad={this.onImageLoad} />
        </div>
        <div className="field twelve wide">
          <label htmlFor="deleteAvatar">Delete Image</label>
          <input type="checkbox" id="deleteAvatar" disabled={!imageLoaded}
            value={profile.deleteAvatar}
            onChange={this.handleChange.bind(this, 'deleteAvatar')}
          />
        </div>
        <div className="ui buttons">
          <button className="ui button" onClick={history.goBack}>Cancel</button>
          <div className="or"></div>
          <button className="ui positive button" onClick={this.handleSave}>Save</button>
        </div>
      </div>
    </div>);
  }
}

export default (props) => (
  <Query query={QueryMe}>
    {({ data, loading, error }) => (
      loading ? "Loading..." :
      error ? "Error" :
      <Mutation mutation={MutationUpdateUser} ignoreResults={true}>
        {(updateUser, result) => (
          <Profile {...props} me={data.me} updateUser={updateUser} result={result} />
        )}
      </Mutation>
    )}
  </Query>
);

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
    avatar: this.props.me && this.props.me.avatar,
    newAvatar: false,
    name: this.props.me && this.props.me.name,
    role: '',
    roleOther: '',
    originalRole: this.props.location.state && this.props.location.state.originalRole,
    isDisabled: 'disabled'
  }

  componentDidUpdate(prevProps) {
    // Update when the query returns
    if (this.props.me && !prevProps.me) {
      // console.log('componentDidUpdate: updating state from props');
      this.setState({
        avatar: this.props.me.avatar,
        name: this.props.me.name
      }, () => this.checkAllInput());
    }
  }
  
  handlePick = (avatar) => {
    // console.log('Profile.handlePick', avatar);
    const newAvatar = true;
    this.setState({avatar, newAvatar}, () => this.checkAllInput());
  }

  handleChange = (field, {target: { value }}) => {
    const tmpvalue = (field === 'role' && value === "please select") ? '' : value;

    if ((field === 'role') && (value !== "OTHER")) {
      this.setState({roleOther : ""});
    }

    this.setState(state => ({[field]: tmpvalue }), () => this.checkAllInput());
  }

  handleRoleChange = (field, event) => {
    if (field === 'role') {
      this.handleChange('role', event);
    } else {
      this.setState({roleOther : event.target.value}, () => this.checkAllInput());
    }
  }

  checkAllInput = () => {
    const {role, name, avatar, roleOther, newAvatar} = this.state;
    const isDisabled = (role === "" || (role === 'OTHER' && roleOther === "") ||
                        name === "" ||
                        (avatar === null && newAvatar === null)) ? 'disabled' : '';

    this.setState({isDisabled});
  }

  handleSave = async (e) => {
    e.preventDefault();

    const { me, updateUser, history } = this.props;
    const { avatar, newAvatar, name, role, roleOther, originalRole } = this.state;

    const finalRole = (role === 'OTHER') ? role + "_" + roleOther : role;

    if (newAvatar) {
      deleteS3Photo(me.avatar);
    }
    
    await updateUser({
      variables: { id: me.id, name, avatar: newAvatar ? avatar : null },
      optimisticResponse: { updateUser: {
        __typename: 'UpdateUserResult',
        user: {
          __typename: 'User',
          id: me.id,
          name: name,
          avatar: {
            ...avatar,
            __typename: 'S3Object'
          }
        }
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
    if (!me) return null;
    let { avatar } = me;

    const { newAvatar, name, role, roleOther, originalRole, isDisabled } = this.state;
    if (newAvatar) { avatar = this.state.avatar; }

    const customClass = (originalRole === "") ? "" : "hide";

    return (
      <div>
        <header className="App-header">
          <img className="App-logo" src={heart} alt="heart" />
        </header>
        <div className="ui container raised very padded segment containerClass">
          <h1 className="ui header">About you...</h1>
          <div className="ui form">
            <div className="field twelve wide avatar">
              <label htmlFor="photo">Photo</label>
              <S3Photo photo={avatar} level={"protected"}
                {...this.props.s3Opts} onPick={this.handlePick} />
            </div>
            <div className="field twelve wide">
              <label htmlFor="name">Name</label>
              <input placeholder="Your Name" type="text" id="name" value={name} onChange={this.handleChange.bind(this, 'name')}/>
            </div>
            <div className={"field twelve wide " + customClass}>
              <label htmlFor="relationship">Relationship To Elder</label>
              <RelationshipToElderDropdown
                  valueRoleOther={roleOther}
                  valueSelect={role}
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

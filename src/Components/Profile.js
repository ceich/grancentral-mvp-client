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

class Profile extends React.Component {
  state = {
    avatar: null,
    name: null,
    role: '',
    roleOther: '',
    originalRole: this.props.location.state && this.props.location.state.originalRole,
    isDisabled: 'disabled'
  }

  handlePick = (avatar) => {
    // console.log('Profile.handlePick', avatar);
    this.setState({avatar}, () => this.checkAllInput());
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
    const { me } = this.props;
    const avatar = this.state.avatar || me.avatar;
    const name = this.state.name || me.name;
    const {role, roleOther, originalRole} = this.state;

    const isDisabled = ((originalRole === "" && (role === "" || (role === 'OTHER' && roleOther === ""))) ||
                        name === "" ||
                        avatar === null) ? 'disabled' : '';

    this.setState({isDisabled});
  }

  handleSave = async (e) => {
    e.preventDefault();

    const { me, updateUser, history } = this.props;
    const avatar = this.state.avatar || Object.assign({}, me.avatar);
    delete avatar.__typename;
    const name = this.state.name || me.name;
    const { role, roleOther, originalRole } = this.state;

    const finalRole = (role === 'OTHER') ? role + "_" + roleOther : role;

    if (this.state.avatar && me.avatar) {
      deleteS3Photo(me.avatar);
    }
    
    await updateUser({
      variables: { id: me.id, name, avatar },
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

    const avatar = this.state.avatar || me.avatar;
    const name = this.state.name || me.name;

    const { role, roleOther, originalRole, isDisabled } = this.state;

    return (
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

          {(originalRole === "") ?
          <div>
            <div className={"field twelve wide"}>
              <label htmlFor="relationship">Relationship To Elder</label>
              <RelationshipToElderDropdown
                  valueRoleOther={roleOther}
                  valueSelect={role}
                  queryProps={QueryGetRole}
                  onChange={this.handleRoleChange} />
            </div>
            <div className="ui buttons">
              <BtnSubmit text="Next" disabled={isDisabled} onClick={this.handleSave}/>
            </div>
          </div>
          :
            <div className="ui buttons">
              <button className="ui button" onClick={history.goBack}>Cancel</button>
              <div className="or"></div>
              <button className="ui positive button" disabled={isDisabled} onClick={this.handleSave}>Save</button>
            </div>
          }
        </div>
      </div>
    );

  }
}

export default (props) => (
  <Query query={QueryMe}>
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

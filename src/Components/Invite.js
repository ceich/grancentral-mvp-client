import React, {Component} from "react";
import {Link} from "react-router-dom";
import {graphql} from "react-apollo";

import QueryGetRole from "../GraphQL/QueryGetRole";
import btnNext from './../img/btnNext.png';
import BtnSubmit from './BtnSubmit';
import './../CSS/Style.css';
import RelationshipToElderDropdown from './RelationshipToElderDropdown';

class Invite extends Component {
  static defaultProps = {
    me: {}
  }

  constructor(props) {
    super(props);

    this.handleRoleChange = this.handleRoleChange.bind(this);
  }

  componentWillMount() {
    const profile = Object.assign({ role : '' }, this.props.me);
    this.setState({
        profile,
        isDisabled : 'disabled'
    });
  }

  checkAllInput() {
    const {role, name, email} = this.state.profile;
    const isDisabled = (role === "" || name === "" || email === '') ? 'disabled' : '';
    this.setState({isDisabled : isDisabled});
  }


  handleChange(field, {target: { value }}) {
    this.setState(state => ({profile: { ...state.profile, [field]: value }}));
    this.checkAllInput();
  }

  handleRoleChange(event) {
    this.handleChange('role', event);
  }

  handleClick() {
    alert("clicked detected...");
  }

  render() {
    const { profile, isDisabled } = this.state;

    return (<div className="ui container raised very padded segment">
      <h1 className="ui header">Create a Caring Circle</h1>
      <div className="ui form">
        <div className="field twelve wide">
          <div className="intro">
            Invite family members, friends, and caregivers who want to share updates about Yvonne
          </div>
        </div>
        <div className="field twelve wide">
          <label htmlFor="name">Name</label>
          <input placeholder="Your Name" type="text" id="name" value={profile.name} onChange={this.handleChange.bind(this, 'name')}/>
        </div>
        <div className="field twelve wide">
          <label htmlFor="name">Name</label>
          <input placeholder="Your Name" type="text" id="name" value={profile.name} onChange={this.handleChange.bind(this, 'name')}/>
        </div>
        <div className="field twelve wide">
          <RelationshipToElderDropdown queryProps={QueryGetRole} onChange={this.handleRoleChange} />
        </div>
        <div className="ui buttons">
          <BtnSubmit text="Invite" disabled={isDisabled} onClick={this.handleSave}/>
        </div>
      </div>
    </div>);
  }

}

export default Invite;
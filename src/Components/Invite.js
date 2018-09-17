import React, {Component} from "react";

import QueryGetRole from "../GraphQL/QueryGetRole";
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

    console.log('profile : ' + JSON.stringify(profile));

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
          <input placeholder="Name" type="text" id="name" value={profile.name} onChange={this.handleChange.bind(this, 'name')}/>
        </div>
        <div className="field twelve wide">
          <label htmlFor="name">Email Address</label>
          <input placeholder="Email Address" type="text" id="name" value={profile.name} onChange={this.handleChange.bind(this, 'name')}/>
        </div>
        <div className="field twelve wide">
          <label htmlFor="relationship">Relationship To Elder</label>
          <RelationshipToElderDropdown valueSelect='' queryProps={QueryGetRole} onChange={this.handleRoleChange} />
        </div>
        <div className="ui buttons medium">
          <BtnSubmit text="Invite" disabled={isDisabled} onClick={this.handleSave}/>
        </div>
      </div>
    </div>);
  }

}

export default Invite;
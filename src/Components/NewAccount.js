import React, {Component} from "react";
import {Mutation} from "react-apollo";
import { VoicePlayer } from 'react-voice-components';

import QueryMyAccounts from "../GraphQL/QueryMyAccounts";
import MutationCreateAccount from "../GraphQL/MutationCreateAccount";

import Moment from 'moment'
import momentLocalizer from 'react-widgets-moment';

import DateTimePicker from 'react-widgets/lib/DateTimePicker';
import 'react-widgets/dist/css/react-widgets.css'
import './../CSS/Style.css';
import imgvoice from './../img/imgvoice.png';
import BtnSubmit from './BtnSubmit';
import heart from './../heart.svg';

Moment.locale('en');
momentLocalizer(Moment);

class NewAccount extends Component {
  static defaultProps = { createAccount: () => null }

  constructor(props) {
    super(props);

    const defaultAge = 65;

    const today = new Date();
    const newDate = new Date((today.getFullYear() - defaultAge),
                             today.getMonth(),
                             today.getDate());

    this.state = {
      account: { name: '', birthday: '' },
      isDisabled : 'disabled',
      defaultDate : newDate,
      voicePlayed : false,
      namePronunciation : false
    }

    this.handleBirthdayChange = this.handleBirthdayChange.bind(this);
    this.checkAllInput = this.checkAllInput.bind(this);
    this.handleClickVoice = this.handleClickVoice.bind(this);
  }

  handleChange(field, {target: { value }}) {
    const {account} = this.state;
    account[field] = value;
    this.setState({account}, () => this.checkAllInput());
  }

  handleClickVoice(isPlayed) {

    let isNameCorrect = false;
    if (!isPlayed) {
      let confirmResult = window.confirm("Sound Right ?");
      if (confirmResult) {
        isNameCorrect = true;
      }
    }
    this.setState({voicePlayed : isPlayed, namePronunciation : isNameCorrect}, () => this.checkAllInput());
  }

  handleBirthdayChange(value) {
    const {account, defaultDate} = this.state;

    const newDate = (value) ? new Date(value) : defaultDate;
    const newDateStr = (value) ? (newDate.getFullYear() + '-' + ('0' + (newDate.getMonth()+1)).slice(-2) + '-' + ('0' + newDate.getDate()).slice(-2)) : '';

    account['birthday'] = newDateStr;
    this.setState({account}, () => this.checkAllInput());
  }

  checkAllInput() {
    const {name, birthday} = this.state.account;
    const {namePronunciation} = this.state;
    const isDisabled = (name === "" || birthday === "" || !namePronunciation) ? 'disabled' : '';
    this.setState({isDisabled : isDisabled});
  }

  handleSave = async (e) => {
    e.stopPropagation();
    e.preventDefault();

    const { createAccount, history, user, location } = this.props;
    const { account } = this.state;
    const variables = {
      name: account.name,
      ownerId: user.id,
      role: location.state.role,
      birthday: account.birthday
    };

    const { data: { createAccount: { account: newAccount } } } = await createAccount({
      variables,
      refetchQueries: [{query: QueryMyAccounts}]
    });

    history.push({
      pathname: '/createFamilyAlbum',
      state: { account: newAccount }
    });
  }

  render() {
    const {account, isDisabled, defaultDate, voicePlayed} = this.state;

    let newDateStr = (defaultDate.getMonth() + 1) + '/' + defaultDate.getDate() + '/' + defaultDate.getFullYear();

    return (
      <div>
        <header className="App-header">
          <img className="App-logo" src={heart} alt="heart" />
        </header>
        <div className="ui container raised very padded segment">
          <h1 className="ui header">About your elder...</h1>
          <div className="ui form">
            <div className="field twelve wide">
              <label htmlFor="name">Elder's Name</label>
              <input type="text" placeholder="Enter Elder's Full Name" id="name" value={account.name} onChange={this.handleChange.bind(this, 'name')}/>
            </div>
            <div className="field twelve wide">
              <input id="nameSound" className="nameSound" type="image" alt="Name Pronunciation" src={imgvoice} onClick={() => this.handleClickVoice(true)}/>
              <label htmlFor="nameSound">Tap to hear how GranCentral will say "{this.state.account.name}"</label>
              {
                (voicePlayed) ?
                    <VoicePlayer
                      play
                      onEnd={() => this.handleClickVoice(false)}
                      text={account.name} /> :
                    ""

              }
            </div>
            <div className="field twelve wide">
              <label htmlFor="name">Birthday</label>
              <DateTimePicker
                dateFormat={dt => String(dt.getDate())}
                placeholder={newDateStr}
                defaultCurrentDate={defaultDate}
                onChange={(value) => this.handleBirthdayChange(value)}
                format="M/D/YYYY"
                time={false}
              />
            </div>
            <div className="ui buttons">
              <BtnSubmit text="Next" disabled={isDisabled} onClick={this.handleSave}/>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default (props) => (
  <Mutation mutation={MutationCreateAccount}>
    {(createAccount) => (
      <NewAccount {...props} createAccount={createAccount} />
    )}
  </Mutation>
);

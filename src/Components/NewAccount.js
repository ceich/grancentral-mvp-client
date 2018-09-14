import React, {Component} from "react";
import {graphql} from "react-apollo";
import { v4 as uuid } from "uuid";

import QueryMyAccounts from "../GraphQL/QueryMyAccounts";
import MutationCreateAccount from "../GraphQL/MutationCreateAccount";

import Moment from 'moment'
import momentLocalizer from 'react-widgets-moment';
import DateTimePicker from 'react-widgets/lib/DateTimePicker';
import 'react-widgets/dist/css/react-widgets.css'
import './../CSS/Style.css';
import imgvoice from './../img/imgvoice.png';
import BtnSubmit from './BtnSubmit';

Moment.locale('en');
momentLocalizer();

class NewAccount extends Component {
  static defaultProps = { createAccount: () => null }

  //state = { account: { name: '', birthday: '' }, isDisabled : 'disabled' }

  constructor(props) {
    super(props);

    const maxYears = 65;

    let currentDate = new Date();
    let newDateStr = (currentDate.getMonth() + 1) + '/' + currentDate.getDate() + '/' + (currentDate.getFullYear() - maxYears);
    let newDate = new Date((currentDate.getFullYear() - maxYears), (currentDate.getMonth()), currentDate.getDate());

    console.log('defaultDate : ' + newDateStr);

    this.state = {
      account: { name: '', birthday: newDateStr },
      isDisabled : 'disabled',
      birthdayDate : newDate
    }

    this.handleBirthdayChange = this.handleBirthdayChange.bind(this);
  }

  handleChange(field, {target: { value }}) {
    const {account} = this.state;
    account[field] = value;
    this.setState({account}, () => console.log('changing on account : ' + JSON.stringify(this.state.account)));
  }

  handleClick() {
    alert("Sound Right ?");
  }

  handleBirthdayChange(value) {
    //console.log('date changed : ' + value);
    //const newDate = Date.parse(value);
    const tmpDate = new Date(value);
    const newDate = (tmpDate.getFullYear() + '-' + (tmpDate.getMonth() + 1) + '-' + tmpDate.getDate())



    //let currentDate = new Date(value);
    //let newDateStr = (currentDate.getMonth() + 1) + '/' + currentDate.getDate() + '/' + (currentDate.getFullYear() - maxYears);
    //let newDate = new Date((currentDate.getFullYear() - maxYears), (currentDate.getMonth()), currentDate.getDate());


    //console.log('new Date : ' + newDate);
    //console.log('date changed : ' + (newDate.getFullYear() + '-' + (newDate.getMonth() + 1) + '-' + newDate.getDate()));
    this.setState({account: {birthday: newDate}, birthdayDate: null}, () => console.log('state new date : ' + this.state.account.birthday));
  }

  handleSave = async (e) => {
    e.stopPropagation();
    e.preventDefault();

    const { createAccount, history, user } = this.props;
    const { account} = this.state;
    account.ownerId = user.id;
    //account.role = 'son-in-law';    // TODO: add UI for owner's relation to elder
    account.role = user.role;    // TODO: add UI for owner's relation to elder
    account.birthday = '1948-12-23'; // TODO: add UI for birthday selection

    await createAccount(account);

    //history.push('/');
    history.push('/familyAlbum');
  }

  render() {
    const {account, isDisabled, birthdayDate} = this.state;

    console.log('account on render : ' + JSON.stringify(account));

    return (<div className="ui container raised very padded segment">
      <h1 className="ui header">About your elder...</h1>
      <div className="ui form">
        <div className="field twelve wide">
          <label htmlFor="name">Elder's Name</label>
          <input type="text" placeholder="Enter Elder's Full Name" id="name" value={account.name} onChange={this.handleChange.bind(this, 'name')}/>
        </div>
        <div className="field twelve wide">
          <input id="nameSound" className="nameSound" type="image" alt="Name Pronunciation" src={imgvoice} onClick={this.handleClick.bind(this)}/>
          <label htmlFor="nameSound">Tap to hear how GranCentral will say "{this.state.account.name}"</label>
        </div>
        <div className="field twelve wide">
          <label htmlFor="name">Birthday</label>
          <DateTimePicker
            placeholder={account.birthday}
            currentDate={birthdayDate}
            onCurrentDateChange={(value) => this.handleBirthdayChange(value)}
            format="MM/DD/YYYY"
            time={false}
          />
        </div>
        <div className="ui buttons">
          <BtnSubmit text="Next" disabled={isDisabled} onClick={this.handleSave}/>
        </div>
      </div>
    </div>);
  }
}

export default graphql(
  MutationCreateAccount, {
    options: {
      refetchQueries: [{ query: QueryMyAccounts }],
      update: (proxy, { data: { createAccount: { account } } }) => {
        const query = QueryMyAccounts;
        const data = proxy.readQuery({ query });
        var members = data.me.members;
        // Guard against multiple calls with optimisticResponse:
        // https://github.com/awslabs/aws-mobile-appsync-sdk-js/issues/65
        if (members.length === 0 ||
            members[members.length-1].account.id !== account.id) {
          members.push({
            __typename: 'Member',
            role: 'owner', // TODO: should not be hardcoded
            account: account
          });
        }

        proxy.writeQuery({ query, data });
      }
    },
    props: (props) => ({
      createAccount: (account) => {
        return props.mutate({
          variables: account,
          optimisticResponse: () => ({
            createAccount: {
              __typename: 'CreateAccountResult',
              account: {
                __typename: 'Account',
                id: uuid(),
                createdAt: Date.now(),
                name: account.name,
                ownerId: account.ownerId,
                elders: [{
                  __typename: 'Elder',
                  name: account.name,
                  birthday: account.birthday
                }],
                members: [{
                  __typename: 'Member',
                  user: {
                    __typename: 'User',
                    id: account.ownerId
                  },
                  role: account.role
                }]
              }
            }
          })
        })
      }
    })
  }
)(NewAccount);

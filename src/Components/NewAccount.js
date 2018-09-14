import React, {Component} from "react";
import {graphql} from "react-apollo";
import { v4 as uuid } from "uuid";

import QueryMyAccounts from "../GraphQL/QueryMyAccounts";
import QueryMe from "../GraphQL/QueryMe";
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

    const currentDate = new Date();
    const newDate = new Date((currentDate.getFullYear() - maxYears), (currentDate.getMonth()), currentDate.getDate());
    //const newDateStr = (newDate.getFullYear() + '-' + (newDate.getMonth() + 1) + '-' + newDate.getDate())

    //console.log('defaultDate : ' + newDate);

    this.state = {
      account: { name: '', birthday: '' },
      isDisabled : 'disabled',
      defaultDate : newDate
    }

    this.handleBirthdayChange = this.handleBirthdayChange.bind(this);
    this.checkAllInput = this.checkAllInput.bind(this);
  }

  handleChange(field, {target: { value }}) {
    const {account} = this.state;
    account[field] = value;
    this.setState({account}, () => this.checkAllInput());
  }

  handleClick() {
    alert("Sound Right ?");
  }

  handleBirthdayChange(value) {
    //console.log('on handleBirthdayChange : ' + value);
    const {account, defaultDate} = this.state;

    const newDate = (value) ? new Date(value) : defaultDate;
    const newDateStr = (value) ? (newDate.getFullYear() + '-' + ('0' + (newDate.getMonth()+1)).slice(-2) + '-' + ('0' + newDate.getDate()).slice(-2)) : '';

    account['birthday'] = newDateStr;
    this.setState({account}, () => this.checkAllInput());
  }

  checkAllInput() {
    //console.log('checkAllInput got called');
    const {name, birthday} = this.state.account;
    const isDisabled = (name === "" || birthday === "") ? 'disabled' : '';
    this.setState({isDisabled : isDisabled});
  }

  handleSave = async (e) => {
    e.stopPropagation();
    e.preventDefault();

    const { createAccount, history, user, location } = this.props;
    const { account} = this.state;
    account.ownerId = user.id;
    //account.role = 'son-in-law';    // TODO: add UI for owner's relation to elder
    account.role = location.state.role;    // TODO: add UI for owner's relation to elder
    //account.birthday = '1948-12-23'; // TODO: add UI for birthday selection

    console.log('user : ' + JSON.stringify(user));
    console.log('account : ' + JSON.stringify(account));

    await createAccount(account);

    //history.push('/');
    history.push('/familyAlbum');
  }

  render() {
    const {account, isDisabled, defaultDate} = this.state;

    console.log('account on render : ' + JSON.stringify(account));
    //console.log('birthdayDate on render : ' + birthdayDate);

    let newDateStr = (defaultDate.getMonth() + 1) + '/' + defaultDate.getDate() + '/' + defaultDate.getFullYear();

    //console.log('role : ' + this.props.location.state.role);
    console.log('user : ' + JSON.stringify(this.props.user));

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
            placeholder={newDateStr}
            defaultCurrentDate={defaultDate}
            onChange={(value) => this.handleBirthdayChange(value)}
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
        console.log('update running ... : ' + JSON.stringify(account, null, 4));
        const query = QueryMyAccounts;

        //console.log('query : ' + JSON.stringify(query, null, 4));

        //readQuery will be error on first try
        //const data = proxy.readQuery({ query });
        let data = null;
        try{
          data = proxy.readQuery({ query });
        } catch(err) {
          console.log('err : ' + err);
          data = proxy.readQuery({ query : QueryMe });
        }


        console.log('filling members... : ' + JSON.stringify(data));

        var members = (data.me.members) ? data.me.members : [];

        console.log('finish filling members');
        // Guard against multiple calls with optimisticResponse:
        // https://github.com/awslabs/aws-mobile-appsync-sdk-js/issues/65
        if (members.length === 0 ||
            members[members.length-1].account.id !== account.id) {
          members.push({
            __typename: 'Member',
            role: account.members[0].role, // TODO: should not be hardcoded
            account: account
          });

          if(!data.me.members) {
            data.me.members = members;
            console.log('copying members, data : ' + JSON.stringify(data));
          }

        }

        proxy.writeQuery({ query, data });
        console.log('proses update finished');
      }
    },
    props: (props) => ({
      createAccount: (account) => {
        console.log('create account executed... ');
        return props.mutate({
          variables: account,
          optimisticResponse: () => {

            console.log('optimistic response running .. ');
            return ({
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
            });
          }

        })
      }
    })
  }
)(NewAccount);

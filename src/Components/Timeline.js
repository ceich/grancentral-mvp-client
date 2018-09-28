import React from "react";
import { Mutation, Query } from "react-apollo";
import { Link } from "react-router-dom";
import { v4 as uuid } from 'uuid';
import { Auth } from "aws-amplify";

//Get configs
import awsmobile from './../aws-exports';

import Moment from 'moment'
import QueryGetListEvents from "../GraphQL/QueryGetListEvents";
import MutationCreateEvent from "../GraphQL/MutationCreateEvent";

import BtnSubmit from './BtnSubmit';
import ItemImg from './ItemImg';
import "semantic-ui-css/semantic.min.css";
import './../CSS/Style.css';
import plus from './../img/plus1.png';
import video from './../img/video1.png';
import gear from './../img/gear1.png';


import heart from './../heart.svg';

class Timeline extends React.Component{
  constructor(props) {
    super(props);

    this.state = {
      msgText : '',
      myfile : null
    }

    this.myRef = React.createRef();
    this.formRef = React.createRef();
    this.handleChange = this.handleChange.bind(this);
    this.handleSend = this.handleSend.bind(this);
    this.handleUpload = this.handleUpload.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleRedirect = this.handleRedirect.bind(this);
  }

  handleChange(event) {
    this.setState({msgText : event.target.value});
  }

  handleRedirect(event, imgURL) {
    event.preventDefault();

    const { history } = this.props;
    const { account } = this.props.location.state;

    history.push({pathname : '/timelineDetail', state : {imgURL : imgURL, account : account}});
  }

  handleUpload(event) {
      const { target: { value, files } } = event;

      const [file,] = files || [];

      this.setState({
          myfile: file || value
      }, () => this.formRef.current.dispatchEvent(new Event("submit")));
  }

  handleClick(event) {
    event.preventDefault();
    this.myRef.current.click();
  }

  async handleSend() {
    const { msgText } = this.state;
    const { createEvent, user } = this.props;
    const { account } = this.props.location.state;


    let input = {
        accountId : account.id,
        text: msgText,
        userId: user.id
    };

    await createEvent(input);

    this.setState({msgText : ""});
  }

  async handleSubmit(event) {
    const { myfile: selectedFile } = this.state;
    const { accountId, createEvent, user: { id: userId } } = this.props;
    
    const text = "this is a trial";

    let media;
    if (selectedFile) {
        const { name: fileName, type: mimeType } = selectedFile;

        const [, , , extension] = /([^.]+)(\.(\w+))?$/.exec(fileName);
        
        const { identityId } = await Auth.currentCredentials();

        const key = `public/${identityId}/${uuid()}${extension && '.'}${extension}`;
        const bucket = awsmobile.aws_user_files_s3_bucket;
        const region = awsmobile.aws_user_files_s3_bucket_region;

        media = {
            bucket,
            region,
            key,
            localUri: selectedFile,
            mimeType
        };
    }

    await createEvent({
      variables: { accountId, userId, text, media },
      update: this.createEventUpdate
    });
  }

  createEventUpdate(proxy, { data: { createEvent } }) {
    const { accountId, id } = createEvent.event;

    const query = QueryGetListEvents;
    const variables = { accountId };
    const data = proxy.readQuery({ query, variables });
    
    const items = data.listEvents.items;
    // Guard against multiple calls with optimisticResponse:
    // https://github.com/awslabs/aws-mobile-appsync-sdk-js/issues/65
    if (items.length === 0 || items[items.length-1].id !== id) {
      items.push(createEvent.event);
    }

    proxy.writeQuery({ query, variables, data });
  }

  render() {
    const { account } = this.props.history.location.state;
    const { listEvents } = this.props;
    const { msgText } = this.state;

    const statusDisplay = (listEvents) ? listEvents.items.length : -1;


    return(
      <div>
        <header className="App-header">
          <img className="App-logo" src={heart} alt="heart" />
        </header>
        <div className="ui container raised very padded segment containerClass">
          <h1 className="ui header">{ account.name + " Central" }</h1>
          <div className="ui form centralContainer">
            <div className="centralContent">
              <div className={"centralContentInner " + ((statusDisplay === 0) ? "tableShape" : "") }>
                {
                  (statusDisplay === -1) ?
                      "Loading..." :
                      ((statusDisplay > 0) ?
                          listEvents.items.map((mydata, index) =>
                            <div key={mydata.id} className="eventsItem">
                              <b>User</b>
                              {
                                "  " + Moment.unix(mydata.createdAt).format('h:mm A')
                              }
                              <br/>
                              {mydata.text}
                              {
                                (!mydata.media) ?
                                    "" :
                                    <ItemImg key={index} propType="video" propsClick={this.handleRedirect} propImgKey={mydata.media.key} />
                              }
                            </div>
                          ) :
                          <div className="noContent">
                            <b>Nothing here yet ... here's some things to try</b>
                            <br/><br/>
                            Add a new photo to {account.name}'s' Family Album by tapping "+" below
                            <br/><br/>
                            Send a message to @{account.name}
                          </div>)
                }
              </div>
            </div>
            <div className="field twelve wide">

              <input placeholder="Your Message Here" value={msgText} className="msgInput" type="text" onChange={(event) => this.handleChange(event)}/>
              <BtnSubmit text="..." customClass="btnSend" disabled="" onClick={this.handleSend}/>
              <div className="leftSection">
                <form onSubmit={this.handleSubmit} ref={this.formRef}>
                  <input type="image" src={video} alt="upload new media" onClick={this.handleClick}/>
                  <input className="fileUpload" label="File to upload" type="file" onChange={this.handleUpload} ref={this.myRef}/>

                  <Link to={{pathname : '/myPictures', state : {account : account}}}>
                    <img src={plus} alt="add to family album"/>
                  </Link>


                </form>
              </div>
              <div className="rightSection">
                <img src={gear} alt="setting"/>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default (props) => (
  <Query query={QueryGetListEvents}
    variables={{ accountId: props.location.state.account.id }}>
    {({ data, loading, error }) => (
      (loading) ? "Loading..." :
      (error) ? error :
      <Mutation mutation={MutationCreateEvent} ignoreResults={true}>
        {(createEvent) => (
          <Timeline {...props}
            listEvents={data.listEvents}
            createEvent={createEvent} />
        )}
      </Mutation>
    )}
  </Query>
);

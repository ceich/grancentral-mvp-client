import React, {Component} from "react";
import { Link } from "react-router-dom";
import {compose, Query, graphql} from "react-apollo";
import { v4 as uuid } from 'uuid';
import { Auth } from "aws-amplify";

//Get configs
import awsmobile from './../aws-exports';

import './../CSS/Style.css';
import BtnSubmit from './BtnSubmit';
import ItemImg from './ItemImg';
import MutationCreateEvent from "../GraphQL/MutationCreateEvent";
import QueryGetAccount from "../GraphQL/QueryGetAccount";
import QueryGetListEvents from "../GraphQL/QueryGetListEvents";
import heart from './../heart.svg';

class FamilyAlbum extends Component {
  constructor(props) {
    super(props);

    this.state = {
      myfile : null
    }

    this.myRef = React.createRef();
    this.formRef = React.createRef();
    this.handleClick = this.handleClick.bind(this);
    this.handleUpload = this.handleUpload.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleRedirect = this.handleRedirect.bind(this);
  }

  handleRedirect() {
    const { account, history } = this.props;
    if (account.members.length > 1) {
      alert("redirect to elder's central");
    } else {
      history.push("/account/" + account.id+"/member/new");
    }

  }

  handleClick() {
    this.myRef.current.click();
  }

  async handleSubmit(event) {
    const { myfile: selectedFile } = this.state;
    const { createEvent } = this.props;
    const { account } = this.props.location.state;

    const { identityId } = await Auth.currentCredentials();
    //const { username: owner } = await Auth.currentUserInfo();

    //await console.log('identityId : ' + JSON.stringify(identityId, null, 4));
    //await console.log('owner : ' + JSON.stringify(owner, null, 4));



    if (selectedFile) {
        let file;
        let input;
        const { name: fileName, type: mimeType } = selectedFile;

        const [, , , extension] = /([^.]+)(\.(\w+))?$/.exec(fileName);

        const key = `public/${identityId}/${uuid()}${extension && '.'}${extension}`;
        const bucket = awsmobile.aws_user_files_s3_bucket;
        const region = awsmobile.aws_user_files_s3_bucket_region;

        file = {
            bucket,
            region,
            key,
            localUri: selectedFile,
            mimeType
        };


        input = {
          accountId : account.id,
          text: "this is trial",
          userId: account.members[0].user.id,
          media: file,
        };

        await createEvent(input);
    }



  }

  handleUpload(event) {
      const { target: { value, files } } = event;
      const [file,] = files || [];

      this.setState({
          myfile: file || value
      }, () => this.formRef.current.dispatchEvent(new Event("submit")));
  }

  render() {
    const {id} = this.props.location.state.account;
    const { history } = this.props;

    return (
      <div>
        <header className="App-header">
          <Link to={{pathname : '/timeline', state : {account : history.location.state.account}}}>
            <img className="App-logo" src={heart} alt="heart" />
          </Link>
        </header>
        <div className="ui container raised very padded segment">
          <h1 className="ui header">Family Album</h1>
          <div className="field twelve wide">
            <Query query={QueryGetListEvents} variables={{ accountId : id }}>
            {
              ({ data, loading, error }) => {
                if(loading || !data.listEvents) {
                  return('loading');
                } else if(error) {
                  return('error');
                } else {
                  const {items} = data.listEvents;

                  return(
                    <div className="album">
                    {
                      items.map((mydata, index) =>
                          <ItemImg key={index} propType="image" propImgKey={mydata.media.key} />
                      )
                    }
                    </div>
                  );
                }
              }
            }
            </Query>
          </div>
          <form onSubmit={this.handleSubmit} ref={this.formRef}>
            <div className="ui buttons familyAlbum">
              <BtnSubmit text="Add More Photos" disabled='' onClick={this.handleClick} />
              <input className="fileUpload" label="File to upload" type="file" onChange={this.handleUpload} ref={this.myRef}/>
            </div>
            <div className="ui buttons familyAlbum">
              <BtnSubmit text="Done" disabled='' customClass='link' onClick={this.handleRedirect}/>
            </div>
          </form>
        </div>
      </div>
    );
  }

}

export default compose(
  graphql(
    QueryGetAccount,
    {
      options: ({ location: { state: { account: {id} } } }) => {
        return ({
          variables: { id },
          fetchPolicy: 'cache-and-network'
        })
      },
      props: ({ data: { getAccount: account } }) => {
        return({account});
      }
    }
  ),
  graphql(
    MutationCreateEvent,
    {
        options: {
          update: (proxy, { data: { createEvent } }) => {
            const { accountId } = createEvent.event;

            const query = QueryGetListEvents;
            const variables = { accountId };
            const { listEvents } = proxy.readQuery({ query, variables });

            listEvents["items"] = [...listEvents["items"], createEvent.event];

            proxy.writeQuery({
              query,
              data: { listEvents: listEvents },
              variables
            });
          }
        },
        props: ({ ownProps, mutate }) => ({
            ...ownProps,
            createEvent: input => {
              return(
                mutate({
                    variables: input
                })
              );
            }
        })
    }
  )
) (FamilyAlbum);




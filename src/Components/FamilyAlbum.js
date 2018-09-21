import React, {Component} from "react";
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

class FamilyAlbum extends Component {
  constructor(props) {
    super(props);

    this.state = {
      myfile : null
    }

    console.log('props : ' + JSON.stringify(this.props, null, 4));

    this.myRef = React.createRef();
    this.formRef = React.createRef();
    this.handleClick = this.handleClick.bind(this);
    this.handleUpload = this.handleUpload.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleRedirect = this.handleRedirect.bind(this);
  }

  handleRedirect() {
    console.log('props on handleRedirect : ' + JSON.stringify(this.props, null, 4));
    const { account, history } = this.props;
    if (account.members.length > 1) {
      alert("redirect to elder's central");
    } else {
      history.push("/account/" + account.id+"/member/new");
    }

  }

  handleClick() {
    //alert("clicked detected...");
    //console.log('state : ' + JSON.stringify(this.state, null, 4));
    this.myRef.current.click();
  }

  async handleSubmit(event) {
    //alert("form Submitted");
    const { myfile: selectedFile } = this.state;
    const { createEvent } = this.props;
    const { account } = this.props.location.state;
    //console.log('state : ' + JSON.stringify(this.state, null, 4));

    //console.log('account on handleSubmit : ' + JSON.stringify(this.props, null, 4));

    const { identityId } = await Auth.currentCredentials();
    const { username: owner } = await Auth.currentUserInfo();

    await console.log('identityId : ' + JSON.stringify(identityId, null, 4));
    await console.log('owner : ' + JSON.stringify(owner, null, 4));



    if (selectedFile) {
        let file;
        let input;
        const { name: fileName, type: mimeType } = selectedFile;

        console.log('fileName : ' + fileName);
        console.log('mimeType: ' + mimeType);

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


        /*
          input S3ObjectInput {
            bucket: String!
            region: String!
            key: String!
            localUri: String
            mimeType: String
          }

          input CreateEventInput {
            accountId: ID!
            text: String
            userId: ID
            referenceId: ID
            media: S3ObjectInput
          }




        */

        //createEvent({ name, owner, `public`, file })
    }



  }

  handleUpload(event) {
      //const { target: { files } } = event;
      //const [file,] = files || [];

      const { target: { value, files } } = event;
      //console.log('files : ' + JSON.stringify(files, null, 4));
      //console.log('value : ' + JSON.stringify(value, null, 4));
      const [file,] = files || [];

      this.setState({
          myfile: file || value
      }, () => this.formRef.current.dispatchEvent(new Event("submit")));
  }

  render() {
    const {id} = this.props.location.state.account;

    return (
      <div className="ui container raised very padded segment">
        <h1 className="ui header">Family Album</h1>
        <div className="field twelve wide">
          <Query query={QueryGetListEvents} variables={{ accountId : id }}>
          {
            ({ data, loading, error }) => {
              if(loading || !data.listEvents) {
                return('loading');
              } else if(error) {
                console.log('error : ' + JSON.stringify(error));
                return('error');
              } else {
                const {items} = data.listEvents;

                //console.log('items : ' + JSON.stringify(items, null, 4));

                return(
                  <div className="album">
                  {
                    items.map((mydata, index) =>
                        <ItemImg key={index} propImgKey={mydata.media.key} />
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
    );
  }

}

export default compose(
  graphql(
    QueryGetAccount,
    {
      options: ({ location: { state: { account: {id} } } }) => {
        console.log('query options running');
        return ({
          variables: { id },
          fetchPolicy: 'cache-and-network'
        })
      },
      props: ({ data: { getAccount: account } }) => {
        console.log('query props running');
        return({account});
      }
    }
  ),
  graphql(
    MutationCreateEvent,
    {
        options: {
          update: (proxy, { data: { createEvent } }) => {
            //console.log('createEvent on update MutationCreateEvent : ' + JSON.stringify(createEvent, null, 4));
            const { accountId } = createEvent.event;

            const query = QueryGetListEvents;
            const variables = { accountId };
            //const data = proxy.readQuery({ query, variables });
            const { listEvents } = proxy.readQuery({ query, variables });

            //console.log('listEvents on cache after MutationCreateEvent' + JSON.stringify(listEvents, null, 4));

            listEvents["items"] = [...listEvents["items"], createEvent.event];
            //console.log('events before writeQuery to cache : ' + JSON.stringify(listEvents, null, 4));

            proxy.writeQuery({
              query,
              data: { listEvents: listEvents },
              variables
            });
            //console.log('proses updating completed : ' + JSON.stringify(listEvents, null, 4));
          }
        },
        props: ({ ownProps, mutate }) => ({
            ...ownProps,
            createEvent: input => {
              //console.log('input at props : ' + JSON.stringify(input, null, 4));
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




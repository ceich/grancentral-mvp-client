import React, {Component} from "react";
import {graphql} from "react-apollo";
import { Query, Mutation } from "react-apollo";
import { S3Image } from 'aws-amplify-react';
import { Storage } from 'aws-amplify';

import QueryMyAccounts from "../GraphQL/QueryMyAccounts";
import MutationDeleteMember from "../GraphQL/MutationDeleteMember";
import QueryTrial from "../GraphQL/QueryTrial";
import QueryGetListEvents from "../GraphQL/QueryGetListEvents";




class Devtrial extends React.Component{
  constructor(props) {
    super(props);

    //this.checkImg = this.checkImg.bind(this);
  }

  componentDidMount() {
    this.checkImg();
    /*
    const {deleteMember, result} = this.props;

    const input = {
      accountId: '9dfb22a4-171a-4bbd-af6d-09f10f21d5c4',
      userId: '75405c2a-a5ec-49f1-baf4-bf6a521077ba'
    }

    deleteMember({
      variables: input
    });
    */
  }

  checkImg = async() => {
    /*
    await Storage.get()
      .then(result => { console.log('result : ' + JSON.stringify(result, null, 4)) })
      .catch(err => console.log('error'));
    */
  }

  render() {

    //<Query query={QueryTrial} variables={{ id : 'a14a91fd-e492-446b-9bb2-a91575af3f99' }}>
    //<Query query={QueryMyAccounts}>
    //imgKey(avatar/75405c2a-a5ec-49f1-baf4-bf6a521077ba)
    return(
      <Query query={QueryGetListEvents} variables={{ accountId : 'e8a43a7a-3681-490c-bea1-cdf9d61f534d' }}>
      {
        ({ data, loading, error }) => {
          if(loading || !data.listEvents) {
            return('loading');
          } else if(error) {
            console.log('error : ' + JSON.stringify(error));
            return('error');
          } else {
            //console.log('data : ' + );
            var jsonstr = JSON.stringify(data, null, 4);
            console.log('data Image : ' + JSON.stringify(data.listEvents.items[0].media.key, null, 4));

            //let imgUrl;
            Storage.get(data.listEvents.items[0].media.key.replace("public/", ""))
              .then(result => { console.log('result : ' + JSON.stringify(result, null, 4)) })
              .catch(err => console.log('error'));

            //console.log(data.listEvents.items[0].media.key);
            //const imgUrl = "https://grancentralmvp-userfiles-mobilehub-806911104.s3.us-west-2.amazonaws.com/" + data.listEvents.items[0].media.key;
            const imgUrl = "https://grancentralmvp-userfiles-mobilehub-806911104.s3.us-west-2.amazonaws.com/public/us-west-2%3A42e00c4b-d316-4125-89d3-035eeb1a8194/745da923-7e9e-496e-bd15-839c0a4e14f2.png?AWSAccessKeyId=ASIAUOOLI4YOLKHGP7V7&Expires=1537432354&Signature=2%2BCVHu%2F3EwtixsCTjZMBGGfPDoY%3D&x-amz-security-token=AgoGb3JpZ2luEAwaCXVzLWVhc3QtMSKAAlxVBnLdbWwoTDi3k5%2FqzZ0686SKdfo570uAMh5rrYRxo5lqay%2Bl4w2ErNJo1GuTsbk7SFh6aFkbgl2n60xB1gCpsgfCQZR%2FyPEg8nrw8MCvp%2BZ3QvGXzzzILXUjdVAIGh3AY7C5vLoYG9ldSfCxjlCMU8sRZmItEUCqDzAPcZ%2FSsocIIH46pJY2qqW%2FpgxkU%2FBylIw6y5VUqHJfkul6vBoDPlYIw3SOwX7ueD4Bp93H%2FgDmyluTsQoUi04rqnji8lCPT0zA6GT2bazmvkghfwwnRrgS2ZAi3BkcJUaH%2Bu6EVSfkiaNTx0MBKGkyfj2Lcfo9jbvLINrO0bCd60WEIX0qpgUIQRAAGgwzMDU5MDU4NTM5ODAiDDHovgHwj2w4aLu6ziqDBWjjQOSJ30KWjmjUvzG6AhBxXhv3MxKYf%2BO7VoaxMjUQHGvFx3WcX%2B97mZj5q0j0JSaXnASwGRlKi4pfCoftgXNL0HGJAriIL6PjmKijKqqZa7aqmeIr%2BXDgaO0VHCz90p2yulMUWZJZ6G8fdAEv%2B6GMXOI%2BCRtmJj6%2FGI%2BP0wFXg3XJjgSaByLYieu9peaXijumXXMNv6n4Yhb6Ysb79yDiXbX9r9ko4RbDl7T%2F6dDXx5hE0tbCtD%2FilktQB8LkJKVtpiC53qYAGoyIZ1%2F%2Be8CO5xa5Sbmx4%2FwNG1QJF742QwM%2FXRL%2BlOgG%2BkM62mnl6jjHbeggHfDOBPzic2aVnbIIbeZhdAG9fDkNdWziy1hq9w9LZEsNWg8KfydmT9HGbfm9xbZFLCcssHITuXSrq85TOo1pIVMj%2B6UQqXSJruos3qzwdlx2URwYjPjQuVeSF5cG%2FUEsXGXmrfWklZ9Cbwk%2BWwR4Ki%2Bmdx%2FlGJfbzpuHPpY8iEKCyFQQvGWvVNZG2gK2tuJh9bEB%2Bp0KSTvyHCx0nPZFrqkS9nD4oAG4KEwmKHf4%2FptzH1mk90TdZFtyDhM068OP3IxCmH9H0hVqx5a9Ffnodg29p19Cit1f%2Bb5O9UK4twH5V3dh9TLISdiR1me6P28YwR6lrUEcVwIDPhtflc6mEpQhs%2BKtRwYbeZDww7inaDJ6pUnSQbgsojIHE2uVVsDdWn98CtX4FDzMEyWzBc1SBH5L5qrTvD62yTWsRmA09F30RWnVpxdo8j1jMDZy0XjtPC67Pl0bnHcr3tuQRIf82yIZ6pSPffVVESu4isJNPzJNiMrNqVefF%2FcR126Dbq1xPJ59UKw%2BKIFwK6V1CJQwnq%2BN3QU%3D";
            const imgKey =  "avatar/75405c2a-a5ec-49f1-baf4-bf6a521077ba";
            return(
              <div id="jsonwriter">
                query succeed...
                <pre id="json">
                {
                  jsonstr
                  //document.getElementById("json").innerHTML = (jsonstr) ? jsonstr : ''
                }
                </pre>

                <img src={imgUrl} />
                <S3Image imgKey={imgUrl} onError={(e) => {console.log('image not found : ')}} />
                <S3Image imgKey={imgKey} onError={(e) => {console.log('image not found : ')}} />
              </div>
            );
          }
        }
      }
      </Query>
    );


  }
}


const AppWithMutation = () => (

      <Mutation mutation={MutationDeleteMember}>
        {
          (deleteMember, result) => (
            <Devtrial deleteMember={deleteMember} result={result}/>
          )
        }
      </Mutation>

);


export default Devtrial;


import React, {Component} from "react";
import { Storage } from 'aws-amplify';
import { S3Image } from 'aws-amplify-react';


export default class ItemImg extends Component {
  constructor(props) {
    super(props);

    console.log("props on ItemImg : " + JSON.stringify(this.props, null, 4));

    this.state = {
     imgURL: null
    }
  }

  componentDidMount() {
    this.fetchImg();
  }

  async fetchImg() {
    const{propImgKey} = this.props;
    //console.log('propImgKey : ' + propImgKey);
    await Storage.get(propImgKey.replace("public/", ""))
      .then(result => { this.setState({imgURL : result}); })
      .catch(err => console.log('error'));
  }

  render() {
    const {imgURL} = this.state;

    //const tmpURL = "https://grancentralmvp-userfiles-mobilehub-806911104.s3.us-west-2.amazonaws.com/public/us-west-2%3A42e00c4b-d316-4125-89d3-035eeb1a8194/5d01fb9d-131a-4346-9645-d30dbb32bb50.png?AWSAccessKeyId=ASIAUOOLI4YOAV5USBWN&Expires=1537436927&Signature=ySmC22qgMrh3pb6EBlMRODQm%2Fk8%3D&x-amz-security-token=AgoGb3JpZ2luEA0aCXVzLWVhc3QtMSKAApcjoSZnC6xlC2qsydBjl31BFqIYFpcTEBrLZZ2QjpvImYHh8pNR9qaIEokTtfQoGaTyM9V36bjKMYvGWMl6dQLCq9tSBpkN409WT5qJriTike4kT9z32u4UMy8nffclZ%2FmovFVT6wp50HEeCHkoFD2quiyH2ft6%2FGbtYxnCYr8ZmY0NOJ8HmH%2FtSGjHiXAt6SGuYxZadzgngbDhv9LBKTv8fnp%2FABwlMHv0CdYse7H4x4y7TAF6qmF937ZFsyqGhmNIGUQLUKSw%2B6Fj7%2FM3GunS8ZyOvCwf0ffCYE1XKFmNY4dC5mEXhKhVvNWYDOJDP2kxDr7cbMNL8ryyhLaUQLwqpgUIQxAAGgwzMDU5MDU4NTM5ODAiDO9HVxWscvdMv%2FfQmCqDBYr6kJ6Ax4P4UBQ4YSv0E9BRmmE%2FgRrcggKb%2FYn7rKRt1ICxo%2BvEMpO6WwBXwCVuRdAisgxh5mbHnHFVZ%2BIwcC3DCYQyljnQEmRVf3hizvJgxUO82C2Cgetf7lnHU%2BmWtte5NcZ1bFd7lhsbTHNcAwyxXr%2B8yJ8%2FQc4lQttBYWT2IN9wWKH8ttAD4OX7CbeaztanDZ5Bwihjd%2B0u%2B64JwJPMnMZ4NDlpCVlX3wyZiYdaMyyZBt4mIGgx1gJTKBMVP2deMCntqKUTbE4jHPKanPvSKPUqAhlZ8hsRCPaGffbv09uY9Kskbfauty5Rb9sT0uCRLC9OJVAZQXTfBx7IJVdAOiPnE0828Dn9SqT1xqgCZlBaj6imCb%2FzXwVY2roW2sWJU7Lxmgc8aaYt%2Bys63zrxebdZ2e4trJMm5WHE3A7%2FdfjhMh2A9stc3xYnfxptjrdGnOpL6S7vEROLruUg7szv49YP3ge8O4rC2o7EnxFbGFoglj4m%2F3VMSVdoXtPMUVO8n1EkkFs1PM2mJIL7C7RQKou%2FziM%2FlqjjdVIS7VH2hxqa%2BFqtO%2Fz%2F7XkaBT%2BRzQleDzK8qxs6%2F4YzIDDy%2BZW%2BAuD0jWcd5Y54chpkhToWJI2wHsmbxMsfmtSnN6fXSvOpJCW1J8NhCfDJAVnM6bzKY%2F5XnJon6TMAAUvXjQUHl7pKzydTu29pkQe8InUJheFnyUwwfqSYXNFbK0iDUq594wG0ji1HW%2FLWa3H%2FZkLyw%2BIdA2bPnyRGIYoJ%2BqfFrKFM%2Fbgf8hDEEIajoq9g1UBHu3L0wWb93hEhWzCJpjuqyQ35LFAsEQ9eDQ5jTEhbLu%2F5F%2FJtndVoNhpsk62XTXtQoKMw%2BtKN3QU%3D";
    if(imgURL) {
      console.log('imgURL : ' + imgURL);
      return(
        <img src={imgURL} />
      );
    } else {
      return(
        <div>
        </div>
      );
    }

  }

}
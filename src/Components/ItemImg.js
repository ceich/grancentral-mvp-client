import React, {Component} from "react";
import { Storage } from 'aws-amplify';


export default class ItemImg extends Component {
  constructor(props) {
    super(props);

    this.state = {
     imgURL: null
    }
  }

  componentDidMount() {
    this.fetchImg();
  }

  async fetchImg() {
    const{propImgKey} = this.props;

    await Storage.get(propImgKey.replace("public/", ""))
      .then(result => { this.setState({imgURL : result}); })
      .catch(err => console.log('error'));
  }

  render() {
    const {imgURL} = this.state;
    const{propType, propsClick} = this.props;

    if(imgURL) {
      if (propType === "image") {
        return(
          <img src={imgURL} alt="Family Album" />
        );
      } else {
        return(
          <video src={imgURL} onClick={(event) => propsClick(event, {imgURL})} />
        );
      }
    } else {
      return(
        <div>
        </div>
      );
    }

  }

}
import React from "react";

import "semantic-ui-css/semantic.min.css";
import './../CSS/Style.css';

class TimelineDetail extends React.Component{

  render() {
    const{ imgURL } = this.props.location.state.imgURL;

    return(
      <div className="ui container raised very padded segment containerClass">
        <div className="timelineDtlContent">
          <video src={imgURL} className="videoFullWidth" controls/>
        </div>
      </div>
    );
  }

}

export default TimelineDetail;
import React from "react";
import './../CSS/Style.css';


class BtnSubmit extends React.Component{
  constructor(props) {
    super(props);
  }


  render() {
    const{ text, disabled, onClick } = this.props;

    console.log('text : ' + text);

    return(
      <button type="button" className="btnSubmit" disabled={disabled} onClick={(event) => onClick(event)}>
        {text}
      </button>
    );
  }
}

export default BtnSubmit;
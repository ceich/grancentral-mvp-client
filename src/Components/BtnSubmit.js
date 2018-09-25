import React from "react";
import './../CSS/Style.css';


class BtnSubmit extends React.Component{

  render() {
    const{ text, disabled, onClick, customClass } = this.props;

    const propsClass = (customClass) ? customClass : '';

    return(
      <button type="button" className={"btnSubmit " + propsClass} disabled={disabled} onClick={(event) => onClick(event)}>
        {text}
      </button>
    );
  }
}

export default BtnSubmit;
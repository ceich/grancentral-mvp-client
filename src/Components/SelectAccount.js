import React from "react";
import { Link } from "react-router-dom";
import "semantic-ui-css/semantic.min.css";
import moment from "moment";

export default (props) => {
  const { user } = props;

  return ((!user || !user.members) ? null :
    <div className="ui link cards">
      <div className="card blue">
        <Link to="/newAccount" className="new-account content center aligned">
          <i className="icon add"></i>
          <p>Create new account</p>
        </Link>
      </div>
      {user.members.map(({ role, account }) => (
        <Link to="/timeline" className="card" key={account.id}
              onClick={()=>props.setAccount(account)}>
          <div className="content">
            <div className="header">{account.name}</div>
          </div>
          <div className="content">
            <p>
              <i className="icon calendar"></i>
              {moment(account.createdAt, 'x').format('l LTS')}
            </p>
          </div>
          <div className="content">
            <div className="description">
              <i className="icon info circle"></i>
              Member count: {account.members ? account.members.length : 0}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

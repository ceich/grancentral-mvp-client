import React from 'react'
import { Query } from "react-apollo";
import { slide as Slide } from 'react-burger-menu'

import heart from './../heart.svg';

import QueryMyAccounts from '../GraphQL/QueryMyAccounts'

const styles = {
  bmBurgerButton: {
    position: 'fixed',
    width: '36px',
    height: '30px',
    left: '36px',
    top: '36px'
  },
  bmBurgerBars: {
    background: '#373a47'
  },
  bmBurgerBarsHover: {
    background: '#a90000'
  },
  bmCrossButton: {
    height: '24px',
    width: '24px'
  },
  bmCross: {
    background: '#bdc3c7'
  },
  bmMenuWrap: {
    position: 'fixed',
    height: '100%'
  },
  bmMenu: {
    background: '#373a47',
    padding: '2.5em 1.5em 0',
    fontSize: '1.15em'
  },
  bmMorphShape: {
    fill: '#373a47'
  },
  bmItemList: {
    color: '#b8b7ad',
    padding: '0.8em'
  },
  bmItem: {
    display: 'inline-block'
  },
  bmOverlay: {
    background: 'rgba(0, 0, 0, 0.3)'
  }
}

const Menu = (props) => {
  if (!props.me) return null;
  const [ firstName ] = props.me.members[0].account.elders[0].name.split(' ');
  return (
    <Slide
      styles={styles}
      customBurgerIcon={ <img className="App-logo" src={heart} alt="Menu" /> }
    >
      <a id="timeline" className="bm-item" href="/timeline">{firstName} Central</a>
      <a id="album" className="bm-item" href="/createFamilyAlbum">Photo Album</a>
      <a id="members" className="bm-item" href="/account">Caring Circle</a>
      <a id="profile" className="bm-item" href="/profile">Your Profile</a>
    </Slide>
  );
}

export default (props) => (
  <Query query={QueryMyAccounts}>
    {({ data, loading, error }) => (
        loading ? "Loading..." :
        error ? "Error" :
        <Menu {...props} me={data.me} />
    )}
  </Query>
);

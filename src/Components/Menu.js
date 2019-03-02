import React from 'react'
import Menu from 'react-burger-menu/lib/menus/slide'
import { Link } from 'react-router-dom'

import heart from './../heart.svg'

const styles = {
  bmBurgerButton: {
    position: 'fixed',
    width: '36px',
    height: '30px',
    left: '12px',
    top: '12px'
  },
  bmBurgerBars: {
    background: '#373a47'
  },
  bmBurgerBarsHover: {
    background: '#a90000'
  },
  bmCrossButton: {
    height: '24px',
    width:  '24px'
  },
  bmCross: {
    background: '#bdc3c7'
  },
  bmMenuWrap: {
    position: 'fixed',
    height: 'auto',
    width: '250px'
  },
  bmMenu: {
    background: 'white',
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
    display: 'block',
    marginBottom: '0.5em',
    textAlign: 'left'
  },
  bmOverlay: {
    background: 'rgba(0, 0, 0, 0.3)'
  }
}

class HeartMenu extends React.Component {
  // Using React Router Links in react-burger-menu avoids page reloads,
  // but requires managing menu state programmatically, cf.
  // https://github.com/negomi/react-burger-menu/wiki/FAQ
  state = {
    isOpen: false
  }

  handleStateChange = ({ isOpen }) => {
    this.setState({isOpen})
  }

  closeMenu = () => {
    this.setState({isOpen: false})
  }

  menuItem = ({ pathname, text }) => (
    <Link key={pathname} to={"/" + pathname} onClick={this.closeMenu}>
      {text}
    </Link>
  )

  render() {
    const { account } = this.props
    const firstName = account ? account.name.split(' ')[0] : 'Gran'
    const menuItems = [
      { pathname: "timeline",     text: `${firstName} Central` },
      { pathname: "familyAlbum",  text: "Photo Album" },
      { pathname: "caringCircle", text: "Caring Circle" },
      { pathname: "profile",      text: "Your Profile" }
    ]
    const { user } = this.props
    if (user && user.members && user.members.length > 1) {
      menuItems.push({ pathname: "selectAccount", text: "Switch Accounts" })
    }
    menuItems.push({ pathname: "signout", text: "Sign Out" })

    return (
      <Menu
        styles={styles}
        customBurgerIcon={<img className="App-logo" src={heart} alt="Menu" />}
        isOpen={this.state.isOpen}
        onStateChange={this.handleStateChange}
      >
        {menuItems.map((item) => this.menuItem(item))}
      </Menu>
    )
  }
}

export default HeartMenu;

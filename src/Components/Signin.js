import React from "react"
import { Redirect } from 'react-router-dom'

const Signin = (props) => {
  const { user } = props
  if (!user) return null
  const { name, avatar, members } = user
  const profileComplete = name && avatar

  if (!profileComplete) {
    // Prompt to complete profile
    return (<Redirect push to="/profile" />)
  } else if (members.length === 0) {
    // Prompt to create new account
    return (<Redirect to="/newAccount" />)
  } else if (members.length === 1) {
    // Only one account, go there
    return (<Redirect to="/timeline" />)
  } else {
    // Redirect to SelectAccount
    return (<Redirect to="/selectAccount" />)
  }
}

export default Signin

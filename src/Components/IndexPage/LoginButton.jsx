import React from 'react'
import { Link } from 'react-router-dom'

const LoginButton = () => {
  return (
    <div>
        <Link to="/login" className='hidden lg:flex items-center hover:text-gray900 text-brandPrimary'>Login</Link>

    </div>
  )
}

export default LoginButton
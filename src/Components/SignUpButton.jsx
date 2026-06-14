import React from 'react'
import { Link } from 'react-router'

const SignUpButton = () => {
  return (
    <div>
        <Link to='/sign-up'><button className='bg-brandPrimary items-center text-white py-2 px-4 transition-all duration-300 hover:bg-neutralDGrey rounded'>Sign Up</button></Link>
        


    </div>
  )
}

export default SignUpButton
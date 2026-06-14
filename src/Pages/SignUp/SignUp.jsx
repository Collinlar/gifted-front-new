import React from 'react'
import { useContext } from 'react'
import { storeContext } from '../../Context'
import {Link, useNavigate} from "react-router"


const SignUp = () => {  
    const {setfirstName,setLastName, setEmail,setDOB,setGender,setPassword, setMobileNumber,setCountry} = useContext(storeContext)
    const navigate = useNavigate()
  return (
    <form onSubmit ={(e)=>{e.preventDefault() ; navigate("/select-category")}} className='absolute left-[32.5%] top-[5%] flex flex-col gap-6'>
        <h1 className='text-blue-500 font-semibold text-2xl'>Register</h1>
        <h2 className='text-blue-500'>Input your details to register</h2>
        <div className='flex gap-4'>
            <input type="text" required placeholder="first Name" className='rounded-lg'  onChange={(e)=>{setfirstName(e.target.value)}}/>
            <input type="text" required placeholder="Last Name" className='rounded-lg'  onChange={(e)=>{setLastName(e.target.value)}}/>
        </div>
        <div className='flex gap-4'>
            <input type="email" required placeholder="email" className='rounded-lg mt-[23px]'  onChange={(e)=>{setEmail(e.target.value)}}/>
            <input type="text" required placeholder="Country" className='rounded-lg mt-[23px]'  onChange={(e)=>{setCountry(e.target.value)}}/>
           
        </div>
        {/* <hr /> */}
        <div className='flex gap'>
            <div className='flex flex-col gap-0'>
                <h1 className='font-bold mt-[40px]'>Date of Birth</h1>
                <input type="Date" required placeholder="Date of Birth" className='rounded-lg w-[245px] cursor-pointer mt-[30px]'  onChange={(e)=>{setDOB(e.target.value)}}/>
            </div>
            <div className='flex gap-5 flex-col'>
                <div>
                    <h1 className='font-bold mt-[40px] ml-[28px]'>Gender</h1>

                </div>
                <div className='ml-[30px] flex gap-4 mt-[25px]'>
                    <label htmlFor="gender">Male</label>
                    <input type="radio" value="male" required name='gender' id="gender" className='' onChange={(e)=>{setGender(e.target.value)}} />
                    <label htmlFor="genders">Female</label>
                    <input type="radio" value="female" required name='gender' id="genders" className='' onChange={(e)=>{setGender(e.target.value)}} />

                </div>
                
            </div>
        </div>
        
        <div className='flex gap-4'>
            <input type="text" required placeholder="Phone Number" className='rounded-lg'  onChange={(e)=>{setMobileNumber(e.target.value)}}/>
            <input type="password" required placeholder="Password" className='rounded-lg'  onChange={(e)=>{setPassword(e.target.value)}}/>
        </div>
        


        <button className=' bg-blue-500 text-white rounded-lg px-[5px] hover:bg-black cursor-pointer mt-[30px] h-[50px]' type="submit">NEXT</button>


    </form>
  )
}

export default SignUp
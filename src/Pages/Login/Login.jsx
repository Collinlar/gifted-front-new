import React from 'react'
import { useState } from 'react'
import { loginUser } from "../../lib/auth"
import { useNavigate } from 'react-router'
import { IoMdCheckbox } from "react-icons/io";
import { ToastContainer,toast } from 'react-toastify';

const Login = () => {
    const [email, setEmail]= useState("")
    const [password, setPassword] = useState("")
    const navigate = useNavigate()
    const handleSubmit = async(e)=>{
        e.preventDefault()
        try{
            const response = await loginUser({email,password})
            if(response.success){
                navigate("/user-dashboard")
            }
            else{
                toast.error(response.message,{toastId:"id"})
            }


            

        }catch(error){
            console.log(error)
        }
    }
  return (
    <form  onSubmit={(e)=>{handleSubmit(e)}} className='flex flex-col gap-4 absolute left-[40%] top-[35%]'>
        <h1 className='font-semibold text-blue-500 text-2xl'>Login</h1>
        <div>
            <input type="text" placeholder='Username or Email' className="rounded-lg w-[350px]" onChange={(e)=>{setEmail(e.target.value)}}/>

        </div>
        <div>
            <input type="password" placeholder='password' className='rounded-lg w-[350px]' onChange={(e)=>{setPassword(e.target.value)}}/>
        </div>
        <button type='submit' className='bg-blue-500 w-[350px] text-white rounded-lg h-[40px] hover:bg-black'>Login</button>
        <ToastContainer/>
        

    </form>
  )
}

export default Login
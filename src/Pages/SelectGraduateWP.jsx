import React, { useContext, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { HiArrowRight } from "react-icons/hi2";
import { storeContext } from '../Context';
import { registerUser } from '../lib/auth'
import { ToastContainer,toast } from 'react-toastify';
import { MdOutlineCheckBoxOutlineBlank } from "react-icons/md";
import { IoMdCheckbox } from "react-icons/io";


const Select = () => {
  const { studychecked, prepChecked, setPrepChecked, setStudyChecked, purposeOfRegistration, SetPurposeofRegistration,firstName, lastName,DOB,email,mobileNumber,category,password,gender,school,country,grade,educationalLevel,purposes,setPurposes} = useContext(storeContext)
 const [selectAtLeastOne,setSelectAtLeastOne] = useState("")
  const navigate = useNavigate()
  // let preferences=[]
  // const handleStudyChecked = (e)=>{
  //   e.preventDefault()
    
  //   setStudyChecked(!studychecked)
  //   if(!studychecked){
  //     SetPurposeofRegistration((prev)=>{return [...prev, e.target.value]})
  //     console.log(e.target.value)
  //   }
  //   else if(studychecked){
  //     SetPurposeofRegistration((prev)=>{ return prev.filter((item)=>item!==e.target.value)})
  //   }
  // }

  // const handlePrepChecked = (e)=>{
  //   e.preventDefault()
  //   setPrepChecked(!prepChecked)
  //   if(!prepChecked){
  //     console.log(e.target.value)
  //     SetPurposeofRegistration((prev)=>{return [...prev, e.target.value]})
  //   }
  //   else if(prepChecked){
  //     console.log(e.target.value)
  //     SetPurposeofRegistration((prev)=>{ return prev.filter((item)=>item!==e.target.value)})
  //   }
  // }


  useEffect(()=>{
    console.log(purposeOfRegistration,studychecked,prepChecked,{purposeOfRegistration,firstName, lastName,DOB,email,mobileNumber,category,password,gender,school,country,grade,educationalLevel})

  },[purposeOfRegistration])


  const handleSubmit = async(e)=>{
    e.preventDefault()
    if(prepChecked||studychecked){
        const registerData = {firstName:firstName, lastName:lastName,DOB:DOB,email:email,mobileNumber,Category:category,password,gender,School:school,country,grade,educationalLevel,purposeOfRegistration}
        const response = await registerUser(registerData)

        if(response.success){
            navigate("/overview")
            toast.success("User registered successfully")
        }
        else{
          toast.error(response.message)
          studychecked("")
          prepChecked("")
        }


    }else{
      setSelectAtLeastOne("Please select at least one")
      
    }
    
  }
  const handleNavigation = (e)=>{
    e.preventDefault()
    if(prepChecked||studychecked){
        navigate("/detail-summary")
    }
    else{
      setSelectAtLeastOne("Please select at least one")
    }

  }
  return (
    <form className='' onSubmit={(e)=>{handleSubmit(e)}}>  
        <div className='flex flex-col gap-4 absolute top-[45%] left-[40%]'>
            <h1 className='font-semibold'>What would you like to do</h1>
            <div className=' flex w-[350px] h-[30px]  rounded-md'>
              {!studychecked?<MdOutlineCheckBoxOutlineBlank onClick={()=>{ SetPurposeofRegistration((prev)=>{return [...prev,"Study Abroad"]})}}/>:<IoMdCheckbox onClick={()=>{setStudyChecked("")}}/>}
              <h1 className='font-semibold cursor-pointer' onClick={()=>{setStudyChecked(!studychecked)}}>STUDY ABROAD</h1> 
            </div>
            <div className=' flex w-[350px] h-[30px]  rounded-md'>
            {!prepChecked?<MdOutlineCheckBoxOutlineBlank onClick={()=>{SetPurposeofRegistration((prev)=>{return [...prev,"Test Prep"]})}}/>:<IoMdCheckbox onClick={()=>{setPrepChecked("")}}/>}
              
              <h1 className='font-semibold cursor-pointer' onClick={()=>{setPrepChecked(!prepChecked)}}>TEST PREP</h1> 
            </div>
            <div className='text-red-500'>{selectAtLeastOne}</div>
            <button  className="submit w-[360px] h-[40px] bg-blue-500 text-white rounded-lg" type="submit" >Submit <HiArrowRight className='absolute top-[87.5%] left-[70%]'/></button>
        </div>
      <ToastContainer/>


    </form>
  )
}

export default Select
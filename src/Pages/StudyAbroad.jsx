import React from 'react'
import { Link } from 'react-router'
import { HiArrowRight } from "react-icons/hi2";


const StudyAbroad = () => {
  return (
    
    <div className='flex flex-col absolute top-[40%] left-[40%]'>
        <div>
            <input type="text" placeholder='country' className='rounded-lg border-black'/>
        </div>
        <div>
            <input type="text" placeholder='program' className='rounded-lg border-black'/>
        </div>
        <select name="" id="" className='w-[245px]'>
            <option value="">Select Type of Service</option>
            <option value="">Tutorials</option>
            <option value="">Study Materials</option>
        </select>

        <Link ><button className="submit w-[245px]">NEXT <HiArrowRight className='absolute top-[86.2%] left-[70%]'/></button></Link>



    </div>
  )
}

export default StudyAbroad
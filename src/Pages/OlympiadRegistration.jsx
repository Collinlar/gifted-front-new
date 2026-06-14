import React, { useContext } from 'react'
import { useNavigate } from 'react-router'
import RoundedCard from '../Components/Card'
import { FaToggleOff } from "react-icons/fa6";
import { FaToggleOn } from "react-icons/fa6";
import { useState } from 'react';
import { storeContext } from '../Context';
import CalendarPage from './Calendar';

const OlympiadRegistration = () => {

  const navigate = useNavigate()
  const {Calendar,setCalendar} = useContext(storeContext)
  
  
  


  const olympiad= [{name:"Sasmo",id:1,link:"/sasmo-page"}, {name:"hippo",id:2,link:"/hippo-page"}, {name:"Dr.CT", id:3, link:"/drct-page"}]
  return (

    <div className='flex flex-col '>
      <h1 className='font-semibold text-2xl absolute left-[35%] top-[2%]'>Olympiad Competitions</h1>
      <div className='flex absolute top-[8%] left-[35%] gap-3'>
        <div onClick={()=>{setCalendar(true)}}>
          <label className="font-semibold " htmlFor="calendar">Calendar View</label>
          <input name='views' id='calendar' type="radio"  />
        </div>
        <div onClick={()=>{setCalendar(false)}}>
          <label className="font-semibold"htmlFor="block">Block view</label>
          <input name="views" id="block" type="radio" />
        </div>
      </div>

      <div className='flex mt-[6%]'>
        {
          !Calendar?(
            olympiad.map((item)=>{
              return (<div onClick={()=>{navigate(item.link)}} ><RoundedCard key={item.id} purpose={item.name} /></div> )
              }) 
            ): <CalendarPage/>

        }
      </div>


      


    </div>
  )
}

export default OlympiadRegistration
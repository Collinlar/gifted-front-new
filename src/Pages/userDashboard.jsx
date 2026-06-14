import React, { useContext, useState} from 'react'
import { storeContext } from '../Context'
import Sidebar from '../Components/Sidebar'
import { LayoutDashboard, Home, StickyNote, Layers, Flag, Calendar, LifeBuoy, Settings, Link } from "lucide-react";
import { SidebarItem } from "../Components/Sidebar"
import RoundedCard from '../Components/Card';
import { useNavigate } from 'react-router';



const userDashboard = () => {
    const {purposes} = useContext(storeContext)
    const handleButtonClick = () => {
        alert("Button clicked!");
      };
      const navigate = useNavigate()
   
      let Purpose = [{name:"Olympiad",link:"/olympiad-registration",id:"1"},{name:"ATDP Events", link:"/atdp-registration",id:"2"}]
    //   const [hasOlympiad, sethasOlympiad]= useState(false)
      return (
        <div className='flex'>
            <div className="flex">
                <Sidebar>
                <SidebarItem icon={<Home size={20} />} text="Dashboard" alert />
                <SidebarItem icon={<StickyNote size={20} />} text="Community" alert />
                <SidebarItem icon={<Calendar size={20} />} text="Invoices" />
                <SidebarItem icon={<Layers size={20} />} text="Add Ons" />
       
              
                </Sidebar>
            </div>
            <div className='flex'>
                {
                   Purpose.map((item)=>{
                    return (<div onClick={()=>{navigate(item.link)}} ><RoundedCard key={item.id} purpose={item.name} /></div> )
                   }) 

                }
            </div>
        
        </div>
  )
}

export default userDashboard
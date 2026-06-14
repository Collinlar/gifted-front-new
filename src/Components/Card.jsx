import React from 'react'

const RoundedCard = ({purpose}) => {
  return (
    <div className='w-[350px] h-[300px] bg-white rounded-lg shadow-md ml-[30px] overflow-y-hidden hover:shadow-lg cursor-pointer mt-[50px]'>
        <div className='w-[350px] h-[150px] bg-black text-white font-semibold px-[10px]'>{purpose}</div>
        <div className='px-[10px]'>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Dignissimos exercitationem laudantium rerum eum doloremque, 
            
        </div>

    </div>
  )
}

export default RoundedCard
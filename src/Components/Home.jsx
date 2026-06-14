import React from 'react'
import { Carousel } from 'flowbite-react'
import banner from "../assets/sample.jpeg"

const Home = () => {
  return (
    <div className='bg-neutralSilver'>
        <div className='px-4 lg:px-14 max-w-screen-2xl mx-auto min-h-screen h-screen'>
            <div className=" absolute left-0 w-full h-[80%] top-[12%]">
                <Carousel className='w-full mx-auto'>
                    <div className="flex h-full items-center justify-center bg-gray-400 dark:bg-gray-700 dark:text-white">
                        Slide 1
                    </div>
                    <div className="flex h-full items-center justify-center bg-gray-400 dark:bg-gray-700 dark:text-white">
                        Slide 2
                    </div>
                    <div className="flex h-full items-center justify-center bg-gray-400 dark:bg-gray-700 dark:text-white">
                        Slide 3
                    </div>
                </Carousel>
            </div>

        </div>
    </div>
  )
}

export default Home
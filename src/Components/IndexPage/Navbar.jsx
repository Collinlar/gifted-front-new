import React, { useEffect, useState } from 'react'
import { Link } from 'react-scroll'
import {FaXmark, FaBars } from "react-icons/fa6";
// import { Link } from 'react-router';
import SignUpButton from './SignUpButton';
import LoginButton from './LoginButton';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isSticky, setIsSticky] = useState(false)

    const toggleMenu = ()=>{
        setIsMenuOpen(!isMenuOpen)
    }

    useEffect(()=>{
         const handleScroll = ()=>{
            if(window.scrollY>100){
                setIsSticky(true)
            }
             else{
                 setIsSticky(false)
             }
         }
         window.addEventListener("scroll", handleScroll)
         return ()=>{
             window.addEventListener("scroll", handleScroll)
         }

        
    },[isSticky,isMenuOpen])
    const navItems = [
        {link:"Home", path:"home"},
        {link:"Service", path:"service"},
        {link:"About", path:"About"},
        {link:"Testimonial", path:"testimonial"},
        {link:"FAQ", path:"faq"},
        {link:"Product", path:"product"},
    ]
  return (
    <header className='w-full bg-white md:bg-transparent fixed top-0 left-0 right-0'>
        <nav className={`py-4 lg:px-14 px-4 ${isSticky?"sticky top-0 right-0 left-0 border-b bg-white duration-300":""}`}>
            <div className='flex justify-between items-center gap-8 text-base'>
                <div>
                    <h1 className='text-2xl font-semibold'>OLYMPIAD EDU CENTER</h1>
                </div>
                <ul className='md:flex space-x-12 hidden'>
                    {
                        navItems.map(({link,path})=>{ 
                            return (
                                <Link className='block text-base text-gray900 hover:text-brandPrimary first:font-medium cursor-pointer' to={path} spy={true} smooth={true} offset={-100} key={path}>{link}</Link>
                            )

                        })
                    }

                </ul>
                <div className='space-x-12 hidden lg:flex items-center'>
                    <LoginButton/>
                    <SignUpButton/>
                    

                </div>
                <div className='md:hidden'>
                    <button onClick={toggleMenu} className='focus:outline focus:text-gray-500 text-neutralDGrey'>
                        {
                            isMenuOpen? (<FaXmark className='w-6 h-6'/>):(<FaBars className='w-6 h-6'/>)
                        }
                    </button>


                </div>
            </div>
            <div className={`relative z-10 space-y-4 px-4 mt-16 py-6  bg-brandPrimary ${isMenuOpen? "block left-0 right-0 top-0":"hidden"}`}>
            {/* <ul className='md:flex space-x-12 hidden'> */}
                    {
                        navItems.map(({link,path})=>{ 
                            return (
                                <Link className=' block text-base text-gray900 hover:text-white first:font-medium cursor-pointer hover:text-2xl' to={path} spy={true} smooth={true} offset={-100} key={path}>{link}</Link>
                            )

                        })
                    }

                

            </div>

        </nav>
    </header>
  )
}

export default Navbar
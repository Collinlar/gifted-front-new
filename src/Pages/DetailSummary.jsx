import React, { useContext } from 'react'
import { storeContext } from '../Context'

const DetailSummary = () => {
  const {
    firstName,
    setfirstName,
    lastName,
    setLastName,
    DOB,
    setDOB,
    email,
    setEmail,
    mobileNumber,
    setMobileNumber,
    category,
    setCategory,
    password,
    setPassword,
    gender,
    setGender,
    purposeOfRegistration,
    SetPurposeofRegistration,
    country,
    setCountry,
    educationalLevel,
    setEducationalLevel,
    setSchool,
    school,
    grade,
    setGrade,
    preferences,
    prepChecked,
    studychecked,
    atdp,
    olympiad,
    setPrepChecked,
    setStudyChecked,
    setATDP,
    setOlympiad

    
} = useContext(storeContext)
  return (
    <div className='absolute top-[3%] left-[40%]'>
      <div className='flex'>
        <div className='flex'>
          <div className=''>FirstName</div>
          <div>James</div>
        </div>
        <div>Ewoenam</div>
      </div>



    </div>
  )
}

export default DetailSummary
// import axios from "axios";
import { Calendar } from "lucide-react";
import { createContext , useState } from "react";
// import {jwtDecode} from "jwt-decode"
// import { food_list } from "../assets/assets";

export const storeContext = createContext({})


export const StoreContextProvider = (props)=>{
    const [firstName,setfirstName] = useState("")
    const [lastName,setLastName] = useState("")
    const [DOB,setDOB] = useState("")
    const [email,setEmail]= useState("")
    const [mobileNumber,setMobileNumber] = useState("")
    const [password,setPassword] = useState("")
    const [category, setCategory] = useState("")
    const [gender, setGender]= useState("")
    const [purposeOfRegistration, SetPurposeofRegistration] = useState([])
    const [educationalLevel , setEducationalLevel]= useState("")
    const [country,setCountry] = useState("")
    const [school,setSchool]= useState("")
    const [grade, setGrade] = useState("")         
    const [Calendar, setCalendar]= useState(false)
    const [studychecked, setStudyChecked]= useState(false)
    const [prepChecked, setPrepChecked]= useState(false)
    const [atdp, setATDP] = useState(false)
    const [olympiad, setOlympiad] = useState(false)
    const [purposes, setPurposes] = useState([])
    const [loadCompetitions, setLoadCompetitions]= useState(false)
    const [purposeChecked, setPurposeChecked] = useState(false)
    const [userExamination, setUserExamination]= useState([])
    const [loadExaminations, setLoadExaminations]= useState(false)
    const [AllExamination, setAllExamination]= useState([])
    const [competitionList, setCompetitionList] = useState([])
    const [name,setName]= useState("")
    const [startDate, setStartDate]= useState("")
    const [endDate, setEndDate] = useState("")
    const [description, setDescription] = useState("")
    const [subType, setSubType ]= useState([])
    const [id,setId] = useState("")
    const [ExaminationList, setExaminationList]= useState([])
    const [competitions, setCompetitions]= useState([])
    const [buttonClicked,setButtonClicked]=useState(false)
      const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        country: "",
        dob: "",
        gender: "",
        mobileNumber: "",
        password: "",
        confirmPassword: "",
        purposeOfRegistration: [],
        category:"",
        educationalLevel:"",
        school:"",
        grade:""
      })
    // let preferences=[]
    

    const contextValue ={
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
        // preferences,
        prepChecked,
        studychecked,
        atdp,
        olympiad,
        setPrepChecked,
        setStudyChecked,
        setATDP,
        setOlympiad,
        setCalendar,
        Calendar,
        purposes,
        setPurposes,
        loadCompetitions,
        setLoadCompetitions,
        purposeChecked,
        setPurposeChecked,
        userExamination,
        setUserExamination,
        loadExaminations,
        setLoadExaminations,
        setAllExamination,
        AllExamination,
        competitionList,
        setCompetitionList,
        setName,
        name,
        setStartDate,
        startDate,
        setEndDate,
        endDate,
        description,
        setDescription,
        id,
        setId,
        setSubType,
        subType,
        setExaminationList,
        ExaminationList,
        formData,
        setFormData,
        competitions,
        setCompetitions,
        buttonClicked,
        setButtonClicked
        
    }
    return (
        <storeContext.Provider value={contextValue}>
            {props.children}

        </storeContext.Provider>
    )
}

export default StoreContextProvider
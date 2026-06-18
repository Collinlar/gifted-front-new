import { Route, Routes, useLocation } from "react-router-dom";



import Sidebar from "./Components/common/Sidebar";

import OverviewPage from "./Pages/OverviewPage";
import Tracks from "./Pages/Tracks";
import TrackDetail from "./Pages/TrackDetail";
import Community from "./Pages/Community";
import LearningManagement from "./Pages/LearningManagement";
import AssessmentManagement from "./Pages/AssessmentManagement";
import FeaturedQuizzes from "./Pages/FeaturedQuizzes";
import AIAgent from "./Pages/AIAgent";
import InvoiceList from "./Pages/InvoiceList";
import Diagnostics from "./Pages/Diagnostics";
import { useContext,useEffect, useState } from "react";
import Select from "./Pages/SelectGraduatWP";

import SelectParent from "./Pages/SelectParent";
import SelectStudent from "./Pages/SelectStudent";
import { storeContext } from './Context'
import SelectCategory from "./Pages/SelectCategory";
import SelectHighSchool from "./Pages/SelectHighSchool";
import SelectPrimary from "./Pages/SelectPrimary";
import InputSchool from "./Pages/InputSchool";
import SubDetails from "./Pages/subDetails"
import Invoice from "./Pages/Invoice";
import axios from "axios";
import Login from "./Pages/Login";
// import { useLocation } from "react-router-dom";
import LandingPages from "./Pages/landingPage";
import SignUp from "./Pages/SignUp";
import Question from "./Pages/Question"
import QuizOverview from "./Pages/QuizOverview";
import ProgramsPage from "./Pages/Programs";
import CourseViewPage from "./Pages/CoursePage";
import ChannelFeed from "./Pages/ChannelFeed";
import InvoicePage from "./Pages/InvoiceList";
import CalendarPage from "./Pages/Calendar";

import UserDetails from "./Pages/UserDetails";
import InvoiceChannel from "./Pages/InvoiceChannel";

import Profile from "./Pages/Profile";
import InvoiceAssessment from "./Pages/InvoiceAssessment";
import InvoiceCourse from "./Pages/InvoiceCourse";
import { jwtDecode } from "jwt-decode";
import ForgotPassword from "./Pages/ForgotPassword";
import ResetPasswordPage from "./Pages/ResetPassword";

import ReviewAssessments from "./Pages/ReviewAssessments";
import ReviewCourse from "./Pages/ReviewCourse";
import CourseDetails from "./Pages/CourseDetails";
import FlashCardsPage from "./Pages/FlashCardsPage";
import ClassicFlashcards from './Pages/ClassicFlashcards';
import TimedChallenge from './Pages/TimedChallenge';
import AIPoweredStudy from './Pages/AIPoweredStudy';
import Marketplace from './Pages/MarketPlace';
import History from './Pages/History';
import { ensureAccessibilityBar } from './Components/AccessibilityBar';
// import { LeaderboardPage } from "./Pages/Leaderboard";
// import ContestJoinPage from "./Pages/JoinContest";
import ContextOverview from "./Pages/ContestOverviewPage";
import 	ContextPage from "./Pages/ContestPage";

import Leaderboard from "./Pages/Leaderboard";

import PathwayLandingPage from "./Pages/PathwayLandingPage"
import BeginnersPathwayDetail from "./Pages/BeginnersPathwayDetail";
import ExamModePage from "./Pages/ExamMode";
import ExamLogin from "./Pages/ExamLogin";
import VerifyPayment from "./Pages/VerifyPayment"
import ClaimAccount from "./Pages/ClaimAccount";

import useGATracking from "./Pages/UseGATracking";





function App() {
	// API calls now route through Supabase (src/lib/api.js)
    const { competitionList,competitions} = useContext(storeContext)
    // const [competitions, setCompetitions] = useState([])
	// const [update,setUpdate]= useState(false)
	const location = useLocation()

	useGATracking()
    // useEffect(()=>{
    //     const LoadCompetitions = async ()=>{
         
	// 	     const response = await axios.get("/all-competitions")
			 
	// 		 setCompetitions(()=>{return [...response.data.AllCompetitions]})

	// 		 setUpdate(true)

	// 		 console.log(response)
	// 		 console.log(competitions)
			 
         
            
          
             
    //           setCompetitionList(()=>{return [{name:"Science"}, {name:"Mathematics"},{name:"English"}]})
    //       }
    //      LoadCompetitions()
        
    //     },[update])

	// 	useEffect(() => {
	// 		setUpdate(true)
	// 		const LoadUserDetails = async () => {
	// 		  const response = await axios.get(`/user-details/${jwtDecode(localStorage.getItem("token"))?.id}`);
	// 		  console.log(response)
	// 		  if (response.data.success) {
	// 			localStorage.setItem("Paid",JSON.stringify(response.data.user.Paid.map((item)=>`${item.name}`)))
	// 			localStorage.setItem("Grade-Paid",JSON.stringify(response.data.user.Paid.map((item)=>`${item.name}-${item.grade}`)))
	// 			localStorage.setItem("user",JSON.stringify(response.data.user))
	// 			localStorage.setItem("learning",JSON.stringify(response.data.learningResources[0]?.learningAnalytics || []))
	// 			localStorage.setItem("performance",JSON.stringify(response.data.performance[0]?.details || []))
	// 		  }
			  
	// 		};
	// 		LoadUserDetails();
	// 	  }, [update]);

	
	return (
		<div className='flex h-screen overflow-hidden'>
			{/* BG */}
			{/* <div className='fixed inset-0 z-0'>
				<div className='absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 opacity-80' />
				<div className='absolute inset-0 backdrop-blur-sm' />
			</div> */}

			{(location.pathname=="/overview"||location.pathname=="/community"||location.pathname=="/learning-management"||location.pathname=="/assessment-management"||location.pathname=="/ai-agent"||location.pathname=="/invoice"||location.pathname=="/diagnostics"|| location.pathname=="/invoice-page"||location.pathname=="/calendar-page" || location.pathname=="/tracks" || location.pathname.startsWith("/track/") || location.pathname=="/history" || location.pathname=="/profile")&&<Sidebar className="overflow-y-hidden" />}
			<div className="flex-1 h-screen overflow-y-auto">
			<Routes>
				<Route index element={<LandingPages/>}/>
				
				<Route path='/overview' element={<OverviewPage competitions={competitions} />} />
				<Route path='/tracks' element={<Tracks />} />
				<Route path='/history' element={<History />} />
				<Route path='/track/:slug' element={<TrackDetail />} />
				<Route path='/community' element={<Community />} />
				<Route path='/learning-management' element={<LearningManagement />} />
				<Route path='/assessment-management' element={<AssessmentManagement />} />
				<Route path='/ai-agent' element={<AIAgent />} />
				<Route path='/invoice' element={<InvoiceList />} />
				<Route path='/diagnostics' element={<Diagnostics />} />
				<Route element={<Select competitionList={competitionList}/>} path='/purpose'/>
				<Route element={<SignUp/>} path="/sign-up"/>
				<Route element={<SelectParent/>} path='/select-parent'/>
				<Route element={<SelectStudent/>} path='/select-student'/>
				<Route element={<SelectCategory/>} path="/select-category"/>
				<Route element={<SelectHighSchool/>} path='/select-highschool'/>
				<Route element={<Login/>} path="/login"/>
				
				<Route element={<SelectPrimary/>} path='/select-primary'/>
				<Route element={<InputSchool/>} path='/input-school'/>
				<Route element={<SubDetails/>} path='/details/:id'/>
				<Route element={<Invoice/>} path='/subitem/:name'/>
				{/* <Route element={<Questions/>} path="/quiz-questions"/> */}

				<Route element={<Question/>} path="/quiz-questions"/>
				<Route element={<QuizOverview/>} path="/quiz-overview"/>
				<Route element={<ProgramsPage competition={competitions}/>} path="/programs"/>
				<Route element={<CourseViewPage/>} path="/course-view"/>

				<Route element={<ChannelFeed/>} path="/channel-page"/>
				<Route element={<InvoicePage/>} path="/invoice-page"/>
				<Route element={<CalendarPage/>} path="/calendar-page"/>

				<Route element={<UserDetails/>} path="/user-details"/>
				<Route element={<Profile/>} path="/profile"/>
				<Route element={<InvoiceAssessment/>} path="/assessment"/>
				<Route element={<FeaturedQuizzes/>} path="/featured-quizzes"/>

				<Route element={<ReviewAssessments/>} path="/review-assessment"/>
				<Route element={<ReviewCourse/>} path="/review-course"/>
				
				<Route element={<InvoiceCourse/>} path="/learning"/>
				<Route element={<InvoiceChannel/>} path="/channels"/>
				<Route element={<ForgotPassword/>} path="/forgot-password"/>
				<Route element={<ClaimAccount/>} path="/claim-account"/>
				<Route element={<ResetPasswordPage/>} path="/reset-password"/>
				<Route element={<CourseDetails/>} path="/course-details"/>
				<Route element={<VerifyPayment/>} path="/verify-payment"/>
				

				{/* Flashcards */}
				<Route element={<FlashCardsPage/>} path="/flashcards"/>
				<Route path="/flashcards/classic" element={<ClassicFlashcards />} />
				<Route path="/flashcards/timed" element={<TimedChallenge />} />
				<Route path="/flashcards/ai" element={<AIPoweredStudy />} />
				<Route path="/marketplace" element={<Marketplace />} />
				{/* <Route path="/leaderboard" element={<LeaderboardPage />} /> */}

				<Route path="/contest-overview" element={<ContextOverview />} />
				<Route path="/contest-page" element={<ContextPage />} />
				<Route path="/leaderboard" element={<Leaderboard/>}/>

				<Route path="/pathway" element={<PathwayLandingPage />} />
				<Route path="/beginner-pathway" element={<BeginnersPathwayDetail />} />
				<Route path="/exam/:id" element={<ExamModePage/>}/>
				<Route path="/exam-login" element={<ExamLogin/>}/>

				{/* <Route path="/google-analytics-tracking" element={<useGATracking/>}/> */}
				
				
	
	
{/* 				<Route element={<CoursePage/>} path="/course"/> */}
			</Routes>
			</div>
		</div>
	);
}

export default App;

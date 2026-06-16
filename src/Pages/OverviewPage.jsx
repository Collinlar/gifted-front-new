import { getTokenUserId } from "../lib/auth";

"use client"

import { BarChart2, ShoppingBag, Users, Zap, Calendar, ChevronRight, ChevronLeft, Clock, DollarSign, Filter, Plus, Search, BookOpen, CheckCircle, Award, TrendingUp, Book, MessageCircle,ShoppingCart, Play, X, Pause, RotateCcw, } from "lucide-react";
import { motion } from "framer-motion";
// import Sidebar from "../components/common/Sidebar";
import Header from "../Components/common/Header";
import { useState, useEffect, useContext, useCallback } from "react";
import { storeContext } from "../Context";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getQuizDetails, getAllLearningResourceAnalytics, getUserDetails, getUserTracks, getTrackContent } from "../lib/api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { jwtDecode } from "jwt-decode";
import AnnouncementModal from "./AnnouncementModal";

// Brand colors
const brandColors = {
  primary: "#003366",
  secondary: "#336699",
  accent: "#6699CC",
  background: "#F0F4F8",
  text: "#333333",
  white: "#FFFFFF",
};

const quickActions = [
  {
    label: 'Register for a Program',
    color: 'bg-red-500',
    icon: <Award size={40} className="text-white mb-4" />,
    to: '/programs',
  },
  {
    label: 'Take a Test',
    color: 'bg-purple-900',
    icon: <CheckCircle size={40} className="text-white mb-4" />,
    to: '/assessment-management',
  },
  {
    label: 'Learn Something',
    color: 'bg-blue-800',
    icon: <BookOpen size={40} className="text-white mb-4" />,
    to: '/learning-management',
  },
  {
    label: 'Join a Community',
    color: 'bg-yellow-400',
    icon: <Users size={40} className="text-white mb-4" />,
    to: '/community',
  },
  {
    label: 'Visit our Marketplace',
    color: 'bg-teal-600',
    icon: <ShoppingCart size={40} className="text-white mb-4" />,
    to: '/marketplace',
  },
  {
    label: 'View Your Results',
    color: 'bg-pink-600',
    icon:  <MessageCircle size={40} className="text-white mb-4" />,
    to: '/view-results',
  },
];

const ONBOARDING_ACCENT = "#003366";

const OnboardingWizard = ({ isVisible, onClose, onComplete, navigate }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const onboardingSteps = [
    {
      id: 'welcome',
      content: (
        <div className="text-center">
          <h3 className="text-xl font-bold text-gray-800 mb-2">Welcome to Gifted</h3>
          <p className="text-gray-600 mb-6 text-sm">
            Here's a quick look at your dashboard before you get started.
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={onClose} className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">
              Skip
            </button>
            <button
              onClick={() => setCurrentStep(1)}
              className="px-6 py-2 text-white rounded-lg font-medium"
              style={{ backgroundColor: ONBOARDING_ACCENT }}
            >
              Continue
            </button>
          </div>
        </div>
      )
    },
    {
      id: 'choose-track',
      content: (
        <div className="text-center">
          <h3 className="text-lg font-bold text-gray-800 mb-2">Pick your tracks</h3>
          <p className="text-gray-600 mb-6 text-sm">
            A track brings together the competitions, camps, resources and assessments for one subject, like Mathematics or Science.
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => setCurrentStep(2)} className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">
              Later
            </button>
            <button
              onClick={() => { onClose(); navigate && navigate('/tracks'); }}
              className="px-6 py-2 text-white rounded-lg font-medium"
              style={{ backgroundColor: ONBOARDING_ACCENT }}
            >
              Choose Tracks
            </button>
          </div>
        </div>
      )
    },
    {
      id: 'complete',
      content: (
        <div className="text-center">
          <h3 className="text-lg font-bold text-gray-800 mb-2">You're ready</h3>
          <p className="text-gray-600 mb-6 text-sm">
            Use the sidebar to get to Programs, Learning Hub and Assessments any time. Your dashboard always shows where you left off.
          </p>
          <button
            onClick={() => { onComplete(); onClose(); }}
            className="px-6 py-2 text-white rounded-lg font-medium"
            style={{ backgroundColor: ONBOARDING_ACCENT }}
          >
            Start Learning
          </button>
        </div>
      )
    }
  ];

  const currentStepData = onboardingSteps[currentStep];

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-sm mx-4 p-6">
        <button onClick={onClose} className="absolute top-3 right-3 p-1 rounded-full text-gray-400 hover:bg-gray-100">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex items-center gap-1.5 mb-5">
          {onboardingSteps.map((_, index) => (
            <div
              key={index}
              className="h-1 flex-1 rounded-full"
              style={{ backgroundColor: index <= currentStep ? ONBOARDING_ACCENT : '#E5E7EB' }}
            />
          ))}
        </div>

        {currentStepData.content}
      </div>
    </div>
  );
};

const OverviewPage = () => {
  const { purposes, userExamination, loadExaminations, SetPurposeofRegistration, 
          setCompetitionList, setId, competitionList, setLoadExaminations,
          AllExamination, setExaminationList, ExaminationList, setAllExamination,
          purposeOfRegistration,setCompetitions,competitions} = useContext(storeContext);
  
  const [viewSub, setViewSub] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortOrder, setSortOrder] = useState("dateAsc");
  const [showAnalytics, setShowAnalytics] = useState(true);
  const [activeTab, setActiveTab] = useState("programs");
  const [assessments,setAssessment]= useState([])
  const [performanceData, setPreformanceData]= useState([])
  const [subjectDistribution, setSubjectDistribution]=useState([])
  const [learningResources, setLearningResources] = useState([])
  const [registeredPrograms ,setRegisteredPrograms] = useState(0)
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [myTracks, setMyTracks] = useState([])
  const [newCountsByTrack, setNewCountsByTrack] = useState({})
  const navigate = useNavigate();

  useEffect(() => {
    const loadMyTracks = async () => {
      const userId = getTokenUserId()
      if (!userId) return
      try {
        const res = await getUserTracks(userId)
        setMyTracks(res.tracks || [])
      } catch (error) {
        console.error("Error loading tracks:", error)
      }
    }
    loadMyTracks()
  }, [])

  // How many new (untaken, not-yet-seen) assessments sit in each of the user's tracks
  useEffect(() => {
    if (myTracks.length === 0) return
    const loadNewCounts = async () => {
      try {
        const profile = JSON.parse(localStorage.getItem('user') || '{}')
        const lastSeenAt = profile.last_seen_exams_at ? new Date(profile.last_seen_exams_at) : null
        const attemptedIds = new Set(assessments.map((q) => q.id || q.quizId))

        const results = await Promise.all(myTracks.map((t) => getTrackContent(t.id).catch(() => null)))
        const counts = {}
        myTracks.forEach((t, i) => {
          const res = results[i]
          if (!res) return
          counts[t.id] = res.exams.filter((e) =>
            !attemptedIds.has(e.id) && (!lastSeenAt || (e.created_at && new Date(e.created_at) > lastSeenAt))
          ).length
        })
        setNewCountsByTrack(counts)
      } catch (error) {
        console.error("Error loading new assessment counts:", error)
      }
    }
    loadNewCounts()
  }, [myTracks, assessments])

  // Mock analytics data - in production you would calculate this from real data
  const analyticsData = {
    totalPrograms: 0,
    upcomingExams: 0,
    completedExams: 0,
    averageScore: 0
  };

  // Mock learning resources data
  const learningResourcess = [
    { id: 1, title: "Mathematics Fundamentals", category: "Mathematics", level: "Beginner", completed: false, progress: 0 },
    { id: 2, title: "Physics: Core Concepts", category: "Science", level: "Intermediate", completed: false, progress: 65 },
    { id: 3, title: "Essay Writing Guide", category: "English", level: "Advanced", completed: true, progress: 100 },
    { id: 4, title: "Chemistry Laboratory Techniques", category: "Science", level: "Intermediate", completed: false, progress: 32 },
    { id: 5, title: "Algebra Problem Solving", category: "Mathematics", level: "Intermediate", completed: false, progress: 78 },
    { id: 6, title: "Reading Comprehension", category: "English", level: "Beginner", completed: true, progress: 100 },
  ];

  // Mock assessments data
  const assessment = [
    { id: 1, title: "Mathematics Quiz 1", totalQuestions: 20, score: 85, completed: true, date: "2025-03-28" },
    { id: 2, title: "Physics Test", totalQuestions: 15, score: 92, completed: true, date: "2025-03-15" },
    { id: 3, title: "English Language Assessment", totalQuestions: 30, score: 78, completed: true, date: "2025-02-20" },
    { id: 4, title: "Weekly Math Challenge", totalQuestions: 10, completed: false, date: "2025-04-05" },
    { id: 5, title: "Science Olympiad Prep", totalQuestions: 25, completed: false, date: "2025-04-10" },
  ];

  // Performance data for subjects chart
  const performanceInformation= [
    { subject: "Mathematics", score: 85 },
    { subject: "Science", score: 92 },
    { subject: "English", score: 78 },
    { subject: "History", score: 88 }
  ];

  // Learning focus distribution data for pie chart
  const subjectDistributions = [
    { name: "Mathematics", value: 35 },
    { name: "Science", value: 25 },
    { name: "English", value: 20 },
    { name: "History", value: 20 }
  ];

  // Colors for charts
  const COLORS = ['#003366', '#336699', '#6699CC', '#99CCFF'];
  
  // Show the guided tour once per account — until they complete or dismiss it
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    if (!hasSeenOnboarding) {
      setTimeout(() => {
        setShowOnboarding(true);
      }, 1000);
    }
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setShowOnboarding(false);
  };

  useEffect(()=>{
    const loadAssessmentAnalytics = async()=>{
      const response = await getQuizDetails(jwtDecode(localStorage.getItem("token")).sub)
      if(response.success && response.quizDetails.length>0){
        setAssessment(()=>{return [...response.quizDetails]})
        const performance = response.quizDetails
        setPreformanceData(()=>{return [...performance]})

      }

    }
    loadAssessmentAnalytics()
  },[])
  useEffect(()=>{
    const loadLearningAnalytics = async()=>{
      const response = await getAllLearningResourceAnalytics(jwtDecode(localStorage.getItem("token")).sub)
      if(response.success && response.analytics.length>0){
        setLearningResources(()=>{return [...response.analytics]})
        const learningAnalytics = response.analytics.map((item)=>{return {name:item.title, value:item.progress}})
        setSubjectDistribution(()=>{return [...learningAnalytics]})

      }

    }
    loadLearningAnalytics()
  },[])

  const token = localStorage.getItem("token");
  useEffect(() => {
    setLoadExaminations(true);
    const LoadUserExamination = async () => {
      try {
        const response = await getUserDetails(jwtDecode(localStorage.getItem("token")).sub);
        if (response.success) {
          localStorage.setItem("purpose", JSON.stringify(response.user.purposeOfRegistration));
          
          let userInterest = []
          // Update analytics based on loaded data
          if (response.success) {

            const listArray = JSON.parse(localStorage.getItem("interest")) || []
            const objectsArray = competitions
            console.log(listArray)
            console.log(competitions)
            let programs =  [];
            let subPrograms = []

            // for (let item of objectsArray){
            //   subPrograms.push(...item.subTypes)
            // }
            listArray?.forEach(item => {
              competitions.forEach(obj => {
                if (obj.type.includes(item)) {
                  const isDuplicate = programs.some(r =>
                    JSON.stringify(r) === JSON.stringify(obj.type)
                  );
                  if (!isDuplicate) {
                    programs.push(obj);
                  }
                }
              });
            });


            const totalRegisteredPrograms = programs.filter(item=> item.registered.includes(jwtDecode(localStorage.getItem("token"))?.sub))
            setRegisteredPrograms(totalRegisteredPrograms.length)
            console.log(totalRegisteredPrograms)
            console.log(programs)
          


            // const programs = response.data.user.purposeOfRegistration;
            // localStorage.setItem("interests",JSON.stringify(programs))
            analyticsData.totalPrograms = programs.length;
            analyticsData.upcomingExams = programs.filter(p => new Date(p.startDate) > new Date()).length;
            analyticsData.completedExams = programs.filter(p => new Date(p.endDate) < new Date()).length;
            console.log(getTokenUserId())

          }
        }
      } catch (error) {
        console.error("Error loading purposes:", error);
      } finally {
        setIsLoading(false);
      }
    };
    LoadUserExamination();
  }, [isLoading]);

  const handleCardClick = (id, subItem) => {
    // navigate(`/details/${id}`);
    localStorage.setItem("id", id);

    navigate(`/subitem/${subItem.name}`, { state: subItem }); // Navigate to SubItemPage
    localStorage.setItem("state",JSON.stringify(subItem))
    // localStorage.setItem("id",id)
  };

  const handleCalendarClick = async (id) => {
    navigate(`/calendars/${id}`);
  };

  const handleViewAllPrograms = () => {
    navigate("/programs");
  };

  const handleStartAssessment = (id) => {
    navigate(`/assessment-management`);
  };

  const handleViewResource = (id,courseId,title,category,level,progress) => {
    navigate(`/review-course`,{state:{courseId,title,category,level,progress}});
  };

  // Filter and sort functions
  const extractGradeNumber = (value) => {
    if (value === undefined || value === null) return null;
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      const match = value.match(/\d+/);
      return match ? parseInt(match[0], 10) : null;
    }
    return null;
  };

  const getUserGradeNumber = () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;
      const tokenGrade = jwtDecode(token).grade;
      return extractGradeNumber(tokenGrade);
    } catch (e) {
      return null;
    }
  };

  const getFilteredPrograms = () => {
    const listArray = JSON.parse(localStorage.getItem("interest")) || []
    const objectsArray = competitions
    let programs =  [];

    if (!listArray.length) return programs;

    listArray.forEach(item => {
      competitions.forEach(obj => {
        if (obj.type.includes(item)) {
          const isDuplicate = programs.some(r =>
            JSON.stringify(r) === JSON.stringify(obj.type)
          );
          if (!isDuplicate) {
            programs.push(obj);
          }
        }
      });
    });

    // console.log(programs)
    const seen = new Set();
    programs = programs.filter(obj => {
      const key = `${obj.name}-${obj.year}`;
      return seen.has(key) ? false : seen.add(key);
    });

    // Apply grade filter
    const userGradeNumber = getUserGradeNumber();
    const anyHasGradeArray = programs.some(p => Array.isArray(p.grade) && p.grade.length > 0);
    if (anyHasGradeArray && userGradeNumber !== null) {
      programs = programs.filter(p => {
        // If no grade array on the item, always include it
        if (!Array.isArray(p.grade) || p.grade.length === 0) return true;
        const normalizedGrades = p.grade
          .map(g => extractGradeNumber(g))
          .filter(gNum => gNum !== null);
        return normalizedGrades.includes(userGradeNumber);
      });
    }


    
    // Apply search filter
    if (searchTerm) {
      programs = programs.filter(program => 
        program.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (filterStatus !== "all") {
      programs = programs.filter(program => program.status === filterStatus);
    }
    
    // Apply sorting
    programs = programs.sort((a, b) => {
      switch(sortOrder) {
        case "dateAsc":
          return new Date(a.startDate) - new Date(b.startDate);
        case "dateDesc":
          return new Date(b.startDate) - new Date(a.startDate);
        case "costAsc":
          return a.cost - b.cost;
        case "costDesc":
          return b.cost - a.cost;
        case "nameAsc":
          return a.name.localeCompare(b.name);
        case "nameDesc":
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });
    
    return programs;
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "TBD";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Format cost for display with Ghana Cedi (GH₵)
  const formatCost = (cost) => {
    if (cost === undefined || cost === null) return "Free";
    return `GH₵${parseInt(cost).toFixed(2)}`;
  };

  // Format progress percentage for display
  const formatProgress = (progress) => {
    return `${progress}%`;
  };

  

  return (
    <div className="flex-1 min-h-screen bg-gray-50 overflow-auto relative z-10">
      <Header title="Dashboard" />
      
      {/* Enhanced Onboarding Wizard */}
      <OnboardingWizard
        isVisible={showOnboarding}
        onClose={() => { localStorage.setItem('hasSeenOnboarding', 'true'); setShowOnboarding(false); }}
        onComplete={handleOnboardingComplete}
        navigate={navigate}
      />
      
      <main className="max-w-7xl mx-auto py-8 px-4 lg:px-8">
        {/* Hero Section */}
        <motion.div 
          className="mb-8 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="font-bold">{`${localStorage.getItem("isReturningSession") === "true" ? "Welcome back" : "Hello"} ${JSON.parse(localStorage.getItem("user") || "{}").first_name || JSON.parse(localStorage.getItem("user") || "{}").firstName || "there"}`}</p>
          <h1 className="text-4xl font-bold mb-4 text-[#003366]">Dashboard Overview</h1>
          <p className="text-lg text-[#336699] max-w-2xl mx-auto">
            Track your programs, access learning resources, and take assessments all in one place.
          </p>
        </motion.div>

        {/* Continue Your Track */}
        <div className="mb-10">
          {myTracks.length > 0 ? (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold text-[#003366] mb-4">Continue Your Track</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {myTracks.map((track) => {
                  const newCount = newCountsByTrack[track.id] || 0
                  return (
                    <button
                      key={track.id}
                      onClick={() => navigate(`/track/${track.slug}`)}
                      className="text-left rounded-lg border border-gray-200 p-4 hover:shadow-md hover:border-[#336699] transition-all relative"
                    >
                      {newCount > 0 && (
                        <span
                          className="absolute -top-2 -right-2 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white"
                          style={{ backgroundColor: track.color || "#336699" }}
                        >
                          {newCount} new
                        </span>
                      )}
                      <p className="font-semibold text-[#003366]">{track.name}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {newCount > 0 ? `${newCount} new assessment${newCount > 1 ? "s" : ""} →` : "Open track →"}
                      </p>
                    </button>
                  )
                })}
                <button
                  onClick={() => navigate("/tracks")}
                  className="text-left rounded-lg border border-dashed border-gray-300 p-4 hover:border-[#336699] transition-all text-gray-500"
                >
                  Manage tracks →
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-md p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-[#003366]">Choose your tracks</h2>
                <p className="text-sm text-gray-500 mt-1">Pick the subjects you're interested in to get a personalized path through Olympiads, camps, resources and assessments.</p>
              </div>
              <button
                onClick={() => navigate("/tracks")}
                className="px-5 py-2.5 rounded-lg bg-[#003366] text-white font-medium hover:bg-[#002347] transition-colors whitespace-nowrap"
              >
                Choose Tracks
              </button>
            </div>
          )}
        </div>

        {/* Quick Actions Card Grid */}
        <div className="mb-10 flex flex-col items-center justify-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 quick-actions-grid">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => navigate(action.to)}
                className={`rounded-2xl shadow-lg flex flex-col items-center justify-center w-64 h-56 ${action.color} hover:scale-105 transition-transform duration-200 focus:outline-none`}
                style={{ minWidth: '220px', minHeight: '180px' }}
              >
                {action.icon}
                <span className="text-white text-xl font-bold text-center px-2">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6 border-b border-gray-200 navigation-tabs">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("programs")}
              className={`py-4 px-1 text-center border-b-2 font-medium text-sm ${
                activeTab === "programs"
                  ? "border-[#003366] text-[#003366]"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center">
                <ShoppingBag className="mr-2 h-5 w-5" />
                Programs & Competitions
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab("learning")}
              className={`py-4 px-1 text-center border-b-2 font-medium text-sm ${
                activeTab === "learning"
                  ? "border-[#003366] text-[#003366]"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center">
                <BookOpen className="mr-2 h-5 w-5" />
                Learning Resources
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab("assessments")}
              className={`py-4 px-1 text-center border-b-2 font-medium text-sm ${
                activeTab === "assessments"
                  ? "border-[#003366] text-[#003366]"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center">
                <CheckCircle className="mr-2 h-5 w-5" />
                Assessments
              </div>
            </button>
          </nav>
        </div>
        
        {/* Filters and Search - Only show for Programs tab */}
        {activeTab === "programs" && (
          <motion.div 
            className="mb-8 flex flex-col sm:flex-row justify-between items-center gap-4 search-filters"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className="relative w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search programs"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-[#6699CC] focus:border-[#6699CC]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <select 
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-[#6699CC] focus:border-[#6699CC]"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="dateAsc">Date: Earliest First</option>
                <option value="dateDesc">Date: Latest First</option>
                <option value="costAsc">Cost: Low to High</option>
                <option value="costDesc">Cost: High to Low</option>
                <option value="nameAsc">Name: A-Z</option>
                <option value="nameDesc">Name: Z-A</option>
              </select>
            </div>
          </motion.div>
        )}

        {/* Programs Content */}
        {activeTab === "programs" && (
          <>
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6699CC]"></div>
              </div>
            ) : (
              <>
                {getFilteredPrograms().length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                    <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No programs found</h3>
                    <p className="text-gray-500 mb-6">
                      {searchTerm || filterStatus !== "all" 
                        ? "Try adjusting your filters or search terms" 
                        : "You haven't enrolled in any programs yet"}
                    </p>
                    <button 
                      onClick={handleViewAllPrograms}
                      className="bg-[#003366] text-white px-6 py-3 rounded-lg hover:bg-[#002244] transition-colors"
                    >
                      Browse Available Programs
                    </button>
                  </div>
                ) : (
                  <motion.div
                    className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-12 programs-grid"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ staggerChildren: 0.1 }}
                  >
                    {getFilteredPrograms().map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        whileHover={{ y: -5 }}
                        onMouseEnter={() => setHoveredCard(index)}
                        onMouseLeave={() => setHoveredCard(null)}
                        className={`relative overflow-hidden rounded-xl shadow-lg transition-all duration-300 ${
                          hoveredCard === index ? 'shadow-xl' : 'shadow-md'
                        }`}
                      >
                        <div 
                          className="absolute inset-0 bg-gradient-to-br from-[#003366] to-[#336699] opacity-90"
                          style={{ 
                            transform: hoveredCard === index ? 'scale(1.05)' : 'scale(1)',
                            transition: 'transform 0.3s ease'
                          }}
                        />
                        <div className="relative z-10 p-6 text-white">
                          <div className="flex items-center justify-between mb-4">
                            <ShoppingBag className="w-8 h-8" />
                            <span className="text-sm font-medium bg-white/20 px-2 py-1 rounded-full">
                            {/* {item.registered.includes(getTokenUserId())?"Registered":""} */}

                            </span>
                          </div>
                          <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
                          
                          <div className="space-y-2 mb-4">
                            {/* Date Information */}
                            <div className="flex items-center text-white/80 text-sm">
                              <Clock className="w-4 h-4 mr-2" />
                              <div>
                                <span className="block">Start: {formatDate(item.startDate)}</span>
                                <span className="block">End: {formatDate(item.EndDate)}</span>
                              </div>
                            </div>
                            
                            {/* Cost Information */}
                            <div className="flex items-center text-white/80 text-sm">
                              <div className="w-4 h-4 mr-2 flex items-center justify-center font-bold">₵</div>
                              <span>{formatCost(item.cost)}</span>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <button
                              onClick={() => handleCardClick(item._id, item)}
                              className="px-4 py-2 bg-white text-[#003366] rounded-lg font-medium hover:bg-opacity-90 transition"
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
                
                {/* View All Programs Button */}
                <div className="flex justify-center mt-8">
                  <button 
                    onClick={handleViewAllPrograms}
                    className="flex items-center gap-2 bg-[#336699] hover:bg-[#003366] text-white px-6 py-3 rounded-lg transition-colors"
                  >
                    View All Available Programs
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </>
            )}  
          </>
        )}

        {/* Learning Resources Content */}
        {activeTab === "learning" && (
          <>
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-[#003366]">Learning Resources</h2>
              <div className="relative w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search resources"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-[#6699CC] focus:border-[#6699CC]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {learningResources.map((resource, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow"
                >
                  <div className={`h-2 ${
                    resource.category === "Mathematics" ? "bg-[#003366]" :
                    resource.category === "Science" ? "bg-[#336699]" :
                    resource.category === "English" ? "bg-[#6699CC]" : "bg-gray-400"
                  }`}></div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-full ${
                          resource.category === "Mathematics" ? "bg-[#003366]/10 text-[#003366]" :
                          resource.category === "Science" ? "bg-[#336699]/10 text-[#336699]" :
                          resource.category === "English" ? "bg-[#6699CC]/10 text-[#6699CC]" : "bg-gray-100 text-gray-600"
                        }`}>
                          <Book className="w-5 h-5" />
                        </div>
                        <span className="ml-2 text-sm font-medium text-gray-600">{resource.category}</span>
                      </div>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        resource.level === "Beginner" ? "bg-green-100 text-green-700" :
                        resource.level === "Intermediate" ? "bg-blue-100 text-blue-700" :
                        "bg-purple-100 text-purple-700"
                      }`}>
                        {resource.level}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-[#003366] mb-3">{resource.title}</h3>
                    
                    {/* Progress bar */}
                    <div className="w-full h-2 bg-gray-100 rounded-full mb-3 overflow-hidden">
                      <div 
                        className={`h-full ${
                          resource.completed ? "bg-green-500" : "bg-[#6699CC]"
                        }`}
                        style={{ width: `${resource.progress}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        {resource.completed ? "Completed" : `${formatProgress(resource.progress)} complete`}
                      </span>
                      <button 
                        onClick={() => handleViewResource(resource.id,resource.courseId,resource.title,resource.category,resource.level,resource.progress)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium ${
                          resource.completed 
                            ? "bg-gray-100 text-gray-700" 
                            : "bg-[#336699] text-white hover:bg-[#003366]"
                        }`}
                      >
                        {resource.completed ? "Review" : "Continue"}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-8">
              <button className="bg-[#336699] hover:bg-[#003366] text-white px-6 py-3 rounded-lg transition-colors">
                Browse All Learning Resources
              </button>
            </div>
          </>
        )}

        {/* Assessments Content */}
        {activeTab === "assessments" && (
          <>
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-[#003366]">Assessments</h2>
              <button 
                onClick={() => handleStartAssessment()}
                className="px-4 py-2 bg-[#003366] text-white rounded-lg hover:bg-[#002244] transition-colors flex items-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                Start New Quiz
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6">
                <div className="grid grid-cols-1 gap-4">
                  {assessments.length>0? assessments.map((assessment, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center">
                          <div className={`p-2 rounded-full mr-3 ${
                            assessment.completed ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                          }`}>
                            <CheckCircle className="w-5 h-5" />
                          </div>
                          <h3 className="text-lg font-semibold text-[#003366]">
                            {assessment.title}
                          </h3>
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatDate(assessment.date)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-sm text-gray-500">
                              <div>
                                Score: <span className="font-semibold">{assessment.score}%</span> • 
                                Questions: {assessment.totalQuestions}
                              </div>
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            navigate(`/review-assessment`,{state:{quizId:assessment.quizId}}) 
                            }}
                          className={`px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200`}
                        >
                          View Results
                        </button>
                      </div>
                    </motion.div>
                  )):<>No Course Records</>}
                </div>
              </div>
            </div>

            <div className="text-center mt-8">
              <button className="bg-[#336699] hover:bg-[#003366] text-white px-6 py-3 rounded-lg transition-colors mr-4" onClick={()=>{navigate("/assessment-management")}}>
                View All Assessments
              </button>
              <button className="bg-[#336699] hover:bg-[#003366] text-white px-6 py-3 rounded-lg transition-colors" onClick={()=>{navigate("/featured-quizzes")}}>
                View Featured Quizzes
              </button>
            </div>
          </>
        )}


        {/* Analytics Section */}
        {showAnalytics && (
          <motion.div
            className="mb-10 analytics-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6">
                <h2 className="text-2xl font-semibold text-[#003366] mb-6">Your Progress Summary</h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {/* Total Programs */}
                  <div className="bg-[#F0F4F8] rounded-lg p-4 flex items-center">
                    <div className="bg-[#003366] p-3 rounded-lg mr-4">
                      <ShoppingBag className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Total Programs</p>
                      <p className="text-2xl font-bold text-[#003366]">
                        {registeredPrograms || 0}
                      </p>
                    </div>
                  </div>
                  
                  {/* Completed Assessments */}
                  <div className="bg-[#F0F4F8] rounded-lg p-4 flex items-center">
                    <div className="bg-[#336699] p-3 rounded-lg mr-4">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Completed Quizzes</p>
                      <p className="text-2xl font-bold text-[#336699]">
                        {assessments.filter(a => a.completed).length}
                      </p>
                    </div>
                  </div>
                  
                  {/* Learning Resources */}
                  <div className="bg-[#F0F4F8] rounded-lg p-4 flex items-center">
                    <div className="bg-[#6699CC] p-3 rounded-lg mr-4">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Learning Resources</p>
                      <p className="text-2xl font-bold text-[#6699CC]">
                        {learningResources.length}
                      </p>
                    </div>
                  </div>
                 
                 {/* Average Score */}
                  <div className="bg-[#F0F4F8] rounded-lg p-4 flex items-center">
                    <div className="bg-green-600 p-3 rounded-lg mr-4">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Average Score</p>
                      <p className="text-2xl font-bold text-green-600">
                        {Math.round(
                          assessments
                            .filter(a => a.completed)
                            .reduce((sum, a) => sum + a.score, 0) / 
                          assessments.filter(a => a.completed).length
                        )}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Performance Analytics Charts */}
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Performance Bar Chart */}
            <div className="bg-white rounded-xl shadow-md p-6 overflow-hidden">
              <h3 className="text-xl font-semibold text-[#003366] mb-4">Subject Performance</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={performanceData} margin={{ top: 5, right: 5, bottom: 20, left: 0 }}>
                    <XAxis dataKey="subject" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="score" fill="#336699" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Subject Distribution Pie Chart */}
            <div className="bg-white rounded-xl shadow-md p-6 overflow-hidden">
              <h3 className="text-xl font-semibold text-[#003366] mb-4">Learning Focus</h3>
              <div className="h-64 flex justify-center items-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={subjectDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {subjectDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </motion.div>
        
        
      </main>
    </div>
  );
};

export default OverviewPage;

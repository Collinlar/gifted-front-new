import { getTokenUserId } from "../lib/auth";

"use client"

import { BarChart2, ShoppingBag, Users, Zap, Calendar, ChevronRight, ChevronLeft, Clock, DollarSign, Filter, Plus, Search, BookOpen, CheckCircle, Award, TrendingUp, Book, MessageCircle,ShoppingCart, Play, X, Pause, RotateCcw, Compass, } from "lucide-react";
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
import AnnouncementsSection from "./AnnouncementsSection";

// Brand colors
const brandColors = {
  primary: "#003366",
  secondary: "#336699",
  accent: "#6699CC",
  background: "#F0F4F8",
  text: "#333333",
  white: "#FFFFFF",
};

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

// One column of the "What's Next" cross-track feed on the dashboard.
const FeedColumn = ({ title, icon, items, emptyLabel, renderMeta, tab, navigate }) => (
  <div className="bg-white rounded-xl shadow-md p-5">
    <h3 className="flex items-center gap-2 font-semibold text-[#003366] mb-4">
      {icon}
      {title}
    </h3>
    {items.length === 0 ? (
      <p className="text-sm text-gray-400">{emptyLabel}</p>
    ) : (
      <div className="space-y-3">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => navigate(`/track/${item.trackSlug}`, { state: { tab } })}
            className="w-full text-left rounded-lg border border-gray-100 p-3 hover:border-[#336699] hover:shadow-sm transition-all"
          >
            <div className="flex items-center gap-1.5 mb-1">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.trackColor || "#336699" }} />
              <span className="text-xs text-gray-400">{item.trackName}</span>
            </div>
            <p className="text-sm font-medium text-[#003366] line-clamp-1">{item.title || item.name}</p>
            {renderMeta && <p className="text-xs text-gray-500 mt-0.5">{renderMeta(item)}</p>}
          </button>
        ))}
      </div>
    )}
  </div>
)

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
  const [showAnalytics, setShowAnalytics] = useState(true);
  const [assessments,setAssessment]= useState([])
  const [learningResources, setLearningResources] = useState([])
  const [registeredPrograms ,setRegisteredPrograms] = useState(0)
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [myTracks, setMyTracks] = useState([])
  const [newCountsByTrack, setNewCountsByTrack] = useState({})
  const [crossTrackFeed, setCrossTrackFeed] = useState({ newAssessments: [], upcomingCompetitions: [], upcomingCamps: [] })
  const [trackStats, setTrackStats] = useState([])
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

  // Builds the "What's Next" cross-track feed: new assessments and upcoming
  // competitions/camps pulled from every track the user has picked, instead
  // of three separate unfiltered tabs repeating the same global catalogs.
  useEffect(() => {
    if (myTracks.length === 0) return
    const loadFeed = async () => {
      try {
        const profile = JSON.parse(localStorage.getItem('user') || '{}')
        const lastSeenAt = profile.last_seen_exams_at ? new Date(profile.last_seen_exams_at) : null
        const attemptedIds = new Set(assessments.map((q) => q.id || q.quizId))
        const now = new Date()

        const results = await Promise.all(myTracks.map((t) => getTrackContent(t.id).catch(() => null)))

        const counts = {}
        const newAssessments = []
        const upcomingCompetitions = []
        const upcomingCamps = []
        const stats = []

        myTracks.forEach((t, i) => {
          const res = results[i]
          if (!res) return

          const newExams = res.exams.filter((e) =>
            !attemptedIds.has(e.id) && (!lastSeenAt || (e.created_at && new Date(e.created_at) > lastSeenAt))
          )
          counts[t.id] = newExams.length
          newExams.forEach((e) => newAssessments.push({ ...e, trackName: t.name, trackSlug: t.slug, trackColor: t.color }))

          res.competitions.forEach((c) => {
            const d = c.start_date ? new Date(c.start_date) : null
            if (d && !isNaN(d) && d >= now) {
              upcomingCompetitions.push({ ...c, trackName: t.name, trackSlug: t.slug, trackColor: t.color, _date: d })
            }
          })

          res.camps.forEach((c) => {
            const d = c.start_date ? new Date(c.start_date) : null
            if (d && !isNaN(d) && d >= now) {
              upcomingCamps.push({ ...c, trackName: t.name, trackSlug: t.slug, trackColor: t.color, _date: d })
            }
          })

          // Real per-track stats for the progress charts — replaces the old
          // "Subject Performance" data source, which had no subject field at all
          const trackExamIds = new Set(res.exams.map((e) => e.id))
          const completedInTrack = assessments.filter((a) => trackExamIds.has(a.id) || trackExamIds.has(a.quizId))
          const avgScore = completedInTrack.length
            ? Math.round(completedInTrack.reduce((sum, a) => sum + (a.score || 0), 0) / completedInTrack.length)
            : null
          stats.push({
            name: t.name,
            color: t.color || "#336699",
            competitions: res.competitions.length,
            courses: res.courses.length,
            exams: res.exams.length,
            completedCount: completedInTrack.length,
            avgScore,
          })
        })

        upcomingCompetitions.sort((a, b) => a._date - b._date)
        upcomingCamps.sort((a, b) => a._date - b._date)

        setNewCountsByTrack(counts)
        setTrackStats(stats)
        setCrossTrackFeed({
          newAssessments: newAssessments.slice(0, 5),
          upcomingCompetitions: upcomingCompetitions.slice(0, 5),
          upcomingCamps: upcomingCamps.slice(0, 5),
        })
      } catch (error) {
        console.error("Error loading dashboard feed:", error)
      }
    }
    loadFeed()
  }, [myTracks, assessments])

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
      }

    }
    loadAssessmentAnalytics()
  },[])
  useEffect(()=>{
    const loadLearningAnalytics = async()=>{
      const response = await getAllLearningResourceAnalytics(jwtDecode(localStorage.getItem("token")).sub)
      if(response.success && response.analytics.length>0){
        setLearningResources(()=>{return [...response.analytics]})
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

        {/* Announcements */}
        <AnnouncementsSection />

        {/* Continue Your Track */}
        <div className="mb-10">
          {myTracks.length > 0 ? (
            <div>
              <h2 className="text-xl font-semibold text-[#003366] mb-4">Continue Your Track</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {myTracks.map((track, i) => {
                  const newCount = newCountsByTrack[track.id] || 0
                  const stats = trackStats.find((s) => s.name === track.name)
                  const color = track.color || ["#336699", "#1D9E75", "#E8A020", "#185FA5", "#9333EA"][i % 5]
                  return (
                    <button
                      key={track.id}
                      onClick={() => navigate(`/track/${track.slug}`)}
                      className="group text-left rounded-2xl bg-white border overflow-hidden transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 relative"
                      style={{ borderColor: "#E5E7EB" }}
                    >
                      <div className="h-1.5 w-full" style={{ backgroundColor: color }} />
                      <div className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: `${color}1A` }}>
                            {track.icon || <Compass size={20} style={{ color }} />}
                          </div>
                          {newCount > 0 && (
                            <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: color }}>
                              {newCount} new
                            </span>
                          )}
                        </div>
                        <p className="font-semibold text-[#003366] mb-1">{track.name}</p>
                        {stats ? (
                          <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                            <span>{stats.competitions} competitions</span>
                            <span>•</span>
                            <span>{stats.exams} assessments</span>
                          </div>
                        ) : (
                          <div className="h-4 mb-3" />
                        )}
                        {stats?.avgScore != null && (
                          <div className="mb-3">
                            <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${stats.avgScore}%`, backgroundColor: color }} />
                            </div>
                            <p className="text-xs text-gray-400 mt-1">{stats.avgScore}% average score</p>
                          </div>
                        )}
                        <span className="inline-flex items-center gap-1 text-sm font-semibold" style={{ color }}>
                          Open track <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                        </span>
                      </div>
                    </button>
                  )
                })}
                <button
                  onClick={() => navigate("/tracks")}
                  className="rounded-2xl border border-dashed border-gray-300 p-5 hover:border-[#336699] transition-all text-gray-400 flex flex-col items-center justify-center gap-1 min-h-[160px]"
                >
                  <Plus className="h-5 w-5" />
                  <span className="text-sm font-medium">Manage tracks</span>
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

        {/* What's Next — cross-track feed, replaces the old Programs/Learning/Assessments tabs */}
        <div className="mb-10">
          <h2 className="text-xl font-semibold text-[#003366] mb-4">What's Next</h2>
          {myTracks.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-6 text-center">
              <p className="text-gray-500 mb-4">Choose a track to see what's coming up across your subjects.</p>
              <button
                onClick={() => navigate("/tracks")}
                className="px-5 py-2.5 rounded-lg bg-[#003366] text-white font-medium hover:bg-[#002347] transition-colors"
              >
                Choose Tracks
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <FeedColumn
                title="New Assessments"
                icon={<CheckCircle className="h-5 w-5 text-[#336699]" />}
                items={crossTrackFeed.newAssessments}
                emptyLabel="No new assessments right now."
                renderMeta={(item) => `${item.number_of_questions || item.totalQuestions || "?"} questions`}
                tab="exams"
                navigate={navigate}
              />
              <FeedColumn
                title="Upcoming Competitions"
                icon={<ShoppingBag className="h-5 w-5 text-[#336699]" />}
                items={crossTrackFeed.upcomingCompetitions}
                emptyLabel="No upcoming competitions right now."
                renderMeta={(item) => item.start_date}
                tab="competitions"
                navigate={navigate}
              />
              <FeedColumn
                title="Upcoming Camps"
                icon={<Calendar className="h-5 w-5 text-[#336699]" />}
                items={crossTrackFeed.upcomingCamps}
                emptyLabel="No upcoming camps right now."
                renderMeta={(item) => item.is_virtual ? "Virtual" : (item.location || item.start_date)}
                tab="camps"
                navigate={navigate}
              />
            </div>
          )}
        </div>

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
                        {(() => {
                          const completed = assessments.filter(a => a.completed)
                          if (!completed.length) return "—"
                          return `${Math.round(completed.reduce((sum, a) => sum + (a.score || 0), 0) / completed.length)}%`
                        })()}
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
          {trackStats.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-6 text-center text-gray-400 text-sm">
              Pick a track to see your performance broken down by subject.
            </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Average score per track */}
            <div className="bg-white rounded-xl shadow-md p-6 overflow-hidden">
              <h3 className="text-xl font-semibold text-[#003366] mb-4">Subject Performance</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trackStats.map(s => ({ subject: s.name, score: s.avgScore ?? 0 }))} margin={{ top: 5, right: 5, bottom: 20, left: 0 }}>
                    <XAxis dataKey="subject" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="score" fill="#336699" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Resource distribution across tracks */}
            <div className="bg-white rounded-xl shadow-md p-6 overflow-hidden">
              <h3 className="text-xl font-semibold text-[#003366] mb-4">Learning Focus</h3>
              {trackStats.every(s => s.courses === 0) ? (
                <div className="h-64 flex items-center justify-center text-gray-400 text-sm">No resources tagged into your tracks yet.</div>
              ) : (
                <div className="h-64 flex justify-center items-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={trackStats.filter(s => s.courses > 0).map(s => ({ name: s.name, value: s.courses }))}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {trackStats.filter(s => s.courses > 0).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
          )}
        </motion.div>
        
        
      </main>
    </div>
  );
};

export default OverviewPage;

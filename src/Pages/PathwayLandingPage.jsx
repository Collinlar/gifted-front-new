import React, { useState } from 'react';
import { Route, Clock, Users, BookOpen, CheckCircle, ArrowRight, Star, Target, Trophy, Play, ChevronRight, Code, Palette, PenTool, Calculator, Lightbulb, Award, Globe, Zap, Brain, Rocket, Filter, Search, User, Calendar, ChevronLeft, ChevronDown, Flame, TrendingUp, Medal, Lock, Unlock, FileText, Video, Gift, Shield, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PathwayLearningPage = () => {
  const [currentView, setCurrentView] = useState('landing');
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const navigate = useNavigate();

  const trackData = {
    stem: {
      title: "STEM Track",
      subtitle: "Science • Technology • Engineering • Math",
      icon: Calculator,
      gradient: "from-blue-600 to-purple-600",
      stats: { 
        programsCompleted: 8, 
        assessmentsTaken: 15, 
        resourcesChecked: 23, 
        streak: 12 
      },
      level: "Intermediate",
      xp: 1250,
      nextLevelXp: 2000,
      badges: 3,
      programs: [
        { 
          name: "American Maths Olympiad - 2025", 
          startDate: "Oct 30, 2025",
          endDate: "Nov 3, 2025",
          status: "Registered",
          difficulty: "Advanced",
          type: "Competition",
          xpReward: 200,
          associatedResources: ["Mathematics Fundamentals", "Advanced Physics Concepts"]
        },
        { 
          name: "National Junior Informatics Olympiad - 2025", 
          startDate: "Jun 11, 2025",
          endDate: "TBO",
          status: "Register Now",
          difficulty: "Intermediate",
          type: "Competition",
          xpReward: 150,
          associatedResources: ["Programming Basics", "Data Science Fundamentals"]
        },
        { 
          name: "Vanda National Junior Science Olympiad (VNJSO) - 2025", 
          startDate: "Jun 15, 2025",
          endDate: "TBO",
          status: "Register Now",
          difficulty: "Intermediate",
          type: "Competition",
          xpReward: 150,
          associatedResources: ["Advanced Physics Concepts", "Mathematics Fundamentals"]
        },
        { 
          name: "Kangaroo Math Competition - 2025", 
          startDate: "Jun 22, 2025",
          endDate: "TBO",
          status: "Register Now",
          difficulty: "Beginner",
          type: "Competition",
          xpReward: 100,
          associatedResources: ["Mathematics Fundamentals", "Programming Basics"]
        }
      ],
      assessments: [
        {
          name: "Vanda International Science Competition - Quiz 1",
          description: "Grade 3 level science assessment",
          type: "Science",
          difficulty: "Beginner",
          questions: 20,
          duration: "30 min",
          xpReward: 50,
          completed: true
        },
        {
          name: "Vanda International Science Competition - Quiz 2",
          description: "Grade 3 level science assessment",
          type: "Science",
          difficulty: "Beginner",
          questions: 25,
          duration: "35 min",
          xpReward: 75,
          completed: false
        },
        {
          name: "IGEO Ghana Demo - Quiz 1",
          description: "Demo test for International Geography",
          type: "Geography",
          difficulty: "Intermediate",
          questions: 15,
          duration: "25 min",
          xpReward: 100,
          completed: false
        }
      ],
      learningResources: [
        {
          name: "Mathematics Fundamentals",
          description: "Complete guide to basic mathematics concepts",
          type: "Course",
          difficulty: "Beginner",
          duration: "4 hours",
          progress: 75,
          checked: true,
          xpReward: 150
        },
        {
          name: "Advanced Physics Concepts",
          description: "Deep dive into modern physics",
          type: "Video Series",
          difficulty: "Advanced",
          duration: "6 hours",
          progress: 30,
          checked: false,
          xpReward: 300
        },
        {
          name: "Programming Basics",
          description: "Introduction to coding concepts",
          type: "Interactive",
          difficulty: "Beginner",
          duration: "3 hours",
          progress: 100,
          checked: true,
          xpReward: 200
        },
        {
          name: "Data Science Fundamentals",
          description: "Learn data analysis and visualization",
          type: "Course",
          difficulty: "Intermediate",
          duration: "5 hours",
          progress: 0,
          checked: false,
          xpReward: 250
        }
      ]
    },
    creative: {
      title: "Creative Arts Track",
      subtitle: "Art • Design • Music • Creative Writing",
      icon: Palette,
      gradient: "from-purple-600 to-pink-600",
      stats: { 
        programsCompleted: 6, 
        assessmentsTaken: 12, 
        resourcesChecked: 18, 
        streak: 8 
      },
      level: "Advanced",
      xp: 1800,
      nextLevelXp: 2500,
      badges: 5,
      programs: [
        { 
          name: "Digital Art Mastery", 
          startDate: "Jul 1, 2025",
          endDate: "Aug 15, 2025",
          status: "Registered",
          difficulty: "Intermediate",
          type: "Course",
          xpReward: 300,
          associatedResources: ["Digital Painting Techniques"]
        },
        { 
          name: "Creative Writing Workshop", 
          startDate: "Jun 20, 2025",
          endDate: "TBO",
          status: "Register Now",
          difficulty: "Beginner",
          type: "Workshop",
          xpReward: 150,
          associatedResources: ["Creative Writing Fundamentals"]
        }
      ],
      assessments: [
        {
          name: "Color Theory Quiz",
          description: "Test your knowledge of color principles",
          type: "Art",
          difficulty: "Beginner",
          questions: 15,
          duration: "20 min",
          xpReward: 50,
          completed: true
        },
        {
          name: "Design Principles Assessment",
          description: "Evaluate your design thinking skills",
          type: "Design",
          difficulty: "Intermediate",
          questions: 30,
          duration: "45 min",
          xpReward: 100,
          completed: false
        }
      ],
      learningResources: [
        {
          name: "Digital Painting Techniques",
          description: "Master digital art creation",
          type: "Video Series",
          difficulty: "Intermediate",
          duration: "5 hours",
          progress: 60,
          checked: true,
          xpReward: 200
        },
        {
          name: "Creative Writing Fundamentals",
          description: "Learn storytelling and narrative techniques",
          type: "Course",
          difficulty: "Beginner",
          duration: "3 hours",
          progress: 100,
          checked: false,
          xpReward: 150
        }
      ]
    },
    literacy: {
      title: "Literacy Track",
      subtitle: "Reading • Writing • Communication • Languages",
      icon: BookOpen,
      gradient: "from-green-600 to-blue-600",
      stats: { 
        programsCompleted: 10, 
        assessmentsTaken: 18, 
        resourcesChecked: 25, 
        streak: 15 
      },
      level: "Advanced",
      xp: 2200,
      nextLevelXp: 3000,
      badges: 7,
      programs: [
        { 
          name: "Advanced Literary Analysis", 
          startDate: "Jun 10, 2025",
          endDate: "Jul 30, 2025",
          status: "Registered",
          difficulty: "Advanced",
          type: "Course",
          xpReward: 400,
          associatedResources: ["Advanced Vocabulary Builder", "Effective Communication Skills"]
        },
        { 
          name: "Public Speaking Mastery", 
          startDate: "Jul 5, 2025",
          endDate: "TBO",
          status: "Register Now",
          difficulty: "Intermediate",
          type: "Workshop",
          xpReward: 200,
          associatedResources: ["Effective Communication Skills"]
        }
      ],
      assessments: [
        {
          name: "Reading Comprehension Test",
          description: "Advanced reading and analysis skills",
          type: "Literacy",
          difficulty: "Advanced",
          questions: 25,
          duration: "40 min",
          xpReward: 150,
          completed: true
        },
        {
          name: "Grammar and Syntax Assessment",
          description: "Test your language proficiency",
          type: "Language",
          difficulty: "Intermediate",
          questions: 35,
          duration: "50 min",
          xpReward: 100,
          completed: false
        }
      ],
      learningResources: [
        {
          name: "Advanced Vocabulary Builder",
          description: "Expand your vocabulary with advanced words",
          type: "Interactive",
          difficulty: "Advanced",
          duration: "4 hours",
          progress: 80,
          checked: true,
          xpReward: 250
        },
        {
          name: "Effective Communication Skills",
          description: "Master verbal and written communication",
          type: "Course",
          difficulty: "Intermediate",
          duration: "3 hours",
          progress: 45,
          checked: false,
          xpReward: 200
        }
      ]
    }
  };

  // Calculate overall progress for a track
  const calculateTrackProgress = (track) => {
    const totalItems = track.programs.length + track.assessments.length + track.learningResources.length;
    const completedItems = track.stats.programsCompleted + track.stats.assessmentsTaken + track.stats.resourcesChecked;
    return Math.round((completedItems / totalItems) * 10);
  };

  // Filter programs by difficulty
  const getFilteredPrograms = (track) => {
    if (difficultyFilter === 'all') return track.programs;
    return track.programs.filter(program => program.difficulty === difficultyFilter);
  };

  // Get learning resources for selected program
  const getProgramResources = (track, programName) => {
    const program = track.programs.find(p => p.name === programName);
    if (!program || !program.associatedResources) return [];
    
    return track.learningResources.filter(resource => 
      program.associatedResources.includes(resource.name)
    );
  };

  // Handle program registration
  const handleProgramRegister = (programName) => {
    const track = trackData[selectedTrack];
    const program = track.programs.find(p => p.name === programName);
    
    if (program) {
      // Update program status to registered
      program.status = 'Registered';
      setSelectedProgram(programName);
    }
  };

  const renderLandingPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-12">
          <button
            onClick={() => navigate('/overview')}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Back to Overview</span>
          </button>
          <div className="text-center flex-1">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">G</span>
              </div>
              <h1 className="text-4xl font-bold text-gray-900">Gifted</h1>
            </div>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose your learning journey and unlock your potential with personalized tracks designed to help you excel.
            </p>
          </div>
          <div className="w-24"></div> {/* Spacer for balance */}
        </div>

        {/* Track Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {Object.entries(trackData).map(([trackKey, track]) => {
            const IconComponent = track.icon;
            const progress = calculateTrackProgress(track);
            
            return (
              <div
                key={trackKey}
                onClick={() => {
                  setSelectedTrack(trackKey);
                  setCurrentView('dashboard');
                }}
                className="group cursor-pointer transform hover:scale-105 transition-all duration-300"
              >
                <div className={`relative bg-gradient-to-br ${track.gradient} rounded-2xl p-8 text-white overflow-hidden shadow-xl`}>
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute -top-4 -right-4 w-32 h-32 rounded-full bg-white"></div>
                    <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-white"></div>
                  </div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <IconComponent className="w-12 h-12" />
                      <div className="flex items-center space-x-1 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                        <Flame className="w-4 h-4 text-orange-300" />
                        <span className="text-sm font-semibold">{track.stats.streak}</span>
                      </div>
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-2">{track.title}</h3>
                    <p className="text-white/80 mb-6">{track.subtitle}</p>
                    
                    {/* Gamification Stats */}
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-white/80">Level</span>
                        <span className="font-semibold flex items-center">
                          <Star className="w-4 h-4 mr-1" />
                          {track.level}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-white/80">XP Points</span>
                        <span className="font-semibold">{track.xp}</span>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mb-6">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-white/80">Track Progress</span>
                        <span className="font-semibold">{progress}%</span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2">
                        <div 
                          className="bg-white rounded-full h-2 transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <button className="w-full bg-white/20 backdrop-blur-sm hover:bg-white/30 border border-white/30 rounded-xl py-3 font-semibold transition-all duration-200 flex items-center justify-center space-x-2 group-hover:transform group-hover:scale-105">
                      <span>Continue Journey</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Updated Quick Stats with Gamification */}
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Your Learning Journey</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Trophy className="w-8 h-8 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">24</div>
              <div className="text-sm text-gray-600">Programs Completed</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">4,250</div>
              <div className="text-sm text-gray-600">Total XP Earned</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Flame className="w-8 h-8 text-orange-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">15</div>
              <div className="text-sm text-gray-600">Day Streak</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTrackDashboard = () => {
    const track = trackData[selectedTrack];
    const IconComponent = track.icon;
    const overallProgress = calculateTrackProgress(track);
    const levelProgress = Math.round((track.xp / track.nextLevelXp) * 10);
    const filteredPrograms = getFilteredPrograms(track);
    const programResources = selectedProgram ? getProgramResources(track, selectedProgram) : [];

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header with Progress Bar */}
        <div className={`bg-gradient-to-r ${track.gradient} text-white`}>
          <div className="px-8 py-6">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => {
                  setCurrentView('landing');
                  setSelectedProgram(null);
                  setDifficultyFilter('all');
                }}
                className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                <span>Back to Tracks</span>
              </button>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                  <User className="w-4 h-4" />
                  <span className="text-sm font-medium">Welcome back!</span>
                </div>
              </div>
            </div>

            {/* Gamification Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <IconComponent className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">{track.title}</h1>
                  <p className="text-white/80">{track.subtitle}</p>
                </div>
              </div>
              
              {/* Level and XP Display */}
              <div className="text-right">
                <div className="flex items-center justify-end space-x-2 mb-2">
                  <Star className="w-5 h-5 text-yellow-300" />
                  <span className="text-lg font-bold">Level {track.level}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-sm text-white/80">XP: {track.xp}/{track.nextLevelXp}</div>
                  <div className="w-24 bg-white/20 rounded-full h-2">
                    <div 
                      className="bg-yellow-400 rounded-full h-2"
                      style={{ width: `${levelProgress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Gamification Progress Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Trophy className="w-5 h-5 text-yellow-300" />
                  <span className="font-bold text-lg">{track.stats.programsCompleted}</span>
                </div>
                <div className="text-sm text-white/80">Programs Completed</div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-green-300" />
                  <span className="font-bold text-lg">{track.xp}</span>
                </div>
                <div className="text-sm text-white/80">XP Points</div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Flame className="w-5 h-5 text-orange-300" />
                  <span className="font-bold text-lg">{track.stats.streak}</span>
                </div>
                <div className="text-sm text-white/80">Day Streak</div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content - Programs First */}
            <div className="lg:col-span-2 space-y-8">
              {/* Programs Section - Now First */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Programs & Competitions</h3>
                  <div className="flex items-center space-x-4">
                    {/* Difficulty Filter */}
                    <div className="relative">
                      <select
                        value={difficultyFilter}
                        onChange={(e) => setDifficultyFilter(e.target.value)}
                        className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:border-blue-500"
                      >
                        <option value="all">All Levels</option>
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                      <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search programs..."
                        className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  {filteredPrograms.map((program, index) => (
                    <div key={index} className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-semibold text-gray-900">{program.name}</h4>
                            <div className="flex items-center space-x-2">
                              <div className={`px-2 py-1 rounded-full text-xs font-bold ${
                                program.difficulty === 'Beginner' ? 'bg-green-100 text-green-700' :
                                program.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {program.difficulty}
                              </div>
                              <div className="flex items-center space-x-1 bg-purple-50 text-purple-600 px-2 py-1 rounded-full">
                                <Zap className="w-3 h-3" />
                                <span className="text-xs font-bold">{program.xpReward} XP</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>Start: {program.startDate}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>End: {program.endDate}</span>
                            </span>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleProgramRegister(program.name)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium ${
                            program.status === 'Registered'
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          } transition-colors`}
                        >
                          {program.status}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Learning Resources Section - Now After Programs */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">
                    {selectedProgram ? `Learning Resources for ${selectedProgram}` : 'Learning Resources'}
                  </h3>
                  {selectedProgram && (
                    <button 
                      onClick={() => setSelectedProgram(null)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Show All Resources
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(selectedProgram ? programResources : track.learningResources).map((resource, index) => (
                    <div key={index} className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            resource.type === 'Video Series' ? 'bg-red-100' :
                            resource.type === 'Course' ? 'bg-blue-100' :
                            'bg-green-100'
                          }`}>
                            {resource.type === 'Video Series' ? <Video className="w-6 h-6 text-red-600" /> :
                             resource.type === 'Course' ? <BookOpen className="w-6 h-6 text-blue-600" /> :
                             <FileText className="w-6 h-6 text-green-600" />}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{resource.name}</h4>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-xs text-gray-500">{resource.duration}</span>
                              <div className={`px-2 py-1 rounded-full text-xs font-bold ${
                                resource.difficulty === 'Beginner' ? 'bg-green-100 text-green-700' :
                                resource.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {resource.difficulty}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
                          <Zap className="w-3 h-3" />
                          <span className="text-xs font-bold">{resource.xpReward} XP</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-4">{resource.description}</p>
                      
                      <div className="space-y-3">
                        {resource.progress > 0 && (
                          <div>
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                              <span>Progress</span>
                              <span>{resource.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  resource.progress === 100 ? 'bg-green-500' : 'bg-blue-500'
                                }`}
                                style={{ width: `${resource.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                        
                        <button className={`w-full py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${
                          resource.checked 
                            ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}>
                          {resource.checked ? (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              <span>Continue Course</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4" />
                              <span>Start Course</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar - Assessments */}
            <div className="space-y-8">
              {/* Assessments Section */}
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Assessments</h3>
                  <span className="bg-blue-100 text-blue-600 text-xs font-bold px-2 py-1 rounded-full">
                    {track.assessments.length} available
                  </span>
                </div>
                <div className="space-y-4">
                  {track.assessments.map((assessment, index) => (
                    <div key={index} className={`p-4 rounded-lg border-2 ${
                      assessment.completed ? 'border-green-200 bg-green-50' : 'border-gray-200 hover:border-blue-200'
                    } transition-colors`}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900 text-sm">{assessment.name}</h4>
                        {assessment.completed && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mb-3">{assessment.description}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                        <span>{assessment.questions} questions • {assessment.duration}</span>
                        <div className="flex items-center space-x-1 bg-orange-50 text-orange-600 px-2 py-1 rounded-full">
                          <Zap className="w-3 h-3" />
                          <span className="font-bold">{assessment.xpReward} XP</span>
                        </div>
                      </div>
                      <button className={`w-full py-2 rounded-lg text-xs font-medium transition-colors ${
                        assessment.completed
                          ? 'bg-gray-100 text-gray-600'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}>
                        {assessment.completed ? 'Completed' : 'Start Assessment'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gamification Elements */}
              <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl p-6 text-white">
                <div className="flex items-center space-x-2 mb-3">
                  <Medal className="w-5 h-5" />
                  <h3 className="font-bold">Current Streak</h3>
                </div>
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold mb-1">{track.stats.streak}</div>
                  <div className="text-yellow-100 text-sm">days in a row!</div>
                </div>
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <div className="text-xs text-yellow-100 mb-1">Next milestone: {track.stats.streak + 1} days</div>
                  <div className="w-full bg-white/30 rounded-full h-2">
                    <div className="bg-white rounded-full h-2" style={{ width: '75%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return currentView === 'landing' ? renderLandingPage() : renderTrackDashboard();
};

export default PathwayLearningPage;
import React, { useState, useEffect } from 'react';
import { Route, Clock, Users, BookOpen, CheckCircle, ArrowRight, Star, Target, Trophy, Play, ChevronRight, ArrowLeft, Award, FileText, Video, Download, ExternalLink, Lock, Unlock } from 'lucide-react';

const BeginnerPathwayDetail = () => {
  const [completedItems, setCompletedItems] = useState({
    programs: [],
    assessments: [],
    resources: []
  });
  
  const [overallProgress, setOverallProgress] = useState(0);
  const [activeSection, setActiveSection] = useState('overview');

  // Beginner Pathway Data Structure (Using actual platform data patterns)
  const pathwayData = {
    title: "Beginner Pathway",
    subtitle: "Foundation Level",
    description: "Build your foundational skills with structured learning, hands-on practice, and expert guidance. Perfect for newcomers ready to start their learning journey.",
    estimatedTime: "4-6 weeks",
    difficulty: "Beginner",
    totalItems: 12,
    
    programs: [
      {
        id: 1,
        title: "American Maths Olympiad - 2025",
        description: "Start with fundamental mathematics concepts and problem-solving techniques used in competitive mathematics.",
        startDate: "Oct 30, 2025",
        endDate: "Nov 3, 2025",
        status: "Available",
        type: "Competition",
        isRequired: true,
        unlocked: true,
        completed: false,
        order: 1,
        registered: false,
        modules: [
          { name: "Number Theory Basics", duration: "2 hours", completed: false },
          { name: "Algebra Foundations", duration: "2 hours", completed: false },
          { name: "Geometry Principles", duration: "1.5 hours", completed: false },
          { name: "Practice Problems", duration: "2 hours", completed: false }
        ]
      },
      {
        id: 2,
        title: "National Junior Informatics Olympiad-2025",
        description: "Learn programming fundamentals and algorithmic thinking for computer science competitions.",
        startDate: "Jun 11, 2025",
        endDate: "TBD",
        status: "Available",
        type: "Competition",
        isRequired: true,
        unlocked: false,
        completed: false,
        order: 2,
        registered: false,
        prerequisite: "Complete American Maths Olympiad - 2025",
        modules: [
          { name: "Programming Basics", duration: "3 hours", completed: false },
          { name: "Data Structures", duration: "2.5 hours", completed: false },
          { name: "Algorithm Design", duration: "2 hours", completed: false },
          { name: "Competition Problems", duration: "2 hours", completed: false }
        ]
      },
      {
        id: 3,
        title: "Vanda National Junior Science Olympiad (VNJSO)-2025",
        description: "Explore science concepts through hands-on experiments and theoretical understanding.",
        startDate: "Jun 15, 2025",
        endDate: "TBD",
        status: "Available",
        type: "Competition",
        isRequired: true,
        unlocked: false,
        completed: false,
        order: 3,
        registered: false,
        prerequisite: "Complete National Junior Informatics Olympiad-2025",
        modules: [
          { name: "Physics Fundamentals", duration: "2 hours", completed: false },
          { name: "Chemistry Basics", duration: "2 hours", completed: false },
          { name: "Biology Concepts", duration: "2 hours", completed: false },
          { name: "Lab Techniques", duration: "2 hours", completed: false }
        ]
      },
      {
        id: 4,
        title: "Ghana STEM Olympiad-2025",
        description: "Comprehensive STEM competition combining mathematics, science, and technology skills.",
        startDate: "TBD",
        endDate: "TBD",
        status: "Coming Soon",
        type: "Competition",
        isRequired: true,
        unlocked: false,
        completed: false,
        order: 4,
        registered: false,
        prerequisite: "Complete Vanda National Junior Science Olympiad (VNJSO)-2025",
        modules: [
          { name: "Integrated STEM Problems", duration: "3 hours", completed: false },
          { name: "Technology Applications", duration: "2 hours", completed: false },
          { name: "Research Methods", duration: "2 hours", completed: false },
          { name: "Presentation Skills", duration: "1 hour", completed: false }
        ]
      }
    ],

    assessments: [
      {
        id: 1,
        title: "IGEO Ghana Demo",
        description: "This is a demo test for the International Geography Olympiad. Test your knowledge of world geography and geographical concepts.",
        questions: 5,
        timeLimit: "10 minutes",
        passingScore: 70,
        unlocked: true,
        completed: false,
        prerequisite: null,
        type: "Assessment",
        category: "Geography"
      },
      {
        id: 2,
        title: "Vanda International Science Competition [Grade 3] - Quiz 1",
        description: "VANDA Science Olympiad Test. Each question has only 4 possible answers a, b, c and d. Only one answer is correct.",
        questions: 25,
        timeLimit: "90 minutes",
        passingScore: 75,
        unlocked: false,
        completed: false,
        prerequisite: "Complete American Maths Olympiad - 2025",
        type: "Assessment",
        category: "Science"
      },
      {
        id: 3,
        title: "Vanda International Science Competition [Grade 3] - Quiz 2",
        description: "VANDA Science Olympiad Test. Each question has only 4 possible answers a, b, c and d. Only one answer is correct.",
        questions: 25,
        timeLimit: "90 minutes",
        passingScore: 80,
        unlocked: false,
        completed: false,
        prerequisite: "Complete National Junior Informatics Olympiad-2025",
        type: "Assessment",
        category: "Science"
      },
      {
        id: 4,
        title: "Vanda Science Olympiad [Grade 4] - Quiz 1",
        description: "Only Scientific Calculators are allowed during the contest. Each question has only 4 possible answers a, b, c and d.",
        questions: 25,
        timeLimit: "90 minutes",
        passingScore: 85,
        unlocked: false,
        completed: false,
        prerequisite: "Complete Vanda National Junior Science Olympiad (VNJSO)-2025",
        type: "Assessment",
        category: "Science"
      }
    ],

    learningResources: [
      {
        id: 1,
        title: "Beginner's Complete Guide",
        type: "PDF Guide",
        description: "Comprehensive 50-page guide covering all fundamental concepts.",
        downloadUrl: "#",
        unlocked: true,
        category: "Study Material"
      },
      {
        id: 2,
        title: "Video Tutorial Series",
        type: "Video Content",
        description: "12 hours of step-by-step video tutorials with practical examples.",
        downloadUrl: "#",
        unlocked: true,
        category: "Video Learning"
      },
      {
        id: 3,
        title: "Practice Exercises Workbook",
        type: "Interactive Workbook",
        description: "100+ practice exercises with detailed solutions and explanations.",
        downloadUrl: "#",
        unlocked: false,
        prerequisite: "Complete Introduction to Fundamentals",
        category: "Practice Material"
      },
      {
        id: 4,
        title: "Community Study Group Access",
        type: "Community Access",
        description: "Join beginner-level study groups and discussion forums.",
        downloadUrl: "#",
        unlocked: true,
        category: "Community"
      }
    ]
  };

  // Calculate overall progress
  useEffect(() => {
    const totalItems = pathwayData.programs.length + pathwayData.assessments.length + pathwayData.learningResources.length;
    const completedCount = 
      completedItems.programs.length + 
      completedItems.assessments.length + 
      completedItems.resources.length;
    
    setOverallProgress(Math.round((completedCount / totalItems) * 100));
  }, [completedItems]);

  const handleCompleteItem = (type, id) => {
    setCompletedItems(prev => ({
      ...prev,
      [type]: [...prev[type], id]
    }));
  };

  const isItemUnlocked = (item, type) => {
    if (item.unlocked) return true;
    
    // Check prerequisites
    if (type === 'programs') {
      const prevProgram = pathwayData.programs.find(p => p.order === item.order - 1);
      return prevProgram ? completedItems.programs.includes(prevProgram.id) : true;
    }
    
    return completedItems.programs.length > 0; // Simplified logic for demo
  };

  const ProgramCard = ({ program }) => {
    const isUnlocked = isItemUnlocked(program, 'programs');
    const isCompleted = completedItems.programs.includes(program.id);
    
    return (
      <div className={`border rounded-xl p-6 transition-all duration-200 ${
        isCompleted ? 'bg-green-50 border-green-200' : 
        isUnlocked ? 'bg-white border-gray-200 hover:shadow-md' : 
        'bg-gray-50 border-gray-200'
      }`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${
              isCompleted ? 'bg-green-500' : 
              isUnlocked ? 'bg-blue-500' : 'bg-gray-400'
            }`}>
              {isCompleted ? (
                <CheckCircle className="w-5 h-5 text-white" />
              ) : isUnlocked ? (
                <Trophy className="w-5 h-5 text-white" />
              ) : (
                <Lock className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900">{program.title}</h4>
              <p className="text-sm text-gray-600">{program.type}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {program.isRequired && (
              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
                Required
              </span>
            )}
            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full font-medium">
              #{program.order}
            </span>
          </div>
        </div>

        <p className="text-gray-700 mb-4">{program.description}</p>

        {/* Program Details */}
        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <div>
            <div className="flex items-center mb-1">
              <Clock className="w-4 h-4 mr-1" />
              <span>Start: {program.startDate}</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              <span>End: {program.endDate}</span>
            </div>
          </div>
          <div className="text-right">
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
              program.status === 'Available' ? 'bg-green-100 text-green-700' :
              program.status === 'Coming Soon' ? 'bg-yellow-100 text-yellow-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {program.status}
            </div>
          </div>
        </div>

        {!isUnlocked && program.prerequisite && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <Lock className="w-4 h-4 inline mr-1" />
              {program.prerequisite}
            </p>
          </div>
        )}

        {/* Modules Progress */}
        {isUnlocked && (
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Learning Modules</span>
              <span>{program.modules.filter(m => m.completed).length}/{program.modules.length}</span>
            </div>
            <div className="space-y-2">
              {program.modules.map((module, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm">
                  <CheckCircle className={`w-4 h-4 ${module.completed ? 'text-green-500' : 'text-gray-300'}`} />
                  <span className={module.completed ? 'text-green-700' : 'text-gray-700'}>
                    {module.name}
                  </span>
                  <span className="text-gray-500">({module.duration})</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <button
            disabled={!isUnlocked || isCompleted}
            onClick={() => !isCompleted && handleCompleteItem('programs', program.id)}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
              isCompleted ? 'bg-green-100 text-green-700 cursor-not-allowed' :
              isUnlocked ? 'bg-blue-600 text-white hover:bg-blue-700' : 
              'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isCompleted ? 'Completed ✓' : 
             isUnlocked ? (program.registered ? 'Continue' : 'Register Now') : 
             'Locked'}
          </button>
          
          {isCompleted && (
            <div className="text-sm text-green-600 flex items-center">
              <CheckCircle className="w-4 h-4 mr-1" />
              Well done!
            </div>
          )}
        </div>
      </div>
    );
  };

  const AssessmentCard = ({ assessment }) => {
    const isUnlocked = assessment.unlocked || completedItems.programs.length > 0;
    const isCompleted = completedItems.assessments.includes(assessment.id);
    
    return (
      <div className={`border rounded-xl overflow-hidden transition-all duration-200 ${
        isCompleted ? 'bg-purple-50 border-purple-200' : 
        isUnlocked ? 'bg-white border-gray-200 hover:shadow-md' : 
        'bg-gray-50 border-gray-200'
      }`}>
        {/* Assessment Image/Header */}
        <div className={`h-32 bg-gradient-to-r relative ${
          assessment.category === 'Geography' ? 'from-green-400 to-blue-500' :
          assessment.category === 'Science' ? 'from-purple-500 to-indigo-600' :
          'from-blue-500 to-teal-500'
        }`}>
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          <div className="absolute bottom-2 left-4 text-white">
            <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded">
              {assessment.type}
            </span>
          </div>
          <div className="absolute top-2 right-2">
            {isCompleted ? (
              <div className="bg-green-500 text-white p-1 rounded-full">
                <CheckCircle className="w-4 h-4" />
              </div>
            ) : isUnlocked ? (
              <div className="bg-orange-500 text-white p-1 rounded-full">
                <FileText className="w-4 h-4" />
              </div>
            ) : (
              <div className="bg-gray-500 text-white p-1 rounded-full">
                <Lock className="w-4 h-4" />
              </div>
            )}
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-start justify-between mb-3">
            <h4 className="text-lg font-semibold text-gray-900 leading-tight">{assessment.title}</h4>
          </div>

          <p className="text-gray-700 text-sm mb-4 line-clamp-2">{assessment.description}</p>

          {!isUnlocked && assessment.prerequisite && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <Lock className="w-4 h-4 inline mr-1" />
                {assessment.prerequisite}
              </p>
            </div>
          )}

          {/* Assessment Details */}
          <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-600">
            <div className="flex items-center">
              <FileText className="w-4 h-4 mr-1" />
              <span>{assessment.questions} questions</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              <span>{assessment.timeLimit}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
            <span>Passing Score: {assessment.passingScore}%</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              assessment.category === 'Geography' ? 'bg-green-100 text-green-700' :
              assessment.category === 'Science' ? 'bg-purple-100 text-purple-700' :
              'bg-blue-100 text-blue-700'
            }`}>
              {assessment.category}
            </span>
          </div>

          <button
            disabled={!isUnlocked || isCompleted}
            onClick={() => !isCompleted && handleCompleteItem('assessments', assessment.id)}
            className={`w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              isCompleted ? 'bg-purple-100 text-purple-700' :
              isUnlocked ? 'bg-blue-600 text-white hover:bg-blue-700' : 
              'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isCompleted ? 'Assessment Completed ✓' : isUnlocked ? 'Start Quiz' : 'Locked'}
          </button>
        </div>
      </div>
    );
  };

  const ResourceCard = ({ resource }) => {
    const isUnlocked = resource.unlocked || completedItems.programs.length > 0;
    
    return (
      <div className={`border rounded-xl p-6 transition-all duration-200 ${
        isUnlocked ? 'bg-white border-gray-200 hover:shadow-md' : 'bg-gray-50 border-gray-200'
      }`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${isUnlocked ? 'bg-teal-500' : 'bg-gray-400'}`}>
              {resource.type === 'PDF Guide' ? <FileText className="w-5 h-5 text-white" /> :
               resource.type === 'Video Content' ? <Video className="w-5 h-5 text-white" /> :
               resource.type === 'Interactive Workbook' ? <BookOpen className="w-5 h-5 text-white" /> :
               <Users className="w-5 h-5 text-white" />}
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900">{resource.title}</h4>
              <p className="text-sm text-gray-600">{resource.type}</p>
            </div>
          </div>
          
          <span className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded-full">
            {resource.category}
          </span>
        </div>

        <p className="text-gray-700 mb-4">{resource.description}</p>

        {!isUnlocked && resource.prerequisite && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <Lock className="w-4 h-4 inline mr-1" />
              {resource.prerequisite}
            </p>
          </div>
        )}

        <button
          disabled={!isUnlocked}
          className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${
            isUnlocked ? 'bg-teal-600 text-white hover:bg-teal-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isUnlocked ? (
            <>
              {resource.type === 'Community Access' ? <ExternalLink className="w-4 h-4" /> : <Download className="w-4 h-4" />}
              <span>{resource.type === 'Community Access' ? 'Access Community' : 'Download Resource'}</span>
            </>
          ) : (
            <>
              <Lock className="w-4 h-4" />
              <span>Locked</span>
            </>
          )}
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-red-500 to-red-600 rounded-lg">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{pathwayData.title}</h1>
                  <p className="text-gray-600">{pathwayData.subtitle} • {pathwayData.estimatedTime}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{overallProgress}%</div>
                <div className="text-sm text-gray-600">Complete</div>
              </div>
              <div className="w-16 h-16 relative">
                <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="2"
                  />
                  <path
                    d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="2"
                    strokeDasharray={`${overallProgress}, 100`}
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Learning Progress</span>
            <span className="text-sm text-gray-600">{completedItems.programs.length + completedItems.assessments.length + completedItems.resources.length} of {pathwayData.totalItems} completed</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-red-500 to-red-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${overallProgress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: Star },
              { id: 'programs', label: 'Programs', icon: BookOpen },
              { id: 'assessments', label: 'Assessments', icon: Award },
              { id: 'resources', label: 'Resources', icon: FileText }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={`py-4 px-1 text-center border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeSection === id
                    ? "border-red-500 text-red-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeSection === 'overview' && (
          <div className="space-y-8">
            <div className="bg-white rounded-xl shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Your Beginner Journey!</h2>
              <p className="text-gray-700 text-lg mb-6">{pathwayData.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-blue-50 rounded-lg">
                  <BookOpen className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">4 Core Programs</h3>
                  <p className="text-gray-600">Structured learning modules</p>
                </div>
                <div className="text-center p-6 bg-purple-50 rounded-lg">
                  <Award className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">4 Assessments</h3>
                  <p className="text-gray-600">Test your knowledge</p>
                </div>
                <div className="text-center p-6 bg-teal-50 rounded-lg">
                  <FileText className="w-12 h-12 text-teal-600 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">4 Resources</h3>
                  <p className="text-gray-600">Additional study materials</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'programs' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Learning Programs</h2>
              <div className="text-sm text-gray-600">
                {completedItems.programs.length} of {pathwayData.programs.length} completed
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {pathwayData.programs.map((program) => (
                <ProgramCard key={program.id} program={program} />
              ))}
            </div>
          </div>
        )}

        {activeSection === 'assessments' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Assessments</h2>
              <div className="text-sm text-gray-600">
                {completedItems.assessments.length} of {pathwayData.assessments.length} completed
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {pathwayData.assessments.map((assessment) => (
                <AssessmentCard key={assessment.id} assessment={assessment} />
              ))}
            </div>
          </div>
        )}

        {activeSection === 'resources' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Learning Resources</h2>
              <div className="text-sm text-gray-600">
                Additional materials to support your learning
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {pathwayData.learningResources.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Pathways</span>
            </button>
            
            <div className="flex space-x-3">
              <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                Save Progress
              </button>
              <button className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:opacity-90 transition-all flex items-center space-x-2">
                <span>Continue Learning</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BeginnerPathwayDetail;
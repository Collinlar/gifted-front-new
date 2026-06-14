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
import { getQuizDetails, getAllLearningResourceAnalytics, getUserDetails } from "../lib/api";
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

const OnboardingWizard = ({ isVisible, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const onboardingSteps = [
    {
      id: 'welcome',
      title: 'Welcome to Gifted - Your Learning Command Center!',
      description: 'Ready to unlock your potential? Let\'s take a guided tour of your personalized learning dashboard. This 2-minute walkthrough will transform you from newcomer to navigator!',
      target: null,
      position: 'center',
      content: (
        <div className="text-center">
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 rounded-full flex items-center justify-center mb-4 shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Ready for Liftoff?</h3>
            <p className="text-gray-600 mb-4">
              Your learning journey starts here! We've designed every pixel to help you discover, learn, compete, and excel.
            </p>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-3">
              <p className="text-sm text-blue-800">
                <strong>What you'll discover:</strong> Navigation secrets, quick-action shortcuts, progress tracking, and hidden gems that 95% of users never find!
              </p>
            </div>
          </div>
          <div className="flex gap-3 justify-center">
            <button 
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all font-medium"
            >
              Maybe Later
            </button>
            <button 
              onClick={() => {
                setHasStarted(true);
                setCurrentStep(1);
              }}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 flex items-center gap-2 shadow-md transition-all font-medium"
            >
              Let's Explore!
            </button>
          </div>
        </div>
      )
    },
    {
      id: 'sidebar-navigation',
      title: 'Your Navigation Command Center',
      description: 'This sidebar is your mission control! Think of it as your personal assistant - always ready to teleport you exactly where you need to go.',
      target: '.sidebar, nav, [class*="sidebar"]',
      position: 'right',
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            Your Navigation Command Center
          </h3>
          <p className="text-gray-600 text-sm">
            This sidebar is your mission control! Each icon represents a different universe of learning opportunities.
          </p>
          <div className="space-y-2">
            <div className="flex items-start gap-2 p-2 bg-blue-50 rounded-lg">
              <span className="text-blue-600">📊</span>
              <div>
                <strong className="text-blue-800 text-sm">Dashboard:</strong>
                <p className="text-xs text-blue-700">Your learning cockpit - see everything at a glance</p>
              </div>
            </div>
            <div className="flex items-start gap-2 p-2 bg-green-50 rounded-lg">
              <span className="text-green-600">🏆</span>
              <div>
                <strong className="text-green-800 text-sm">Programs & Competitions:</strong>
                <p className="text-xs text-green-700">Join olympiads, contests, and structured learning paths</p>
              </div>
            </div>
            <div className="flex items-start gap-2 p-2 bg-purple-50 rounded-lg">
              <span className="text-purple-600">🛍️</span>
              <div>
                <strong className="text-purple-800 text-sm">Marketplace:</strong>
                <p className="text-xs text-purple-700">Discover premium courses and learning materials</p>
              </div>
            </div>
          </div>
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-2">
            <p className="text-xs text-indigo-800">
              <strong>Pro Tip:</strong> Notice how the active section is highlighted? That's your "You Are Here" marker!
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'quick-actions',
      title: 'Lightning-Fast Quick Actions',
      description: 'These vibrant cards are your express lanes! Skip the navigation maze and jump directly to what matters most.',
      target: '.quick-actions-grid, [class*="quick"], [class*="card"]',
      position: 'bottom',
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            Lightning-Fast Quick Actions
          </h3>
          <p className="text-gray-600 text-sm">
            These aren't just pretty cards - they're your time-saving superpowers! Each color represents a different type of action.
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-gradient-to-r from-yellow-100 to-orange-100 p-2 rounded-lg">
              <strong className="text-yellow-800">Join Community:</strong>
              <p className="text-yellow-700">Connect, collaborate, compete</p>
            </div>
            <div className="bg-gradient-to-r from-teal-100 to-green-100 p-2 rounded-lg">
              <strong className="text-teal-800">Visit Marketplace:</strong>
              <p className="text-teal-700">Shop for premium content</p>
            </div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-2">
            <p className="text-xs text-purple-800">
              <strong>Design Secret:</strong> We use color psychology - warm colors for social actions, cool colors for analytical tasks!
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'navigation-tabs',
      title: 'Smart Content Switcher',
      description: 'These tabs are your content filters - think of them as different lenses to view your learning universe. Each tab reveals a completely different perspective!',
      target: '.navigation-tabs, [class*="tab"], .tab-navigation',
      position: 'bottom',
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            Smart Content Switcher
          </h3>
          <p className="text-gray-600 text-sm">
            These tabs are like TV channels for your learning! Each one shows completely different content tailored to your current needs.
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <span className="text-lg">🏆</span>
              <div>
                <strong className="text-blue-800 text-sm">Programs & Competitions:</strong>
                <p className="text-xs text-blue-700">Your competitive arena - olympiads, contests, and structured challenges</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg border-l-4 border-green-500">
              <span className="text-lg">📚</span>
              <div>
                <strong className="text-green-800 text-sm">Learning Resources:</strong>
                <p className="text-xs text-green-700">Your digital library - courses, materials, and study guides</p>
              </div>
            </div>
          </div>
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-2">
            <p className="text-xs text-indigo-800">
              <strong>Smart Tip:</strong> The active tab changes the entire page content - it's like having 3 dashboards in one!
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'search-filters',
      title: 'Your Personal Discovery Engine',
      description: 'Lost in the learning universe? This search and filter system is your GPS! Find exactly what you need in seconds, not minutes.',
      target: '.search-filters, [class*="search"], [class*="filter"]',
      position: 'bottom',
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            Your Personal Discovery Engine
          </h3>
          <p className="text-gray-600 text-sm">
            Why scroll through hundreds of items when you can find exactly what you need instantly? This isn't just search - it's smart discovery!
          </p>
          <div className="space-y-2">
            <div className="flex items-start gap-2 p-2 bg-blue-50 rounded-lg">
              <span className="text-blue-600">🔎</span>
              <div>
                <strong className="text-blue-800 text-sm">Smart Search:</strong>
                <p className="text-xs text-blue-700">Type keywords, program names, or subjects - our AI understands context!</p>
              </div>
            </div>
            <div className="flex items-start gap-2 p-2 bg-green-50 rounded-lg">
              <span className="text-green-600">📅</span>
              <div>
                <strong className="text-green-800 text-sm">Date Sorting:</strong>
                <p className="text-xs text-green-700">"Earliest First" shows urgent deadlines - never miss registration again!</p>
              </div>
            </div>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-2">
            <p className="text-xs text-orange-800">
              <strong>Power User Trick:</strong> Use quotes for exact phrases, like "National Olympiad" to find specific competitions!
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'program-cards',
      title: 'Your Learning Portfolio at a Glance',
      description: 'These cards are your learning story! Each one represents an opportunity, complete with all the intel you need to make smart decisions.',
      target: '.programs-grid, [class*="program"], [class*="card"]',
      position: 'top',
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            Your Learning Portfolio at a Glance
          </h3>
          <p className="text-gray-600 text-sm">
            Each card tells a complete story! We've designed them to give you maximum information with minimal reading time.
          </p>
          <div className="space-y-2">
            <div className="bg-blue-50 p-2 rounded-lg border border-blue-200">
              <strong className="text-blue-800 text-sm">Program Title & Icon:</strong>
              <p className="text-xs text-blue-700">Instantly recognize what this program is about</p>
            </div>
            <div className="bg-green-50 p-2 rounded-lg border border-green-200">
              <strong className="text-green-800 text-sm">Smart Date Display:</strong>
              <p className="text-xs text-green-700">Start/End dates with color-coded urgency indicators</p>
            </div>
            <div className="bg-purple-50 p-2 rounded-lg border border-purple-200">
              <strong className="text-purple-800 text-sm">Cost & Status:</strong>
              <p className="text-xs text-purple-700">Free programs marked clearly, registration status visible</p>
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-2">
            <p className="text-xs text-amber-800">
              <strong>Visual Hierarchy:</strong> We use colors and spacing to help your eyes find the most important info first!
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'analytics',
      title: 'Your Success Tracking Station',
      description: 'Numbers tell your story! This isn\'t just data - it\'s your learning DNA, showing patterns, progress, and potential.',
      target: '.analytics-section, [class*="analytics"], [class*="progress"], [class*="summary"]',
      position: 'top',
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            Your Success Tracking Station
          </h3>
          <p className="text-gray-600 text-sm">
            This isn't boring statistics - it's your personal success story visualized! Every number represents growth and achievement.
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-blue-50 p-2 rounded-lg border border-blue-200">
              <strong className="text-blue-800">Total Programs</strong>
              <p className="text-blue-700">Your learning breadth</p>
            </div>
            <div className="bg-green-50 p-2 rounded-lg border border-green-200">
              <strong className="text-green-800">Completed Quizzes</strong>
              <p className="text-green-700">Your assessment activity</p>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 p-2 bg-indigo-50 rounded-lg">
              <span>📈</span>
              <div>
                <strong className="text-indigo-800 text-xs">Subject Performance Chart:</strong>
                <p className="text-xs text-indigo-700">See your strengths and improvement areas</p>
              </div>
            </div>
          </div>
          <div className="bg-rose-50 border border-rose-200 rounded-lg p-2">
            <p className="text-xs text-rose-800">
              <strong>Insight Magic:</strong> These charts update in real-time as you learn - watch your progress grow live!
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'accessibility-features',
      title: 'Accessibility & Personalization Hub',
      description: 'Everyone learns differently! This button opens your personalization center where you can customize the platform to match your learning style.',
      target: '[class*="accessibility"], .accessibility-button',
      position: 'bottom',
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            Your Personal Learning Customizer
          </h3>
          <p className="text-gray-600 text-sm">
            This little button packs a big punch! It's your gateway to making Gifted work perfectly for YOUR learning style.
          </p>
          <div className="space-y-2">
            <div className="flex items-start gap-2 p-2 bg-blue-50 rounded-lg">
              <span className="text-blue-600">👁️</span>
              <div>
                <strong className="text-blue-800 text-sm">Visual Preferences:</strong>
                <p className="text-xs text-blue-700">Adjust font sizes, contrast, color schemes for better readability</p>
              </div>
            </div>
            <div className="flex items-start gap-2 p-2 bg-green-50 rounded-lg">
              <span className="text-green-600">⌨️</span>
              <div>
                <strong className="text-green-800 text-sm">Navigation Options:</strong>
                <p className="text-xs text-green-700">Keyboard shortcuts, screen reader support, focus indicators</p>
              </div>
            </div>
          </div>
          <div className="bg-teal-50 border border-teal-200 rounded-lg p-2">
            <p className="text-xs text-teal-800">
              <strong>Inclusive Design:</strong> We believe learning should be accessible to everyone - this tool makes it happen!
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'complete',
      title: 'Mission Accomplished, Learning Champion!',
      description: 'You\'ve unlocked the secrets of your dashboard! You\'re now equipped with insider knowledge that will supercharge your learning journey.',
      target: null,
      position: 'center',
      content: (
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-800">You're Now a Dashboard Master!</h3>
          <p className="text-gray-600">
            Congratulations! You've discovered the hidden powers of your learning dashboard. You're officially part of the 5% who know all the insider tricks!
          </p>
          
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <div className="text-xl mb-1">🧭</div>
              <strong className="text-blue-800">Navigation Pro</strong>
              <p className="text-blue-700 text-xs">Master of the sidebar</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <div className="text-xl mb-1">⚡</div>
              <strong className="text-green-800">Quick Action Expert</strong>
              <p className="text-green-700 text-xs">Lightning-fast access</p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
              <div className="text-xl mb-1">🔍</div>
              <strong className="text-purple-800">Search Ninja</strong>
              <p className="text-purple-700 text-xs">Find anything instantly</p>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
              <div className="text-xl mb-1">📊</div>
              <strong className="text-orange-800">Analytics Wizard</strong>
              <p className="text-orange-700 text-xs">Track like a champion</p>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3">
            <div className="flex items-center justify-center gap-1 mb-1">
              <span>🎁</span>
              <strong className="text-yellow-800 text-sm">Exclusive Bonus Unlocked!</strong>
            </div>
            <p className="text-xs text-yellow-800">
              You can restart this tour anytime from your profile settings. Plus, you now have access to keyboard shortcuts!
            </p>
          </div>

          <div className="flex gap-2 justify-center">
            <button 
              onClick={() => setCurrentStep(0)}
              className="px-4 py-2 text-indigo-600 border border-indigo-300 rounded-lg hover:bg-indigo-50 transition-all font-medium"
            >
              Replay Tour
            </button>
            <button 
              onClick={() => {
                onComplete();
                onClose();
              }}
              className="px-6 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:from-green-600 hover:to-blue-600 shadow-md transition-all font-medium"
            >
              Start My Journey!
            </button>
          </div>
        </div>
      )
    }
  ];

  const currentStepData = onboardingSteps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === onboardingSteps.length - 1;

  // Auto-play functionality
  useEffect(() => {
    let interval;
    if (isPlaying && hasStarted && !isFirstStep && !isLastStep) {
      interval = setInterval(() => {
        if (currentStep < onboardingSteps.length - 2) {
          setCurrentStep(prev => prev + 1);
        } else {
          setIsPlaying(false);
        }
      }, 6000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentStep, hasStarted, isFirstStep, isLastStep]);

  const nextStep = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const jumpToStep = (stepIndex) => {
    setCurrentStep(stepIndex);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Modal */}
      <div 
        className={`absolute bg-white rounded-2xl shadow-xl border transition-all duration-500 ${
          currentStepData.position === 'center' 
            ? 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md mx-4'
            : currentStepData.position === 'right'
            ? 'top-1/2 right-6 transform -translate-y-1/2 w-full max-w-sm'
            : 'top-20 left-1/2 transform -translate-x-1/2 w-full max-w-sm mx-4'
        }`}
        style={{
          maxHeight: '80vh'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {/* Progress Dots */}
            <div className="flex items-center gap-1">
              {(localStorage.getItem("login")!==true)&&onboardingSteps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => hasStarted && jumpToStep(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentStep
                      ? 'bg-blue-600 scale-125'
                      : index < currentStep
                      ? 'bg-green-500 hover:bg-green-600'
                      : 'bg-gray-300 hover:bg-gray-400'
                  } ${hasStarted ? 'cursor-pointer' : ''}`}
                />
              ))}
            </div>
            <span className="text-xs font-medium text-gray-600">
              {currentStep + 1} of {onboardingSteps.length}
            </span>
          </div>
          
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-red-50 hover:text-red-500 transition-all"
          >
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-4 max-h-96 overflow-y-auto">
          {currentStepData.content}
        </div>

        {/* Footer */}
        {hasStarted && !isFirstStep && !isLastStep && (
          <div className="flex items-center justify-between p-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`p-2 rounded-full transition-all ${
                  isPlaying 
                    ? 'bg-orange-100 text-orange-600' 
                    : 'bg-green-100 text-green-600'
                }`}
                title={isPlaying ? "Pause auto-play" : "Start auto-play"}
              >
                {isPlaying ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </button>
              
              <button
                onClick={() => setCurrentStep(0)}
                className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
                title="Restart tour"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={prevStep}
                disabled={currentStep === 0}
                className="flex items-center gap-1 px-3 py-1 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
              
              <button
                onClick={nextStep}
                className="flex items-center gap-1 px-4 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 shadow-md transition-all text-sm font-medium"
              >
                Continue
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Skip button for non-first/last steps */}
        {hasStarted && !isFirstStep && !isLastStep && (
          <div className="px-4 pb-3">
            <button
              onClick={onClose}
              className="w-full text-xs text-gray-500 hover:text-gray-700 py-1 rounded hover:bg-gray-50 transition-all"
            >
              Skip remaining steps →
            </button>
          </div>
        )}

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-100 rounded-b-2xl overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
            style={{ width: `${((currentStep + 1) / onboardingSteps.length) * 100}%` }}
          />
        </div>
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
  const navigate = useNavigate();

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
  
  // Check if user has seen onboarding before
  useEffect(() => {
  // TEMPORARY: Force show onboarding for testing
  console.log('Forcing onboarding to show for testing');
  if(!localStorage.getItem("login")){

    setShowOnboarding(true);
  }
  
  // Original code commented out for testing:
  // const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
  // if (!hasSeenOnboarding) {
  //   setTimeout(() => {
  //     setShowOnboarding(true);
  //   }, 1000);
  // }
}, []);
  // useEffect(() => {
  //   const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
  //   if (!hasSeenOnboarding) {
  //     // Small delay to ensure DOM is ready
  //     setTimeout(() => {
  //       setShowOnboarding(true);
  //     }, 1000);
  //   }
  // }, []);

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
      
      {/* <AnnouncementModal/> */}
      
      {/* Enhanced Onboarding Wizard */}
      {/* <OnboardingWizard 
        isVisible={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={handleOnboardingComplete}
      /> */}
      
      <main className="max-w-7xl mx-auto py-8 px-4 lg:px-8">
        {/* Hero Section */}
        <motion.div 
          className="mb-8 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="font-bold">{`Hello ${JSON.parse(localStorage.getItem("user") || "{}").first_name || JSON.parse(localStorage.getItem("user") || "{}").firstName || "there"}`}</p>
          <h1 className="text-4xl font-bold mb-4 text-[#003366]">Dashboard Overview</h1>
          <p className="text-lg text-[#336699] max-w-2xl mx-auto">
            Track your programs, access learning resources, and take assessments all in one place.
          </p>
        </motion.div>

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

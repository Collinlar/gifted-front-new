import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  RotateCcw,
  CheckCircle,
  X,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  CheckCircle as CheckCircleSolid
} from 'lucide-react';
import { getFlashCards, getTrackFlashcards } from "../lib/api"
import { useNavigate, useLocation } from 'react-router-dom';

function ClassicFlashcards() {
  const [currentCard, setCurrentCard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studiedCards, setStudiedCards] = useState(new Set());
  const [isAnimating, setIsAnimating] = useState(false);
  const [flashcards, setFlashCards] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [noFlashcards, setNoFlashcards] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const locationState = location.state || {}



  useEffect(() => {
    const fetchFlashCard = async () => {
      try {
        setIsLoading(true);

        let cards = []

        // Priority 1: flashcards passed directly via navigation state (from TrackDetail group)
        if (locationState.flashcards?.length) {
          cards = locationState.flashcards
        }
        // Priority 2: trackId — fetch all published flashcards for the track
        else if (locationState.trackId) {
          const response = await getTrackFlashcards(locationState.trackId)
          cards = response.flashcards || []
        }
        // Priority 3: courseId — existing course-based flow
        else {
          const courseId = localStorage.getItem("courseId")
          if (!courseId) {
            setFlashCards([])
            setNoFlashcards(true)
            return
          }
          const response = await getFlashCards(courseId)
          cards = response.flashcards || []
        }

        if (cards.length > 0) {
          const formatted = cards.map((item, index) => ({ ...item, id: item.id || index }))
          setFlashCards(formatted)
          setNoFlashcards(false)
        } else {
          setFlashCards([])
          setNoFlashcards(true)
        }
      } catch (error) {
        console.log("Error fetching flashcards:", error);
        setFlashCards([]);
        setNoFlashcards(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFlashCard();
  }, []);
  

  const handleFlip = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      setIsFlipped(!isFlipped);
      setIsAnimating(false);
    }, 150);
  };

  const handleNext = () => {
    if (currentCard < flashcards.length - 1) {
      setCurrentCard(currentCard + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentCard > 0) {
      setCurrentCard(currentCard - 1);
      setIsFlipped(false);
    }
  };

  const handleMarkStudied = () => {
    setStudiedCards(new Set([...studiedCards, flashcards[currentCard].id]));
    handleNext();
  };

  const handleMarkDifficult = () => {
    // Mark as difficult and move to next
    handleNext();
  };


   const progress = flashcards.length > 0 ? ((currentCard + 1) / flashcards.length) * 100 : 0;
   const currentFlashcard = flashcards[currentCard];
   const isStudied = currentFlashcard ? studiedCards.has(currentFlashcard.id) : false;


  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6 w-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading flashcards...</p>
        </div>
      </div>
    );
  }

  if (noFlashcards || !flashcards.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6 w-full flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-sm p-8">
          <p className="text-gray-700 text-lg font-semibold mb-2">No flashcards for this course.</p>
          <p className="text-gray-500 mb-6">Please check back later or choose a different course.</p>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all duration-200 font-semibold"
          >
            <ArrowLeft size={20} />
            Back to Study Modes
          </button>
        </div>
      </div>
    );
  }


  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6 w-full">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => {navigate(-1)}}
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 mb-6 px-4 py-2 rounded-lg hover:bg-indigo-50 transition-all duration-200"
          >
            <ArrowLeft size={20} />
            Back to Study Modes
          </button>
          
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Classic Flashcards
            </h1>
            <p className="text-gray-600 text-lg">Master your knowledge, one card at a time</p>
          </div>

          {/* Progress Section */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="text-indigo-500" size={20} />
                <span className="font-semibold text-gray-700">Progress</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm bg-gray-100 px-3 py-1 rounded-full font-medium">
                  {currentCard + 1} of {flashcards.length}
                </span>
                <span className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                  {studiedCards.size} mastered
                </span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Flashcard Container */}
        <div className="relative mb-8" style={{ perspective: '1000px' }}>
          <div 
            className={`relative w-full h-96 cursor-pointer transition-transform duration-500 ${
              isFlipped ? '' : ''
            } ${isAnimating ? 'scale-95' : 'hover:scale-105'}`}
            style={{
              transformStyle: 'preserve-3d',
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
            }}
            onClick={handleFlip}
          >
            {/* Front of card */}
            <div 
              className="absolute inset-0 w-full h-full"
              style={{ 
                backfaceVisibility: 'hidden',
                transform: 'rotateY(0deg)'
              }}
            >
              <div className="bg-white rounded-3xl shadow-xl p-8 h-full flex flex-col justify-center items-center relative overflow-hidden border border-gray-100">
                {/* Decorative background pattern */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full -translate-y-16 translate-x-16 opacity-50"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-pink-100 to-yellow-100 rounded-full translate-y-12 -translate-x-12 opacity-50"></div>
                
                {/* Difficulty badge */}
                <div className="absolute top-6 left-6">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(currentFlashcard?.difficulty || 'medium')}`}>
                    {currentFlashcard?.difficulty || 'medium'}
                  </span>
                </div>

                {/* Studied indicator */}
                {isStudied && (
                  <div className="absolute top-6 right-6">
                    <CheckCircle className="text-green-500" size={24} />
                  </div>
                )}

                <div className="text-center z-10">
                  <div className="text-sm text-indigo-600 mb-4 font-semibold uppercase tracking-wide">Question</div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-8 leading-tight">
                    {currentFlashcard?.question || 'Loading question...'}
                  </h2>
                  <div className="flex items-center justify-center gap-2 text-gray-500">
                    <RotateCcw size={16} />
                    <p className="text-sm">Click to reveal answer</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Back of card */}
            <div 
              className="absolute inset-0 w-full h-full"
              style={{ 
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)'
              }}
            >
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl shadow-xl p-8 h-full flex flex-col justify-center items-center relative overflow-hidden text-white">
                {/* Decorative background pattern */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white bg-opacity-10 rounded-full translate-y-12 -translate-x-12"></div>
                
                <div className="text-center z-10">
                  <div className="text-sm text-indigo-200 mb-4 font-semibold uppercase tracking-wide">Answer</div>
                  <h2 className="text-2xl font-bold mb-8 leading-relaxed">
                    {currentFlashcard?.answer || 'Loading answer...'}
                  </h2>
                  <div className="flex items-center justify-center gap-2 text-indigo-200">
                    <RotateCcw size={16} />
                    <p className="text-sm">Click to flip back</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Controls */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex justify-between items-center">
            {/* Previous Button */}
            <button
              onClick={handlePrevious}
              disabled={currentCard === 0}
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold"
            >
              <ChevronLeft size={20} />
              Previous
            </button>

            {/* Center Controls */}
            <div className="flex gap-3">
              <button
                onClick={handleFlip}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
              >
                <RotateCcw size={20} />
                Flip Card
              </button>

              {isFlipped && (
                <>
                  <button
                    onClick={handleMarkDifficult}
                    className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl animate-slideIn"
                  >
                    <X size={20} />
                    Still Learning
                  </button>
                  
                  <button
                    onClick={handleMarkStudied}
                    className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl animate-slideIn"
                  >
                    <CheckCircle size={20} />
                    Got It!
                  </button>
                </>
              )}
            </div>

            {/* Next Button */}
            <button
              onClick={handleNext}
              disabled={currentCard === flashcards.length - 1}
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold"
            >
              Next
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Completion Message */}
        {currentCard === flashcards.length - 1 && studiedCards.size === flashcards.length && (
          <div className="mt-8 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl p-8 text-center animate-slideUp">
            <CheckCircleSolid className="mx-auto mb-4" size={48} />
            <h3 className="text-2xl font-bold mb-2">Congratulations!</h3>
            <p className="text-green-100">You've mastered all the flashcards in this set!</p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}

export default ClassicFlashcards;

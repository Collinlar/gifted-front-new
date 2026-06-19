import React, { useEffect } from 'react';
import { ArrowLeft, RotateCcw, Clock, Brain } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function FlashcardsPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Two entry points:
  // 1. From TrackDetail flashcards tab: { trackId, subject, grade, title, flashcards[] }
  // 2. From CoursePage: courseData with id/_id and title
  const state = location.state || {};
  const isTrackSource = !!state.trackId;

  const courseId   = state.id || state._id || null;
  const trackId    = state.trackId || null;
  const pageTitle  = state.title || state.subject || "Study Flash Cards";
  const subLabel   = state.grade ? `Grade ${state.grade}` : null;

  useEffect(() => {
    if (courseId) localStorage.setItem("courseId", courseId);
    if (trackId)  localStorage.setItem("flashcardTrackId", trackId);
    // If the track passed pre-fetched flashcards, cache them for the study view
    if (state.flashcards?.length) {
      localStorage.setItem("flashcardSet", JSON.stringify(state.flashcards));
    } else if (!isTrackSource) {
      // Clear any stale track flashcard set when entering from course
      localStorage.removeItem("flashcardTrackId");
      localStorage.removeItem("flashcardSet");
    }
  }, [courseId, trackId]);

  const handleStudyModeSelect = (mode) => {
    switch (mode) {
      case 'classic': navigate('/flashcards/classic', { state }); break;
      case 'timed':   navigate('/flashcards/timed',   { state }); break;
      case 'ai':      navigate('/flashcards/ai',      { state }); break;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 w-full">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">{pageTitle}</h1>
          {subLabel && <p className="text-sm text-gray-500 mb-1">{subLabel}</p>}
          <p className="text-gray-600">Choose your study mode</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            onClick={() => handleStudyModeSelect('classic')}
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer border border-gray-200 hover:border-blue-300"
          >
            <div className="text-center">
              <div className="p-3 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <RotateCcw className="text-blue-600" size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Classic Flash Cards</h3>
              <p className="text-gray-600">Flip cards to study at your own pace</p>
            </div>
          </div>

          <div
            onClick={() => handleStudyModeSelect('timed')}
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer border border-gray-200 hover:border-orange-300"
          >
            <div className="text-center">
              <div className="p-3 bg-orange-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Clock className="text-orange-600" size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Timed Challenge</h3>
              <p className="text-gray-600">Test your knowledge against the clock</p>
            </div>
          </div>

          <div
            onClick={() => handleStudyModeSelect('ai')}
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer border border-gray-200 hover:border-purple-300"
          >
            <div className="text-center">
              <div className="p-3 bg-purple-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Brain className="text-purple-600" size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">AI-Powered</h3>
              <p className="text-gray-600">Smart, adaptive learning</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

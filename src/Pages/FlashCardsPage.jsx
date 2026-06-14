import React from 'react';
import { 
  ArrowLeft, 
  Brain, 
  Clock,
  Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // Assuming you're using React Router

export default function FlashcardsPage() {
  const navigate = useNavigate();

  // Mock course data
  const courseData = {
    title: "Study Flashcards",
    description: "Choose your study mode"
  };

  const handleNavigateBack = () => {
    navigate(-1); // Go back to previous page
    // OR navigate to specific route: navigate('/dashboard');
  };

  const handleStudyModeSelect = (mode) => {
    switch(mode) {
      case 'classic':
        navigate('/flashcards/classic');
        break;
      case 'timed':
        navigate('/flashcards/timed');
        break;
      case 'ai':
        navigate('/flashcards/ai');
        break;
      default:
        console.log('Unknown study mode');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 w-full">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <button
            onClick={handleNavigateBack}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {courseData.title}
          </h1>
          <p className="text-gray-600">{courseData.description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Classic Flashcards */}
          <div 
            onClick={() => handleStudyModeSelect('classic')}
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer border border-gray-200 hover:border-blue-300"
          >
            <div className="text-center">
              <div className="p-3 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Zap className="text-blue-600" size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Classic Flashcards</h3>
              <p className="text-gray-600">Flip cards to study at your own pace</p>
            </div>
          </div>

          {/* Timed Challenge */}
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

          {/* AI-Powered Study */}
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
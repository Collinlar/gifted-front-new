import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Brain,
  CheckCircle,
  XCircle,
  Target
} from 'lucide-react';

function AIPoweredStudy() {
  const navigate = useNavigate();
  const [currentCard, setCurrentCard] = useState(0);
  const [difficulty, setDifficulty] = useState('medium');
  const [studyMode, setStudyMode] = useState('adaptive');
  const [userProgress, setUserProgress] = useState({
    easy: 0,
    medium: 0,
    hard: 0
  });

  // Mock AI-generated content
  const aiFlashcards = [
    {
      id: 1,
      question: "Based on your previous answers, explain the relationship between photosynthesis and cellular respiration.",
      answer: "Photosynthesis and cellular respiration are complementary processes. Photosynthesis converts CO₂ and H₂O into glucose and O₂ using light energy, while cellular respiration breaks down glucose using O₂ to produce CO₂, H₂O, and ATP energy.",
      difficulty: 'hard',
      aiInsight: "This builds on your understanding of basic biology processes."
    },
    {
      id: 2,
      question: "What is the derivative of x²?",
      answer: "The derivative of x² is 2x, using the power rule where d/dx(xⁿ) = n·xⁿ⁻¹",
      difficulty: 'medium',
      aiInsight: "Perfect level for your current calculus understanding."
    },
    {
      id: 3,
      question: "Analyze the significance of the French Revolution in European history.",
      answer: "The French Revolution (1789-1799) fundamentally transformed European society by challenging absolute monarchy, promoting democratic ideals, and inspiring nationalist movements across the continent.",
      difficulty: 'hard',
      aiInsight: "This connects to your interest in European history."
    }
  ];

  const handleDifficultyChange = (newDifficulty) => {
    setDifficulty(newDifficulty);
    // AI would adjust content based on difficulty
  };

  const handleConfidenceRating = (rating) => {
    // AI would use this to adapt future content
    setUserProgress(prev => ({
      ...prev,
      [difficulty]: prev[difficulty] + rating
    }));
    
    if (currentCard < aiFlashcards.length - 1) {
      setCurrentCard(currentCard + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 w-full">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => navigate('/flashcards')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft size={20} />
            Back to Study Modes
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI-Powered Study</h1>
          <p className="text-gray-600">Personalized learning that adapts to you</p>
        </div>

        {/* AI Controls */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">AI Study Settings</h3>
            <Brain className="text-purple-600" size={24} />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => handleDifficultyChange(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Study Mode</label>
              <select
                value={studyMode}
                onChange={(e) => setStudyMode(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="adaptive">Adaptive</option>
                <option value="review">Review Weak Areas</option>
                <option value="challenge">Challenge Mode</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Progress</label>
              <div className="text-sm text-gray-600">
                Easy: {userProgress.easy} | Medium: {userProgress.medium} | Hard: {userProgress.hard}
              </div>
            </div>
          </div>
        </div>

        {/* AI Flashcard */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">AI-Generated Question</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                aiFlashcards[currentCard].difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                aiFlashcards[currentCard].difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {aiFlashcards[currentCard].difficulty.toUpperCase()}
              </span>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg mb-4">
              <p className="text-sm text-purple-700">
                <strong>AI Insight:</strong> {aiFlashcards[currentCard].aiInsight}
              </p>
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {aiFlashcards[currentCard].question}
            </h2>
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <p className="text-gray-700">{aiFlashcards[currentCard].answer}</p>
            </div>
          </div>
        </div>

        {/* Confidence Rating */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">How confident are you with this answer?</h3>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => handleConfidenceRating(1)}
              className="flex items-center gap-2 px-6 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
            >
              <XCircle size={20} />
              Not Confident
            </button>
            <button
              onClick={() => handleConfidenceRating(2)}
              className="flex items-center gap-2 px-6 py-3 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
            >
              <Target size={20} />
              Somewhat Confident
            </button>
            <button
              onClick={() => handleConfidenceRating(3)}
              className="flex items-center gap-2 px-6 py-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
            >
              <CheckCircle size={20} />
              Very Confident
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AIPoweredStudy;
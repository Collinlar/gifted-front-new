import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AnnouncementModal() {
  const [isVisible, setIsVisible] = useState(true);
  const navigate = useNavigate();

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-lg border border-blue-100 p-8 max-w-lg w-full relative text-center">

        {/* Close button */}
        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-3 right-4 text-gray-500 hover:text-red-500 text-xl font-bold"
        >
          ×
        </button>

        {/* Message */}
        <h2 className="text-2xl font-bold text-blue-900 mb-4">Announcement</h2>
        <p className="text-blue-800 text-lg mb-6">
          The GH STEM Olympiad is now open. Click the button below to take the test now.
        </p>

        {/* Action Button */}
        <button
          onClick={() => {
            setIsVisible(false);
            navigate("/featured-quizzes"); // Replace with your actual route
          }}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold text-sm shadow-md transition-all duration-300"
        >
          Take Test Now
        </button>
      </div>
    </div>
  );
}

import { getTokenUserId } from "../lib/auth";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchCourseReview } from "../lib/api";
import { jwtDecode } from "jwt-decode";

export default function ReviewCourse() {
  const userId = getTokenUserId();
  const locator = useLocation();
  const courseId = locator.state.courseId;
  const title = locator.state.title;
  const category = locator.state.category;
  const level = locator.state.level;
  const courseProgress = locator.state.progress;
  const trackSlug = locator.state?.trackSlug;
  const trackName = locator.state?.trackName;

  const navigate = useNavigate();
  const [courseReview, setCourseReview] = useState([]);

  useEffect(() => {
    const fetchCourseReviews = async () => {
      try {
        const response = await fetchCourseReview(userId, courseId);
        setCourseReview(response.data.courseReview[0].review);
        console.log(courseReview)
      } catch (error) {
        console.error("Error fetching course review:", error);
      }
    };
    fetchCourseReviews();
  }, [userId, courseId,courseReview]);

  const completedModules = courseReview.filter(item => item.status).length;
  const progress = courseReview.length > 0
    ? Math.round((completedModules / courseReview.length) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 w-full flex flex-col items-center py-10 px-6 overflow-auto">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg border border-blue-100 p-8 text-center">
        <h1 className="text-3xl font-bold text-blue-900 mb-2">
          {progress === 100 ? "Course Completed" : "Course Progress"}
        </h1>
        <h1>{title}</h1>
        <h1>{category}</h1>
        <h1>{level}</h1>
        <h1>{courseProgress}</h1>

        <p className="text-lg font-semibold text-green-700 mb-4">
          Score: {progress}%
        </p>

        <div className="w-full bg-blue-50 rounded-lg p-4 mb-6">
          <div className="h-4 bg-blue-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-1000"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="mt-2 text-blue-700 font-medium text-sm sm:text-base">
            Progress: {progress}%
          </p>
        </div>

        {/* List of Modules */}
        <div className="space-y-4 text-left mb-10">
          {courseReview.map((item, index) => (
            <div
              key={index}
              className={`flex justify-between items-center p-4 border rounded-lg shadow-sm ${
                item.status ? "bg-green-50" : "bg-white"
              }`}
            >
              <div className="flex-1 mr-4">
                <div className="mb-2">
                  <h2 className="text-base font-semibold text-blue-800 truncate max-w-xs sm:max-w-sm md:max-w-md">
                    File Name:{" "}
                    <span className="font-normal text-gray-700">{item.fileName}</span>
                  </h2>
                </div>
                <a
                  href={item.file}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-sm font-medium transition-all duration-200 inline-block"
                >
                  View
                </a>
              </div>

              {/* Status Button (Unclickable) */}
              <button
                disabled
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  item.status
                    ? "bg-green-500 text-white cursor-not-allowed"
                    : "bg-gray-400 text-white cursor-not-allowed"
                }`}
              >
                {item.status ? "Completed" : "Incomplete"}
              </button>
            </div>
          ))}
        </div>

        {/* Navigation back */}
        <div className="flex gap-3 justify-center mt-4 flex-wrap">
          {trackSlug && (
            <button
              onClick={() => navigate(`/track/${trackSlug}`, { state: { tab: "courses" } })}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-full font-medium text-sm transition-all duration-200"
            >
              Back to {trackName || "Track"}
            </button>
          )}
          <button
            onClick={() => navigate("/learning-management")}
            className="px-6 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-full font-medium text-sm transition-all duration-200"
          >
            All Courses
          </button>
        </div>
      </div>

      {/* Wave SVG footer */}
      <div className="w-full overflow-hidden leading-none mt-10">
        <svg
          data-name="Layer 1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="w-full h-16 text-blue-800 fill-current"
        >
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C57.32,118.92,163.89,106.92,321.39,56.44Z"></path>
        </svg>
      </div>
    </div>
  );
}

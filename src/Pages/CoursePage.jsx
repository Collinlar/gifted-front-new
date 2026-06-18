import React, { useState, useEffect } from "react";
import { CheckCircle, Brain, Video, FileText, Link as LinkIcon } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchCourseDetails, fetchCourseProgress } from "../lib/api";
import { jwtDecode } from "jwt-decode";

export default function CourseDetailsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const courseData = location.state;
  const { title, description, duration } = courseData;
  const trackSlug = courseData?.trackSlug;
  const trackName = courseData?.trackName;

  const [course, setCourse] = useState([]);
  const [courseProgress, setCourseProgress] = useState([]);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [completedModules, setCompletedModules] = useState(0);

  useEffect(() => {
    const loadCourseDetails = async () => {
      try {
        const response = await fetchCourseDetails(courseData._id);
        setCourse(response.course);
      } catch (err) {
        console.error("Failed to fetch course:", err);
      }
    };
    loadCourseDetails();
  }, [courseData._id]);

  useEffect(() => {
    const fetchCourseProgress = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const decoded = jwtDecode(token);
        const userId = decoded.id;
        const courseId = courseData._id;

        const response = await fetchCourseProgress(userId, courseId);
        const moduleStatus = response.progress?.moduleStatus || [];

        setCourseProgress(moduleStatus);

        const completedCount = moduleStatus.filter(m => m.completed).length;
        const totalModules = course.length;

        setCompletedModules(completedCount);
        setProgressPercentage(
          totalModules > 0 ? Math.round((completedCount / totalModules) * 100) : 0
        );
      } catch (error) {
        console.error("Error fetching course progress:", error);
      }
    };

    if (course.length > 0) fetchCourseProgress();
  }, [course, courseData._id]);

  const getModuleCompletionStatus = (moduleId) => {
    const moduleProgress = courseProgress.find(m => m.moduleId === moduleId);
    return moduleProgress ? moduleProgress.completed : false;
  };

  return (
    <div className="h-[100%] bg-fixed bg-gradient-to-b overflow-auto from-blue-100 to-blue-50 w-full pb-16">
      <div className="mx-auto max-w-5xl p-6 space-y-6">

        {/* HEADER */}
        <div className="bg-white p-6 rounded-xl shadow space-y-2">
          {trackSlug ? (
            <button
              onClick={() => navigate(`/track/${trackSlug}`, { state: { tab: "courses" } })}
              className="text-sm text-blue-600 hover:underline"
            >
              &larr; Back to {trackName || "Track"}
            </button>
          ) : (
            <button
              onClick={() => navigate(-1)}
              className="text-sm text-blue-600 hover:underline"
            >
              &larr; Back
            </button>
          )}
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="text-gray-700">{description}</p>
        </div>

        {/* PROGRESS */}
        <div className="bg-white grid grid-cols-1 sm:grid-cols-3 rounded-xl shadow p-6 text-center gap-4">
          <div>
            <p className="text-3xl font-bold text-purple-600">{progressPercentage}%</p>
            <p className="text-sm text-gray-500">Complete</p>
          </div>
          <div>
            <p className="text-2xl font-semibold">{completedModules}/{course.length}</p>
            <p className="text-sm text-gray-500">Modules</p>
          </div>
          <div>
            <p className="text-2xl font-semibold">{duration}</p>
            <p className="text-sm text-gray-500">Estimated Time</p>
          </div>
          <div className="col-span-full">
            <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
              <div
                className="h-full bg-purple-700 rounded-full"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* MODULES */}
        <div className="bg-white rounded-xl shadow p-4  from-blue-100 to-blue-50">
          <h2 className="text-xl font-semibold mb-3">Learning Modules</h2>
          {course.length === 0 ? (
            <p className="text-gray-500 text-center">No modules available yet.</p>
          ) : (
            course.map((mod, idx) => {
              const isCompleted = getModuleCompletionStatus(mod._id);
              return (
                <div
                  key={idx}
                  className={`p-4 flex items-center justify-between border-b last:border-b-0 ${
                    isCompleted ? "bg-gray-50" : ""
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <CheckCircle
                      className={isCompleted ? "text-green-500" : "text-gray-300"}
                      size={24}
                    />
                    <div>
                      <h3 className="font-semibold text-lg">{mod.title}</h3>
                      <p className="text-sm text-gray-600">{mod.description}</p>
                      <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                        <span>&#8226;</span>
                        <span>{mod.duration}</span>
                        {mod.files?.length >= 1 && (
                          <FileText className="text-blue-500" size={14} />
                        )}
                        {mod.Videos?.length >= 1 && (
                          <Video className="text-red-500" size={14} />
                        )}
                        {Array.isArray(mod.additionalResources) &&
                          mod.additionalResources.length >= 1 && (
                            <LinkIcon className="text-emerald-600" size={14} />
                          )}
                      </div>
                    </div>
                  </div>
                  <div>
                    {isCompleted ? (
                      <div className="flex items-center gap-2">
                        <span className="text-green-600 font-medium text-sm">✓ Completed</span>
                        <button
                          className="border border-blue-500 text-blue-600 px-3 py-1 rounded text-sm hover:bg-blue-50"
                          onClick={() => navigate("/course-details", { state: { ...mod, trackSlug, trackName } })}
                        >
                          Reopen
                        </button>
                      </div>
                    ) : (
                      <button
                        className="border border-green-500 text-green-600 px-4 py-1 rounded hover:bg-green-50"
                        onClick={() => navigate("/course-details", { state: { ...mod, trackSlug, trackName } })}
                      >
                        Open
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* FLASHCARDS */}
        <div className="bg-white p-4 rounded-xl shadow flex items-center justify-between ">
          <div className="flex items-center gap-4">
            <Brain className="text-purple-500" size={24} />
            <div>
              <div className="flex gap-2 items-center">
                <h3 className="font-semibold text-lg">Flashcards</h3>
                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                  Interactive
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Practice and reinforce key concepts with interactive flashcards
              </p>
            </div>
          </div>
          <button
            className="border border-purple-500 text-purple-600 px-4 py-1 rounded hover:bg-purple-50"
            onClick={() => navigate("/flashcards", { state: courseData })}
          >
            Practice
          </button>
        </div>
      </div>
    </div>
  );
}

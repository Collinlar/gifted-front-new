"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle, FileText } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchCourseProgress, updateCourseProgress } from "../lib/api";
import {jwtDecode} from "jwt-decode";

export default function CourseDetailsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const courseDetails = location.state;
  
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if this module is already completed
    checkCompletionStatus();
  }, []);

  const checkCompletionStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      
      const decoded = jwtDecode(token);
      const userId = decoded.id;
      const courseId = localStorage.getItem("courseId");
      
      if (!courseId) return;

      const response = await fetchCourseProgress(userId, courseId);
      const moduleStatus = response.progress?.moduleStatus || [];
      const currentModule = moduleStatus.find(module => module.moduleId === courseDetails._id);
      setIsCompleted(currentModule ? currentModule.completed : false);
    } catch (error) {
      console.error("Error checking completion status:", error);
    }
  };

  const handleToggleCompletion = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return;
      
      const decoded = jwtDecode(token);
      const userId = decoded.id;
      const courseId = localStorage.getItem("courseId");
      
      if (!courseId) return;

      const newCompletedStatus = !isCompleted;
      console.log(userId)
      

      await updateCourseProgress(userId, {
        course_id: courseId,
        module_id: courseDetails._id,
        completed: newCompletedStatus
      });

      setIsCompleted(newCompletedStatus);
    } catch (error) {
      console.error("Error updating completion status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const convertToEmbedUrl = (url) => {
    if (url.includes("watch?v=")) {
      return url.replace("watch?v=", "embed/");
    }
    return url;
  };

  const validVideos = Array.isArray(courseDetails?.Videos)
    ? courseDetails.Videos.filter((url) => typeof url === "string" && url.trim() !== "")
    : [];

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6 bg-blue-50 min-h-screen overflow-auto w-full">
      {/* Header */}
      <div className="space-y-2">
        <button
          className="text-sm text-blue-600 hover:underline"
          onClick={() => navigate(-1)}
        >
          &larr; Back
        </button>
        <h1 className="text-3xl font-bold">{courseDetails?.title}</h1>
        <p className="text-gray-700">{courseDetails?.description}</p>
      </div>

      {/* Learning Module */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Learning Module</h2>

        <div className="bg-white p-6 rounded-xl shadow space-y-4">
          {/* Course Summary */}
          <div className="flex items-center gap-4">
            <CheckCircle 
              className={isCompleted ? "text-green-500" : "text-gray-300"} 
              size={24} 
            />
            <div>
              <div className="flex gap-2 items-center">
                <h3 className="font-semibold text-lg">{courseDetails?.title}</h3>
              </div>
              <p className="text-sm text-gray-600">{courseDetails?.description}</p>
              <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                <span>&#8226;</span>
                <span>{courseDetails?.duration}</span>
              </div>
            </div>
          </div>

          {/* Embedded Videos */}
          {validVideos.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Videos</h4>
              {validVideos.map((url, vIdx) => (
                <iframe
                  key={vIdx}
                  src={convertToEmbedUrl(url)}
                  className="w-full aspect-video rounded border"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ))}
            </div>
          )}

          {/* Additional Resources */}
          {Array.isArray(courseDetails?.additionalResources) && courseDetails.additionalResources.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Additional Resources</h4>
              <ul className="list-disc pl-5 space-y-1">
                {courseDetails.additionalResources.map((resource, rIdx) => {
                  const url = typeof resource === "string" ? resource : resource?.url;
                  const labelCandidate = typeof resource === "string" ? resource : (resource?.title || resource?.label || resource?.name || resource?.url);
                  if (!url || typeof url !== "string" || url.trim() === "") return null;
                  const label = labelCandidate && typeof labelCandidate === "string" ? labelCandidate : url;
                  return (
                    <li key={rIdx}>
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline break-all"
                      >
                        {label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Attached Files */}
          {Array.isArray(courseDetails?.files) && courseDetails.files.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Files</h4>
              <div className="space-y-4">
                {courseDetails.files.map((file, fIdx) => {
                  const isPdf = file.toLowerCase().endsWith(".pdf");
                  return (
                    <div key={fIdx} className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-blue-700">
                        <FileText size={16} />
                        <span>{file.split("/").pop()}</span>
                      </div>
                      {isPdf ? (
                       <iframe
                        src={file}
                        className="w-full min-h-screen border rounded"
                        style={{ height: "100vh" }}
                        title={`pdf-${fIdx}`}
                      />

                      ) : (
                        <a
                          href={file}
                          className="text-blue-600 hover:underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Open File
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Images */}
          {courseDetails?.image && (
            <div className="space-y-4">
              <h4 className="font-medium text-lg">Images</h4>
              <div className="w-full">
                <img
                  src={courseDetails.image}
                  alt="Module Image"
                  className="w-full max-w-full h-auto object-contain rounded-lg border shadow-lg"
                  style={{ maxHeight: '80vh' }}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="text-right space-x-3">
            {/* <button className="border border-green-500 text-green-600 px-4 py-1 rounded hover:bg-green-50">
              Review
            </button> */}
            <button
              onClick={handleToggleCompletion}
              disabled={isLoading}
              className={`px-4 py-1 rounded text-sm font-medium ${
                isCompleted
                  ? "bg-orange-500 text-white hover:bg-orange-600"
                  : "bg-green-500 text-white hover:bg-green-600"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isLoading ? "Updating..." : isCompleted ? "Mark Incomplete" : "Mark as Completed"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

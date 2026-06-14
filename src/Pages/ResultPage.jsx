import { getTokenUserId } from "../lib/auth";
import React, { useEffect, useState } from 'react';
import { getQuizDetails, fetchAllScores, getAllCoursesInfo } from '../lib/api';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const ResultPage = () => {
  const [assessments, setAssessment] = useState([]);
  const [performanceData, setPreformanceData] = useState([]);
  const [activeTab, setActiveTab] = useState("assessments");
  const [leaderboardScores, setLeaderboardScores] = useState([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [leaderboardError, setLeaderboardError] = useState("");
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [coursesError, setCoursesError] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const loadAssessmentAnalytics = async () => {
      try {
        const response = await getQuizDetails(getTokenUserId());
        if (response.success && response.quizDetails.length > 0) {
          setAssessment([...response.quizDetails]);
          setPreformanceData([...response.quizDetails]);
        }
      } catch (error) {
        console.error("Error fetching assessment analytics", error);
      }
    };
    loadAssessmentAnalytics();
  }, []);

  const getDecodedUserId = () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;
      const decoded = jwtDecode(token);
      return decoded?.id ?? null;
    } catch (e) {
      return null;
    }
  };

  const isTimedChallenge = (item) => {
    return Boolean(
      item?.type === "timedChallenge" ||
      item?.category === "timedChallenge" ||
      item?.isTimedChallenge ||
      item?.timed === true ||
      item?.isTimed === true ||
      item?.mode === "timed" ||
      item?.challengeType === "timedChallenge"
    );
  };

  const fetchLeaderboard = async () => {
    setLoadingLeaderboard(true);
    setLeaderboardError("");
    try {
      const response = await fetchAllScores();
      const allScores = Array.isArray(response?.scores) ? response.scores : [];
      setLeaderboardScores(allScores);
    } catch (error) {
      setLeaderboardError("Failed to load leaderboard. Please try again.");
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  useEffect(() => {
    if (activeTab === "leaderboard" && leaderboardScores.length === 0 && !loadingLeaderboard) {
      fetchLeaderboard();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "leaderboard" && courses.length === 0 && !loadingCourses) {
      (async () => {
        setLoadingCourses(true);
        setCoursesError("");
        try {
          const res = await getAllCoursesInfo();
          const list = Array.isArray(res?.courses) ? res.courses : [];
          setCourses(list);
        } catch (err) {
          setCoursesError("Failed to load courses. Please try again.");
        } finally {
          setLoadingCourses(false);
        }
      })();
    }
  }, [activeTab]);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };

  const currentUserId = getDecodedUserId();

  const timedChallengeItems = performanceData.filter((item) => isTimedChallenge(item));
  const regularAssessmentItems = assessments.filter((item) => !isTimedChallenge(item));

  const getScoreValue = (row) => {
    const value = Number(row?.score);
    return Number.isFinite(value) ? value : 0;
  };

  const getTimeTakenValue = (row) => {
    const value = Number(row?.timeTaken);
    return Number.isFinite(value) ? value : Number.MAX_SAFE_INTEGER;
  };

  const formatDuration = (secondsInput) => {
    const totalSeconds = Math.max(0, Math.floor(Number(secondsInput) || 0));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const mm = String(minutes).padStart(2, '0');
    const ss = String(seconds).padStart(2, '0');
    return `${mm}:${ss}`;
  };

  const sortedLeaderboard = [...leaderboardScores].sort((a, b) => {
    const scoreDiff = getScoreValue(b) - getScoreValue(a);
    if (scoreDiff !== 0) return scoreDiff;
    return getTimeTakenValue(a) - getTimeTakenValue(b);
  });

  const filteredLeaderboard = selectedCourseId
    ? sortedLeaderboard.filter((row) => String(row?.courseId) === String(selectedCourseId))
    : sortedLeaderboard;

  const currentUserIndex = filteredLeaderboard.findIndex((row) => row?.userId === currentUserId);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6 w-full"
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 60 }}
        className="w-full max-w-4xl bg-white rounded-xl shadow-lg p-8"
      >
        <div className="mb-6 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold text-[#003366]">
              {activeTab === 'assessments' && 'Assessment Results'}
              {activeTab === 'timedChallenge' && 'Timed Challenge Scores'}
              {activeTab === 'leaderboard' && 'Leaderboard'}
            </h2>
            <button
              onClick={() => navigate("/overview")}
              className="px-4 py-2 bg-[#003366] text-white text-sm font-medium rounded-lg hover:bg-[#002244] transition"
            >
              Back to Dashboard
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('assessments')}
              className={`px-3 py-2 rounded-md text-sm font-medium border ${activeTab === 'assessments' ? 'bg-[#003366] text-white border-[#003366]' : 'bg-white text-[#003366] border-gray-300'}`}
            >
              Assessments
            </button>
            <button
              onClick={() => setActiveTab('timedChallenge')}
              className={`px-3 py-2 rounded-md text-sm font-medium border ${activeTab === 'timedChallenge' ? 'bg-[#003366] text-white border-[#003366]' : 'bg-white text-[#003366] border-gray-300'}`}
            >
              Timed Challenge
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`px-3 py-2 rounded-md text-sm font-medium border ${activeTab === 'leaderboard' ? 'bg-[#003366] text-white border-[#003366]' : 'bg-white text-[#003366] border-gray-300'}`}
            >
              Leaderboard
            </button>
          </div>
        </div>

        {activeTab === 'assessments' && (
          <>
            {regularAssessmentItems.length > 0 ? (
              <div className="grid gap-6">
                {regularAssessmentItems.map((assessment, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="border border-gray-200 rounded-lg p-6 bg-gray-50 hover:bg-white hover:shadow transition duration-300"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center">
                        <div
                          className={`p-2 rounded-full mr-3 ${
                            assessment.completed
                              ? "bg-green-100 text-green-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          <CheckCircle className="w-5 h-5" />
                        </div>
                        <h3 className="text-xl font-semibold text-[#003366]">
                          {assessment.title}
                        </h3>
                      </div>
                      <span className="text-sm text-gray-500">
                        {formatDate(assessment.date)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center mt-2">
                      <div className="text-sm text-gray-600">
                        Score: <span className="font-semibold text-[#003366]">{assessment.score}%</span> • Questions: {assessment.totalQuestions}
                      </div>
                      <button
                        onClick={() =>
                          navigate("/review-assessment", {
                            state: { quizId: assessment.quizId },
                          })
                        }
                        className="px-4 py-2 rounded-lg text-sm font-medium bg-[#003366] text-white hover:bg-[#002244] transition"
                      >
                        View Results
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-gray-500 py-12">
                <p className="text-lg">No course records available yet.</p>
                <p className="text-sm mt-2">When you complete assessments, your results will appear here.</p>
              </motion.div>
            )}
          </>
        )}

        {activeTab === 'timedChallenge' && (
          <>
            {timedChallengeItems.length > 0 ? (
              <div className="grid gap-6">
                {timedChallengeItems.map((assessment, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="border border-gray-200 rounded-lg p-6 bg-gray-50 hover:bg-white hover:shadow transition duration-300"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center">
                        <div className="p-2 rounded-full mr-3 bg-purple-100 text-purple-700">
                          <CheckCircle className="w-5 h-5" />
                        </div>
                        <h3 className="text-xl font-semibold text-[#003366]">
                          {assessment.title}
                        </h3>
                      </div>
                      <span className="text-sm text-gray-500">
                        {formatDate(assessment.date)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center mt-2">
                      <div className="text-sm text-gray-600">
                        Score: <span className="font-semibold text-[#003366]">{assessment.score}%</span> • Questions: {assessment.totalQuestions}
                      </div>
                      <button
                        onClick={() =>
                          navigate("/review-assessment", {
                            state: { quizId: assessment.quizId },
                          })
                        }
                        className="px-4 py-2 rounded-lg text-sm font-medium bg-[#003366] text-white hover:bg-[#002244] transition"
                      >
                        View Results
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-gray-500 py-12">
                <p className="text-lg">No timed challenge records available yet.</p>
                <p className="text-sm mt-2">Start a timed challenge to see your scores here.</p>
              </motion.div>
            )}
          </>
        )}

        {activeTab === 'leaderboard' && (
          <div className="mt-2">
            {leaderboardError && (
              <div className="mb-4 text-sm text-red-600">{leaderboardError}</div>
            )}
            {loadingLeaderboard ? (
              <div className="text-center text-gray-500 py-8">Loading leaderboard...</div>
            ) : (
              <>
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-sm text-gray-600">
                    {typeof currentUserIndex === 'number' && currentUserIndex >= 0 && (
                      <span className="inline-block font-medium bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 text-[#003366] px-3 py-2 rounded-md">
                        Your position: <span className="font-semibold">{currentUserIndex + 1}</span> / {filteredLeaderboard.length}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-700">Course:</label>
                    <select
                      value={selectedCourseId}
                      onChange={(e) => setSelectedCourseId(e.target.value)}
                      className="text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    >
                      <option value="">All courses</option>
                      {loadingCourses && <option>Loading...</option>}
                      {!loadingCourses && courses.map((c) => (
                        <option key={c?._id} value={c?._id}>
                          {c?.title || c?.name || c?._id}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {coursesError && (
                  <div className="mb-3 text-xs text-red-600">{coursesError}</div>
                )}
                {filteredLeaderboard.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-white uppercase tracking-wider">Rank</th>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-white uppercase tracking-wider">User</th>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-white uppercase tracking-wider">Score</th>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-white uppercase tracking-wider">Time</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredLeaderboard.map((row, index) => {
                          const isCurrentUser = currentUserId && row?.userId === currentUserId;
                          const scoreVal = row.score;
                          const timeVal = getTimeTakenValue(row);
                          const rank = index + 1;
                          const rankBadgeClass =
                            rank === 1
                              ? 'bg-[#FFD700] text-[#5C4500]'
                              : rank === 2
                              ? 'bg-[#C0C0C0] text-[#3A3A3A]'
                              : rank === 3
                              ? 'bg-[#CD7F32] text-white'
                              : 'bg-blue-100 text-[#003366]';
                          return (
                            <tr
                              key={index}
                              className={`${isCurrentUser ? 'ring-2 ring-[#003366] ring-inset' : ''} odd:bg-white even:bg-gray-50 hover:bg-indigo-50 transition-colors`}
                            >
                              <td className="px-4 py-3 whitespace-nowrap text-sm">
                                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${rankBadgeClass}`}>
                                  {rank}
                                </span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-800">
                                {row?.userName || 'Anonymous'}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm w-64">
                                <div className="flex items-center gap-3">
                                  <div className="flex-1 h-2.5 rounded-full bg-gray-200 overflow-hidden">
                                    <div
                                      className="h-full rounded-full bg-gradient-to-r from-green-400 via-emerald-500 to-blue-500"
                                      style={{ width: `${scoreVal}%` }}
                                    />
                                  </div>
                                  <span className="min-w-[2.5rem] text-right font-semibold text-[#003366]">{scoreVal}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm">
                                <span className="inline-block px-2.5 py-1 rounded-full bg-pink-100 text-pink-700 font-medium">
                                  {formatDuration(timeVal)}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">No leaderboard data available.</div>
                )}
              </>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default ResultPage;

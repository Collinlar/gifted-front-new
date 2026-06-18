import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { verifyRegistration as verifyReg, getUserDetails, registerProgram, registerForCompetition } from "../lib/api";
import { jwtDecode } from "jwt-decode";
import { getTokenUserId } from "../lib/auth";
import toast, { Toaster } from "react-hot-toast";

// axios.defaults.timeout = 10000; // Prevent infinite hanging requests

const Invoice = () => {
  const navigate = useNavigate();
  const subItem = JSON.parse(localStorage.getItem("state"));
  const [payNow, setPayNow] = useState(false);
  const [cost, setCost] = useState(subItem.assessmentCost + subItem.materialCost);
  const [assessment, setAssessment] = useState(false);
  const [course, setCourse] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [grade, setGrade] = useState("");
  const [gradee, setGradee] = useState("");
  const [action, setAction] = useState("");
  const [ErrorMessage, setErrorMessage] = useState("");
  const [registered, setRegistered] = useState(false);
  const [choice, setChoice] = useState({});
  const [showButton, setShowButton] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registerDetails, setRegisterDetails] = useState({});

  const competitionCourses = subItem.courses
  const competitionAssessment = subItem.Assessment

  const token = localStorage.getItem("token");
  const decodedToken = token ? jwtDecode(token) : {};

  const handleAssessmentCheck = (e) => {
    const { checked } = e.target;
    setAssessment(checked);
    const delta = checked ? subItem.assessmentCost : -subItem.assessmentCost;
    setCost((prevCost) => prevCost + delta);
  };

  const handleCourseCheck = (e) => {
    const { checked } = e.target;
    setCourse(checked);
    const delta = checked ? subItem.materialCost : -subItem.materialCost;
    setCost((prevCost) => prevCost + delta);
  };

  useEffect(() => {
    const verifyRegistration = async () => {
      try {
        const response = await verifyReg(decodedToken.id, subItem.name);
        if (response.success) {
          setRegistered(response.registered);
          setRegisterDetails(response.registration);
          if (response.registered) {
            setGradee(response.registration.grade);
          }
        }
      } catch (err) {
        console.error("Error verifying registration:", err);
      }
    };
    verifyRegistration();
  }, []);

  useEffect(() => {
    const loadUserDetails = async () => {
      try {
        const response = await getUserDetails(decodedToken?.id);
        if (response.success && registered) {
          const found = response.user.Paid?.find(
            (item) => item.name === `${subItem.name}-${subItem.year}`
          );
          if (found) setChoice(found.choice);
        }
      } catch (error) {
        console.error("Failed to load user details", error);
      }
    };
    loadUserDetails();
  }, [registered]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const payload = {
        userId: decodedToken.id,
        program: subItem.name,
        year: subItem.year,
        grade: grade,
        cost,
        assessment,
        course,
        status: paymentMethod === "payNow" ? "paid" : "pending",
      };

      // let response;
      
      const response = await registerProgram(payload);

      if (response.success) {
        toast.success("Registration successful.");
        setShowButton(true);
        // Sync to the new program_registrations table so TrackDetail
        // recognises this user as registered for the same competition
        const supabaseUserId = getTokenUserId()
        if (supabaseUserId) {
          registerForCompetition(supabaseUserId, {
            competitionId: subItem.id || subItem._id || null,
            name: subItem.name,
            year: subItem.year,
            grade: grade,
          }).catch(() => {}) // non-blocking — old flow still succeeded
        }
      } else {
        toast.error(response.data.message || "Registration failed.");
        setErrorMessage(response.data.message || "Something went wrong.");
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Something went wrong. Please try again.");
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 w-full flex items-center justify-center pt-20 pb-10 px-6">
      <Toaster position="top-center" />
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg border border-blue-100 p-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-blue-900">{`${subItem.name}-${subItem.year}`}</h1>
          {registered && <h1 className="text-2xl font-bold text-blue-900">{`Grade ${gradee}`}</h1>}
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-full font-medium transition"
          >
            Go Back
          </button>
        </div>

    

        <div className="flex justify-center gap-4 mb-6">
          <button
            type="button"
            disabled={!registerDetails?.course}
            onClick={() =>
              navigate("/learning", {
                state: { name: subItem.name, grade: gradee, year: subItem.year, course:competitionCourses },
              })
            }
            className={`px-4 py-2 rounded-full font-medium transition ${
              registered && registerDetails?.course
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Learning
          </button>

          <button
            type="button"
            disabled={!registerDetails?.assessment}
            onClick={() =>
              navigate("/assessment", {
                state: { name: subItem.name, grade: gradee, year: subItem.year, assessment:competitionAssessment },
              })
            }
            className={`px-4 py-2 rounded-full font-medium transition ${
              registered && registerDetails.assessment
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Assessment
          </button>

          <button
            type="button"
            disabled={!registered}
            onClick={() =>
              navigate("/channels", {
                state: { name: subItem.name, grade: gradee, year: subItem.year },
              })
            }
            className={`px-4 py-2 rounded-full font-medium transition ${
              registered
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Channels
          </button>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <h2 className="text-xl font-semibold text-blue-800 text-center">
            {!registered
              ? `Register for ${subItem.name}`
              : `User registered for ${subItem.name} Grade: ${gradee}`}
          </h2>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <p className="font-semibold text-blue-700">
              Start Date: <span className="font-normal">{subItem.startDate}</span>
            </p>
            <p className="font-semibold text-blue-700 mt-1">
              End Date: <span className="font-normal">{subItem.EndDate}</span>
            </p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <h3 className="font-semibold text-blue-700 mb-1">Program Details:</h3>
            <p className="text-blue-800 text-sm">{subItem.Description}</p>
          </div>

          {!registered && (
            <>
              <div>
                <label className="block mb-1 font-semibold text-blue-800">Select Grade</label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  required
                  className="w-full p-2 border border-blue-300 rounded-lg"
                >
                  <option value="">Choose Grade</option>
                  {[...Array(12)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </div>

              {subItem.materialCost !== 0 && (
                <div className="flex items-center justify-between mt-2">
                  <label className="text-blue-700">{`Course: ₵${subItem.materialCost}`}</label>
                  <input
                    type="checkbox"
                    className="w-5 h-5 accent-blue-600"
                    onChange={handleCourseCheck}
                  />
                </div>
              )}

              {subItem.assessmentCost !== 0 && (
                <div className="flex items-center justify-between mt-2">
                  <label className="text-blue-700">{`Assessment: ₵${subItem.assessmentCost}`}</label>
                  <input
                    type="checkbox"
                    className="w-5 h-5 accent-blue-600"
                    onChange={handleAssessmentCheck}
                  />
                </div>
              )}

              <p className="text-center font-semibold text-lg text-blue-900 mt-4">
                Total Cost: ₵{cost}
              </p>

              <div className="flex justify-center gap-4 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod("payNow");
                    setAction("Click to Pay Now");
                  }}
                  className={`px-4 py-2 rounded-full font-medium transition ${
                    paymentMethod === "payNow"
                      ? "bg-blue-600 text-white"
                      : "bg-white border border-blue-500 text-blue-600"
                  }`}
                >
                  Click to Pay Now and Register
                </button>
              </div>
            </>
          )}

          {ErrorMessage && <p className="text-center text-red-600 font-medium">{ErrorMessage}</p>}

          {paymentMethod && (
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 rounded-full font-semibold transition ${
                isSubmitting
                  ? "bg-blue-400 cursor-not-allowed text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="4" fill="none" />
                  </svg>
                  Submitting...
                </span>
              ) : (
                `${action}`
              )}
            </button>
          )}
        </form>

          {(registered && subItem.link?.trim()) || (showButton && subItem.link?.trim()) ? (
          <div className="flex justify-center mb-6 mt-6">
            <button
              type="button"
              onClick={() => window.open(subItem.link, "_blank")}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-full transition"
            >
              {`${subItem.customizableButton}`}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Invoice;

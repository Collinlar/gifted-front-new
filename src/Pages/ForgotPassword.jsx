import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { sendPasswordResetLink } from "../lib/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await sendPasswordResetLink({ email });
      setStatusMessage(res.message || "Password reset link sent!");
    } catch (err) {
      setStatusMessage(err.message || "Something went wrong.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 w-full flex flex-col items-center py-10 px-6">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-blue-100 p-8 text-center">

        {/* Back Button */}
        <div className="flex justify-start mb-4">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-blue-800 rounded-full font-semibold text-sm transition-all duration-300"
          >
            ← Back
          </button>
        </div>

        <h1 className="text-3xl font-bold text-blue-900 mb-4">
          Forgot Password
        </h1>
        <p className="text-lg text-blue-700 mb-6">
          Enter your email to receive a reset link
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <label className="block">
            <span className="text-blue-800 font-medium">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="you@example.com"
            />
          </label>
          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold text-sm shadow-md transition-all duration-300"
          >
            Send Reset Link
          </button>
        </form>

        {statusMessage && (
          <p className="mt-4 text-blue-700 font-medium">{statusMessage}</p>
        )}
      </div>

      {/* Footer Wave */}
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

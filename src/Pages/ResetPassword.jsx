import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "../lib/supabase";

const brandColors = {
  primary: "#003366",
  background: "#F0F4F8",
}

export default function ResetPasswordPage() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [sessionError, setSessionError] = useState(false);

  // Supabase embeds the recovery token in the URL hash when the user
  // clicks the reset link. We exchange it for a live session here.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === "PASSWORD_RECOVERY") {
          setSessionReady(true);
        }
      }
    );

    // Also handle if already on the page with a hash token
    const hash = window.location.hash;
    if (hash && hash.includes("type=recovery")) {
      setSessionReady(true);
    } else {
      // Give Supabase a moment to detect the hash
      setTimeout(() => {
        if (!sessionReady) setSessionError(true);
      }, 3000);
    }

    return () => subscription.unsubscribe();
  }, []);

  const getStrength = (pwd) => {
    if (pwd.length === 0) return null;
    if (pwd.length < 6) return "weak";
    if (pwd.length < 10 || !/[0-9]/.test(pwd)) return "fair";
    if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd) && /[^A-Za-z0-9]/.test(pwd)) return "strong";
    return "good";
  };

  const strengthConfig = {
    weak:   { label: "Too short", color: "#EF4444", width: "25%" },
    fair:   { label: "Fair",      color: "#F59E0B", width: "50%" },
    good:   { label: "Good",      color: "#3B82F6", width: "75%" },
    strong: { label: "Strong",    color: "#10B981", width: "100%" },
  };

  const strength = getStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setIsLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError("We could not update your password. The link may have expired — request a new one.");
      setIsLoading(false);
      return;
    }

    setDone(true);
    setIsLoading(false);

    setTimeout(() => navigate("/login"), 3000);
  };

  // ── Session not found after timeout ──
  if (sessionError && !sessionReady) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ backgroundColor: brandColors.background }}
      >
        <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-8 text-center">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ backgroundColor: "#FEF2F2" }}
          >
            <AlertCircle size={26} style={{ color: "#DC2626" }} />
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: brandColors.primary }}>
            Link expired or invalid
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            This password reset link has expired or was already used. Request a new one and try again.
          </p>
          <button
            onClick={() => navigate("/claim-account")}
            className="w-full py-3 rounded-lg text-white text-sm font-medium"
            style={{ backgroundColor: brandColors.primary }}
          >
            Get a new link
          </button>
          <button
            onClick={() => navigate("/login")}
            className="w-full mt-3 py-2 text-sm text-gray-400 hover:text-gray-600"
          >
            Back to sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: brandColors.background }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-xl shadow-xl w-full max-w-md p-8"
      >
        <AnimatePresence mode="wait">

          {/* ── Done state ── */}
          {done && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4"
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
                style={{ backgroundColor: "#DCFCE7" }}
              >
                <CheckCircle size={32} style={{ color: "#16A34A" }} />
              </div>
              <h2 className="text-xl font-bold mb-2" style={{ color: brandColors.primary }}>
                Password updated
              </h2>
              <p className="text-sm text-gray-500">
                Your new password is set. Taking you to sign in...
              </p>
            </motion.div>
          )}

          {/* ── Form state ── */}
          {!done && (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="mb-7">
                <h1 className="text-2xl font-bold mb-1" style={{ color: brandColors.primary }}>
                  Choose a new password
                </h1>
                <p className="text-sm text-gray-500">
                  Pick something you'll remember. At least 6 characters.
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                {/* Password field */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New password
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-3.5 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(""); }}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-10 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {/* Strength bar */}
                  {strength && (
                    <div className="mt-2">
                      <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: strengthConfig[strength].color }}
                          initial={{ width: 0 }}
                          animate={{ width: strengthConfig[strength].width }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                      <p className="text-xs mt-1" style={{ color: strengthConfig[strength].color }}>
                        {strengthConfig[strength].label}
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm field */}
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm password
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-3.5 text-gray-400" />
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={confirm}
                      onChange={(e) => { setConfirm(e.target.value); setError(""); }}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-10 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {confirm && password && confirm === password && (
                    <div className="flex items-center gap-1 mt-1.5 text-xs" style={{ color: "#16A34A" }}>
                      <CheckCircle size={12} />
                      Passwords match
                    </div>
                  )}
                </div>

                {error && (
                  <div className="flex items-center gap-1.5 mb-4 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                    <AlertCircle size={14} />
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || !password || !confirm}
                  className="w-full py-3 rounded-lg text-white text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: brandColors.primary }}
                >
                  {isLoading ? "Updating password..." : "Set new password"}
                </button>
              </form>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>
    </div>
  );
}

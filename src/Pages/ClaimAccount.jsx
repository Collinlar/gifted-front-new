import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  Phone, Mail, Lock, Eye, EyeOff,
  CheckCircle, AlertCircle, ArrowLeft, User, ShieldCheck
} from "lucide-react"
import { supabase } from "../lib/supabase"
import { supabaseAdmin } from "../lib/supabaseAdmin"
import { syncUserTracksFromInterests } from "../lib/auth"

const brandColors = {
  primary: "#003366",
  background: "#F0F4F8",
}

const STEPS = {
  PHONE: "phone",
  CONFIRM: "confirm",
  CREDENTIALS: "credentials",
  DONE: "done",
}

// Normalise phone to try multiple formats stored in DB
function phoneVariants(raw) {
  const digits = raw.replace(/\D/g, "")
  const variants = new Set()
  variants.add(raw.trim())
  variants.add(digits)
  // Ghana: 0XXXXXXXXX ↔ 233XXXXXXXXX ↔ +233XXXXXXXXX
  if (digits.startsWith("233")) {
    variants.add("0" + digits.slice(3))
    variants.add("+" + digits)
  } else if (digits.startsWith("0")) {
    variants.add("233" + digits.slice(1))
    variants.add("+233" + digits.slice(1))
  } else if (digits.length === 9) {
    variants.add("0" + digits)
    variants.add("233" + digits)
    variants.add("+233" + digits)
  }
  return [...variants]
}

function maskName(name) {
  if (!name) return "—"
  const parts = name.trim().split(" ")
  return parts.map((p, i) =>
    i === 0 ? p : p[0] + "*".repeat(Math.max(p.length - 1, 1))
  ).join(" ")
}

function getInitial(user) {
  return (user.first_name || user.firstName || user.name || "?")[0].toUpperCase()
}

function displayName(user) {
  const first = user.first_name || user.firstName || ""
  const last = user.last_name || user.lastName || ""
  return maskName((first + " " + last).trim() || user.name || user.username || "Unknown")
}

function displayCategory(user) {
  return user.category || user.role || user.type || null
}

function displayPhone(phone) {
  if (!phone) return null
  const d = phone.replace(/\D/g, "")
  return d.slice(0, 3) + " *** " + d.slice(-3)
}

function formatJoined(user) {
  const d = user.created_at || user.createdAt
  if (!d) return null
  return new Date(d).toLocaleDateString("en-GH", { month: "long", year: "numeric" })
}

export default function ClaimAccount() {
  const navigate = useNavigate()
  const location = useLocation()
  const prefilledEmail = location.state?.email || ""

  const [step, setStep] = useState(prefilledEmail ? STEPS.CREDENTIALS : STEPS.PHONE)
  const [phone, setPhone] = useState("")
  const [foundUser, setFoundUser] = useState(null)
  const [email, setEmail] = useState(prefilledEmail)
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  // ── Step 1: Look up by phone ──
  const handlePhoneLookup = async (e) => {
    e.preventDefault()
    setError("")

    if (!phone || phone.replace(/\D/g, "").length < 9) {
      setError("Enter a valid phone number.")
      return
    }

    setIsLoading(true)

    const variants = phoneVariants(phone)

    let found = null
    for (const variant of variants) {
      // Use admin client — anon key is blocked by RLS on the users table
      const { data } = await supabaseAdmin
        .from("users")
        .select("*")
        .eq("mobile_number", variant)
        .maybeSingle()

      if (data) { found = data; break }
    }

    if (!found) {
      setError("We could not find an account with that phone number. Try a different number or contact support.")
      setIsLoading(false)
      return
    }

    if (found.claimed === true) {
      setError("This account has already been claimed. Sign in normally, or use Forgot Password if needed.")
      setIsLoading(false)
      return
    }

    setFoundUser(found)
    setStep(STEPS.CONFIRM)
    setIsLoading(false)
  }

  // ── Step 2: Confirm → move to credentials ──
  const handleConfirm = () => {
    setStep(STEPS.CREDENTIALS)
  }

  const handleDenyConfirm = () => {
    setFoundUser(null)
    setPhone("")
    setStep(STEPS.PHONE)
    setError("")
  }

  // ── Step 3: Create Supabase Auth account ──
  const handleCreateAccount = async (e) => {
    e.preventDefault()
    setError("")

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError("Enter a valid email address.")
      return
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.")
      return
    }

    setIsLoading(true)

    try {
      console.log("Step 1: creating auth user for", email)

      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      })

      console.log("Auth result:", { authData, authError })

      if (authError || !authData?.user) {
        const msg = authError?.message || "Unknown auth error"
        console.error("Auth error:", msg)
        // If email already exists in auth (previous partial attempt), surface clearly
        if (msg.toLowerCase().includes("already")) {
          setError("That email is already registered. Try signing in directly, or use a different email.")
        } else {
          setError(`Could not create your account: ${msg}`)
        }
        setIsLoading(false)
        return
      }

      const newAuthId = authData.user.id
      console.log("Step 2: inserting users row with id", newAuthId)

      // Strip columns with unique constraints and old-identity-only fields
      const {
        id: oldId,
        mongo_id,
        password: _oldPassword,
        claimed,
        claimed_by,
        ...userData
      } = foundUser

      // Save the old UUID — competitions/programs still have it in their `registered` arrays
      localStorage.setItem("legacy_user_id", oldId)

      const { error: insertError } = await supabaseAdmin.from("users").insert({
        ...userData,
        id: newAuthId,
        email,
      })

      console.log("Insert result:", insertError)

      if (insertError) {
        console.error("Insert error:", insertError)
        await supabaseAdmin.auth.admin.deleteUser(newAuthId)
        setError(`Could not link your account: ${insertError.message}`)
        setIsLoading(false)
        return
      }

      console.log("Step 3: marking old row as claimed")
      await supabaseAdmin
        .from("users")
        .update({ claimed: true, claimed_by: newAuthId })
        .eq("id", oldId)

      // Carry the old interest selections over into the new track system
      await syncUserTracksFromInterests(newAuthId, userData.purpose_of_registration)

      setStep(STEPS.DONE)
    } catch (err) {
      console.error("Unexpected error:", err)
      setError("Something unexpected went wrong. Check the console and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // ─────────────────────────────────────────────────────
  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit:    { opacity: 0, x: -20 },
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
        className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden"
      >
        {/* Progress bar */}
        {step !== STEPS.DONE && (
          <div className="h-1 bg-gray-100">
            <motion.div
              className="h-full"
              style={{ backgroundColor: brandColors.primary }}
              animate={{
                width:
                  step === STEPS.PHONE ? "33%" :
                  step === STEPS.CONFIRM ? "66%" :
                  "100%",
              }}
              transition={{ duration: 0.4 }}
            />
          </div>
        )}

        <div className="p-8">
          <AnimatePresence mode="wait">

            {/* ── PHONE ── */}
            {step === STEPS.PHONE && (
              <motion.div key="phone" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.25 }}>
                <button
                  onClick={() => navigate("/login")}
                  className="flex items-center gap-1 text-sm mb-6 hover:opacity-70"
                  style={{ color: brandColors.primary }}
                >
                  <ArrowLeft size={15} /> Back to sign in
                </button>

                <div className="mb-7">
                  <h1 className="text-2xl font-bold mb-2" style={{ color: brandColors.primary }}>
                    Find your account
                  </h1>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    We moved to a new system. Your data, scores, and progress are all here. Enter the phone number you used when you registered.
                  </p>
                </div>

                <form onSubmit={handlePhoneLookup}>
                  <div className="mb-5">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone number
                    </label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3 top-3.5 text-gray-400" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => { setPhone(e.target.value); setError("") }}
                        placeholder="e.g. 0244 123 456"
                        className="w-full pl-9 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                        autoFocus
                      />
                    </div>
                    {error && (
                      <div className="flex items-start gap-1.5 mt-2 text-red-600 text-xs">
                        <AlertCircle size={13} className="mt-0.5 shrink-0" />
                        {error}
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !phone}
                    className="w-full py-3 rounded-lg text-white text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: brandColors.primary }}
                  >
                    {isLoading ? "Searching for your account..." : "Find my account"}
                  </button>
                </form>

                <p className="text-center text-xs text-gray-400 mt-6">
                  New here?{" "}
                  <button onClick={() => navigate("/sign-up")} className="underline" style={{ color: brandColors.primary }}>
                    Create an account
                  </button>
                </p>
              </motion.div>
            )}

            {/* ── CONFIRM ── */}
            {step === STEPS.CONFIRM && foundUser && (
              <motion.div key="confirm" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.25 }}>
                <div className="mb-7">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-4">
                    We found an account
                  </p>
                  <h1 className="text-2xl font-bold mb-1" style={{ color: brandColors.primary }}>
                    Is this you?
                  </h1>
                  <p className="text-sm text-gray-500">
                    Confirm your account before setting a new password.
                  </p>
                </div>

                {/* Account card */}
                <div
                  className="rounded-xl p-5 mb-7 border"
                  style={{ backgroundColor: "#F8FAFC", borderColor: "#E2E8F0" }}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0"
                      style={{ backgroundColor: brandColors.primary }}
                    >
                      {getInitial(foundUser)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{displayName(foundUser)}</p>
                      {displayCategory(foundUser) && (
                        <p className="text-xs text-gray-500 mt-0.5">{displayCategory(foundUser)}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    {foundUser.mobile_number && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Phone</span>
                        <span className="text-gray-700 font-medium font-mono">
                          {displayPhone(foundUser.mobile_number)}
                        </span>
                      </div>
                    )}
                    {formatJoined(foundUser) && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Registered</span>
                        <span className="text-gray-700 font-medium">{formatJoined(foundUser)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleConfirm}
                  className="w-full py-3 rounded-lg text-white text-sm font-medium mb-3"
                  style={{ backgroundColor: brandColors.primary }}
                >
                  Yes, that's me — set my password
                </button>
                <button
                  onClick={handleDenyConfirm}
                  className="w-full py-2.5 text-sm text-center text-gray-500 hover:text-gray-700"
                >
                  That's not me — try a different number
                </button>
              </motion.div>
            )}

            {/* ── CREDENTIALS ── */}
            {step === STEPS.CREDENTIALS && (
              <motion.div key="credentials" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.25 }}>
                <div className="mb-7">
                  <div className="flex items-center gap-2 mb-4">
                    <ShieldCheck size={18} style={{ color: "#16A34A" }} />
                    <span className="text-sm text-green-700 font-medium">Account confirmed</span>
                  </div>
                  <h1 className="text-2xl font-bold mb-1" style={{ color: brandColors.primary }}>
                    Set your login details
                  </h1>
                  <p className="text-sm text-gray-500">
                    You'll use these to sign in from now on. Pick an email you actually check.
                  </p>
                </div>

                <form onSubmit={handleCreateAccount}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email address
                    </label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3 top-3.5 text-gray-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setError("") }}
                        placeholder="What's your email address?"
                        className="w-full pl-9 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="mb-5">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New password
                    </label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3 top-3.5 text-gray-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setError("") }}
                        placeholder="At least 6 characters"
                        className="w-full pl-9 pr-10 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {password.length > 0 && password.length < 6 && (
                      <p className="text-xs text-amber-600 mt-1">Too short — needs at least 6 characters</p>
                    )}
                  </div>

                  {error && (
                    <div className="flex items-start gap-1.5 mb-4 text-red-600 text-xs bg-red-50 px-3 py-2 rounded-lg">
                      <AlertCircle size={13} className="mt-0.5 shrink-0" />
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading || !email || password.length < 6}
                    className="w-full py-3 rounded-lg text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: brandColors.primary }}
                  >
                    {isLoading ? "Creating your account..." : "Claim my account"}
                  </button>
                </form>
              </motion.div>
            )}

            {/* ── DONE ── */}
            {step === STEPS.DONE && (
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
                  Account claimed
                </h2>
                <p className="text-sm text-gray-500 mb-2">
                  Your account is set up. All your scores, courses, and history are exactly as you left them.
                </p>
                <p className="text-sm font-medium mb-8" style={{ color: brandColors.primary }}>
                  {email}
                </p>
                <button
                  onClick={() => navigate("/login", { state: { email } })}
                  className="w-full py-3 rounded-lg text-white text-sm font-medium"
                  style={{ backgroundColor: brandColors.primary }}
                >
                  Sign in now
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}

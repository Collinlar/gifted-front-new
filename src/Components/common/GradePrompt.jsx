import { useEffect, useState } from "react"
import { GraduationCap, X } from "lucide-react"
import { GRADE_OPTIONS, parseGrade } from "../../lib/grades"
import { getTokenUserId } from "../../lib/auth"
import { updateUserDetails } from "../../lib/api"
import { A } from "../../lib/appTheme"

// Asks for a grade once, for the students we could not work one out for.
//
// 5,086 accounts have no usable grade: 5,037 never had one, and the rest hold
// something we refused to guess at, such as "Junior College (AS, A-Level)",
// "Level 400", or a person's name typed into the wrong box. Converting those
// would have meant inventing an answer, so they get asked instead.
//
// It does not block anything. Until it is answered their content is not
// filtered by grade at all, so they see more rather than an empty page.

const SNOOZE_KEY = "grade_prompt_snoozed_until"
const SNOOZE_DAYS = 7

export default function GradePrompt() {
  const [show, setShow] = useState(false)
  const [value, setValue] = useState("")
  const [saving, setSaving] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let profile = {}
    try { profile = JSON.parse(localStorage.getItem("user") || "{}") } catch { profile = {} }
    if (!getTokenUserId()) return
    if (parseGrade(profile.grade)) return

    const snoozed = Number(localStorage.getItem(SNOOZE_KEY) || 0)
    if (snoozed && Date.now() < snoozed) return

    setShow(true)
  }, [])

  if (!show) return null

  const snooze = () => {
    localStorage.setItem(SNOOZE_KEY, String(Date.now() + SNOOZE_DAYS * 86400000))
    setShow(false)
  }

  const save = async () => {
    const grade = parseGrade(value)
    if (!grade) return
    setSaving(true)
    setFailed(false)
    try {
      const uid = getTokenUserId()
      await updateUserDetails(uid, { grade })

      let profile = {}
      try { profile = JSON.parse(localStorage.getItem("user") || "{}") } catch { profile = {} }
      localStorage.setItem("user", JSON.stringify({ ...profile, grade }))
      localStorage.removeItem(SNOOZE_KEY)
      // The lists on screen were built without a grade, so they have to be
      // rebuilt now that there is one.
      window.location.reload()
    } catch (e) {
      console.error("Could not save the grade:", e)
      setFailed(true)
      setSaving(false)
    }
  }

  return (
    <div className="mb-6 rounded-xl border px-5 py-4" style={{ backgroundColor: A.ground, borderColor: A.line }}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0" style={{ color: A.navy }}>
          <GraduationCap size={20} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold" style={{ color: A.navy }}>
            Which grade are you in?
          </p>
          <p className="text-xs mt-0.5" style={{ color: A.muted }}>
            We are showing you everything at the moment. Tell us your grade and we will narrow it down to the papers and resources meant for you.
          </p>

          <div className="flex flex-wrap items-center gap-2 mt-3">
            <select
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="rounded-lg border px-3 text-sm"
              style={{ borderColor: A.line, minHeight: 44, minWidth: 190, fontSize: 16, color: A.ink }}
            >
              <option value="">Pick your grade</option>
              {GRADE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            <button
              onClick={save}
              disabled={!value || saving}
              className="rounded-lg px-4 text-sm font-semibold text-white disabled:opacity-50"
              style={{ backgroundColor: A.navy, minHeight: 44 }}
            >
              {saving ? "Saving your grade" : "Save my grade"}
            </button>

            <button
              onClick={snooze}
              className="rounded-lg px-3 text-sm font-medium"
              style={{ color: A.muted, minHeight: 44 }}
            >
              Not now
            </button>
          </div>

          {failed && (
            <p className="text-xs mt-2" style={{ color: A.red }}>
              That did not save. Check your connection and tap again.
            </p>
          )}
        </div>

        <button onClick={snooze} aria-label="Close" className="shrink-0" style={{ color: A.subtle, minHeight: 44, minWidth: 44 }}>
          <X size={16} />
        </button>
      </div>
    </div>
  )
}

import { CheckCircle2, XCircle, MinusCircle, Award } from "lucide-react"

const NAVY = "#003366"
const MID  = "#336699"

// Shown when a candidate signs back in after the invigilator publishes results.
// The per-question breakdown only appears if the sitting was set to reveal it,
// because showing correct answers retires the paper for future use.
export default function ExamResults({ results, onClose }) {
  const { candidateName, examTitle, score, total, submittedAt, breakdown, showBreakdown } = results
  const pct = total ? Math.round((score / total) * 100) : 0

  return (
    <div className="min-h-screen w-full py-10 px-4" style={{ backgroundColor: "#F0F4F8" }}>
      <div className="max-w-2xl mx-auto space-y-5">

        <div className="bg-white rounded-2xl shadow-lg p-7 text-center">
          <Award size={36} className="mx-auto mb-3" style={{ color: NAVY }} />
          <p className="text-sm mb-1" style={{ color: MID }}>{examTitle}</p>
          <h1 className="text-2xl font-bold mb-4" style={{ color: NAVY }}>{candidateName}</h1>

          <div className="inline-flex items-baseline gap-2 mb-2">
            <span className="text-5xl font-bold" style={{ color: NAVY }}>{score}</span>
            <span className="text-2xl font-semibold" style={{ color: MID }}>/ {total}</span>
          </div>
          <p className="text-lg font-semibold mb-4" style={{ color: pct >= 50 ? "#1D9E75" : "#DC2626" }}>
            {pct}%
          </p>

          <div className="h-2 rounded-full bg-gray-100 overflow-hidden mb-4">
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${pct}%`, backgroundColor: pct >= 50 ? "#1D9E75" : "#DC2626" }} />
          </div>

          {submittedAt && (
            <p className="text-xs" style={{ color: MID }}>
              Submitted {new Date(submittedAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
            </p>
          )}
        </div>

        {showBreakdown && breakdown?.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-5">
            <h2 className="font-semibold mb-3" style={{ color: NAVY }}>Question by question</h2>
            <div className="divide-y divide-gray-100">
              {breakdown.map((q, i) => (
                <div key={i} className="py-3 flex items-start gap-3">
                  <span className="shrink-0 mt-0.5">
                    {q.yourAnswer == null
                      ? <MinusCircle size={16} className="text-gray-300" />
                      : q.correct
                        ? <CheckCircle2 size={16} className="text-emerald-500" />
                        : <XCircle size={16} className="text-red-500" />}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm mb-1" style={{ color: "#1F2937" }}>
                      <span className="font-semibold" style={{ color: MID }}>Q{i + 1}.</span>{" "}
                      <span dangerouslySetInnerHTML={{ __html: q.question }} />
                    </p>
                    <p className="text-xs mb-0.5">
                      <span className="text-gray-500">You chose: </span>
                      {q.yourAnswer
                        ? <span className={q.correct ? "text-emerald-700" : "text-red-600"}
                            dangerouslySetInnerHTML={{ __html: q.yourAnswer }} />
                        : <span className="text-gray-400">left blank</span>}
                    </p>
                    {!q.correct && (
                      <p className="text-xs">
                        <span className="text-gray-500">Correct answer: </span>
                        <span className="text-emerald-700" dangerouslySetInnerHTML={{ __html: q.correctAnswer || "" }} />
                      </p>
                    )}
                    {!q.correct && q.explanation && (
                      <p className="text-xs text-gray-500 mt-1 pl-2 border-l-2 border-gray-200"
                        dangerouslySetInnerHTML={{ __html: q.explanation }} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!showBreakdown && (
          <p className="text-center text-sm" style={{ color: MID }}>
            Question by question feedback is not being shown for this exam.
          </p>
        )}

        <button onClick={onClose}
          className="w-full py-3 rounded-xl font-semibold text-white"
          style={{ backgroundColor: NAVY }}>
          Done
        </button>
      </div>
    </div>
  )
}

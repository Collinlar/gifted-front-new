import { useState } from "react"
import { useParams } from "react-router-dom"
import ExamEntry from "./ExamEntry"
import ExamRunner from "./ExamRunner"
import ExamResults from "./ExamResults"
import { readToken, saveToken, clearToken } from "../lib/examApi"

// One route for the whole sitting. Holding the token here means a refresh
// mid-exam resumes the paper instead of throwing the candidate back to login.
//
// The same credentials serve two purposes over time: they start the exam, and
// once results are published they show the score. The server decides which,
// so there is no second link or second system to explain to candidates.
export default function ExamPortal() {
  const { sessionCode } = useParams()
  const [token, setToken]     = useState(() => readToken(sessionCode))
  const [results, setResults] = useState(null)

  const handleAuthenticated = (payload) => {
    if (payload.mode === "results") {
      setResults(payload)
      return
    }
    saveToken(sessionCode, payload.token)
    setToken(payload.token)
  }

  const handleFinished = () => {
    clearToken(sessionCode)
    setToken(null)
  }

  if (results) {
    return <ExamResults results={results} onClose={() => setResults(null)} />
  }

  if (!token) {
    return <ExamEntry sessionCode={sessionCode} onAuthenticated={handleAuthenticated} />
  }

  return <ExamRunner sessionCode={sessionCode} token={token} onFinished={handleFinished} />
}

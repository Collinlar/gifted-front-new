import { useState } from "react"
import { useParams } from "react-router-dom"
import ExamEntry from "./ExamEntry"
import ExamRunner from "./ExamRunner"
import { readToken, saveToken, clearToken } from "../lib/examApi"

// One route for the whole sitting. Holding the token here means a refresh
// mid-exam resumes the paper instead of throwing the candidate back to login.
export default function ExamPortal() {
  const { sessionCode } = useParams()
  const [token, setToken] = useState(() => readToken(sessionCode))

  const handleAuthenticated = (t) => {
    saveToken(sessionCode, t)
    setToken(t)
  }

  const handleFinished = () => {
    clearToken(sessionCode)
    setToken(null)
  }

  if (!token) {
    return <ExamEntry sessionCode={sessionCode} onAuthenticated={handleAuthenticated} />
  }

  return <ExamRunner sessionCode={sessionCode} token={token} onFinished={handleFinished} />
}

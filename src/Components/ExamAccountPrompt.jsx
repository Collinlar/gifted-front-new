import { Link } from 'react-router-dom'
import { examAccountPath } from '../lib/examAccountLinks'

export default function ExamAccountPrompt({ sessionCode }) {
  return <section className="bg-white border border-gray-200 rounded-xl p-5 my-4 text-left">
    <h2 className="font-semibold text-[#103254]">Keep this exam in your Gifted account</h2>
    <p className="text-sm text-gray-600 mt-2 mb-4">
      Sign in or create an account, then verify your exam slip. Your results and certificates
      will be available in My Exams when released. You can save a completed exam before results are published.
    </p>
    <Link to={examAccountPath(sessionCode)} className="inline-block px-4 py-3 rounded-lg bg-[#103254] text-white font-semibold text-sm">
      Save this exam to my account
    </Link>
  </section>
}

import { supabase } from './supabase'

async function generatePracticeContent(kind, question) {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.access_token) throw new Error('Sign in again to use practice help.')

  const options = question.options || question.answers || []
  const correctIndex = question.correct ?? question.answer ?? 0
  const response = await fetch('/.netlify/functions/practice-ai', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      kind,
      question: question.question || '',
      options,
      correctOption: kind === 'explanation' ? options[correctIndex] || '' : undefined,
      image: question.image || undefined,
    }),
  })
  if (!response.ok) throw new Error('Practice help is temporarily unavailable.')
  const { content } = await response.json()
  if (!content) throw new Error('Practice help returned no content.')
  return content
}

export const generateHint = (question) => generatePracticeContent('hint', question)
export const generateExplanation = (question) => generatePracticeContent('explanation', question)

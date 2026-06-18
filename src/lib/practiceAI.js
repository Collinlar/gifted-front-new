// Practice Mode — Groq API calls for hint and explanation generation
// Used when a question has no admin-authored hint/explanation field.

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_MODEL   = 'llama-3.3-70b-versatile'
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY

async function callGroq(systemPrompt, userMessage) {
  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      max_tokens: 300,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userMessage },
      ],
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Groq API error: ${err}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content || ''
}

// Generate a hint that narrows reasoning without giving the answer.
// Triggered when a student fails the same question twice in a session.
export async function generateHint(question) {
  const system = `You are a patient tutor helping a student prepare for a school exam in Africa.
Your job is to write a hint for a multiple-choice question.

Rules:
- Never reveal the correct answer or its letter.
- Lead the student toward the right reasoning by asking a guiding question or highlighting the key concept.
- Write in plain, clear English suitable for a secondary school student.
- Maximum 2 sentences.
- Do not use em dashes. Do not start with "Think about" every time — vary your opening.
- Do not use filler phrases like "Great question" or "Let's explore".`

  const options = (question.options || [])
    .map((o, i) => `${String.fromCharCode(65 + i)}. ${o}`)
    .join('\n')

  const user = `Question: ${question.question}
Options:
${options}

Write a hint.`

  return callGroq(system, user)
}

// Generate a concise explanation of why the correct answer is right.
// Shown after the student answers in practice mode.
export async function generateExplanation(question) {
  const correctIndex = question.correct ?? question.answer ?? 0
  const correctOption = (question.options || [])[correctIndex] || ''

  const system = `You are writing a short explanation for a school exam question for students in Africa.

Rules:
- Explain clearly why the correct answer is right.
- Optionally note why a common wrong choice is incorrect, if it adds clarity.
- Write 2 to 3 sentences maximum.
- Plain, direct language for secondary school level.
- Do not use em dashes. Do not use filler phrases like "Great job" or "Well done".
- Do not start with "The correct answer is" — the student already sees that highlighted.`

  const options = (question.options || [])
    .map((o, i) => `${String.fromCharCode(65 + i)}. ${o}`)
    .join('\n')

  const user = `Question: ${question.question}
Options:
${options}
Correct answer: ${correctOption}

Write the explanation.`

  return callGroq(system, user)
}

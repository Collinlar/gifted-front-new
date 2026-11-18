const clean = value => typeof value === 'string' ? value.trim() : ''

export function normalizeMedia(value) {
  const values = Array.isArray(value) ? value : value ? [value] : []
  const seen = new Set()
  return values.map(item => typeof item === 'string'
    ? { url: item.trim() }
    : item && typeof item === 'object'
      ? { url: clean(item.url || item.src), title: clean(item.title || item.caption), alt: clean(item.alt) }
      : { url: '' })
    .filter(item => item.url && !seen.has(item.url) && seen.add(item.url))
}

function attr(tag, name) {
  const quoted = tag.match(new RegExp(`\\b${name}\\s*=\\s*(["'])(.*?)\\1`, 'i'))
  if (quoted) return quoted[2].trim()
  return tag.match(new RegExp(`\\b${name}\\s*=\\s*([^\\s>]+)`, 'i'))?.[1]?.trim() || ''
}

export function splitLegacyImages(value) {
  let content = clean(value).replace(/&lt;(img\b[\s\S]*?)&gt;/gi, '<$1>')
  const media = []
  content = content.replace(/<img\b[^>]*>/gi, tag => {
    const url = attr(tag, 'src')
    if (url) media.push({ url, title: attr(tag, 'title'), alt: attr(tag, 'alt') })
    return ''
  })
  return { content: content.trim(), media: normalizeMedia(media) }
}

export function normalizeQuestion(raw = {}) {
  const question = { ...raw }
  const prompt = splitLegacyImages(question.question)
  const answers = Array.isArray(question.answers) ? question.answers.map(value => String(value ?? ''))
    : Array.isArray(question.options) ? question.options.map(value => String(value ?? '')) : []
  const authoredValues = Array.isArray(question.answerValues) && question.answerValues.length === answers.length
    ? question.answerValues.map(value => String(value ?? ''))
    : answers
  const existing = Array.isArray(question.answerMedia) ? question.answerMedia
    : Array.isArray(question.answerImages) ? question.answerImages : []
  const answerMedia = answers.map((answer, index) => {
    const legacy = splitLegacyImages(answer)
    return normalizeMedia([...(normalizeMedia(existing[index])), ...legacy.media])
  })
  const cleanedAnswers = answers.map(answer => splitLegacyImages(answer).content)
  const correctRaw = question.correctValue ?? question.correctAnswer ?? question.correct_answer
  let correctIndex = authoredValues.findIndex(answer => String(answer) === String(correctRaw ?? ''))
  if (correctIndex < 0) correctIndex = answers.findIndex(answer => String(answer) === String(question.correctAnswer ?? ''))
  const media = normalizeMedia([
    ...normalizeMedia(question.media || question.images),
    ...(question.image ? [{ url: question.image, title: question.imageTitle || '', alt: question.imageAlt || '' }] : []),
    ...prompt.media,
  ])
  return {
    ...question,
    question: prompt.content,
    // Keep the authored values as well as the display-safe text. Exam-mode
    // scoring happens on the server, so an older option containing an inline
    // <img> must still be submitted byte-for-byte until that exam is re-saved
    // into the structured media format.
    answerValues: authoredValues,
    answers: cleanedAnswers,
    options: cleanedAnswers,
    correctValue: correctRaw,
    correctAnswer: correctIndex >= 0 ? cleanedAnswers[correctIndex] : correctRaw,
    correct: typeof question.correct === 'number' ? question.correct : correctIndex,
    media,
    answerMedia,
    image: media[0]?.url || '',
    imageTitle: media[0]?.title || media[0]?.alt || '',
  }
}

export const normalizeQuestions = value => Array.isArray(value) ? value.map(normalizeQuestion) : []

export function shuffleQuestionAnswers(rawQuestion, random = Math.random) {
  const question = normalizeQuestion(rawQuestion)
  const pairs = question.answers.map((answer, index) => ({
    answer,
    value: question.answerValues[index],
    media: question.answerMedia[index] || [],
  }))
  for (let i = pairs.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[pairs[i], pairs[j]] = [pairs[j], pairs[i]]
  }
  return {
    ...question,
    answers: pairs.map(pair => pair.answer),
    options: pairs.map(pair => pair.answer),
    answerValues: pairs.map(pair => pair.value),
    answerMedia: pairs.map(pair => pair.media),
  }
}

export function plainAssessmentText(value) {
  return splitLegacyImages(value).content.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
}

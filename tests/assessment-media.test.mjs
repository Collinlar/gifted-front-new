import assert from 'node:assert/strict'
import { normalizeQuestion, shuffleQuestionAnswers } from '../src/lib/assessmentMedia.js'

const legacy = {
  question: 'Choose &lt;img src="q1.png" alt="diagram"&gt;<img src="q2.png">',
  answers: ['Alpha <img src="a.png">', 'Beta'],
  correctAnswer: 'Alpha <img src="a.png">',
  media: [{ url: 'q3.png' }],
  answerMedia: [[{ url: 'a2.png' }], []],
}

const normalized = normalizeQuestion(legacy)
assert.equal(normalized.question, 'Choose')
assert.deepEqual(normalized.media.map(item => item.url), ['q3.png', 'q1.png', 'q2.png'])
assert.equal(normalized.answers[0], 'Alpha')
assert.deepEqual(normalized.answerMedia[0].map(item => item.url), ['a2.png', 'a.png'])
assert.equal(normalized.correctAnswer, 'Alpha')
assert.equal(normalized.correctValue, legacy.correctAnswer)
assert.equal(normalized.answerValues[0], legacy.answers[0])

const shuffled = shuffleQuestionAnswers(normalized, () => 0)
assert.deepEqual(shuffled.answers, ['Beta', 'Alpha'])
assert.deepEqual(shuffled.answerMedia[1].map(item => item.url), ['a2.png', 'a.png'])
assert.equal(shuffled.answerValues[1], legacy.answers[0])

console.log('assessment media regression checks passed')

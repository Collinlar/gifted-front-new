import { test } from 'node:test'
import assert from 'node:assert/strict'
import { examAccountPath, safeAuthNext } from '../src/lib/examAccountLinks.js'

test('signup and login can return to the sitting without putting credentials in URLs', () => {
  const path = examAccountPath('MATH 2026/A')
  assert.equal(path, '/my-exams?session=MATH%202026%2FA')
  assert.equal(safeAuthNext(`?next=${encodeURIComponent(path)}`), path)
  assert.equal(examAccountPath(), '/my-exams')
})
test('external and malformed redirect paths fall back to the portal', () => {
  for (const next of ['https://outside.test', '//outside.test', '/\\outside.test', '/\noutside.test', 'javascript:alert(1)', ''])
    assert.equal(safeAuthNext(`?next=${encodeURIComponent(next)}`), '/overview')
  assert.equal(safeAuthNext(''), '/overview')
  assert.equal(safeAuthNext('?next=%2Fregister%2Fabc'), '/register/abc')
})

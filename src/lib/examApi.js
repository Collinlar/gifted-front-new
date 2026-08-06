// Exam mode talks to Postgres through SECURITY DEFINER functions using the
// ANON key only. supabaseAdmin is deliberately not imported here.
//
// Nothing in this file can read the exams table, so the answer key never
// reaches the browser. Scoring happens inside Postgres on submit.
import { supabase } from './supabase'

// Two failure shapes, both carrying messages written for students.
//
// `error` is a raised exception. `data.error` is a returned failure, used where
// the function needed to write a security log row first: raising would roll the
// transaction back and lose the very record we want to keep.
function unwrap({ data, error }) {
  if (error) throw new Error(error.message || 'Something went wrong. Try again.')
  if (data && typeof data === 'object' && data.error) throw new Error(data.error)
  return data
}

// Not cryptographic. Just enough to notice the same login being used from a
// different machine during a sitting.
export function deviceFingerprint() {
  const parts = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
  ].join('|')
  let h = 0
  for (let i = 0; i < parts.length; i++) {
    h = (h << 5) - h + parts.charCodeAt(i)
    h |= 0
  }
  return String(h >>> 0)
}

export async function examLogin(sessionCode, accessCode, password) {
  return unwrap(await supabase.rpc('exam_candidate_login', {
    p_session_code: sessionCode,
    p_access_code: accessCode,
    p_password: password,
    p_fingerprint: deviceFingerprint(),
  }))
}

export async function examGetPaper(token) {
  return unwrap(await supabase.rpc('exam_get_paper', { p_token: token }))
}

export async function examSaveProgress(token, answers) {
  return unwrap(await supabase.rpc('exam_save_progress', { p_token: token, p_answers: answers }))
}

export async function examHeartbeat(token) {
  return unwrap(await supabase.rpc('exam_heartbeat', { p_token: token }))
}

export async function examLogEvent(token, type, meta = {}) {
  try {
    return await supabase.rpc('exam_log_event', { p_token: token, p_type: type, p_meta: meta })
      .then((r) => r.data)
  } catch {
    return null // monitoring must never interrupt a candidate
  }
}

export async function examSubmit(token, answers, auto = false) {
  return unwrap(await supabase.rpc('exam_submit', {
    p_token: token, p_answers: answers, p_auto: auto,
  }))
}

// Token storage is scoped per sitting so two sittings on one machine cannot
// collide, and a refresh mid-exam resumes rather than locking the candidate out.
export const tokenKey = (code) => `exam_token_${String(code).toUpperCase()}`
export const readToken  = (code) => localStorage.getItem(tokenKey(code))
export const saveToken  = (code, t) => localStorage.setItem(tokenKey(code), t)
export const clearToken = (code) => localStorage.removeItem(tokenKey(code))

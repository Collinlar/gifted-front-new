// Only the public sitting code travels through authentication. Never put exam
// passwords, result tokens or certificate download keys in URLs or storage.
export const examAccountPath = (sessionCode = '') =>
  `/my-exams${sessionCode ? `?session=${encodeURIComponent(sessionCode)}` : ''}`

export function safeAuthNext(search) {
  const next = new URLSearchParams(search).get('next')
  if (!next || !next.startsWith('/') || next.startsWith('//') || /[\\\u0000-\u0020]/.test(next)) return '/overview'
  try {
    const parsed = new URL(next, 'https://gifted.invalid')
    return parsed.origin === 'https://gifted.invalid' ? parsed.pathname + parsed.search + parsed.hash : '/overview'
  } catch { return '/overview' }
}

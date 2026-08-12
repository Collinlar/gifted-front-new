// Test a sign-in straight against Supabase, with none of the app in the way.
//
//   node diagnose-login.mjs calculus.yoa@gmail.com
//
// It prompts for the password rather than taking it as an argument, so the
// credential never lands in your shell history, and it is never printed.
//
// What the result tells you:
//   SUCCEEDED -> the account and password are fine. The bug is in the app's
//                login page, after authentication returns.
//   FAILED    -> authentication itself is refusing. The message says why.

import { createClient } from '@supabase/supabase-js'
import { createInterface } from 'node:readline/promises'
import { readFileSync } from 'node:fs'

// Read the same keys the browser app uses
const env = Object.fromEntries(
  readFileSync('.env', 'utf8')
    .split('\n')
    .filter((l) => l.includes('='))
    .map((l) => {
      const i = l.indexOf('=')
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()]
    })
)

const url  = env.VITE_SUPABASE_URL
const anon = env.VITE_SUPABASE_ANON_KEY

if (!url || !anon) {
  console.error('Could not read VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY from .env')
  process.exit(1)
}

const email = (process.argv[2] || '').trim()
if (!email) {
  console.error('Usage: node diagnose-login.mjs <email>')
  process.exit(1)
}

const rl = createInterface({ input: process.stdin, output: process.stdout })
const password = await rl.question(`Password for ${email}: `)
rl.close()

const supabase = createClient(url, anon)

console.log('\nSigning in exactly as the login form does...\n')
const { data, error } = await supabase.auth.signInWithPassword({ email, password })

if (error) {
  console.log('FAILED')
  console.log('  reason :', error.message)
  console.log('  status :', error.status)
  console.log('\nAuthentication itself refused. The account or the password is the problem,')
  console.log('not the app. "Invalid login credentials" here means the stored password is')
  console.log('not the one you just typed.')
} else {
  console.log('SUCCEEDED')
  console.log('  user id       :', data.user.id)
  console.log('  email         :', data.user.email)
  console.log('  confirmed at  :', data.user.email_confirmed_at)
  console.log('  session token :', data.session?.access_token ? 'issued' : 'MISSING')
  console.log('\nThe account and password are fine. Whatever is stopping this person is in')
  console.log('the login page, after authentication returns.')
}

// Retry with a trailing space, to prove or rule out the whitespace theory
if (error) {
  const { error: e2 } = await supabase.auth.signInWithPassword({ email, password: password + ' ' })
  if (!e2) console.log('\nNOTE: it succeeds with a trailing space on the password.')
  const { error: e3 } = await supabase.auth.signInWithPassword({ email, password: password.trim() })
  if (!e3) console.log('\nNOTE: it succeeds with the password trimmed.')
}

process.exit(0)

import { supabase } from './supabase'
import { supabaseAdmin } from './supabaseAdmin'
import { jwtDecode } from 'jwt-decode'
import { getAllTracks, setUserTracks } from './api'

// Interest checkboxes at signup use the `interests` table's name column
// (e.g. "Mathematics", "ICT"). Tracks use the same vocabulary, so we
// resolve by case-insensitive name match rather than requiring an exact
// string match — interests/tracks are managed independently in admin.
export async function syncUserTracksFromInterests(userId, interestNames) {
  if (!interestNames?.length) return
  try {
    const { tracks } = await getAllTracks()
    const normalized = interestNames.map((n) => n.trim().toLowerCase())
    const matchedIds = tracks
      .filter((t) => normalized.includes(t.name.trim().toLowerCase()))
      .map((t) => t.id)
    if (matchedIds.length) await setUserTracks(userId, matchedIds)
  } catch (error) {
    console.warn('Could not sync user_tracks from interests:', error)
  }
}

// Supabase JWTs use `sub` for user ID, not `id`.
// Use this everywhere instead of jwtDecode(token).id
export function getTokenUserId() {
  try {
    const token = localStorage.getItem('token')
    if (!token) return null
    return jwtDecode(token).sub || null
  } catch {
    return null
  }
}

// Read profile fields (firstName, category etc) from the users table
// stored in localStorage by loginUser — not from the JWT.
export function getStoredProfile() {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}')
  } catch {
    return {}
  }
}

export async function loginUser({ email, password, userName }) {
  const loginEmail = email || userName

  const { data, error } = await supabase.auth.signInWithPassword({
    email: loginEmail,
    password,
  })

  if (error) {
    return { success: false, message: error.message }
  }

  const user = data.user
  const token = data.session.access_token

  // Primary lookup by auth UUID (use admin client — RLS blocks anon reads)
  let { data: profile } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  // Fallback: look up by email for edge cases where row wasn't linked yet
  if (!profile && user.email) {
    const { data: byEmail } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', user.email)
      .maybeSingle()
    profile = byEmail
  }

  // Always check for a legacy pre-claim row.
  // legacy_user_id — the old Supabase UUID, still in competitions.registered arrays
  // legacy_mongo_id — the original MongoDB ObjectId, still in assessments.userId
  const { data: oldRow } = await supabaseAdmin
    .from('users')
    .select('id, mongo_id')
    .eq('claimed_by', user.id)
    .maybeSingle()
  if (oldRow?.id) {
    localStorage.setItem('legacy_user_id', oldRow.id)
  } else {
    localStorage.removeItem('legacy_user_id')
  }
  if (oldRow?.mongo_id) {
    localStorage.setItem('legacy_mongo_id', oldRow.mongo_id)
  } else {
    localStorage.removeItem('legacy_mongo_id')
  }

  // Distinguish "Welcome back" (returning login) from "Hello" (right after signup) on the dashboard
  const hasLoggedInBefore = localStorage.getItem('hasLoggedInBefore') === 'true'
  localStorage.setItem('isReturningSession', hasLoggedInBefore ? 'true' : 'false')
  localStorage.setItem('hasLoggedInBefore', 'true')

  localStorage.setItem('token', token)
  localStorage.setItem('login', 'true')
  if (profile) {
    const normalized = {
      ...profile,
      firstName:             profile.first_name              ?? profile.firstName              ?? '',
      lastName:              profile.last_name               ?? profile.lastName               ?? '',
      mobileNumber:          profile.mobile_number           ?? profile.mobileNumber           ?? '',
      dateOfBirth:           profile.date_of_birth           ?? profile.dateOfBirth            ?? '',
      schoolName:            profile.school_name             ?? profile.schoolName             ?? profile.school ?? '',
      School:                profile.school_name             ?? profile.School                 ?? profile.schoolName ?? profile.school ?? '',
      educationalLevel:      profile.educational_level       ?? profile.educationalLevel       ?? '',
      profilePicture:        profile.profile_picture         ?? profile.profilePicture         ?? '',
      purposeOfRegistration: profile.purpose_of_registration ?? profile.purposeOfRegistration  ?? [],
    }
    localStorage.setItem('user', JSON.stringify(normalized))
  }
  if (profile?.purpose_of_registration) {
    localStorage.setItem('interest', JSON.stringify(profile.purpose_of_registration))
  }

  return { success: true, token, user: { ...user, ...profile } }
}

export async function registerUser(registerData) {
  const {
    email,
    password,
    firstName,
    lastName,
    mobileNumber,
    dob,
    DOB,
    gender,
    category,
    Category,
    country,
    educationalLevel,
    school,
    School,
    grade,
    purposeOfRegistration,
    purpose_Of_Registration,
    purpose_of_registration,
  } = registerData

  const purposes  = purposeOfRegistration ?? purpose_Of_Registration ?? purpose_of_registration ?? []
  const dobVal    = dob ?? DOB ?? ''
  const catVal    = category ?? Category ?? ''
  const schoolVal = school ?? School ?? ''

  // Create auth user — email_confirm:true skips the confirmation email
  const { data: adminData, error: adminError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      first_name:        firstName  ?? '',
      last_name:         lastName   ?? '',
      mobile_number:     mobileNumber ?? '',
      date_of_birth:     dobVal,
      gender:            gender     ?? '',
      category:          catVal,
      country:           country    ?? '',
      educational_level: educationalLevel ?? '',
      school_name:       schoolVal,
      grade:             grade      ?? '',
      purpose_of_registration: purposes,
    },
  })

  if (adminError) {
    return { success: false, message: adminError.message }
  }

  const authUser = adminData.user

  // Insert into users table — only include columns confirmed to exist in the schema.
  // If your users table is missing educational_level or school_name, run the SQL
  // migration in src/lib/supabase-migrations.sql to add them before enabling those lines.
  const dbRow = {
    id:                      authUser.id,
    first_name:              firstName    ?? '',
    last_name:               lastName     ?? '',
    email:                   email        ?? '',
    mobile_number:           mobileNumber ?? '',
    date_of_birth:           dobVal,
    gender:                  gender       ?? '',
    category:                catVal,
    country:                 country      ?? '',
    grade:                   grade        ?? '',
    purpose_of_registration: purposes,
    created_at:              new Date().toISOString(),
  }

  // Add optional columns only when they have a value — avoids "column does not exist" errors
  // if your schema was migrated from MongoDB without those columns
  if (educationalLevel) dbRow.educational_level = educationalLevel
  if (schoolVal)        dbRow.school_name        = schoolVal

  const { error: upsertError } = await supabaseAdmin.from('users').upsert(dbRow)

  if (upsertError) {
    // Clean up the auth user so the person can try again
    await supabaseAdmin.auth.admin.deleteUser(authUser.id)
    return { success: false, message: `Account created but profile save failed: ${upsertError.message}. Please try again.` }
  }

  await syncUserTracksFromInterests(authUser.id, purposes)

  // Sign in to get a live session/token
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (signInError) {
    return { success: false, message: signInError.message }
  }

  const token = signInData.session.access_token
  const profile = {
    ...dbRow,
    firstName:             dbRow.first_name,
    lastName:              dbRow.last_name,
    mobileNumber:          dbRow.mobile_number,
    dateOfBirth:           dbRow.date_of_birth,
    schoolName:            schoolVal,
    School:                schoolVal,
    educationalLevel:      educationalLevel ?? '',
    purposeOfRegistration: purposes,
  }

  // First-ever dashboard view for this account — not a "returning" session
  localStorage.setItem('isReturningSession', 'false')
  localStorage.setItem('hasLoggedInBefore', 'true')

  localStorage.setItem('token', token)
  localStorage.setItem('login', 'true')
  localStorage.setItem('user', JSON.stringify(profile))
  if (purposes.length) {
    localStorage.setItem('interest', JSON.stringify(purposes))
  }

  return { success: true, token, purposeOfRegistration: purposes }
}

export async function sendPasswordResetLink({ email }) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  })

  if (error) return { success: false, message: error.message }
  return { success: true, message: 'Password reset link sent to your email.' }
}

export async function resetPassword({ password }) {
  const { error } = await supabase.auth.updateUser({ password })

  if (error) return { success: false, message: error.message }
  return { success: true, message: 'Password updated successfully.' }
}

export async function logoutUser() {
  await supabase.auth.signOut()
  localStorage.clear()
}

export async function getCurrentUser() {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return null

  const { data: profile } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single()

  return { ...session.user, ...profile }
}

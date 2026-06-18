import { supabase } from './supabase'
import { supabaseAdmin } from './supabaseAdmin'

// ─── Users ────────────────────────────────────────────────────────────────────

// Normalize DB snake_case columns to camelCase expected by UI components
function normalizeUser(data) {
  if (!data) return data
  return {
    ...data,
    firstName:              data.first_name              ?? data.firstName              ?? '',
    lastName:               data.last_name               ?? data.lastName               ?? '',
    mobileNumber:           data.mobile_number           ?? data.mobileNumber           ?? '',
    purposeOfRegistration:  data.purpose_of_registration ?? data.purposeOfRegistration  ?? [],
    purposeOfRegistrations: data.purpose_of_registration ?? data.purposeOfRegistrations ?? [],
    schoolName:             data.school_name             ?? data.schoolName             ?? data.school        ?? '',
    School:                 data.school_name             ?? data.School                 ?? data.schoolName    ?? data.school ?? '',
    educationalLevel:       data.educational_level       ?? data.educationalLevel       ?? data.education_level ?? '',
    dateOfBirth:            data.date_of_birth           ?? data.dateOfBirth            ?? '',
    profilePicture:         data.profile_picture         ?? data.profilePicture         ?? '',
  }
}

export async function getUserDetails(userId) {
  // Use admin client — RLS policies are not yet configured on the users table
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) return { success: false, user: null }
  const user = normalizeUser(data)
  // Keep localStorage in sync
  localStorage.setItem('user', JSON.stringify(user))
  return { success: true, user }
}

export async function updateUserDetails(userId, updates) {
  // Map camelCase updates back to snake_case columns
  const dbUpdates = { ...updates }
  if ('firstName'              in updates) dbUpdates.first_name              = updates.firstName
  if ('lastName'               in updates) dbUpdates.last_name               = updates.lastName
  if ('mobileNumber'           in updates) dbUpdates.mobile_number           = updates.mobileNumber
  if ('purposeOfRegistration'  in updates) dbUpdates.purpose_of_registration = updates.purposeOfRegistration
  if ('schoolName'             in updates) dbUpdates.school_name             = updates.schoolName
  if ('dateOfBirth'            in updates) dbUpdates.date_of_birth           = updates.dateOfBirth
  if ('profilePicture'         in updates) dbUpdates.profile_picture         = updates.profilePicture
  if ('educationalLevel'       in updates) dbUpdates.educational_level       = updates.educationalLevel
  if ('School'                 in updates) dbUpdates.school                  = updates.School
  if ('userName'               in updates) dbUpdates.user_name               = updates.userName

  const { data, error } = await supabaseAdmin
    .from('users')
    .update(dbUpdates)
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return { success: true, user: normalizeUser(data) }
}

export async function updateProfilePicture(userId, file) {
  const ext = file.name.split('.').pop()
  const path = `profile-pictures/${userId}.${ext}`

  const { error: uploadError } = await supabaseAdmin.storage
    .from('avatars')
    .upload(path, file, { upsert: true })

  if (uploadError) throw uploadError

  const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)

  await supabaseAdmin.from('profile_images').upsert({ user_id: userId, url: publicUrl })
  await supabaseAdmin.from('users').update({ profile_picture: publicUrl }).eq('id', userId)

  return { success: true, url: publicUrl }
}

export async function updateCoverImage(userId, file) {
  const ext = file.name.split('.').pop()
  const path = `cover-images/${userId}.${ext}`

  const { error: uploadError } = await supabaseAdmin.storage
    .from('avatars')
    .upload(path, file, { upsert: true })

  if (uploadError) throw uploadError

  const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)

  await supabaseAdmin.from('users').update({ cover_image: publicUrl }).eq('id', userId)

  return { success: true, url: publicUrl }
}

// ─── Competitions / Programs ───────────────────────────────────────────────────

export async function getAllCompetitions() {
  const { data, error } = await supabaseAdmin
    .from('competitions')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return { success: true, AllCompetitions: data }
}

export async function getAllInterests() {
  const { data, error } = await supabaseAdmin.from('interests').select('*')
  if (error) throw error
  return { success: true, interests: data }
}

export async function getRegisteredPrograms(fullName) {
  // Primary: check competitions.registered array using current + legacy user IDs
  const { data: { session } } = await supabase.auth.getSession()
  const currentId = session?.user?.id
  const legacyId = localStorage.getItem('legacy_user_id')

  const { data: comps } = await supabaseAdmin.from('competitions').select('*')
  if (comps) {
    const registered = comps.filter(c => {
      const arr = c.registered || []
      return (currentId && arr.includes(currentId)) ||
             (legacyId  && arr.includes(legacyId))
    })
    if (registered.length > 0) return { success: true, programs: registered }
  }

  // Fallback: program_registrations table (for new registrations post-migration)
  const { data, error } = await supabaseAdmin
    .from('program_registrations')
    .select('*')
    .eq('full_name', fullName)

  if (error || !data?.length) return { success: true, programs: [] }
  return { success: true, programs: data }
}

export async function registerProgram(payload) {
  const { data, error } = await supabaseAdmin
    .from('program_registrations')
    .insert(payload)
    .select()
    .single()

  if (error) throw error
  return { success: true, registration: data }
}

export async function verifyRegistration(userId, programName) {
  const { data, error } = await supabaseAdmin
    .from('program_registrations')
    .select('*')
    .eq('user_id', userId)
    .eq('program', programName)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return { success: true, registered: !!data, registration: data }
}

// ─── Courses ───────────────────────────────────────────────────────────────────

export async function getAllCoursesInfo() {
  const { data, error } = await supabaseAdmin
    .from('courses')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return { success: true, courses: data }
}

export async function getCourse(name, grade) {
  const { data, error } = await supabaseAdmin
    .from('courses')
    .select('*')
    .eq('name', name)
    .eq('grade', grade)
    .single()

  if (error) throw error
  return { success: true, course: data }
}

export async function fetchCourseDetails(courseId) {
  const { data, error } = await supabaseAdmin
    .from('courses')
    .select('*, course_details(*)')
    .eq('id', courseId)
    .single()

  if (error) throw error
  return { success: true, course: data }
}

export async function fetchCourseInfo(id) {
  const { data, error } = await supabaseAdmin
    .from('courses')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return { success: true, course: data }
}

export async function fetchCourseProgress(userId, courseId) {
  const { data, error } = await supabaseAdmin
    .from('course_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return { success: true, progress: data || null }
}

export async function updateCourseProgress(userId, updates) {
  const { data, error } = await supabaseAdmin
    .from('course_progress')
    .upsert({ user_id: userId, ...updates })
    .select()
    .single()

  if (error) throw error
  return { success: true, progress: data }
}

export async function fetchCourseReview(userId, courseId) {
  const { data, error } = await supabaseAdmin
    .from('course_reviews')
    .select('*')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return { success: true, review: data }
}

// ─── Assessments / Exams ───────────────────────────────────────────────────────

export async function getAllExams() {
  const { data, error } = await supabaseAdmin
    .from('exams')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return { success: true, exams: data }
}

export async function getExam(id) {
  const { data, error } = await supabaseAdmin
    .from('exams')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return { success: true, exam: data }
}

export async function getFeaturedExams() {
  const { data, error } = await supabaseAdmin
    .from('exams')
    .select('*')
    .eq('featured', true)
    .order('created_at', { ascending: false })

  if (error) throw error
  return { success: true, exams: data }
}

export async function getAssessment(name, grade) {
  const { data, error } = await supabaseAdmin
    .from('exams')
    .select('*')
    .eq('name', name)
    .eq('grade', grade)
    .single()

  if (error) throw error
  return { success: true, assessment: data }
}

export async function sendAssessmentAnalytics(scoreData) {
  // assessments table has user_id (snake_case) — map from camelCase scoreData.userId
  const { userId, ...rest } = scoreData
  const row = { ...rest, user_id: userId || rest.user_id }
  const { error } = await supabaseAdmin.from('assessments').insert(row)
  if (error) throw error
  return { success: true }
}

export async function addExamRecord(userId, record) {
  const { error } = await supabaseAdmin
    .from('exam_scores')
    .insert({ user_id: userId, ...record })

  if (error) throw error
  return { success: true }
}

export async function sendFeedback({ quiz, feedback }) {
  const { error } = await supabaseAdmin.from('feedbacks').insert({ quiz_id: quiz, feedback })
  if (error) throw error
  return { success: true }
}

export async function saveQuizReview(reviewData) {
  const { error } = await supabaseAdmin.from('quiz_reviews').upsert(reviewData)
  if (error) throw error
  return { success: true }
}

export async function fetchQuizReview(userId, quizId) {
  const { data, error } = await supabaseAdmin
    .from('quiz_reviews')
    .select('*')
    .eq('user_id', userId)
    .eq('quiz_id', quizId)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return { success: true, review: data }
}

// ─── Scores ────────────────────────────────────────────────────────────────────

export async function addScore(scoreData) {
  // exam_scores actual columns: id, mongo_id, quiz_id, grade, score, created_at, updated_at, user_id
  // quiz_id holds the exam/contest UUID; user_id holds the Supabase auth UUID
  const row = {
    user_id:  scoreData.userId    || scoreData.user_id,
    quiz_id:  scoreData.courseId  || scoreData.contest_id || scoreData.contestId || scoreData.quiz_id,
    score:    scoreData.score,
    grade:    scoreData.grade,
  }

  const { data, error } = await supabaseAdmin
    .from('exam_scores')
    .insert(row)
    .select()
    .single()

  if (error) throw error

  // Compute rank: count of rows with a strictly higher score for this contest
  const { count } = await supabaseAdmin
    .from('exam_scores')
    .select('id', { count: 'exact', head: true })
    .eq('quiz_id', row.quiz_id)
    .gt('score', row.score)

  const rank = (count || 0) + 1
  return { success: true, score: data, rank }
}

export async function fetchAllScores() {
  const { data, error } = await supabaseAdmin
    .from('leaderboards')
    .select('*')
    .order('score', { ascending: false })

  if (error) throw error
  return { success: true, scores: data }
}

export async function getQuizDetails(userId) {
  // assessments table uses user_id (snake_case) only.
  // Legacy rows:  user_id = MongoDB ObjectId  → matched via legacy_mongo_id
  // New rows:     user_id = Supabase UUID     → matched via userId
  // Claimed rows: user_id may be old Supabase UUID → matched via legacy_user_id
  const legacyId = localStorage.getItem('legacy_user_id')
  const mongoId  = localStorage.getItem('legacy_mongo_id')

  const ids = [...new Set([userId, legacyId, mongoId].filter(Boolean))]
  if (!ids.length) return { success: true, quizDetails: [] }

  const { data, error } = await supabaseAdmin
    .from('assessments')
    .select('*')
    .in('user_id', ids)
    .order('created_at', { ascending: false })

  if (error) throw error

  const quizDetails = (data || [])
    .map(row => ({
      ...(row.details || {}),
      id:     row.id,
      userId: row.user_id,
    }))
    .filter(item => item.title)

  return { success: true, quizDetails }
}

export async function getExamAttempts(userId, quizId) {
  const legacyId = typeof localStorage !== 'undefined' ? localStorage.getItem('legacy_user_id') : null
  const mongoId  = typeof localStorage !== 'undefined' ? localStorage.getItem('legacy_mongo_id') : null
  const ids = [...new Set([userId, legacyId, mongoId].filter(Boolean))]
  if (!ids.length) return { success: true, attempts: [] }

  const { data, error } = await supabaseAdmin
    .from('assessments')
    .select('id, created_at, details')
    .in('user_id', ids)
    .filter('details->>quizId', 'eq', String(quizId))
    .order('created_at', { ascending: false })

  if (error) throw error

  const attempts = (data || []).map((row) => ({
    id: row.id,
    date: row.details?.date || new Date(row.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    score: row.details?.score ?? null,
    totalQuestions: row.details?.totalQuestions ?? null,
    review: row.details?.review || null, // per-question data if stored
    createdAt: row.created_at,
  }))

  return { success: true, attempts }
}

// ─── Flashcards ────────────────────────────────────────────────────────────────

export async function getFlashCards(courseId) {
  const { data, error } = await supabaseAdmin
    .from('flashcards')
    .select('*')
    .eq('course_id', courseId)

  if (error) throw error
  return { success: true, flashcards: data }
}

export async function getTimedChallenge(courseId) {
  const { data, error } = await supabaseAdmin
    .from('timed_challenges')
    .select('*, timed_challenge_sets(*)')
    .eq('course_id', courseId)

  if (error) throw error
  return { success: true, challenge: data }
}

// ─── Community / Channels ──────────────────────────────────────────────────────

export async function getAllGroups() {
  const { data, error } = await supabaseAdmin
    .from('groups')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return { success: true, groups: data }
}

export async function getChannelFeed(channelId) {
  const { data, error } = await supabaseAdmin
    .from('channel_feeds')
    .select('*, users(first_name, last_name, profile_picture)')
    .eq('channel_id', channelId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return { success: true, messages: data }
}

export async function sendMessage(formData) {
  const { error } = await supabaseAdmin.from('messages').insert({
    channel_id: formData.get('channelId'),
    content: formData.get('content'),
    user_id: formData.get('userId'),
  })

  if (error) throw error
  return { success: true }
}

// ─── Leaderboard / Contests ────────────────────────────────────────────────────

export async function fetchContestLeaderboard(contestId) {
  // exam_scores.user_id references auth.users (not public.users) so PostgREST cannot auto-join.
  // Step 1: fetch scores
  const { data: scores, error } = await supabaseAdmin
    .from('exam_scores')
    .select('*')
    .eq('quiz_id', contestId)
    .order('score', { ascending: false })
    .limit(100)

  if (error) throw error
  if (!scores || scores.length === 0) return { success: true, leaderboard: [] }

  // Step 2: batch-fetch names from public.users
  const userIds = [...new Set(scores.map(s => s.user_id).filter(Boolean))]
  const { data: users } = await supabaseAdmin
    .from('users')
    .select('id, first_name, last_name')
    .in('id', userIds)

  const nameMap = {}
  ;(users || []).forEach(u => {
    nameMap[u.id] = [u.first_name, u.last_name].filter(Boolean).join(' ') || 'Anonymous'
  })

  const leaderboard = scores.map(s => ({
    ...s,
    display_name: nameMap[s.user_id] || 'Anonymous',
  }))

  return { success: true, leaderboard }
}

export async function getUserContestAttempts(contestId, userId) {
  const { data, error } = await supabaseAdmin
    .from('exam_scores')
    .select('*')
    .eq('quiz_id', contestId)
    .eq('user_id', userId)

  if (error) throw error
  return { success: true, attempts: data }
}

// ─── Analytics ─────────────────────────────────────────────────────────────────

export async function getAllLearningResourceAnalytics(userId) {
  const { data, error } = await supabaseAdmin
    .from('learning_analytics')
    .select('*')
    .eq('user_id', userId)

  if (error) throw error
  return { success: true, analytics: data }
}

// ─── Transactions / Payments ───────────────────────────────────────────────────

export async function loadPurpose(token) {
  const { data: { user } } = await supabaseAdmin.auth.getUser(token)
  if (!user) return { success: false, message: 'Not authenticated' }

  const { data, error } = await supabaseAdmin
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)

  if (error) throw error
  return { success: true, invoices: data }
}

export async function makePayment(userId, payload) {
  const { data, error } = await supabaseAdmin
    .from('transactions')
    .insert({ user_id: userId, ...payload })
    .select()
    .single()

  if (error) throw error
  return { success: true, payment: data }
}

export async function verifyPayment(payload) {
  // transactions table uses 'id' as primary key — no 'reference' column
  const { id, ...rest } = payload
  const { data, error } = await supabaseAdmin
    .from('transactions')
    .update({ status: 'verified', ...rest })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return { success: true, payment: data }
}

export async function updatePayAfterInvoice(item, id) {
  const { data, error } = await supabaseAdmin
    .from('transactions')
    .update({ status: 'paid', choice: item.choice })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return { success: true, invoice: data }
}

// ─── Camps ─────────────────────────────────────────────────────────────────────

export async function getAllCamps() {
  const { data, error } = await supabaseAdmin
    .from('camps')
    .select('*')
    .eq('publish', true)
    .order('start_date', { ascending: true })

  if (error) throw error
  return { success: true, camps: data }
}

export async function getCamp(id) {
  const { data, error } = await supabaseAdmin
    .from('camps')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return { success: true, camp: data }
}

export async function getRegisteredCamps(userId) {
  const { data, error } = await supabaseAdmin
    .from('camp_registrations')
    .select('*, camps(*)')
    .eq('user_id', userId)

  if (error) throw error
  return { success: true, registrations: data }
}

export async function registerForCamp(userId, campId) {
  const { data, error } = await supabaseAdmin
    .from('camp_registrations')
    .insert({ user_id: userId, camp_id: campId })
    .select()
    .single()

  if (error) throw error
  return { success: true, registration: data }
}

// ─── Tracks ────────────────────────────────────────────────────────────────────

export async function getAllTracks() {
  const { data, error } = await supabaseAdmin
    .from('tracks')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error) throw error
  return { success: true, tracks: data }
}

export async function getTrackBySlug(slug) {
  const { data, error } = await supabaseAdmin
    .from('tracks')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) throw error
  return { success: true, track: data }
}

export async function getUserTracks(userId) {
  const { data, error } = await supabaseAdmin
    .from('user_tracks')
    .select('*, tracks(*)')
    .eq('user_id', userId)

  if (error) throw error
  return { success: true, tracks: (data || []).map(row => row.tracks) }
}

export async function setUserTracks(userId, trackIds) {
  // Replace the user's track selections wholesale — simpler than diffing
  await supabaseAdmin.from('user_tracks').delete().eq('user_id', userId)
  if (!trackIds.length) return { success: true }

  const rows = trackIds.map(trackId => ({ user_id: userId, track_id: trackId }))
  const { error } = await supabaseAdmin.from('user_tracks').insert(rows)
  if (error) throw error
  return { success: true }
}

// Fetches every competition/course/exam/camp tagged into a track, fully hydrated.
// Returns them grouped by item_type so the track hub page can render each section directly.
export async function getTrackContent(trackId) {
  const { data: items, error } = await supabaseAdmin
    .from('track_items')
    .select('*')
    .eq('track_id', trackId)

  if (error) throw error

  const idsByType = (items || []).reduce((acc, item) => {
    acc[item.item_type] = acc[item.item_type] || []
    acc[item.item_type].push(item.item_id)
    return acc
  }, {})

  const [competitions, courses, exams, camps] = await Promise.all([
    idsByType.competition?.length
      ? supabaseAdmin.from('competitions').select('*').in('id', idsByType.competition).then(r => r.data || [])
      : Promise.resolve([]),
    idsByType.course?.length
      ? supabaseAdmin.from('courses').select('*').in('id', idsByType.course).then(r => r.data || [])
      : Promise.resolve([]),
    idsByType.exam?.length
      ? supabaseAdmin.from('exams').select('*').in('id', idsByType.exam).then(r => r.data || [])
      : Promise.resolve([]),
    idsByType.camp?.length
      ? supabaseAdmin.from('camps').select('*').in('id', idsByType.camp).then(r => r.data || [])
      : Promise.resolve([]),
  ])

  return { success: true, competitions, courses, exams, camps }
}

// ─── Enrollments ───────────────────────────────────────────────────────────────

// Stamps "now" as the last time this user looked at an Assessments tab.
// Call this AFTER computing which exams were new for the current view —
// otherwise the user would never see the "New" tag they just earned.
export async function markExamsSeen(userId) {
  const { error } = await supabaseAdmin
    .from('users')
    .update({ last_seen_exams_at: new Date().toISOString() })
    .eq('id', userId)
  if (error) throw error
  return { success: true }
}

export async function getEnrollments(userId) {
  const { data, error } = await supabaseAdmin
    .from('enrollments')
    .select('*')
    .eq('user_id', userId)

  if (error) throw error
  return { success: true, enrollments: data }
}

// ─── History & Registration ────────────────────────────────────────────────────

export async function getUserCompetitionRegistrations(userId) {
  const { data, error } = await supabaseAdmin
    .from('program_registrations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return { success: true, registrations: data || [] }
}

export async function registerForCompetition(userId, { competitionId, name, year, grade }) {
  // Check for duplicate first
  const { data: existing } = await supabaseAdmin
    .from('program_registrations')
    .select('id')
    .eq('user_id', userId)
    .eq('program', name)
    .maybeSingle()

  if (existing) return { success: true, registration: existing, alreadyRegistered: true }

  const { data, error } = await supabaseAdmin
    .from('program_registrations')
    .insert({
      user_id: userId,
      competition_id: competitionId,
      program: name,
      year: year || null,
      grade: grade || null,
      status: 'registered',
    })
    .select()
    .single()

  if (error) throw error
  return { success: true, registration: data, alreadyRegistered: false }
}

export async function getUserHistory(userId) {
  const legacyId = typeof localStorage !== 'undefined' ? localStorage.getItem('legacy_user_id') : null
  const mongoId  = typeof localStorage !== 'undefined' ? localStorage.getItem('legacy_mongo_id') : null
  const assessmentIds = [...new Set([userId, legacyId, mongoId].filter(Boolean))]

  const [regsRes, campRegsRes, attemptsRes, progressRes] = await Promise.all([
    supabaseAdmin
      .from('program_registrations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),

    supabaseAdmin
      .from('camp_registrations')
      .select('*, camps(id, name, start_date, end_date, location, is_virtual, image)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),

    assessmentIds.length
      ? supabaseAdmin
          .from('assessments')
          .select('*')
          .in('user_id', assessmentIds)
          .order('created_at', { ascending: true })
      : Promise.resolve({ data: [] }),

    supabaseAdmin
      .from('course_progress')
      .select('*, courses(id, title, thumbnail)')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false }),
  ])

  // Flatten assessment attempts and group by exam title/quizId
  const rawAttempts = (attemptsRes.data || [])
    .map(row => ({ ...(row.details || {}), _rowId: row.id, createdAt: row.created_at }))
    .filter(a => a.title)

  const examMap = {}
  for (const attempt of rawAttempts) {
    const key = attempt.quizId || attempt.title
    if (!examMap[key]) examMap[key] = { quizId: attempt.quizId, title: attempt.title, attempts: [] }
    examMap[key].attempts.push({
      score: attempt.score ?? 0,
      totalQuestions: attempt.totalQuestions ?? 0,
      date: attempt.date || attempt.createdAt,
      createdAt: attempt.createdAt,
    })
  }
  const assessmentHistory = Object.values(examMap)

  return {
    success: true,
    competitions: regsRes.data || [],
    camps: campRegsRes.data || [],
    assessmentHistory,
    courseProgress: progressRes.data || [],
  }
}

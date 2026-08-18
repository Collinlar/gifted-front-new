import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  BookOpen, Clock, Plus, Check, ShoppingBag, Loader2, ArrowRight, Search, X,
} from "lucide-react"
import { supabase } from "../lib/supabase"
import { getAllCoursesInfo, fetchAllCourseProgress } from "../lib/api"
import { claimFree, dropFree, priceOf, formatMoney } from "../lib/shopApi"
import { useCart } from "../store/CartContext"
import { A } from "../lib/appTheme"
import { Page, PageHead, FilterRow, Empty, Notice, Btn } from "../Components/common/PageShell"

// The Learning Hub.
//
// Two things were wrong here, and only one of them was visual.
//
// It read the signed-in user as jwtDecode(token).id. A Supabase JWT carries
// the user id in `sub`, so that was undefined for everybody, which meant the
// registered-courses filter never matched and every student saw an empty
// "Registered Courses" panel above a full list of "Other Courses". It then
// checked progress on a `moduleStatus` field that course_progress does not
// have, so no progress ever showed either.
//
// The design problem was the CTA. Every course said Register, and Register
// opened a payment dialog asking for a phone number, whether the course cost
// two hundred cedis or nothing at all. Free material should be one tap.

export default function LearningManagement() {
  const navigate = useNavigate()
  const cart = useCart()

  const [userId, setUserId]   = useState(null)
  const [courses, setCourses] = useState([])
  const [progress, setProgress] = useState({})
  const [listings, setListings] = useState({})   // course id -> product row
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState("")
  const [search, setSearch]   = useState("")
  const [tab, setTab]         = useState("mine")

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        // The id lives on the session, not in a decoded token field
        const { data: { user } } = await supabase.auth.getUser()
        const uid = user?.id || null
        if (!alive) return
        setUserId(uid)

        // Courses are the page. Progress and shop listings only decorate it,
        // so settled rather than all: the hub must still work for someone
        // signed out, and on an install where the shop tables are not there.
        const [courseRes, progRes, listingRes] = await Promise.allSettled([
          getAllCoursesInfo(),
          uid ? fetchAllCourseProgress(uid) : Promise.resolve({ progress: {} }),
          // A paid course is bought through its marketplace listing. Courses
          // with a price and no listing simply are not on sale yet, which the
          // card says rather than offering a button that leads nowhere.
          supabase.from("marketplace_products")
            .select("id, links_to_id, price, currency")
            .eq("links_to_type", "course"),
        ])
        if (!alive) return

        if (courseRes.status === "rejected") throw courseRes.reason
        setCourses(courseRes.value.courses || [])

        if (progRes.status === "fulfilled") setProgress(progRes.value.progress)

        const map = {}
        if (listingRes.status === "fulfilled") {
          ;(listingRes.value.data || []).forEach((p) => { map[p.links_to_id] = p })
        }
        setListings(map)
      } catch (e) {
        if (alive) setError(e.message || "We could not load your courses.")
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => { alive = false }
  }, [])

  const enriched = useMemo(() => courses.map((c) => {
    const id    = c.id
    const price = priceOf(c.cost)
    return {
      ...c,
      id,
      price,
      free: price <= 0,
      mine: cart.has("course", id),
      product: listings[id] || null,
      progress: progress[id] || null,
    }
  }), [courses, listings, progress, cart])

  const mine   = enriched.filter((c) => c.mine)
  const free   = enriched.filter((c) => !c.mine && c.free)
  const paid   = enriched.filter((c) => !c.mine && !c.free)

  const q = search.trim().toLowerCase()
  const match = (list) => !q ? list : list.filter((c) =>
    [c.title, c.description, c.category, c.level, ...(c.tags || [])]
      .filter(Boolean).some((v) => String(v).toLowerCase().includes(q)))

  const groups = { mine: match(mine), free: match(free), paid: match(paid) }
  const shown = groups[tab] || []

  const refreshOwned = () => cart.refresh()

  return (
    <Page wide>
      <PageHead
        title="Learning Hub"
        sub="Courses, guides and study material. Free ones go straight into your learning."
        actions={<Btn variant="secondary" onClick={() => navigate("/my-library")}>My library</Btn>}
      />

      {error && <Notice tone="bad">{error}</Notice>}
      {!userId && !loading && (
        <Notice tone="info">Sign in to save courses to your own learning and pick up where you left off.</Notice>
      )}

      <div className="relative mb-4">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: A.subtle }} />
        <input
          value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search courses"
          className="w-full pl-11 pr-10 rounded-xl border bg-white text-base focus:outline-none"
          style={{ borderColor: A.line, color: A.ink, height: 48 }}
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
            aria-label="Clear search">
            <X size={16} style={{ color: A.subtle }} />
          </button>
        )}
      </div>

      <FilterRow
        className="mb-6"
        value={tab} onChange={setTab}
        options={[
          { value: "mine", label: "My learning", count: mine.length },
          { value: "free", label: "Free to add", count: free.length },
          { value: "paid", label: "Paid courses", count: paid.length },
        ]}
      />

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-white border overflow-hidden" style={{ borderColor: A.line }}>
              <div className="aspect-[16/9] animate-pulse" style={{ backgroundColor: A.lineSoft }} />
              <div className="p-4 space-y-2">
                <div className="h-4 rounded animate-pulse" style={{ backgroundColor: A.lineSoft }} />
                <div className="h-4 w-2/3 rounded animate-pulse" style={{ backgroundColor: A.lineSoft }} />
              </div>
            </div>
          ))}
        </div>
      ) : shown.length === 0 ? (
        <Empty
          icon={BookOpen}
          title={
            q ? "Nothing matches that"
              : tab === "mine" ? "You have not added anything yet"
              : tab === "free" ? "No free courses right now"
              : "No paid courses right now"
          }
          line={
            q ? "Try a different word."
              : tab === "mine" ? "Free courses can be added in one tap. Have a look."
              : "Check back through the term, new material is added regularly."
          }
          action={tab === "mine" && !q && (
            <Btn onClick={() => setTab("free")}>See what's free</Btn>
          )}
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {shown.map((c) => (
            <CourseCard key={c.id} course={c} cart={cart} signedIn={!!userId}
              onChanged={refreshOwned}
              onOpen={() => {
                localStorage.setItem("courseId", c.id)
                navigate("/course-view", { state: c })
              }} />
          ))}
        </div>
      )}
    </Page>
  )
}

// ── One course ─────────────────────────────────────────────────────────────

function CourseCard({ course: c, cart, signedIn, onOpen, onChanged }) {
  const [busy, setBusy] = useState(false)
  const [err, setErr]   = useState("")

  const pct = c.progress && c.progress.total > 0
    ? Math.round((c.progress.done / c.progress.total) * 100)
    : null
  const started = pct !== null && pct > 0

  const addFree = async () => {
    setErr(""); setBusy(true)
    try { await claimFree("course", c.id); await onChanged() }
    catch (e) { setErr(e.message) }
    finally { setBusy(false) }
  }

  const removeFree = async () => {
    setBusy(true)
    try { await dropFree("course", c.id); await onChanged() }
    catch (e) { setErr(e.message) }
    finally { setBusy(false) }
  }

  const addPaid = async () => {
    setErr(""); setBusy(true)
    try { await cart.add(c.product.id) }
    catch (e) { setErr(e.message) }
    finally { setBusy(false) }
  }

  return (
    <div className="rounded-2xl bg-white border overflow-hidden flex flex-col transition-shadow hover:shadow-lg"
      style={{ borderColor: A.line }}>
      <button onClick={onOpen} className="text-left w-full">
        <div className="aspect-[16/9] relative overflow-hidden" style={{ backgroundColor: A.lineSoft }}>
          {c.thumbnail ? (
            <img src={c.thumbnail} alt="" loading="lazy" className="w-full h-full object-cover"
              onError={(e) => { e.target.style.display = "none" }} />
          ) : (
            <div className="w-full h-full grid place-items-center">
              <BookOpen size={26} style={{ color: A.accent }} />
            </div>
          )}
          {c.free && !c.mine && (
            <span className="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-md text-white"
              style={{ backgroundColor: A.green }}>Free</span>
          )}
        </div>

        <div className="p-4">
          <div className="flex items-center gap-2 mb-1.5 text-[11px]" style={{ color: A.accent }}>
            {c.level && <span className="uppercase tracking-wide">{c.level}</span>}
            {c.duration && (
              <span className="flex items-center gap-1" style={{ color: A.subtle }}>
                <Clock size={11} /> {c.duration}
              </span>
            )}
          </div>

          <p className="font-semibold leading-snug line-clamp-2" style={{ color: A.navy }}>{c.title}</p>
          {c.description && (
            <p className="text-xs mt-1.5 line-clamp-2" style={{ color: A.muted }}>{c.description}</p>
          )}
        </div>
      </button>

      <div className="px-4 pb-4 mt-auto">
        {/* Progress only appears once there is progress. A bar sitting at zero
            on every card is noise that says nothing. */}
        {started && (
          <div className="mb-3">
            <div className="flex justify-between text-[11px] mb-1" style={{ color: A.mid }}>
              <span>{c.progress.done} of {c.progress.total} done</span>
              <span className="font-semibold">{pct}%</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: A.lineSoft }}>
              <div className="h-full rounded-full transition-all"
                style={{ width: `${pct}%`, backgroundColor: A.navy }} />
            </div>
          </div>
        )}

        {c.mine ? (
          <div className="flex gap-2">
            <Btn size="sm" className="flex-1" onClick={onOpen}>
              {started ? "Continue" : "Start"} <ArrowRight size={14} />
            </Btn>
            {/* Only what they added themselves can be taken back off. A course
                they paid for is not removed by a stray tap. */}
            {!c.free ? null : (
              <Btn size="sm" variant="quiet" disabled={busy} onClick={removeFree}>
                <X size={14} />
              </Btn>
            )}
          </div>
        ) : c.free ? (
          <Btn size="sm" full disabled={busy || !signedIn} onClick={addFree}>
            {busy ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            Add to my learning
          </Btn>
        ) : c.product ? (
          cart.inCart(c.product.id) ? (
            <Btn size="sm" full variant="secondary" disabled>
              <Check size={14} /> In your cart
            </Btn>
          ) : (
            <Btn size="sm" full disabled={busy} onClick={addPaid}>
              {busy ? <Loader2 size={14} className="animate-spin" /> : <ShoppingBag size={14} />}
              {formatMoney(c.product.price, c.product.currency)}
            </Btn>
          )
        ) : (
          <Btn size="sm" full variant="secondary" disabled>
            {formatMoney(c.price)} · not on sale yet
          </Btn>
        )}

        {err && <p className="text-xs mt-2" style={{ color: A.red }}>{err}</p>}
      </div>
    </div>
  )
}

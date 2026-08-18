import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Library, Download, BookOpen, FileText, Truck, Loader2, ArrowRight, Package,
} from "lucide-react"
import { supabase } from "../lib/supabase"
import { getMyEntitlements, getMyOrders, getDownloadLink } from "../lib/shopApi"
import { A, shortDate } from "../lib/appTheme"
import { Page, PageHead, Empty, Notice, Btn } from "../Components/common/PageShell"

// Everything the student owns, in one place.
//
// This is the end of the path the marketplace starts. Before it, buying
// something led nowhere: there was no screen that could answer "where did the
// thing I paid for go". A purchase that cannot be found again is not a
// purchase.
//
// Entitlements are the source of truth. A course claimed free from the
// Learning Hub and a book bought last term arrive here the same way, because
// both wrote the same row.

export default function MyLibrary() {
  const navigate = useNavigate()
  const [items, setItems]   = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState("")

  useEffect(() => {
    (async () => {
      try {
        const [{ entitlements }, { orders }] = await Promise.all([
          getMyEntitlements(), getMyOrders(),
        ])
        setOrders(orders)

        // One round trip per kind rather than per row. A student with forty
        // entitlements should not make forty requests to draw one page.
        const byType = { course: [], assessment: [], product: [] }
        entitlements.forEach((e) => byType[e.item_type]?.push(e.item_id))

        const [courses, exams, products] = await Promise.all([
          byType.course.length
            ? supabase.from("courses").select("id, title, thumbnail, description").in("id", byType.course)
            : { data: [] },
          byType.assessment.length
            ? supabase.from("exams").select("id, title, image, description").in("id", byType.assessment)
            : { data: [] },
          byType.product.length
            ? supabase.from("marketplace_products").select("id, title, subtitle, kind, cover_image_url, requires_shipping").in("id", byType.product)
            : { data: [] },
        ])

        const lookup = new Map()
        ;(courses.data  || []).forEach((r) => lookup.set(`course:${r.id}`,     { title: r.title, image: r.thumbnail, sub: r.description }))
        ;(exams.data    || []).forEach((r) => lookup.set(`assessment:${r.id}`, { title: r.title, image: r.image,     sub: r.description }))
        ;(products.data || []).forEach((r) => lookup.set(`product:${r.id}`,    { title: r.title, image: r.cover_image_url, sub: r.subtitle, kind: r.kind, shipping: r.requires_shipping }))

        setItems(
          entitlements
            .map((e) => ({ ...e, ...(lookup.get(`${e.item_type}:${e.item_id}`) || {}) }))
            // A course deleted after someone bought it leaves an entitlement
            // pointing at nothing. Skip it rather than draw a blank card.
            .filter((e) => e.title)
        )
      } catch (e) {
        setError(e.message || "We could not load your library.")
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const courses     = items.filter((i) => i.item_type === "course")
  const assessments = items.filter((i) => i.item_type === "assessment")
  const products    = items.filter((i) => i.item_type === "product")

  const awaiting = orders.filter((o) => o.status === "paid" && ["pending", "dispatched"].includes(o.fulfilment))

  return (
    <Page>
      <PageHead
        title="My library"
        sub="Everything you own, whether you paid for it or added it free."
        actions={<Btn variant="secondary" onClick={() => navigate("/marketplace")}>Shop</Btn>}
      />

      {error && <Notice tone="bad">{error}</Notice>}

      {awaiting.length > 0 && (
        <div className="rounded-2xl border px-5 py-4 mb-6"
          style={{ borderColor: "#FDE68A", backgroundColor: A.amberSoft }}>
          <p className="text-sm font-semibold flex items-center gap-2" style={{ color: A.amber }}>
            <Truck size={15} /> On its way to you
          </p>
          {awaiting.map((o) => (
            <p key={o.id} className="text-sm mt-1.5" style={{ color: A.amber }}>
              {o.reference} — {o.fulfilment === "dispatched" ? "dispatched" : "being packed"}
              {o.delivery_city ? ` to ${o.delivery_city}` : ""}
            </p>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 justify-center py-16 text-sm" style={{ color: A.mid }}>
          <Loader2 size={16} className="animate-spin" /> Opening your library...
        </div>
      ) : items.length === 0 ? (
        <Empty
          icon={Library}
          title="Your library is empty"
          line="Anything you buy, and anything free you save, shows up here."
          action={<Btn onClick={() => navigate("/marketplace")}>Browse the shop</Btn>}
        />
      ) : (
        <div className="space-y-8">
          <Section title="Courses" items={courses} icon={BookOpen}
            onOpen={(i) => navigate("/course-view", { state: { id: i.item_id, _id: i.item_id, title: i.title } })}
            cta="Open" />

          <Section title="Assessments and practice" items={assessments} icon={FileText}
            onOpen={(i) => {
              localStorage.setItem("id", i.item_id)
              navigate("/quiz-overview", { state: { id: i.item_id } })
            }}
            cta="Start" />

          <ProductSection items={products} />
        </div>
      )}
    </Page>
  )
}

function Section({ title, items, icon: Icon, onOpen, cta }) {
  if (items.length === 0) return null
  return (
    <section>
      <h2 className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: A.mid }}>
        {title} <span style={{ color: A.subtle }}>({items.length})</span>
      </h2>
      <div className="grid sm:grid-cols-2 gap-3">
        {items.map((i) => (
          <button key={i.id} onClick={() => onOpen(i)}
            className="flex items-center gap-3 bg-white rounded-2xl border p-3 text-left hover:shadow-md transition-shadow"
            style={{ borderColor: A.line }}>
            <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 grid place-items-center"
              style={{ backgroundColor: A.lineSoft }}>
              {i.image
                ? <img src={i.image} alt="" className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = "none" }} />
                : <Icon size={20} style={{ color: A.accent }} />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-sm leading-snug line-clamp-2" style={{ color: A.navy }}>
                {i.title}
              </p>
              <p className="text-xs mt-0.5" style={{ color: A.subtle }}>
                {i.source === "free" ? "Saved" : "Bought"} {shortDate(i.granted_at)}
              </p>
            </div>
            <span className="text-sm font-semibold flex items-center gap-1 shrink-0" style={{ color: A.navy }}>
              {cta} <ArrowRight size={14} />
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}

// Downloads and printed items. A book has nothing to open, so it says what is
// happening to it instead of offering a button that would do nothing.
function ProductSection({ items }) {
  if (items.length === 0) return null
  return (
    <section>
      <h2 className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: A.mid }}>
        Books and downloads <span style={{ color: A.subtle }}>({items.length})</span>
      </h2>
      <div className="grid sm:grid-cols-2 gap-3">
        {items.map((i) => <ProductRow key={i.id} item={i} />)}
      </div>
    </section>
  )
}

function ProductRow({ item: i }) {
  const [busy, setBusy] = useState(false)
  const [err, setErr]   = useState("")
  const downloadable = i.kind === "download" || i.kind === "bundle"

  return (
    <div className="flex items-center gap-3 bg-white rounded-2xl border p-3" style={{ borderColor: A.line }}>
      <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 grid place-items-center"
        style={{ backgroundColor: A.lineSoft }}>
        {i.image
          ? <img src={i.image} alt="" className="w-full h-full object-cover"
              onError={(e) => { e.target.style.display = "none" }} />
          : <Package size={20} style={{ color: A.accent }} />}
      </div>

      <div className="min-w-0 flex-1">
        <p className="font-semibold text-sm leading-snug line-clamp-2" style={{ color: A.navy }}>{i.title}</p>
        <p className="text-xs mt-0.5" style={{ color: A.subtle }}>
          {i.shipping ? "Printed item" : "Digital"} · {shortDate(i.granted_at)}
        </p>
        {err && <p className="text-xs mt-1" style={{ color: A.red }}>{err}</p>}
      </div>

      {downloadable && (
        <Btn size="sm" variant="secondary" disabled={busy}
          onClick={async () => {
            setErr(""); setBusy(true)
            try {
              const { url } = await getDownloadLink(i.item_id)
              window.open(url, "_blank", "noopener")
            } catch (e) { setErr(e.message) }
            finally { setBusy(false) }
          }}>
          {busy ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
          Download
        </Btn>
      )}
    </div>
  )
}

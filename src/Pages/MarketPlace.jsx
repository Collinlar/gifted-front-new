import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Search, ShoppingBag, Check, Download, BookOpen, FileText,
  Package, Layers, X, Plus, Minus, Trash2, ArrowRight, Loader2,
} from "lucide-react"
import { getProducts, formatMoney } from "../lib/shopApi"
import { useCart } from "../store/CartContext"
import { A } from "../lib/appTheme"
import { Page, PageHead, FilterRow, Empty, Notice, Btn } from "../Components/common/PageShell"

// The shop.
//
// What this replaced: a page with its own sky-blue gradient, its own sticky
// header and footer, three hundred lines of invented products with stock
// photography and fictional instructors, and a Buy Now button whose entire
// implementation was alert("Purchase successful"). Nothing was recorded and
// nobody owned anything afterwards.
//
// This one sits inside the app, sells what is actually in the catalogue, and
// the whole path from browsing to owning the thing is real.

const KINDS = {
  book:       { label: "Books",       Icon: BookOpen, line: "Printed and delivered" },
  download:   { label: "Downloads",   Icon: Download, line: "Yours to download" },
  course:     { label: "Courses",     Icon: Layers,   line: "Opens in your Learning Hub" },
  assessment: { label: "Assessments", Icon: FileText, line: "Opens under Assessments" },
  bundle:     { label: "Bundles",     Icon: Package,  line: "Several items together" },
}

export default function Marketplace() {
  const navigate = useNavigate()
  const cart = useCart()

  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState("")
  const [search, setSearch]     = useState("")
  const [kind, setKind]         = useState(null)
  const [detail, setDetail]     = useState(null)
  const [showCart, setShowCart] = useState(false)

  useEffect(() => {
    (async () => {
      try {
        const { products } = await getProducts()
        setProducts(products)
      } catch (e) {
        // The real message, not a generic one. When this is "relation
        // marketplace_products does not exist" the admin needs to see that.
        setError(e.message || "We could not load the shop just now.")
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const counts = useMemo(() => {
    const c = {}
    products.forEach((p) => { c[p.kind] = (c[p.kind] || 0) + 1 })
    return c
  }, [products])

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase()
    return products.filter((p) => {
      if (kind && p.kind !== kind) return false
      if (!q) return true
      return [p.title, p.subtitle, p.author, p.subject, p.category, ...(p.tags || [])]
        .filter(Boolean).some((v) => String(v).toLowerCase().includes(q))
    })
  }, [products, search, kind])

  const filters = [
    { value: null, label: "Everything", count: products.length },
    ...Object.entries(KINDS)
      .filter(([k]) => counts[k])
      .map(([k, v]) => ({ value: k, label: v.label, count: counts[k] })),
  ]

  return (
    <Page wide>
      <PageHead
        title="Marketplace"
        sub="Books, past papers, courses and practice packs. Everything you buy lands in your account straight away."
        actions={
          <Btn variant="secondary" onClick={() => setShowCart(true)}>
            <ShoppingBag size={16} />
            Cart
            {cart.count > 0 && (
              <span className="ml-0.5 min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold text-white grid place-items-center"
                style={{ backgroundColor: A.gold }}>
                {cart.count}
              </span>
            )}
          </Btn>
        }
      />

      {error && <Notice tone="bad">{error}</Notice>}

      <div className="relative mb-4">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: A.subtle }} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="What are you looking for?"
          className="w-full pl-11 pr-4 rounded-xl border bg-white text-base focus:outline-none"
          style={{ borderColor: A.line, color: A.ink, height: 48 }}
        />
      </div>

      {filters.length > 2 && (
        <FilterRow options={filters} value={kind} onChange={setKind} className="mb-6" />
      )}

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-white border overflow-hidden" style={{ borderColor: A.line }}>
              <div className="aspect-[4/3] animate-pulse" style={{ backgroundColor: A.lineSoft }} />
              <div className="p-4 space-y-2">
                <div className="h-3.5 rounded animate-pulse" style={{ backgroundColor: A.lineSoft }} />
                <div className="h-3.5 w-2/3 rounded animate-pulse" style={{ backgroundColor: A.lineSoft }} />
              </div>
            </div>
          ))}
        </div>
      ) : shown.length === 0 ? (
        <Empty
          icon={ShoppingBag}
          title={search || kind ? "Nothing matches that" : "The shop is being stocked"}
          line={search || kind
            ? "Try a different word, or clear the filter."
            : "New books and practice packs are added through the term. Check back soon."}
          action={(search || kind) && (
            <Btn variant="secondary" onClick={() => { setSearch(""); setKind(null) }}>
              Show everything
            </Btn>
          )}
        />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {shown.map((p) => (
            <ProductCard key={p.id} product={p} cart={cart} onOpen={() => setDetail(p)} />
          ))}
        </div>
      )}

      {detail && <ProductSheet product={detail} cart={cart} onClose={() => setDetail(null)} />}
      {showCart && (
        <CartDrawer
          cart={cart}
          onClose={() => setShowCart(false)}
          onCheckout={() => { setShowCart(false); navigate("/checkout") }}
        />
      )}
    </Page>
  )
}

// ── One item in the grid ───────────────────────────────────────────────────
//
// A cover, a title, a price and one button. The old cards carried a star
// rating and a student count, both of which were `Math.random()` at render
// time, so they changed every time the page loaded. Numbers nobody measured
// are worse than no numbers.

function ProductCard({ product: p, cart, onOpen }) {
  const { Icon } = KINDS[p.kind] || KINDS.book
  const free  = Number(p.price) <= 0
  const owned = p.links_to_type
    ? cart.has(p.links_to_type, p.links_to_id)
    : cart.has("product", p.id)
  const inCart = cart.inCart(p.id)
  const soldOut = p.stock !== null && p.stock !== undefined && p.stock <= 0

  return (
    <div className="rounded-2xl bg-white border overflow-hidden flex flex-col transition-shadow hover:shadow-lg"
      style={{ borderColor: A.line }}>
      <button onClick={onOpen} className="block text-left w-full">
        <div className="aspect-[4/3] relative overflow-hidden" style={{ backgroundColor: A.lineSoft }}>
          {p.cover_image_url ? (
            <img src={p.cover_image_url} alt="" loading="lazy"
              className="w-full h-full object-cover"
              onError={(e) => { e.target.style.display = "none" }} />
          ) : (
            <div className="w-full h-full grid place-items-center">
              <Icon size={30} style={{ color: A.accent }} />
            </div>
          )}
          {soldOut && (
            <span className="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-md text-white"
              style={{ backgroundColor: A.red }}>
              Out of stock
            </span>
          )}
          {!soldOut && free && (
            <span className="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-md text-white"
              style={{ backgroundColor: A.green }}>
              Free
            </span>
          )}
        </div>

        <div className="p-4">
          <p className="text-[11px] uppercase tracking-wide mb-1" style={{ color: A.accent }}>
            {(KINDS[p.kind] || KINDS.book).label}
          </p>
          <p className="font-semibold leading-snug line-clamp-2" style={{ color: A.navy }}>
            {p.title}
          </p>
          {p.author && (
            <p className="text-xs mt-1 truncate" style={{ color: A.subtle }}>{p.author}</p>
          )}
        </div>
      </button>

      <div className="px-4 pb-4 mt-auto">
        <div className="flex items-baseline gap-2 mb-3">
          <span className="font-bold" style={{ color: A.navy }}>
            {free ? "Free" : formatMoney(p.price, p.currency)}
          </span>
          {p.compare_at > p.price && (
            <span className="text-xs line-through" style={{ color: A.subtle }}>
              {formatMoney(p.compare_at, p.currency)}
            </span>
          )}
        </div>
        <AddButton product={p} cart={cart} owned={owned} inCart={inCart} soldOut={soldOut} full />
      </div>
    </div>
  )
}

// ── The one button that matters ────────────────────────────────────────────

function AddButton({ product: p, cart, owned, inCart, soldOut, full, size = "sm" }) {
  const [busy, setBusy] = useState(false)
  const [err, setErr]   = useState("")

  if (owned) {
    return (
      <Btn variant="secondary" size={size} full={full} disabled>
        <Check size={15} style={{ color: A.green }} /> You have this
      </Btn>
    )
  }
  if (soldOut) {
    return <Btn variant="secondary" size={size} full={full} disabled>Out of stock</Btn>
  }
  if (inCart) {
    return (
      <Btn variant="secondary" size={size} full={full} disabled>
        <Check size={15} /> In your cart
      </Btn>
    )
  }

  return (
    <>
      <Btn size={size} full={full} disabled={busy}
        onClick={async () => {
          setErr(""); setBusy(true)
          try { await cart.add(p.id) }
          catch (e) { setErr(e.message) }
          finally { setBusy(false) }
        }}>
        {busy ? <Loader2 size={15} className="animate-spin" /> : <ShoppingBag size={15} />}
        {Number(p.price) <= 0 ? "Add to my account" : "Add to cart"}
      </Btn>
      {err && <p className="text-xs mt-2" style={{ color: A.red }}>{err}</p>}
    </>
  )
}

// ── Detail ─────────────────────────────────────────────────────────────────
//
// A sheet rather than a route, so closing it puts the student back exactly
// where they were in the grid rather than at the top of a reloaded page.

function ProductSheet({ product: p, cart, onClose }) {
  const { Icon, line } = KINDS[p.kind] || KINDS.book
  const free   = Number(p.price) <= 0
  const owned  = p.links_to_type ? cart.has(p.links_to_type, p.links_to_id) : cart.has("product", p.id)
  const inCart = cart.inCart(p.id)
  const soldOut = p.stock !== null && p.stock !== undefined && p.stock <= 0

  useEffect(() => {
    const esc = (e) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", esc)
    document.body.style.overflow = "hidden"
    return () => { window.removeEventListener("keydown", esc); document.body.style.overflow = "" }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ backgroundColor: "rgba(8,24,42,0.45)" }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}
        className="bg-white w-full sm:max-w-3xl rounded-t-2xl sm:rounded-2xl overflow-hidden max-h-[92vh] flex flex-col">

        <div className="flex items-center justify-between px-5 py-3.5 border-b shrink-0" style={{ borderColor: A.line }}>
          <span className="text-xs uppercase tracking-wide font-semibold" style={{ color: A.accent }}>
            {(KINDS[p.kind] || KINDS.book).label}
          </span>
          <button onClick={onClose} className="p-2 -mr-2 rounded-lg" aria-label="Close">
            <X size={18} style={{ color: A.mid }} />
          </button>
        </div>

        <div className="overflow-y-auto">
          <div className="sm:flex">
            <div className="sm:w-2/5 shrink-0 aspect-[4/3] sm:aspect-auto sm:min-h-[280px]"
              style={{ backgroundColor: A.lineSoft }}>
              {p.cover_image_url ? (
                <img src={p.cover_image_url} alt="" className="w-full h-full object-cover"
                  onError={(e) => { e.target.style.display = "none" }} />
              ) : (
                <div className="w-full h-full grid place-items-center">
                  <Icon size={44} style={{ color: A.accent }} />
                </div>
              )}
            </div>

            <div className="p-5 sm:p-6 flex-1">
              <h2 className="text-xl font-bold leading-tight" style={{ color: A.navy }}>{p.title}</h2>
              {p.subtitle && <p className="text-sm mt-1" style={{ color: A.mid }}>{p.subtitle}</p>}
              {p.author && <p className="text-sm mt-2" style={{ color: A.subtle }}>By {p.author}</p>}

              <div className="flex items-baseline gap-2 mt-4">
                <span className="text-2xl font-bold" style={{ color: A.navy }}>
                  {free ? "Free" : formatMoney(p.price, p.currency)}
                </span>
                {p.compare_at > p.price && (
                  <span className="text-sm line-through" style={{ color: A.subtle }}>
                    {formatMoney(p.compare_at, p.currency)}
                  </span>
                )}
              </div>

              <p className="text-xs mt-1.5" style={{ color: A.mid }}>{line}</p>

              {p.stock !== null && p.stock !== undefined && p.stock > 0 && p.stock <= 5 && (
                <p className="text-xs mt-2 font-medium" style={{ color: A.amber }}>
                  Only {p.stock} left
                </p>
              )}

              <div className="mt-5">
                <AddButton product={p} cart={cart} owned={owned} inCart={inCart}
                  soldOut={soldOut} full size="md" />
              </div>

              {p.requires_shipping && (
                <p className="text-xs mt-3" style={{ color: A.mid }}>
                  Printed item. We will ask for a delivery address at checkout.
                </p>
              )}
            </div>
          </div>

          {p.description && (
            <div className="px-5 sm:px-6 pb-6 pt-2">
              <p className="text-sm whitespace-pre-line" style={{ color: A.muted, lineHeight: 1.65 }}>
                {p.description}
              </p>
            </div>
          )}

          {(p.tags?.length > 0 || p.grades?.length > 0) && (
            <div className="px-5 sm:px-6 pb-6 flex flex-wrap gap-1.5">
              {p.grades?.map((g) => (
                <span key={`g-${g}`} className="text-xs px-2.5 py-1 rounded-lg"
                  style={{ backgroundColor: A.lineSoft, color: A.mid }}>Grade {g}</span>
              ))}
              {p.tags?.map((t) => (
                <span key={`t-${t}`} className="text-xs px-2.5 py-1 rounded-lg"
                  style={{ backgroundColor: A.lineSoft, color: A.mid }}>{t}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── The cart ───────────────────────────────────────────────────────────────

function CartDrawer({ cart, onClose, onCheckout }) {
  useEffect(() => {
    const esc = (e) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", esc)
    return () => window.removeEventListener("keydown", esc)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex justify-end"
      style={{ backgroundColor: "rgba(8,24,42,0.45)" }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}
        className="bg-white w-full sm:max-w-md h-full flex flex-col">

        <div className="flex items-center justify-between px-5 py-4 border-b shrink-0" style={{ borderColor: A.line }}>
          <h2 className="font-bold" style={{ color: A.navy }}>
            Your cart {cart.count > 0 && <span style={{ color: A.subtle }}>({cart.count})</span>}
          </h2>
          <button onClick={onClose} className="p-2 -mr-2" aria-label="Close cart">
            <X size={18} style={{ color: A.mid }} />
          </button>
        </div>

        {cart.items.length === 0 ? (
          <div className="flex-1 grid place-items-center px-8 text-center">
            <div>
              <ShoppingBag size={30} className="mx-auto mb-3" style={{ color: A.subtle }} />
              <p className="font-semibold" style={{ color: A.navy }}>Nothing here yet</p>
              <p className="text-sm mt-1" style={{ color: A.mid }}>
                Add a book or a practice pack and it will show up here.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {cart.items.map((item) => {
                const p = item.marketplace_products
                const digital = ["course", "assessment", "download"].includes(p.kind)
                return (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0" style={{ backgroundColor: A.lineSoft }}>
                      {p.cover_image_url && (
                        <img src={p.cover_image_url} alt="" className="w-full h-full object-cover"
                          onError={(e) => { e.target.style.display = "none" }} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold leading-snug line-clamp-2" style={{ color: A.navy }}>
                        {p.title}
                      </p>
                      <p className="text-sm mt-0.5" style={{ color: A.mid }}>
                        {Number(p.price) <= 0 ? "Free" : formatMoney(p.price, p.currency)}
                      </p>

                      <div className="flex items-center gap-3 mt-2">
                        {digital ? (
                          // A second copy of a download grants nothing, so the
                          // stepper would only ever be a way to overpay
                          <span className="text-xs" style={{ color: A.subtle }}>One copy</span>
                        ) : (
                          <div className="flex items-center rounded-lg border" style={{ borderColor: A.line }}>
                            <button onClick={() => cart.setQuantity(item.id, item.quantity - 1)}
                              className="w-9 h-9 grid place-items-center" aria-label="One fewer">
                              <Minus size={13} style={{ color: A.mid }} />
                            </button>
                            <span className="w-7 text-center text-sm font-semibold" style={{ color: A.navy }}>
                              {item.quantity}
                            </span>
                            <button onClick={() => cart.setQuantity(item.id, item.quantity + 1)}
                              className="w-9 h-9 grid place-items-center" aria-label="One more">
                              <Plus size={13} style={{ color: A.mid }} />
                            </button>
                          </div>
                        )}
                        <button onClick={() => cart.remove(item.id)}
                          className="text-xs flex items-center gap-1" style={{ color: A.subtle }}>
                          <Trash2 size={12} /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="border-t px-5 py-4 shrink-0" style={{ borderColor: A.line }}>
              <div className="flex items-baseline justify-between mb-3">
                <span className="text-sm" style={{ color: A.mid }}>Total</span>
                <span className="text-xl font-bold" style={{ color: A.navy }}>
                  {cart.subtotal <= 0 ? "Free" : formatMoney(cart.subtotal)}
                </span>
              </div>
              <Btn full onClick={onCheckout}>
                {cart.subtotal <= 0 ? "Add these to my account" : "Go to checkout"}
                <ArrowRight size={15} />
              </Btn>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

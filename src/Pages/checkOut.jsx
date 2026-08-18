import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { usePaystackPayment } from "react-paystack"
import {
  ShoppingBag, ArrowLeft, Truck, CheckCircle2, Loader2, CreditCard, ArrowRight,
} from "lucide-react"
import { checkout, confirmOrderPayment, formatMoney } from "../lib/shopApi"
import { useCart } from "../store/CartContext"
import { A } from "../lib/appTheme"
import { Page, PageHead, Notice, Btn } from "../Components/common/PageShell"

// Checkout, in three states on one page: review, pay, done.
//
// It is one page rather than a wizard because the whole thing is short, and
// because every screen a student has to come back from is a screen they can
// abandon. The order exists in the database before payment opens, so a
// dropped connection leaves something to pick up rather than nothing.

const profile = () => {
  try { return JSON.parse(localStorage.getItem("user") || "{}") } catch { return {} }
}

export default function Checkout() {
  const navigate = useNavigate()
  const cart = useCart()
  const me = profile()

  const [delivery, setDelivery] = useState({
    name: `${me.first_name || me.firstName || ""} ${me.last_name || me.lastName || ""}`.trim(),
    phone: me.mobile || me.phone || me.mobile_number || "",
    address: "", city: "", note: "",
  })
  const [order, setOrder] = useState(null)
  const [busy, setBusy]   = useState(false)
  const [error, setError] = useState("")

  const set = (k) => (e) => setDelivery((d) => ({ ...d, [k]: e.target.value }))

  // Nothing to check out, and no order made yet, means they arrived here by
  // the back button. Send them to the shop rather than showing an empty form.
  useEffect(() => {
    if (!cart.loading && cart.items.length === 0 && !order) {
      navigate("/marketplace", { replace: true })
    }
  }, [cart.loading, cart.items.length, order, navigate])

  const placeOrder = async () => {
    setError(""); setBusy(true)
    try {
      const { order } = await checkout(cart.needsDelivery ? delivery : {})
      setOrder(order)
      await cart.refresh()
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  if (order?.status === "paid") return <Done order={order} />

  if (order) {
    return (
      <Page>
        <PageHead title="Payment" sub={`Order ${order.reference}`} />
        <PayPanel order={order} onPaid={(o) => setOrder(o)} />
      </Page>
    )
  }

  return (
    <Page>
      <button onClick={() => navigate("/marketplace")}
        className="flex items-center gap-1.5 text-sm mb-4" style={{ color: A.mid }}>
        <ArrowLeft size={15} /> Back to the shop
      </button>

      <PageHead title="Checkout" sub="Check this over, then pay." />

      {error && <Notice tone="bad">{error}</Notice>}

      <div className="grid lg:grid-cols-[1fr_320px] gap-5 items-start">
        <div className="space-y-5">
          <section className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: A.line }}>
            <h2 className="px-5 py-3.5 text-sm font-bold border-b" style={{ color: A.navy, borderColor: A.line }}>
              What you are buying
            </h2>
            <div className="divide-y" style={{ borderColor: A.lineSoft }}>
              {cart.items.map((item) => {
                const p = item.marketplace_products
                return (
                  <div key={item.id} className="flex items-center gap-3 px-5 py-3.5">
                    <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0" style={{ backgroundColor: A.lineSoft }}>
                      {p.cover_image_url && (
                        <img src={p.cover_image_url} alt="" className="w-full h-full object-cover"
                          onError={(e) => { e.target.style.display = "none" }} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium leading-snug" style={{ color: A.navy }}>{p.title}</p>
                      {item.quantity > 1 && (
                        <p className="text-xs mt-0.5" style={{ color: A.subtle }}>{item.quantity} copies</p>
                      )}
                    </div>
                    <span className="text-sm font-semibold shrink-0" style={{ color: A.navy }}>
                      {Number(p.price) <= 0 ? "Free" : formatMoney(p.price * item.quantity, p.currency)}
                    </span>
                  </div>
                )
              })}
            </div>
          </section>

          {cart.needsDelivery && (
            <section className="bg-white rounded-2xl border p-5" style={{ borderColor: A.line }}>
              <div className="flex items-center gap-2 mb-1">
                <Truck size={16} style={{ color: A.mid }} />
                <h2 className="text-sm font-bold" style={{ color: A.navy }}>Where should we send it</h2>
              </div>
              <p className="text-xs mb-4" style={{ color: A.mid }}>
                One of your items is printed, so we need somewhere to deliver it.
              </p>

              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="Who is receiving it" value={delivery.name} onChange={set("name")}
                  placeholder="Full name" />
                <Field label="Phone we can call" value={delivery.phone} onChange={set("phone")}
                  placeholder="024 000 0000" type="tel" />
                <Field label="Where to deliver" value={delivery.address} onChange={set("address")}
                  placeholder="House number, street, area" className="sm:col-span-2" required />
                <Field label="Town or city" value={delivery.city} onChange={set("city")}
                  placeholder="Accra" />
                <Field label="Anything else we should know" value={delivery.note} onChange={set("note")}
                  placeholder="A landmark helps" />
              </div>
            </section>
          )}
        </div>

        <aside className="bg-white rounded-2xl border p-5 lg:sticky lg:top-6" style={{ borderColor: A.line }}>
          <div className="flex items-baseline justify-between mb-1">
            <span className="text-sm" style={{ color: A.mid }}>
              {cart.count} item{cart.count === 1 ? "" : "s"}
            </span>
            <span className="text-2xl font-bold" style={{ color: A.navy }}>
              {cart.subtotal <= 0 ? "Free" : formatMoney(cart.subtotal)}
            </span>
          </div>
          <p className="text-xs mb-4" style={{ color: A.subtle }}>
            {cart.needsDelivery ? "Delivery is arranged after we pack it." : "Everything here is digital."}
          </p>

          <Btn full disabled={busy} onClick={placeOrder}>
            {busy
              ? <><Loader2 size={15} className="animate-spin" /> Setting up your order...</>
              : cart.subtotal <= 0
                ? <><ShoppingBag size={15} /> Add these to my account</>
                : <><CreditCard size={15} /> Pay {formatMoney(cart.subtotal)}</>}
          </Btn>
        </aside>
      </div>
    </Page>
  )
}

function Field({ label, value, onChange, placeholder, type = "text", className = "", required }) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-xs font-medium mb-1.5" style={{ color: A.muted }}>
        {label}{required && <span style={{ color: A.red }}> *</span>}
      </span>
      <input
        type={type} value={value} onChange={onChange} placeholder={placeholder}
        className="w-full px-3.5 rounded-xl border bg-white focus:outline-none"
        style={{ borderColor: A.line, color: A.ink, height: 46, fontSize: 16 }}
      />
    </label>
  )
}

// ── Paying ─────────────────────────────────────────────────────────────────

function PayPanel({ order, onPaid }) {
  const navigate = useNavigate()
  const cart = useCart()
  const [busy, setBusy]   = useState(false)
  const [error, setError] = useState("")
  const key = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY
  const me  = profile()

  const initialise = usePaystackPayment({
    publicKey: key || "",
    email: me.email || "",
    amount: Math.round(Number(order.total || 0) * 100),   // Paystack works in pesewas
    currency: order.currency || "GHS",
    reference: `${order.reference}-${Date.now()}`,
  })

  return (
    <div className="max-w-md">
      <div className="bg-white rounded-2xl border p-5 mb-4" style={{ borderColor: A.line }}>
        <p className="text-sm" style={{ color: A.mid }}>Amount due</p>
        <p className="text-3xl font-bold mt-1" style={{ color: A.navy }}>
          {formatMoney(order.total, order.currency)}
        </p>
        <p className="text-xs mt-2" style={{ color: A.subtle }}>
          Mobile money and card both work. Your order is saved as {order.reference}, so you can
          come back to it from Payments if anything goes wrong here.
        </p>
      </div>

      {error && <Notice tone="bad">{error}</Notice>}

      {key ? (
        <Btn full disabled={busy} onClick={() => {
          setError(""); setBusy(true)
          initialise({
            onSuccess: async (ref) => {
              try {
                await confirmOrderPayment(order.id, ref.reference || ref.trxref)
                await cart.refresh()
                onPaid({ ...order, status: "paid" })
              } catch (e) {
                // The money left their account. Never let this look like a
                // failed payment, and always give them the reference.
                setError(
                  `Your payment went through but we could not record it. ` +
                  `Send us this reference and we will sort it: ${ref.reference || ref.trxref}`
                )
              } finally { setBusy(false) }
            },
            onClose: () => setBusy(false),
          })
        }}>
          {busy
            ? <><Loader2 size={15} className="animate-spin" /> Opening payment...</>
            : <><CreditCard size={15} /> Pay {formatMoney(order.total, order.currency)}</>}
        </Btn>
      ) : (
        <Notice tone="warn">
          Card payment is not switched on yet. Your order {order.reference} is saved. Send us the
          reference and we will confirm it manually.
        </Notice>
      )}

      <button onClick={() => navigate("/payments")}
        className="mt-4 text-sm flex items-center gap-1.5" style={{ color: A.mid }}>
        Pay this later <ArrowRight size={14} />
      </button>
    </div>
  )
}

// ── Done ───────────────────────────────────────────────────────────────────

function Done({ order }) {
  const navigate = useNavigate()
  const physical = order.fulfilment !== "none"
  const paid = Number(order.total) > 0

  return (
    <Page>
      <div className="max-w-md mx-auto text-center pt-8">
        <CheckCircle2 size={44} className="mx-auto mb-4" style={{ color: A.green }} />
        <h1 className="text-2xl font-bold" style={{ color: A.navy }}>
          {paid ? "Paid. It's yours." : "Added to your account."}
        </h1>
        <p className="text-sm mt-2" style={{ color: A.mid }}>
          {physical
            ? "Anything digital is available right now. We will be in touch about delivering the printed items."
            : "Everything is available right now."}
        </p>
        <p className="text-xs font-mono mt-3" style={{ color: A.subtle }}>{order.reference}</p>

        <div className="mt-7 space-y-2">
          <Btn full onClick={() => navigate("/my-library")}>Open my library</Btn>
          <Btn full variant="secondary" onClick={() => navigate("/marketplace")}>
            Back to the shop
          </Btn>
        </div>
      </div>
    </Page>
  )
}

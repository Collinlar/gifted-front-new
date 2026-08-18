import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { usePaystackPayment } from "react-paystack"
import {
  Receipt, CreditCard, CheckCircle2, Clock, Loader2, ShoppingBag,
  ClipboardList, ChevronDown, ChevronUp,
} from "lucide-react"
import { getMyOrders, confirmOrderPayment, formatMoney } from "../lib/shopApi"
import { getMyRegistrations, markPaid } from "../lib/registrationApi"
import { A, shortDate } from "../lib/appTheme"
import { Page, PageHead, FilterRow, Empty, Notice, Btn } from "../Components/common/PageShell"

// Payments.
//
// What this replaced: a page called Invoice whose Pay button called
// updatePayAfterInvoice, which set the row to paid without taking any money.
// It also read item.choice.assessment from a data shape that no longer
// exists, so most cards rendered blank anyway.
//
// A student owes money in two places now, registration fees and marketplace
// orders, and previously each had its own screen or none at all. This is the
// one place that answers "what do I owe" and "what have I paid".

export default function Payments() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [regs, setRegs]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState("")
  const [tab, setTab]       = useState("due")

  const [nonce, setNonce] = useState(0)
  const reload = () => setNonce((n) => n + 1)

  useEffect(() => {
    let alive = true
    ;(async () => {
      // Settled independently: registrations working while the marketplace
      // migration has not been run yet should still show what is owed.
      const [o, r] = await Promise.allSettled([getMyOrders(), getMyRegistrations()])
      if (!alive) return

      if (o.status === "fulfilled") setOrders(o.value.orders)
      if (r.status === "fulfilled") setRegs(r.value.registrations)

      const failed = [o, r].filter((x) => x.status === "rejected")
      if (failed.length === 2) setError(failed[0].reason?.message || "We could not load your payments.")
      else setError("")

      setLoading(false)
    })()
    return () => { alive = false }
  }, [nonce])

  // One shape for two very different rows, so the list can be sorted and
  // filtered without every branch knowing where each item came from.
  const lines = [
    ...orders.map((o) => ({
      id: `order-${o.id}`,
      kind: "order",
      raw: o,
      title: describeOrder(o),
      reference: o.reference,
      amount: Number(o.total || 0),
      currency: o.currency || "GHS",
      paid: o.status === "paid",
      cancelled: o.status === "cancelled",
      at: o.paid_at || o.created_at,
      Icon: ShoppingBag,
    })),
    ...regs
      .filter((r) => r.payment_status && r.payment_status !== "not_required")
      .map((r) => ({
        id: `reg-${r.id}`,
        kind: "registration",
        raw: r,
        title: r.registration_forms?.title || "Programme registration",
        reference: r.reference,
        amount: Number(r.amount || 0),
        currency: r.registration_forms?.fee_currency || "GHS",
        paid: r.payment_status === "paid",
        cancelled: r.status === "rejected" || r.status === "withdrawn",
        at: r.paid_at || r.created_at,
        Icon: ClipboardList,
      })),
  ].sort((a, b) => new Date(b.at) - new Date(a.at))

  const due  = lines.filter((l) => !l.paid && !l.cancelled && l.amount > 0)
  const done = lines.filter((l) => l.paid)
  const owed = due.reduce((n, l) => n + l.amount, 0)

  const shown = tab === "due" ? due : tab === "paid" ? done : lines

  return (
    <Page>
      <PageHead
        title="Payments"
        sub="What you owe, and what you have already paid for."
      />

      {error && <Notice tone="bad">{error}</Notice>}

      {owed > 0 && (
        <div className="rounded-2xl border px-5 py-4 mb-5"
          style={{ borderColor: "#FDE68A", backgroundColor: A.amberSoft }}>
          <p className="text-sm" style={{ color: A.amber }}>Outstanding</p>
          <p className="text-2xl font-bold mt-0.5" style={{ color: A.amber }}>{formatMoney(owed)}</p>
          <p className="text-xs mt-1" style={{ color: A.amber }}>
            Across {due.length} item{due.length === 1 ? "" : "s"}. Mobile money and card both work.
          </p>
        </div>
      )}

      <FilterRow
        className="mb-5"
        value={tab}
        onChange={setTab}
        options={[
          { value: "due",  label: "To pay",   count: due.length },
          { value: "paid", label: "Paid",     count: done.length },
          { value: "all",  label: "Everything", count: lines.length },
        ]}
      />

      {loading ? (
        <div className="flex items-center gap-2 justify-center py-16 text-sm" style={{ color: A.mid }}>
          <Loader2 size={16} className="animate-spin" /> Checking your account...
        </div>
      ) : shown.length === 0 ? (
        <Empty
          icon={Receipt}
          title={tab === "due" ? "Nothing to pay" : tab === "paid" ? "No payments yet" : "Nothing here yet"}
          line={tab === "due"
            ? "You are all settled. Anything you owe later will appear here."
            : "Registration fees and shop orders both show up on this page."}
          action={tab !== "due" && <Btn onClick={() => navigate("/marketplace")}>Visit the shop</Btn>}
        />
      ) : (
        <div className="space-y-2.5">
          {shown.map((line) => <PaymentRow key={line.id} line={line} onSettled={reload} />)}
        </div>
      )}
    </Page>
  )
}

function describeOrder(o) {
  const items = o.order_items || []
  if (items.length === 0) return "Shop order"
  if (items.length === 1) return items[0].title
  return `${items[0].title} and ${items.length - 1} more`
}

// ── One line ───────────────────────────────────────────────────────────────

function PaymentRow({ line, onSettled }) {
  const [open, setOpen] = useState(false)
  const Icon = line.Icon
  const items = line.raw.order_items || []

  return (
    <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: A.line }}>
      <div className="px-5 py-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl grid place-items-center shrink-0"
            style={{ backgroundColor: line.paid ? A.greenSoft : A.lineSoft }}>
            <Icon size={16} style={{ color: line.paid ? A.green : A.mid }} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="font-semibold leading-snug" style={{ color: A.navy }}>{line.title}</p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 text-xs" style={{ color: A.subtle }}>
              {line.reference && <span className="font-mono">{line.reference}</span>}
              <span>{shortDate(line.at)}</span>
              <span>{line.kind === "order" ? "Shop" : "Registration"}</span>
            </div>
          </div>

          <div className="text-right shrink-0">
            <p className="font-bold" style={{ color: A.navy }}>
              {formatMoney(line.amount, line.currency)}
            </p>
            <span className="inline-flex items-center gap-1 text-xs font-semibold mt-0.5"
              style={{ color: line.paid ? A.green : line.cancelled ? A.subtle : A.amber }}>
              {line.paid ? <><CheckCircle2 size={11} /> Paid</>
                : line.cancelled ? "Closed"
                : <><Clock size={11} /> Due</>}
            </span>
          </div>
        </div>

        {!line.paid && !line.cancelled && line.amount > 0 && (
          <div className="mt-3">
            <PayNow line={line} onSettled={onSettled} />
          </div>
        )}

        {items.length > 0 && (
          <button onClick={() => setOpen((v) => !v)}
            className="mt-2.5 text-xs flex items-center gap-1" style={{ color: A.mid }}>
            {open ? <>Hide items <ChevronUp size={12} /></> : <>See what's in it <ChevronDown size={12} /></>}
          </button>
        )}
      </div>

      {open && items.length > 0 && (
        <div className="border-t px-5 py-3 space-y-1.5" style={{ borderColor: A.lineSoft, backgroundColor: A.lineSoft }}>
          {items.map((it) => (
            <div key={it.id} className="flex justify-between text-sm">
              <span style={{ color: A.muted }}>
                {it.title}{it.quantity > 1 ? ` × ${it.quantity}` : ""}
              </span>
              <span style={{ color: A.navy }}>{formatMoney(it.line_total, line.currency)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// The one place money actually moves. Both kinds of line settle through their
// own narrow server function, neither of which the browser can talk into
// marking something paid that was not.
function PayNow({ line, onSettled }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const key = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY
  const me = (() => { try { return JSON.parse(localStorage.getItem("user") || "{}") } catch { return {} } })()

  const initialise = usePaystackPayment({
    publicKey: key || "",
    email: me.email || "",
    amount: Math.round(line.amount * 100),
    currency: line.currency,
    reference: `${line.reference || "PAY"}-${Date.now()}`,
  })

  if (!key) {
    return (
      <p className="text-xs" style={{ color: A.mid }}>
        Card payment is not switched on yet. Send us {line.reference} and we will confirm it.
      </p>
    )
  }

  return (
    <>
      <Btn size="sm" disabled={busy} onClick={() => {
        setError(""); setBusy(true)
        initialise({
          onSuccess: async (ref) => {
            const reference = ref.reference || ref.trxref
            try {
              if (line.kind === "order") await confirmOrderPayment(line.raw.id, reference)
              else                       await markPaid(line.raw.id, reference)
              onSettled()
            } catch {
              setError(`Payment went through but we could not record it. Send us this reference: ${reference}`)
            } finally { setBusy(false) }
          },
          onClose: () => setBusy(false),
        })
      }}>
        {busy ? <Loader2 size={14} className="animate-spin" /> : <CreditCard size={14} />}
        Pay {formatMoney(line.amount, line.currency)}
      </Btn>
      {error && <p className="text-xs mt-2" style={{ color: A.red }}>{error}</p>}
    </>
  )
}

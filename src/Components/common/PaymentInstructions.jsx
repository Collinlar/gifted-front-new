import { CreditCard } from "lucide-react"
import { A } from "../../lib/appTheme"

// How to pay, wherever the student is standing.
//
// The admin sets this per form: a note with the momo details and a link that
// becomes a button. It was only wired into the screen shown straight after
// registering, so anyone who came back later through My Registrations or
// Payments saw what they owed and nothing about how to settle it. Those two
// screens still carried a line saying we would confirm the payment, with no
// way for them to make one.
//
// One component so the three screens cannot drift apart again.

export default function PaymentInstructions({
  amount, currency = "GHS", reference,
  note, linkUrl, linkLabel,
  compact = false,
}) {
  const money = `${currency} ${amount}`
  const hasGuidance = Boolean(note || linkUrl)

  return (
    <div className={compact ? "" : "rounded-xl px-4 py-3.5 border"}
      style={compact ? undefined : { backgroundColor: A.amberSoft, borderColor: "#FDE68A" }}>

      {!compact && (
        <p className="text-sm font-medium" style={{ color: A.amber }}>
          {money} still to pay.
        </p>
      )}

      {note && (
        <p className={`text-sm whitespace-pre-line ${compact ? "" : "mt-2"}`}
          style={{ color: compact ? A.muted : A.amber }}>
          {note}
        </p>
      )}

      {linkUrl && (
        <a href={linkUrl} target="_blank" rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-white text-sm font-semibold"
          style={{ backgroundColor: "#1D9E75" }}>
          <CreditCard size={15} />
          {linkLabel || `Pay ${money}`}
        </a>
      )}

      {/* Nothing configured on this form. Say what is true rather than
          promising a link that nothing is going to send. */}
      {!hasGuidance && (
        <p className={`text-sm ${compact ? "" : "mt-2"}`} style={{ color: compact ? A.muted : A.amber }}>
          Your place is held. Quote {reference || "your reference"} when you pay, and
          contact us if you are not sure how.
        </p>
      )}
    </div>
  )
}

import { A } from "../../lib/appTheme"

// The frame every signed-in page sits in.
//
// Pages used to each invent their own container, which is why one had a
// centred four-line hero, another a sticky glass header and a third neither.
// The heading is left aligned and one line deep: a working page does not need
// to introduce itself three times before showing anything.

export function Page({ children, wide = false }) {
  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: A.ground }}>
      <div className={`mx-auto px-4 sm:px-6 py-6 sm:py-8 ${wide ? "max-w-7xl" : "max-w-5xl"}`}>
        {children}
      </div>
    </div>
  )
}

export function PageHead({ title, sub, actions }) {
  return (
    <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
      <div className="min-w-0">
        <h1 className="text-2xl sm:text-3xl font-bold leading-tight" style={{ color: A.navy }}>
          {title}
        </h1>
        {sub && <p className="text-sm mt-1.5 max-w-2xl" style={{ color: A.mid }}>{sub}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  )
}

/** Horizontal pill filters. One row, scrollable on a phone, never wrapping into a wall. */
export function FilterRow({ options, value, onChange, className = "" }) {
  return (
    <div className={`flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 ${className}`}
      style={{ scrollbarWidth: "none" }}>
      {options.map((o) => {
        const active = value === o.value
        return (
          <button
            key={o.value ?? "all"}
            onClick={() => onChange(o.value)}
            className="shrink-0 px-3.5 py-2 rounded-full text-sm font-medium border transition-colors"
            style={active
              ? { backgroundColor: A.navy, color: "#fff", borderColor: A.navy }
              : { backgroundColor: A.surface, color: A.mid, borderColor: A.line }}
          >
            {o.label}
            {o.count !== undefined && (
              <span className="ml-1.5 text-xs" style={{ opacity: 0.7 }}>{o.count}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}

export function Empty({ icon: Icon, title, line, action }) {
  return (
    <div className="rounded-2xl bg-white border py-14 px-6 text-center" style={{ borderColor: A.line }}>
      {Icon && <Icon size={28} className="mx-auto mb-3" style={{ color: A.subtle }} />}
      <p className="font-semibold" style={{ color: A.navy }}>{title}</p>
      {line && <p className="text-sm mt-1.5 max-w-sm mx-auto" style={{ color: A.mid }}>{line}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function Notice({ tone = "info", children }) {
  const tones = {
    info:    { bg: "#EFF6FF", border: "#BFDBFE", text: "#1D4ED8" },
    good:    { bg: A.greenSoft, border: "#A7F3D0", text: A.green },
    warn:    { bg: A.amberSoft, border: "#FDE68A", text: A.amber },
    bad:     { bg: A.redSoft,   border: "#FECACA", text: A.red },
  }
  const t = tones[tone] || tones.info
  return (
    <div className="rounded-xl px-4 py-3 text-sm border mb-4"
      style={{ backgroundColor: t.bg, borderColor: t.border, color: t.text }}>
      {children}
    </div>
  )
}

/** Minimum 44px tall everywhere, because most of this is used on a phone. */
export function Btn({ children, onClick, variant = "primary", size = "md", disabled, className = "", type = "button", full }) {
  const base = "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors disabled:opacity-55 disabled:cursor-not-allowed"
  const sizes = { sm: "px-3.5 py-2 text-sm min-h-[38px]", md: "px-5 py-2.5 text-sm min-h-[44px]" }
  const styles = {
    primary:   { backgroundColor: A.navy, color: "#fff", border: `1px solid ${A.navy}` },
    secondary: { backgroundColor: A.surface, color: A.navy, border: `1px solid ${A.line}` },
    quiet:     { backgroundColor: "transparent", color: A.mid, border: "1px solid transparent" },
    danger:    { backgroundColor: A.surface, color: A.red, border: `1px solid #FECACA` },
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`${base} ${sizes[size]} ${full ? "w-full" : ""} ${className}`}
      style={styles[variant]}>
      {children}
    </button>
  )
}

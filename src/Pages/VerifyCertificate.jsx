import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { ShieldCheck, ShieldX, Loader2, Search } from "lucide-react"
import { supabase } from "../lib/supabase"

const NAVY = "#003366"
const MID  = "#336699"

// Public page. Anyone with a serial can check a certificate, which is the whole
// point of printing one on the document.
//
// It shows only what the certificate already shows on its face. Serials are
// sequential and quotable, so anything extra here would be a way to harvest
// details about students by walking the range.
export default function VerifyCertificate() {
  const { serial: routeSerial } = useParams()
  const [serial, setSerial] = useState(routeSerial || "")
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(!!routeSerial)
  const [error, setError]   = useState("")

  const check = async (value) => {
    const s = String(value || "").trim()
    if (!s) return
    setLoading(true); setError(""); setResult(null)
    try {
      const { data, error: rpcError } = await supabase.rpc("verify_certificate", { p_serial: s })
      if (rpcError) throw rpcError
      setResult(data)
    } catch {
      setError("We could not check that just now. Try again in a moment.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { if (routeSerial) check(routeSerial) }, [routeSerial])

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-12" style={{ backgroundColor: "#F0F4F8" }}>
      <div className="w-full max-w-md">

        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-1" style={{ color: NAVY }}>Check a certificate</h1>
          <p className="text-sm" style={{ color: MID }}>
            Enter the certificate number printed on the document.
          </p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); check(serial) }}
          className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
          <div className="relative">
            <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: MID }} />
            <input
              value={serial}
              onChange={(e) => setSerial(e.target.value.toUpperCase())}
              placeholder="GHSTEM-2026-0042"
              className="w-full pl-10 pr-4 py-3 rounded-xl border font-mono uppercase tracking-wider text-base focus:outline-none focus:ring-2"
              style={{ borderColor: "#33669930" }}
            />
          </div>

          <button type="submit" disabled={loading || !serial.trim()}
            className="w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ backgroundColor: NAVY }}>
            {loading
              ? <><Loader2 size={16} className="animate-spin" /> Checking the record...</>
              : "Check this certificate"}
          </button>

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}
        </form>

        {result && !loading && (
          <div className="mt-4 bg-white rounded-2xl shadow-lg p-6">
            {!result.found ? (
              <div className="text-center">
                <ShieldX size={34} className="mx-auto mb-3 text-red-500" />
                <p className="font-semibold text-lg mb-1" style={{ color: NAVY }}>No record found</p>
                <p className="text-sm text-gray-600">
                  We have no certificate with that number. Check the spelling, or ask whoever
                  issued it to confirm.
                </p>
              </div>
            ) : result.revoked ? (
              <div className="text-center">
                <ShieldX size={34} className="mx-auto mb-3 text-red-500" />
                <p className="font-semibold text-lg mb-1" style={{ color: NAVY }}>This certificate was withdrawn</p>
                <p className="text-sm text-gray-600 mb-4">
                  It was issued and has since been withdrawn, so it is no longer valid.
                </p>
                <Detail label="Certificate" value={result.serial} mono />
                <Detail label="Withdrawn on" value={new Date(result.revokedAt).toLocaleDateString(undefined, { dateStyle: "long" })} />
              </div>
            ) : (
              <div>
                <div className="text-center mb-4">
                  <ShieldCheck size={34} className="mx-auto mb-3 text-emerald-500" />
                  <p className="font-semibold text-lg" style={{ color: NAVY }}>This certificate is genuine</p>
                </div>
                <Detail label="Awarded to" value={result.name} strong />
                <Detail label="For" value={result.exam} />
                {result.band && <Detail label="Award" value={result.band} />}
                <Detail label="Issued on" value={new Date(result.issuedAt).toLocaleDateString(undefined, { dateStyle: "long" })} />
                <Detail label="Certificate" value={result.serial} mono />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function Detail({ label, value, mono, strong }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-2 border-b border-gray-100 last:border-0">
      <span className="text-xs text-gray-500 shrink-0">{label}</span>
      <span className={`text-sm text-right ${mono ? "font-mono" : ""} ${strong ? "font-semibold" : ""}`}
        style={{ color: "#1F2937" }}>
        {value}
      </span>
    </div>
  )
}

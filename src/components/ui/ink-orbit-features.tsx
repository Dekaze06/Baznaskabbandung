"use client"

// The features section from ink-orbit-saas-template, standalone: a hatched
// page and a bento of three live diagrams — your team's edits flowing through a
// hub into a stack of reports that keeps printing, an integrations hub that
// syncs one tool at a time, and a forecast chart you can scrub.
//
// No dependencies, no assets. React is the only import.

import React from "react"

export type InkFeatureCopy = { title: string; description: string }
export type InkFeatures = {
  tag: string
  /** `*word*` sets a word in the muted tone; `\n` breaks the line. */
  title: string
  collaboration: InkFeatureCopy
  reports: InkFeatureCopy
  integrations: InkFeatureCopy & { tools: string[] }
  insights: InkFeatureCopy & { values: number[]; forecastFrom: number }
}

export type InkOrbitFeaturesProps = {
  /** `auto` follows prefers-color-scheme. */
  theme?: "light" | "dark" | "auto"
  /** Shown on the hub chip in the flow diagram (first word, uppercased). */
  brand?: string
  tag?: string
  title?: string
  collaboration?: { [K in keyof InkFeatureCopy]?: InkFeatureCopy[K] }
  reports?: { [K in keyof InkFeatureCopy]?: InkFeatureCopy[K] }
  integrations?: { [K in keyof InkFeatures["integrations"]]?: InkFeatures["integrations"][K] }
  insights?: { [K in keyof InkFeatures["insights"]]?: InkFeatures["insights"][K] }
  className?: string
  style?: React.CSSProperties
  onlyFlow?: boolean
  showIntegrations?: boolean
  showInsights?: boolean
  isBridge?: boolean
}

/* ------------------------------------------------------------------ logic */

// #region logic
function clamp(v: number, a: number, b: number): number {
  return Math.min(b, Math.max(a, v))
}

// Smooth line + closed area through values, inside a w×h box.
function chartPaths(values: number[], w: number, h: number, pad: number) {
  const n = values.length
  const lo = Math.min(...values)
  const hi = Math.max(...values)
  const span = hi - lo || 1
  const pts = values.map((v, i) => [
    pad + (n < 2 ? 0 : (i / (n - 1)) * (w - pad * 2)),
    h - pad - ((v - lo) / span) * (h - pad * 2),
  ] as [number, number])
  let line = ""
  pts.forEach(([x, y], i) => {
    if (i === 0) {
      line = "M" + x.toFixed(1) + "," + y.toFixed(1)
      return
    }
    const [px, py] = pts[i - 1]
    const cx = (px + x) / 2
    line += " C" + cx.toFixed(1) + "," + py.toFixed(1) + " " + cx.toFixed(1) + "," + y.toFixed(1) + " " + x.toFixed(1) + "," + y.toFixed(1)
  })
  const area = n ? line + " L" + pts[n - 1][0].toFixed(1) + "," + (h - pad) + " L" + pts[0][0].toFixed(1) + "," + (h - pad) + " Z" : ""
  return { line, area, points: pts }
}

function nearestIndex(xs: number[], x: number): number {
  let best = 0
  for (let i = 1; i < xs.length; i++) if (Math.abs(xs[i] - x) < Math.abs(xs[best] - x)) best = i
  return best
}

// "Smart *Workflow*\nAutomation" → lines of { text, muted } runs.
function parseTitle(s: string): { text: string; muted: boolean }[][] {
  return s.split(/\r?\n|\\n/).map((line) => {
    const out: { text: string; muted: boolean }[] = []
    line.split("*").forEach((text, i) => {
      if (text) out.push({ text, muted: i % 2 === 1 })
    })
    return out
  })
}
// #endregion logic

/* --------------------------------------------------------------- defaults */

const D_FEATURES: InkFeatures = {
  tag: "Digitalisasi ZIS",
  title: "Tata Kelola *Amanah*\nDigital Berkelanjutan",
  collaboration: {
    title: "Sinkronisasi Terpadu 31 UPZ",
    description: "Pendataan mustahik dan muzaki dari 31 kecamatan dan 270 desa tersinkronisasi otomatis dalam satu ekosistem.",
  },
  reports: {
    title: "Pelaporan Keuangan Otomatis",
    description: "Penerbitan Bukti Setor Zakat (BSZ) resmi bernomor nasional dan laporan keuangan standar PSAK 109 secara instan.",
  },
  integrations: {
    title: "Integrasi Multi-Kanal Resmi",
    description: "Terhubung langsung dengan SIMBA BAZNAS RI, Dukcapil Kemendagri, QRIS Nasional, dan Perbankan Syariah mitra.",
    tools: ["SiMBA", "Dukcapil", "QRIS", "BJB Syariah"],
  },
  insights: {
    title: "Prediksi & Efektivitas Penyaluran",
    description: "Analisis saintifik model CIBEST dan Had Kifayah untuk memproyeksikan pengentasan kemiskinan ekstrem.",
    values: [28, 31, 35, 42, 38, 45, 49, 52, 58, 64, 72, 85],
    forecastFrom: 8,
  },
}

/* -------------------------------------------------------------- component */

export default function InkOrbitFeatures({
  theme = "auto",
  brand = "BAZNAS KAB. BANDUNG",
  tag = D_FEATURES.tag,
  title = D_FEATURES.title,
  collaboration,
  reports,
  integrations,
  insights,
  onlyFlow = false,
  showIntegrations = true,
  showInsights = true,
  isBridge = false,
  className = "",
  style,
}: InkOrbitFeaturesProps) {
  const uid = "ib" + React.useId().replace(/[^a-zA-Z0-9]/g, "")
  const F: InkFeatures = {
    tag,
    title,
    collaboration: { ...D_FEATURES.collaboration, ...collaboration },
    reports: { ...D_FEATURES.reports, ...reports },
    integrations: { ...D_FEATURES.integrations, ...integrations },
    insights: { ...D_FEATURES.insights, ...insights },
  }

  const [dark, setDark] = React.useState(theme === "dark")
  const [reduced, setReduced] = React.useState(false)
  React.useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) {
      setDark(theme === "dark")
      return
    }
    const scheme = window.matchMedia("(prefers-color-scheme: dark)")
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)")
    const sync = () => {
      setDark(theme === "auto" ? scheme.matches : theme === "dark")
      setReduced(motion.matches)
    }
    sync()
    scheme.addEventListener?.("change", sync)
    motion.addEventListener?.("change", sync)
    return () => {
      scheme.removeEventListener?.("change", sync)
      motion.removeEventListener?.("change", sync)
    }
  }, [theme])

  const [featRef, featIn] = useInView(0.12)

  return (
    <div className={"ib-root " + className} data-theme={dark ? "dark" : "light"} style={style}>
      <style>{IB_CSS}</style>
      <div className="ib-shell">
        <section className="ib-sec" aria-labelledby={uid + "feat"}>
          <div className="ib-reveal" ref={featRef as never} data-in={featIn}>
            <div className="ib-head" id={uid + "feat"}>
              {F.tag && <span className="ib-tag">{F.tag}</span>}
              <Title text={F.title} />
            </div>
            <div className={"ib-bento" + (onlyFlow || (!showIntegrations && !showInsights) ? " ib-bento-single" : "")}>
              <FlowCard brand={brand} features={F} uid={uid} reduced={reduced} inView={featIn} isBridge={isBridge} />
              {!onlyFlow && showIntegrations && <IntegrationsCard copy={F.integrations} reduced={reduced} />}
              {!onlyFlow && showInsights && <InsightsCard copy={F.insights} uid={uid} reduced={reduced} />}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- pieces */

// true once the element has been on screen
function useInView(threshold = 0.2) {
  const ref = React.useRef<HTMLElement | null>(null)
  const [inView, setInView] = React.useState(false)
  React.useEffect(() => {
    const el = ref.current
    if (!el || inView) return
    if (typeof IntersectionObserver !== "function") {
      setInView(true)
      return
    }
    const io = new IntersectionObserver(
      (es) => {
        if (es.some((e) => e.isIntersecting)) {
          setInView(true)
          io.disconnect()
        }
      },
      { threshold },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [inView, threshold])
  return [ref, inView] as const
}

function Brackets() {
  return (
    <>
      <span className="ib-c ib-c-tl" aria-hidden="true" />
      <span className="ib-c ib-c-tr" aria-hidden="true" />
      <span className="ib-c ib-c-bl" aria-hidden="true" />
      <span className="ib-c ib-c-br" aria-hidden="true" />
    </>
  )
}

function Title({ text, className = "ib-h2", as = "h2" }: { text: string; className?: string; as?: "h2" | "h3" }) {
  const Tag = as
  return (
    <Tag className={className}>
      {parseTitle(text).map((line, i) => (
        <span key={i}>
          {line.map((run, j) => (
            <React.Fragment key={j}>{run.muted ? <span className="ib-muted" style={{ display: "inline" }}>{run.text}</span> : run.text}</React.Fragment>
          ))}
        </span>
      ))}
    </Tag>
  )
}

function Mark({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* drawn portraits — greyscale, so they sit in the palette */
const PORTRAITS = [
  { hair: "short", beard: true, glasses: false, skin: "#b9b4ae", hairC: "#2b2a29", shirt: "#3a3a3a", bg: "#d9d6d2" },
  { hair: "long", beard: false, glasses: false, skin: "#d6d0c9", hairC: "#8d7f6c", shirt: "#7b7b7b", bg: "#e6e3df" },
  { hair: "buzz", beard: false, glasses: true, skin: "#a7a19a", hairC: "#3d3c3a", shirt: "#1f1f1f", bg: "#cfcfcf" },
  { hair: "bun", beard: false, glasses: true, skin: "#9a8f84", hairC: "#1e1d1c", shirt: "#5a5a5a", bg: "#dedbd6" },
  { hair: "curly", beard: false, glasses: false, skin: "#7f746a", hairC: "#1a1918", shirt: "#8a8a8a", bg: "#d3d0cb" },
  { hair: "side", beard: true, glasses: true, skin: "#c7c0b8", hairC: "#5b5650", shirt: "#2c2c2c", bg: "#e1ded9" },
]

function Portrait({ index, size = 38, uid }: { index: number; size?: number; uid: string }) {
  const p = PORTRAITS[((index % PORTRAITS.length) + PORTRAITS.length) % PORTRAITS.length]
  const id = uid + "pt" + index
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={p.bg} />
          <stop offset="1" stopColor="#9d9a96" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" fill={"url(#" + id + ")"} />
      {p.hair === "long" && <path d="M18 30c0-12 6-19 14-19s14 7 14 19v20H18z" fill={p.hairC} />}
      {p.hair === "curly" &&
        [[22, 20], [28, 15], [36, 15], [42, 20], [45, 28], [19, 28]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="7" fill={p.hairC} />)}
      <path d="M8 64c2-12 12-18 24-18s22 6 24 18z" fill={p.shirt} />
      <rect x="27.5" y="36" width="9" height="11" rx="3" fill={p.skin} />
      <path d="M27.5 44c3 2.5 6 2.5 9 0v3h-9z" fill="#000" opacity=".12" />
      <ellipse cx="32" cy="28" rx="11" ry="13" fill={p.skin} />
      {p.hair === "short" && <path d="M21 25c0-9 5-13 11-13s11 4 11 13c-2-4-6-6-11-6s-9 2-11 6z" fill={p.hairC} />}
      {p.hair === "buzz" && <path d="M21.5 24c.5-8 5-11.5 10.5-11.5S42 16 42.5 24c-3-3-6.5-4-10.5-4s-7.5 1-10.5 4z" fill={p.hairC} opacity=".85" />}
      {p.hair === "bun" && (
        <>
          <circle cx="32" cy="11" r="6" fill={p.hairC} />
          <path d="M21 26c0-10 5-14 11-14s11 4 11 14c-2-5-6-7.5-11-7.5S23 21 21 26z" fill={p.hairC} />
        </>
      )}
      {p.hair === "long" && <path d="M21 27c0-10 5-15 11-15s11 5 11 15c-3-6-8-8-14-7-3 .5-6 3-8 7z" fill={p.hairC} />}
      {p.hair === "side" && <path d="M21 26c-1-9 5-14 12-14 6 0 11 4 10 12-4-5-10-6-17-3-2 1-4 3-5 5z" fill={p.hairC} />}
      {p.beard && <path d="M21.5 30c1 9 5 12 10.5 12s9.5-3 10.5-12c-2 4-5 5-10.5 5s-8.5-1-10.5-5z" fill={p.hairC} opacity=".9" />}
      <circle cx="27.5" cy="28" r="1.2" fill="#1a1a1a" />
      <circle cx="36.5" cy="28" r="1.2" fill="#1a1a1a" />
      {p.glasses && (
        <g fill="none" stroke="#1a1a1a" strokeWidth="1.1">
          <circle cx="27.5" cy="28" r="3.6" />
          <circle cx="36.5" cy="28" r="3.6" />
          <path d="M31.1 28h1.8" />
        </g>
      )}
      <path d="M29 34.5c1.8 1.2 4.2 1.2 6 0" fill="none" stroke="#1a1a1a" strokeWidth="1" strokeLinecap="round" opacity=".7" />
    </svg>
  )
}

function ToolGlyph({ index }: { index: number }) {
  const k = index % 4
  return (
    <g fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      {k === 0 && (
        <>
          <rect x="-6" y="-6" width="12" height="12" rx="1.5" />
          <path d="M-6 -2h12M-6 2h12M-1.5 -6v12" />
        </>
      )}
      {k === 1 && <path d="M-6.5 4 -2 -5h4l4.5 9zm2.4 0h9.2M-2 -5l4.5 9" />}
      {k === 2 && (
        <>
          <path d="M-4.5 -6.5h6l3 3v10h-9z" />
          <path d="M-2 0h4.5M-2 3h4.5" />
        </>
      )}
      {k === 3 && (
        <>
          <circle cx="-1" cy="-1" r="4.5" />
          <path d="M2.4 2.4 6 6" />
        </>
      )}
    </g>
  )
}

function FlowCard({
  brand,
  features,
  uid,
  reduced,
  inView,
  isBridge = false,
}: {
  brand: string
  features: InkFeatures
  uid: string
  reduced: boolean
  inView: boolean
  isBridge?: boolean
}) {
  const [reports, setReports] = React.useState(128)
  const [side, setSide] = React.useState<"" | "left" | "right">("")
  React.useEffect(() => {
    if (reduced || !inView || isBridge) return
    const t = setInterval(() => setReports((n) => n + 1), 2800)
    return () => clearInterval(t)
  }, [reduced, inView, isBridge])

  const muzakiList = [
    { x: 54, y: 44, name: "Muzaki Perorangan · Zakat Maal & Harta" },
    { x: 104, y: 34, name: "ASN Pemkab Bandung · Payroll Zakat Profesi" },
    { x: 154, y: 44, name: "Muzaki Korporasi · Zakat Perusahaan & CSR" },
    { x: 48, y: 104, name: "Muzaki Digital · Infaq QRIS SiMBA" },
    { x: 150, y: 110, name: "Munfiq & Agniya · Sedekah & Wakaf" },
  ]

  const mustahikList = [
    { x: 486, y: 44, name: "Santri & Pelajar Yatim · Beasiswa Bandung Cerdas" },
    { x: 536, y: 34, name: "Keluarga Prasejahtera & Lansia · Bantuan Bandung Peduli" },
    { x: 586, y: 44, name: "Pasien Dhuafa & Balita · Layanan Bandung Sehat" },
    { x: 490, y: 110, name: "Mustahik Produktif · Modal Usaha Bandung Makmur" },
    { x: 592, y: 104, name: "Guru Ngaji & Marbot · Insentif Bandung Taqwa" },
  ]

  const defaultTeam = [
    { x: 58, y: 38, name: "UPZ Soreang · entri dana" },
    { x: 104, y: 22, name: "Surveyor Ciwidey · verifikasi" },
    { x: 150, y: 40, name: "Bagian Keuangan · validasi BSZ" },
    { x: 46, y: 92, name: "Petugas Distribusi · lapangan" },
    { x: 146, y: 114, name: "Pimpinan · approval TTE" },
  ]

  const team = isBridge ? muzakiList : defaultTeam

  const L1 = isBridge ? "M117,67 C186,67 205,96 256,96" : "M117,67 C196,67 210,100 262,100"
  const L2 = isBridge ? "M117,73 C176,73 205,116 256,116" : "M117,73 C186,73 206,120 262,120"
  const R1 = isBridge ? "M384,96 C435,96 454,67 523,67" : "M378,100 C412,100 418,86 450,86"
  const R2 = isBridge ? "M384,116 C435,116 464,73 523,73" : "M378,120 C412,120 418,134 450,134"

  const chip = brand.split(" ")[0].toUpperCase()
  const chipLong = chip.length * 6.7 > 58
  const rays = uid + "rays"
  const glow = uid + "glow"
  return (
    <div className="ib-frame ib-frame-hover ib-wide">
      <Brackets />
      <div className="ib-card" style={{ padding: 0, overflow: "hidden" }}>
        <svg 
          className="ib-diagram" 
          viewBox="0 0 640 178" 
          role="img" 
          aria-label={isBridge ? "BAZNAS sebagai jembatan penghubung amanah antara Muzaki dan Mustahik" : "Alur data terverifikasi melalui " + brand + " menjadi laporan resmi terbit"}
        >
          <defs>
            <radialGradient id={glow} cx="320" cy="110" r="190" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="var(--ib-raise)" stopOpacity="1" />
              <stop offset="1" stopColor="var(--ib-raise)" stopOpacity="0" />
            </radialGradient>
            <linearGradient id={rays} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="var(--ib-line-strong)" stopOpacity=".55" />
              <stop offset="1" stopColor="var(--ib-line-strong)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="640" height="178" fill={"url(#" + glow + ")"} />
          {[-62, -38, -14, 14, 38, 62].map((a, i) => (
            <path key={i} d={"M320,110 L" + (320 + Math.sin((a * Math.PI) / 180) * 260) + "," + (110 - Math.cos((a * Math.PI) / 180) * 260) + " L" + (320 + Math.sin(((a + 7) * Math.PI) / 180) * 260) + "," + (110 - Math.cos(((a + 7) * Math.PI) / 180) * 260) + "Z"} fill={"url(#" + rays + ")"} opacity=".5" />
          ))}

          {/* SISI KIRI: MUZAKI CLUSTER */}
          <g onMouseEnter={() => setSide("left")} onMouseLeave={() => setSide("")}>
            <rect x="20" y="8" width="170" height="130" fill="transparent" />
            {isBridge && (
              <g transform="translate(104,17)">
                <rect x="-42" y="-9" width="84" height="18" rx="9" fill="var(--ib-raise)" stroke="#064e3b" strokeWidth="1.2" />
                <text x="0" y="3" textAnchor="middle" fontSize="7.5" fontWeight="700" fill="#064e3b" fontFamily="var(--ib-sans)" letterSpacing="0.8">
                  MUZAKI
                </text>
              </g>
            )}
            {team.map((m, i) => (
              <line key={"l" + i} x1={m.x} y1={m.y} x2="104" y2="70" stroke="var(--ib-line-strong)" strokeDasharray="2 3" />
            ))}
            <g transform="translate(91,57)">
              <rect width="26" height="26" rx="5" className="ib-node" />
              <g transform="translate(5,5)" style={{ color: "#064e3b" }}>
                <Mark size={16} />
              </g>
            </g>
            {team.map((m, i) => (
              <g key={i} className="ib-av" tabIndex={0} role="img" aria-label={m.name}>
                <svg x={m.x - 11} y={m.y - 11} width="22" height="22" viewBox="0 0 22 22" overflow="visible">
                  <clipPath id={uid + "avc" + i}>
                    <circle cx="11" cy="11" r="11" />
                  </clipPath>
                  <g clipPath={"url(#" + uid + "avc" + i + ")"}>
                    <Portrait index={i} size={22} uid={uid + "f"} />
                  </g>
                  <circle cx="11" cy="11" r="10.5" fill="none" stroke="var(--ib-paper)" strokeWidth="1.5" />
                </svg>
                <circle cx={m.x + 8} cy={m.y + 8} r="2.6" fill={!isBridge && i === 4 ? "var(--ib-faint)" : "#059669"} stroke="var(--ib-paper)" className={!isBridge && i === 4 ? undefined : "ib-presence"} />
                <g className="ib-av-tip" transform={"translate(" + m.x + "," + (m.y - 18) + ")"}>
                  <rect x={-m.name.length * 2.45 - 6} y="-9" width={m.name.length * 4.9 + 12} height="14" rx="2" fill="var(--ib-inv)" />
                  <text x="0" y="1" textAnchor="middle" fontSize="7.5" fill="var(--ib-inv-ink)" fontFamily="var(--ib-sans)">
                    {m.name}
                  </text>
                </g>
              </g>
            ))}
          </g>

          {/* JALUR ALIRAN (CONNECTORS) */}
          {[L1, L2].map((d, i) => (
            <path key={d} d={d} className={"ib-flow" + (side === "left" ? " ib-flow-on" : "") + (i ? " ib-dash" : "")} />
          ))}
          {[R1, R2].map((d, i) => (
            <path key={d} d={d} className={"ib-flow" + (side === "right" ? " ib-flow-on" : "") + (i ? " ib-dash" : "")} />
          ))}
          {!reduced &&
            [L1, L2, R1, R2].map((d, i) => (
              <circle key={"p" + i} r="2.3" className="ib-pkt">
                <animateMotion dur={2.4 + (i % 2) * 0.5 + "s"} begin={i * 0.35 + "s"} repeatCount="indefinite" path={d} />
              </circle>
            ))}

          {/* TITIK PUSAT: BAZNAS SEBAGAI JEMBATAN AMANAH */}
          <g transform={isBridge ? "translate(256,84)" : "translate(262,88)"}>
            <rect 
              x="-4" 
              y="-4" 
              width={isBridge ? 136 : 124} 
              height={isBridge ? 54 : 52} 
              rx="8" 
              fill="none" 
              stroke="var(--ib-line)" 
              className={reduced ? undefined : "ib-glow"} 
            />
            <rect 
              width={isBridge ? 128 : 116} 
              height={isBridge ? 46 : 44} 
              rx="6" 
              className="ib-node" 
              style={{ filter: "drop-shadow(0 6px 12px rgba(6,78,59,.1))" }} 
            />
            <g transform="translate(12,15)" style={{ color: "#064e3b" }}>
              <Mark size={16} />
            </g>
            <text 
              x="36" 
              y={isBridge ? "23" : "26"} 
              fontSize="9" 
              letterSpacing="1.2" 
              fontWeight="700" 
              fill="#064e3b" 
              fontFamily="var(--ib-sans)"
              textLength={!isBridge && chipLong ? 58 : undefined} 
              lengthAdjust={!isBridge && chipLong ? "spacingAndGlyphs" : undefined}
            >
              {chip}
            </text>
            {isBridge && (
              <text 
                x="36" 
                y="34" 
                fontSize="6.5" 
                fontWeight="600" 
                fill="var(--ib-muted)" 
                fontFamily="var(--ib-sans)" 
                letterSpacing="0.4"
              >
                KAB. BANDUNG
              </text>
            )}
            <path 
              d={isBridge ? "M114 19l4 4-4 4" : "M100 18l4 4-4 4"} 
              fill="none" 
              stroke="#064e3b" 
              strokeWidth="1.4" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
          </g>

          {/* SISI KANAN: MUSTAHIK ATAU REPORT STACK */}
          {isBridge ? (
            /* MUSTAHIK CLUSTER (PENERIMA MANFAAT) */
            <g onMouseEnter={() => setSide("right")} onMouseLeave={() => setSide("")}>
              <rect x="450" y="8" width="170" height="130" fill="transparent" />
              <g transform="translate(536,17)">
                <rect x="-46" y="-9" width="92" height="18" rx="9" fill="var(--ib-raise)" stroke="#064e3b" strokeWidth="1.2" />
                <text x="0" y="3" textAnchor="middle" fontSize="7.5" fontWeight="700" fill="#064e3b" fontFamily="var(--ib-sans)" letterSpacing="0.8">
                  MUSTAHIK
                </text>
              </g>
              {mustahikList.map((m, i) => (
                <line key={"ml" + i} x1={m.x} y1={m.y} x2="536" y2="70" stroke="var(--ib-line-strong)" strokeDasharray="2 3" />
              ))}
              <g transform="translate(523,57)">
                <rect width="26" height="26" rx="5" className="ib-node" />
                <g transform="translate(5,5)" style={{ color: "#064e3b" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </g>
              </g>
              {mustahikList.map((m, i) => (
                <g key={"mus" + i} className="ib-av" tabIndex={0} role="img" aria-label={m.name}>
                  <svg x={m.x - 11} y={m.y - 11} width="22" height="22" viewBox="0 0 22 22" overflow="visible">
                    <clipPath id={uid + "musc" + i}>
                      <circle cx="11" cy="11" r="11" />
                    </clipPath>
                    <g clipPath={"url(#" + uid + "musc" + i + ")"}>
                      <Portrait index={i + 3} size={22} uid={uid + "mus"} />
                    </g>
                    <circle cx="11" cy="11" r="10.5" fill="none" stroke="var(--ib-paper)" strokeWidth="1.5" />
                  </svg>
                  <circle cx={m.x + 8} cy={m.y + 8} r="2.6" fill="#059669" stroke="var(--ib-paper)" className="ib-presence" />
                  <g className="ib-av-tip" transform={"translate(" + m.x + "," + (m.y - 18) + ")"}>
                    <rect x={-m.name.length * 2.45 - 6} y="-9" width={m.name.length * 4.9 + 12} height="14" rx="2" fill="var(--ib-inv)" />
                    <text x="0" y="1" textAnchor="middle" fontSize="7.5" fill="var(--ib-inv-ink)" fontFamily="var(--ib-sans)">
                      {m.name}
                    </text>
                  </g>
                </g>
              ))}
            </g>
          ) : (
            /* the report stack */
            <g onMouseEnter={() => setSide("right")} onMouseLeave={() => setSide("")}>
              {[2, 1, 0].map((k) => (
                <g key={reports - k} transform={"translate(" + (450 + k * 12) + "," + (40 - k * 10) + ")"} opacity={1 - k * 0.25}>
                  <g className={"ib-sheet" + (k === 0 ? " ib-sheet-new" : "")}>
                  <rect width="138" height="102" rx="3" fill="var(--ib-raise)" stroke="var(--ib-line-strong)" />
                  {k === 0 && (
                    <>
                      <text x="10" y="16" fontSize="7" fill="var(--ib-muted)" fontFamily="var(--ib-mono)">
                        {"AUDIT BSZ #" + reports}
                      </text>
                      <rect x="10" y="24" width="64" height="5" rx="1" fill="var(--ib-ink)" opacity=".75" />
                      <rect x="10" y="33" width="92" height="3" rx="1" fill="var(--ib-line-strong)" />
                      <rect x="10" y="39" width="80" height="3" rx="1" fill="var(--ib-line-strong)" />
                      {[18, 26, 14, 30, 22, 34].map((h, j) => (
                        <rect key={j} x={12 + j * 13} y={92 - h} width="8" height={h} fill="var(--ib-ink)" opacity={0.25 + j * 0.12} />
                      ))}
                      <path d="M92 64h34M92 72h28M92 80h32" stroke="var(--ib-line-strong)" strokeWidth="2.5" />
                    </>
                  )}
                  </g>
                </g>
              ))}
            </g>
          )}
        </svg>
        <div className="ib-wide-copy" style={{ padding: "0 22px 20px" }}>
          <div>
            <h3>{features.collaboration.title}</h3>
            <p>{features.collaboration.description}</p>
          </div>
          <div>
            <h3>{features.reports.title}</h3>
            <p>{features.reports.description}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function IntegrationsCard({ copy, reduced }: { copy: InkFeatures["integrations"]; reduced: boolean }) {
  const [hover, setHover] = React.useState(-1)
  const [auto, setAuto] = React.useState(0)
  React.useEffect(() => {
    if (reduced || hover >= 0) return
    const t = setInterval(() => setAuto((a) => (a + 1) % 4), 1700)
    return () => clearInterval(t)
  }, [reduced, hover])
  const on = hover >= 0 ? hover : reduced ? -1 : auto
  const tiles = [
    { x: 66, y: 34 },
    { x: 66, y: 116 },
    { x: 234, y: 34 },
    { x: 234, y: 116 },
  ]
  const path = (i: number) => {
    const t = tiles[i]
    const dir = t.x < 150 ? -1 : 1
    return "M" + (150 + dir * 17) + ",75 H" + (150 + dir * 42) + " V" + t.y + " H" + (t.x - dir * 15)
  }
  return (
    <div className="ib-frame ib-frame-hover">
      <Brackets />
      <div className="ib-card">
        <svg className="ib-diagram" viewBox="0 0 300 150" role="group" aria-label="Integrations">
          {tiles.map((_, i) => (
            <path key={i} d={path(i)} className={"ib-flow" + (on === i ? " ib-flow-on" : "")} />
          ))}
          {!reduced && on >= 0 && (
            <circle key={on} r="2.2" className="ib-pkt">
              <animateMotion dur="1.1s" repeatCount="indefinite" path={path(on)} />
            </circle>
          )}
          <g transform="translate(133,58)">
            <rect width="34" height="34" rx="7" className="ib-node" style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,.08))" }} />
            <g transform="translate(8,8)" style={{ color: "var(--ib-ink)" }}>
              <Mark size={18} />
            </g>
          </g>
          {tiles.map((t, i) => (
            <g
              key={i}
              className={"ib-tool" + (on === i ? " ib-tool-on" : "")}
              tabIndex={0}
              role="img"
              aria-label={copy.tools[i] ?? "Tool"}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(-1)}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(-1)}
            >
              <rect x={t.x - 15} y={t.y - 15} width="30" height="30" rx="6" className="ib-node" />
              <g transform={"translate(" + t.x + "," + t.y + ")"} style={{ color: "var(--ib-ink)" }}>
                <ToolGlyph index={i} />
              </g>
              <text x={t.x} y={t.y + (t.y < 75 ? -21 : 28)} textAnchor="middle" fontSize="8" fill="var(--ib-muted)" fontFamily="var(--ib-sans)" opacity={on === i ? 1 : 0} style={{ transition: "opacity .25s" }}>
                {copy.tools[i] ?? ""}
              </text>
            </g>
          ))}
          <text x="150" y="112" textAnchor="middle" fontSize="7" fill="var(--ib-faint)" fontFamily="var(--ib-mono)">
            {on >= 0 ? "terhubung · " + (copy.tools[on] ?? "").toLowerCase() : "4 sistem aktif"}
          </text>
        </svg>
        <div style={{ marginTop: "auto" }}>
          <h3>{copy.title}</h3>
          <p>{copy.description}</p>
        </div>
      </div>
    </div>
  )
}

function InsightsCard({ copy, uid, reduced }: { copy: InkFeatures["insights"]; uid: string; reduced: boolean }) {
  const [ref, inView] = useInView(0.3)
  const [hover, setHover] = React.useState(-1)
  const W = 300
  const H = 130
  const vals = copy.values.length > 1 ? copy.values : [1, 2]
  const { line, area, points } = chartPaths(vals, W, H, 14)
  const split = clamp(copy.forecastFrom, 1, vals.length - 1)
  const fill = uid + "area"
  const last = points[points.length - 1]
  const i = hover >= 0 ? hover : points.length - 1
  const p = points[i]
  const pct = Math.round(((vals[i] - vals[0]) / (vals[0] || 1)) * 100)
  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    setHover(nearestIndex(points.map((q) => q[0]), ((e.clientX - r.left) / r.width) * W))
  }
  return (
    <div className="ib-frame ib-frame-hover" ref={ref as never} data-in={inView}>
      <Brackets />
      <div className="ib-card">
        <svg className="ib-diagram ib-chart" viewBox={"0 0 " + W + " " + (H + 6)} onPointerMove={onMove} onPointerLeave={() => setHover(-1)} role="img" aria-label={copy.title + " chart"}>
          <defs>
            <linearGradient id={fill} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="var(--ib-ink)" stopOpacity=".12" />
              <stop offset="1" stopColor="var(--ib-ink)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0.25, 0.5, 0.75].map((g) => (
            <line key={g} x1="14" x2={W - 14} y1={H * g} y2={H * g} stroke="var(--ib-line)" />
          ))}
          <path d={area} fill={"url(#" + fill + ")"} />
          <path d={line} fill="none" stroke="var(--ib-ink)" strokeWidth="1.4" pathLength={1} className="ib-line-draw" opacity=".85" />
          <line x1={points[split][0]} x2={points[split][0]} y1="10" y2={H - 14} stroke="var(--ib-line-strong)" strokeDasharray="2 3" />
          <text x={points[split][0] - 4} y={H - 18} textAnchor="end" fontSize="7" fill="var(--ib-faint)" fontFamily="var(--ib-mono)">
            PROYEKSI
          </text>
          {hover >= 0 && <line x1={p[0]} x2={p[0]} y1="8" y2={H - 14} stroke="var(--ib-ink)" strokeOpacity=".35" />}
          {!reduced && hover < 0 && <circle cx={last[0]} cy={last[1]} r="7" fill="var(--ib-ink)" opacity=".15" className="ib-glow" />}
          <circle cx={p[0]} cy={p[1]} r="3.2" fill="var(--ib-raise)" stroke="var(--ib-ink)" strokeWidth="1.5" />
          <g transform={"translate(" + clamp(p[0], 40, W - 40) + "," + (p[1] < 34 ? p[1] + 22 : p[1] - 12) + ")"}>
            <rect x="-30" y="-11" width="60" height="15" rx="2" fill="var(--ib-inv)" />
            <text x="0" y="-1" textAnchor="middle" fontSize="7.5" fill="var(--ib-inv-ink)" fontFamily="var(--ib-mono)">
              {(i >= split ? "est " : "bln " + (i + 1) + " ") + (pct >= 0 ? "+" : "") + pct + "%"}
            </text>
          </g>
        </svg>
        <div style={{ marginTop: "auto" }}>
          <h3>{copy.title}</h3>
          <p>{copy.description}</p>
        </div>
      </div>
    </div>
  )
}

const IB_CSS = `
.ib-root{--ib-page:#fcfcfc;--ib-hatch:rgba(0,0,0,.03);--ib-paper:#ffffff;--ib-card:#fafafa;--ib-raise:#ffffff;--ib-ink:#09090b;--ib-soft:#27272a;--ib-muted:#71717a;--ib-faint:#a1a1aa;--ib-line:#e4e4e7;--ib-line-strong:#d4d4d8;--ib-bracket:#064e3b;--ib-inv:#09090b;--ib-inv-ink:#f4f4f5;--ib-shadow:0 1px 3px rgba(0,0,0,.04),0 12px 32px -12px rgba(6,78,59,.08);--ib-sans:"Inter",ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;--ib-mono:"JetBrains Mono",ui-monospace,"SF Mono",Menlo,Consolas,monospace;position:relative;width:100%;box-sizing:border-box;background-color:transparent;color:var(--ib-ink);font-family:var(--ib-sans);font-size:15px;line-height:1.5;-webkit-font-smoothing:antialiased;transition:background-color .45s ease,color .45s ease}
.ib-root[data-theme="dark"]{--ib-page:#09090b;--ib-hatch:rgba(255,255,255,.03);--ib-paper:#111113;--ib-card:#18181b;--ib-raise:#1f1f23;--ib-ink:#fafafa;--ib-soft:#e4e4e7;--ib-muted:#a1a1aa;--ib-faint:#71717a;--ib-line:#27272a;--ib-line-strong:#3f3f46;--ib-bracket:#10b981;--ib-inv:#f4f4f5;--ib-inv-ink:#09090b;--ib-shadow:0 1px 3px rgba(0,0,0,.5),0 12px 32px -12px rgba(0,0,0,.8)}
.ib-root :where(*){box-sizing:border-box}
.ib-root :focus-visible{outline:2px solid var(--ib-bracket);outline-offset:2px}
.ib-root :where(svg){display:block;max-width:none;flex:none}
.ib-root :where(h2,h3,p){margin:0;padding:0;font-size:inherit;font-weight:inherit}
.ib-shell{width:100%;max-width:1400px;margin:0 auto;container-type:inline-size}
.ib-sec{position:relative;background:var(--ib-paper);border:1px solid var(--ib-line);border-radius:28px;padding:clamp(28px,4cqw,48px) clamp(16px,3cqw,36px);transition:background-color .45s,border-color .45s}
.ib-reveal{opacity:0;transform:translateY(18px);transition:opacity .8s cubic-bezier(.2,.7,.2,1),transform .8s cubic-bezier(.2,.7,.2,1)}
.ib-reveal[data-in="true"]{opacity:1;transform:none}
.ib-head{display:flex;flex-direction:column;align-items:center;text-align:center;gap:12px;margin-bottom:clamp(24px,3.5cqw,40px)}
.ib-tag{display:inline-block;padding:4px 12px;font-size:11px;font-weight:600;letter-spacing:.03em;color:#064e3b;background:#ecfdf5;border:1px solid rgba(6,78,59,.15);border-radius:9999px}
[data-theme="dark"] .ib-tag{color:#34d399;background:rgba(6,78,59,.3);border-color:rgba(52,211,153,.2)}
.ib-h2{font-size:clamp(24px,3.6cqw,38px);line-height:1.15;letter-spacing:-.025em;font-weight:800}
.ib-h2>span{display:block}
.ib-muted{color:#064e3b}
[data-theme="dark"] .ib-muted{color:#34d399}
.ib-frame{position:relative}
.ib-c{position:absolute;width:12px;height:12px;border-color:var(--ib-bracket);border-style:solid;border-width:0;pointer-events:none;transition:border-color .3s,transform .35s cubic-bezier(.2,.8,.2,1);border-radius:2px}
.ib-c-tl{top:-4px;left:-4px;border-top-width:2px;border-left-width:2px}
.ib-c-tr{top:-4px;right:-4px;border-top-width:2px;border-right-width:2px}
.ib-c-bl{bottom:-4px;left:-4px;border-bottom-width:2px;border-left-width:2px}
.ib-c-br{bottom:-4px;right:-4px;border-bottom-width:2px;border-right-width:2px}
.ib-frame-hover:hover>.ib-c{border-color:var(--ib-bracket)}
.ib-frame-hover:hover>.ib-c-tl{transform:translate(-2px,-2px)}
.ib-frame-hover:hover>.ib-c-tr{transform:translate(2px,-2px)}
.ib-frame-hover:hover>.ib-c-bl{transform:translate(-2px,2px)}
.ib-frame-hover:hover>.ib-c-br{transform:translate(2px,2px)}
.ib-bento{display:grid;grid-template-columns:minmax(0,1fr);gap:clamp(18px,2.5cqw,28px)}
.ib-bento-single{grid-template-columns:1fr !important}
.ib-bento-single>.ib-wide{max-width:100% !important;width:100% !important}
@container (min-width:768px){.ib-bento:not(.ib-bento-single){grid-template-columns:repeat(2,minmax(0,1fr))}.ib-wide{grid-column:1 / -1;width:100%}}
.ib-card{background:linear-gradient(180deg,var(--ib-raise),var(--ib-card));border:1px solid var(--ib-line);border-radius:24px;padding:clamp(16px,2cqw,24px);display:flex;flex-direction:column;gap:14px;transition:border-color .3s,box-shadow .35s,background-color .45s}
.ib-card:hover{border-color:var(--ib-line-strong);box-shadow:var(--ib-shadow)}
.ib-card h3{font-size:14px;font-weight:700;letter-spacing:-.01em;color:var(--ib-ink)}
.ib-card p{font-size:12px;line-height:1.6;color:var(--ib-muted);max-width:55ch}
.ib-diagram{width:100%;height:auto;overflow:visible}
.ib-wide-copy{display:grid;grid-template-columns:1fr;gap:16px}
.ib-wide-copy p{max-width:none}
@container (min-width:560px){.ib-wide-copy{grid-template-columns:1fr 1fr}.ib-wide-copy>div:last-child{justify-self:end;text-align:left}}
.ib-flow{stroke:var(--ib-line-strong);fill:none;stroke-width:1.2;transition:stroke .3s}
.ib-flow-on{stroke:#064e3b}
[data-theme="dark"] .ib-flow-on{stroke:#34d399}
.ib-dash{stroke-dasharray:3 4;animation:ib-dash 1.2s linear infinite}
.ib-pkt{fill:#064e3b}
[data-theme="dark"] .ib-pkt{fill:#34d399}
.ib-node{fill:var(--ib-raise);stroke:var(--ib-line-strong);transition:stroke .3s,transform .3s}
.ib-av{cursor:pointer;transition:transform .35s cubic-bezier(.2,.8,.2,1);transform-box:fill-box;transform-origin:center}
.ib-av:hover,.ib-av:focus-visible{transform:scale(1.18)}
.ib-av-tip{opacity:0;transition:opacity .2s;pointer-events:none}
.ib-av:hover .ib-av-tip,.ib-av:focus .ib-av-tip{opacity:1}
.ib-presence{animation:ib-pulse 2.2s ease-in-out infinite;transform-box:fill-box;transform-origin:center}
.ib-sheet{transition:transform .7s cubic-bezier(.2,.8,.2,1),opacity .7s}
.ib-sheet-new{animation:ib-sheet-in .7s cubic-bezier(.2,.8,.2,1) both}
.ib-tool{cursor:pointer;transition:transform .3s cubic-bezier(.2,.8,.2,1);transform-box:fill-box;transform-origin:center}
.ib-tool:hover,.ib-tool-on{transform:translateY(-2px)}
.ib-tool rect{transition:stroke .3s}
.ib-tool-on rect.ib-node{stroke:#064e3b}
[data-theme="dark"] .ib-tool-on rect.ib-node{stroke:#34d399}
.ib-chart{cursor:crosshair}
.ib-line-draw{stroke-dasharray:1;stroke-dashoffset:1;transition:stroke-dashoffset 1.8s cubic-bezier(.4,.1,.2,1)}
[data-in="true"] .ib-line-draw{stroke-dashoffset:0}
.ib-glow{animation:ib-pulse 2s ease-in-out infinite;transform-box:fill-box;transform-origin:center}
@keyframes ib-dash{to{stroke-dashoffset:-14}}
@keyframes ib-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.45;transform:scale(1.35)}}
@keyframes ib-sheet-in{from{opacity:0;transform:translate(14px,-10px) rotate(4deg)}to{opacity:1;transform:none}}
.ib-bento>.ib-frame{display:flex;flex-direction:column}
.ib-bento>.ib-frame>.ib-card{flex:1}
@media (prefers-reduced-motion:reduce){
.ib-reveal{opacity:1;transform:none;transition:none}
.ib-dash,.ib-presence,.ib-glow,.ib-sheet-new{animation:none}
.ib-line-draw{transition:none;stroke-dashoffset:0}
}
`

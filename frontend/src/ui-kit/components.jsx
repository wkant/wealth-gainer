import { useState, useRef, useEffect } from "react";

// ── Theme Tokens ──────────────────────────────────────
const t = {
  bg: "#f8f9fb",
  surface: "#ffffff",
  surfaceRaised: "#ffffff",
  border: "#e8eaef",
  borderLight: "#f0f1f5",
  borderFocus: "#0d9488",
  text: "#1a1d27",
  textSecondary: "#5c6070",
  textTertiary: "#9ca0af",
  textFaint: "#c5c8d4",
  textInverse: "#ffffff",
  accent: "#0d9488",
  accentHover: "#0f766e",
  accentLight: "#f0fdfa",
  accentMid: "#ccfbf1",
  gain: "#0d9488",
  gainBg: "#f0fdfa",
  loss: "#e11d48",
  lossBg: "#fff1f2",
  warning: "#d97706",
  warningBg: "#fffbeb",
  info: "#2563eb",
  infoBg: "#eff6ff",
  shadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
  shadowMd: "0 4px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)",
  shadowLg: "0 10px 30px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)",
  radius: 10,
  radiusLg: 14,
  radiusFull: 9999,
  font: "'Syne', sans-serif",
  fontSerif: "'Newsreader', serif",
};

// ── Section Wrapper ───────────────────────────────────
const Section = ({ title, children, delay = 0 }) => (
  <div style={{
    marginBottom: 40,
    animation: `fadeUp 0.5s ease ${delay}s both`,
  }}>
    <div style={{
      fontSize: 10, fontWeight: 700, color: t.textTertiary,
      letterSpacing: 2, textTransform: "uppercase",
      marginBottom: 16, paddingBottom: 8,
      borderBottom: `1px solid ${t.border}`,
    }}>{title}</div>
    {children}
  </div>
);

// ── BUTTONS ───────────────────────────────────────────
const Button = ({ children, variant = "primary", size = "md", disabled = false, icon, onClick }) => {
  const [hovered, setHovered] = useState(false);
  const styles = {
    primary: {
      bg: hovered && !disabled ? t.accentHover : t.accent,
      color: t.textInverse, border: "none",
    },
    secondary: {
      bg: hovered && !disabled ? t.borderLight : "transparent",
      color: t.text, border: `1.5px solid ${t.border}`,
    },
    ghost: {
      bg: hovered && !disabled ? t.accentLight : "transparent",
      color: t.accent, border: "none",
    },
    danger: {
      bg: hovered && !disabled ? "#be123c" : t.loss,
      color: t.textInverse, border: "none",
    },
  };
  const sizes = {
    sm: { padding: "6px 14px", fontSize: 11 },
    md: { padding: "9px 20px", fontSize: 12 },
    lg: { padding: "12px 28px", fontSize: 13 },
  };
  const s = styles[variant];
  const sz = sizes[size];
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: s.bg, color: s.color, border: s.border,
        borderRadius: t.radiusFull, cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: t.font, fontWeight: 600, letterSpacing: 0.2,
        display: "inline-flex", alignItems: "center", gap: 6,
        opacity: disabled ? 0.45 : 1,
        transition: "all 0.15s ease",
        ...sz,
      }}
    >
      {icon && <span style={{ fontSize: sz.fontSize + 2, lineHeight: 1 }}>{icon}</span>}
      {children}
    </button>
  );
};

// ── INPUT ─────────────────────────────────────────────
const Input = ({ label, placeholder, type = "text", prefix, suffix, error, disabled }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5, flex: 1 }}>
      {label && <label style={{ fontSize: 11, fontWeight: 600, color: t.textSecondary, letterSpacing: 0.3 }}>{label}</label>}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "9px 14px", borderRadius: t.radius,
        border: `1.5px solid ${error ? t.loss : focused ? t.borderFocus : t.border}`,
        background: disabled ? t.borderLight : t.surface,
        transition: "border-color 0.15s ease",
        opacity: disabled ? 0.6 : 1,
      }}>
        {prefix && <span style={{ color: t.textTertiary, fontSize: 13 }}>{prefix}</span>}
        <input
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            border: "none", outline: "none", background: "transparent",
            flex: 1, fontSize: 13, color: t.text, fontFamily: t.font,
          }}
        />
        {suffix && <span style={{ color: t.textTertiary, fontSize: 12 }}>{suffix}</span>}
      </div>
      {error && <span style={{ fontSize: 11, color: t.loss, fontWeight: 500 }}>{error}</span>}
    </div>
  );
};

// ── SELECT ────────────────────────────────────────────
const Select = ({ label, options, value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(value || options[0]);
  return (
    <div style={{ position: "relative", flex: 1 }}>
      {label && <label style={{ fontSize: 11, fontWeight: 600, color: t.textSecondary, letterSpacing: 0.3, display: "block", marginBottom: 5 }}>{label}</label>}
      <div
        onClick={() => setOpen(!open)}
        style={{
          padding: "9px 14px", borderRadius: t.radius,
          border: `1.5px solid ${open ? t.borderFocus : t.border}`,
          background: t.surface, cursor: "pointer",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          fontSize: 13, color: t.text, fontFamily: t.font,
          transition: "border-color 0.15s ease",
        }}
      >
        {selected}
        <span style={{ color: t.textTertiary, fontSize: 10, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s ease" }}>▼</span>
      </div>
      {open && (
        <div style={{
          position: "absolute", top: "100%", left: 0, right: 0, marginTop: 4,
          background: t.surface, borderRadius: t.radius, border: `1px solid ${t.border}`,
          boxShadow: t.shadowMd, zIndex: 50, overflow: "hidden",
        }}>
          {options.map(opt => (
            <div key={opt}
              onClick={() => { setSelected(opt); setOpen(false); onChange?.(opt); }}
              style={{
                padding: "9px 14px", fontSize: 13, cursor: "pointer",
                background: opt === selected ? t.accentLight : "transparent",
                color: opt === selected ? t.accent : t.text,
                fontWeight: opt === selected ? 600 : 400,
                transition: "background 0.1s ease",
              }}
            >{opt}</div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── TOGGLE ────────────────────────────────────────────
const Toggle = ({ label, defaultOn = false }) => {
  const [on, setOn] = useState(defaultOn);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => setOn(!on)}>
      <div style={{
        width: 40, height: 22, borderRadius: 11,
        background: on ? t.accent : t.border,
        padding: 2, transition: "background 0.2s ease",
        display: "flex", alignItems: "center",
      }}>
        <div style={{
          width: 18, height: 18, borderRadius: "50%",
          background: t.surface, boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          transform: on ? "translateX(18px)" : "translateX(0)",
          transition: "transform 0.2s ease",
        }} />
      </div>
      {label && <span style={{ fontSize: 13, color: t.text, fontWeight: 500 }}>{label}</span>}
    </div>
  );
};

// ── CHECKBOX ──────────────────────────────────────────
const Checkbox = ({ label, defaultChecked = false }) => {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }} onClick={() => setChecked(!checked)}>
      <div style={{
        width: 18, height: 18, borderRadius: 5,
        border: `1.5px solid ${checked ? t.accent : t.border}`,
        background: checked ? t.accent : t.surface,
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.15s ease",
      }}>
        {checked && <span style={{ color: "#fff", fontSize: 11, fontWeight: 700 }}>✓</span>}
      </div>
      {label && <span style={{ fontSize: 13, color: t.text }}>{label}</span>}
    </div>
  );
};

// ── BADGE ─────────────────────────────────────────────
const Badge = ({ children, variant = "default" }) => {
  const styles = {
    default: { bg: t.borderLight, color: t.textSecondary },
    success: { bg: t.gainBg, color: t.gain },
    danger: { bg: t.lossBg, color: t.loss },
    warning: { bg: t.warningBg, color: t.warning },
    info: { bg: t.infoBg, color: t.info },
    accent: { bg: t.accentLight, color: t.accent },
  };
  const s = styles[variant];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "3px 10px", borderRadius: t.radiusFull,
      fontSize: 11, fontWeight: 600, letterSpacing: 0.3,
      background: s.bg, color: s.color,
      fontFamily: t.font,
    }}>{children}</span>
  );
};

// ── ALERT ─────────────────────────────────────────────
const Alert = ({ title, message, variant = "info" }) => {
  const styles = {
    info: { bg: t.infoBg, border: "#bfdbfe", color: t.info, icon: "ℹ" },
    success: { bg: t.gainBg, border: t.accentMid, color: t.gain, icon: "✓" },
    warning: { bg: t.warningBg, border: "#fde68a", color: t.warning, icon: "⚠" },
    danger: { bg: t.lossBg, border: "#fecdd3", color: t.loss, icon: "✕" },
  };
  const s = styles[variant];
  return (
    <div style={{
      display: "flex", gap: 12, padding: "14px 18px",
      borderRadius: t.radius, background: s.bg,
      border: `1px solid ${s.border}`,
    }}>
      <span style={{ fontSize: 14, color: s.color, fontWeight: 700, lineHeight: 1.4 }}>{s.icon}</span>
      <div>
        {title && <div style={{ fontSize: 13, fontWeight: 700, color: s.color, marginBottom: 2 }}>{title}</div>}
        <div style={{ fontSize: 12, color: t.textSecondary, lineHeight: 1.5 }}>{message}</div>
      </div>
    </div>
  );
};

// ── TABS ──────────────────────────────────────────────
const Tabs = ({ items }) => {
  const [active, setActive] = useState(0);
  return (
    <div>
      <div style={{ display: "flex", gap: 2, marginBottom: 16 }}>
        {items.map((item, i) => (
          <button key={i} onClick={() => setActive(i)} style={{
            padding: "7px 20px", borderRadius: t.radiusFull, border: "none",
            background: active === i ? t.text : "transparent",
            color: active === i ? t.textInverse : t.textTertiary,
            fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: t.font,
            transition: "all 0.15s ease",
          }}>{item.label}</button>
        ))}
      </div>
      <div style={{
        padding: "16px 20px", borderRadius: t.radius,
        background: t.surface, border: `1px solid ${t.borderLight}`,
        fontSize: 13, color: t.textSecondary, lineHeight: 1.6,
      }}>{items[active].content}</div>
    </div>
  );
};

// ── AVATAR ────────────────────────────────────────────
const Avatar = ({ name, size = 36, color }) => {
  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2);
  const bg = color || t.accent;
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", background: bg,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.38, fontWeight: 700, color: t.textInverse,
      fontFamily: t.font, letterSpacing: 0.5,
    }}>{initials}</div>
  );
};

// ── PROGRESS ──────────────────────────────────────────
const Progress = ({ value = 0, label }) => (
  <div>
    {label && (
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: t.textSecondary, fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: 12, color: t.text, fontWeight: 600 }}>{value}%</span>
      </div>
    )}
    <div style={{ height: 6, borderRadius: 3, background: t.borderLight, overflow: "hidden" }}>
      <div style={{
        height: "100%", borderRadius: 3,
        background: value > 75 ? t.accent : value > 40 ? t.warning : t.loss,
        width: `${value}%`, transition: "width 0.6s ease",
      }} />
    </div>
  </div>
);

// ── SKELETON ──────────────────────────────────────────
const Skeleton = ({ width = "100%", height = 14, rounded = false }) => (
  <div style={{
    width, height, borderRadius: rounded ? t.radiusFull : 6,
    background: `linear-gradient(90deg, ${t.borderLight} 25%, ${t.border} 50%, ${t.borderLight} 75%)`,
    backgroundSize: "200% 100%",
    animation: "shimmer 1.5s ease infinite",
  }} />
);

// ── TOOLTIP ───────────────────────────────────────────
const Tooltip = ({ children, text }) => {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: "relative", display: "inline-block" }}
      onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <div style={{
          position: "absolute", bottom: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)",
          padding: "6px 12px", borderRadius: 8, background: t.text, color: t.textInverse,
          fontSize: 11, fontWeight: 500, whiteSpace: "nowrap",
          boxShadow: t.shadowMd, fontFamily: t.font,
          animation: "fadeIn 0.15s ease",
        }}>{text}</div>
      )}
    </div>
  );
};

// ── CARD ──────────────────────────────────────────────
const Card = ({ title, subtitle, children, accent }) => (
  <div style={{
    background: t.surface, borderRadius: t.radiusLg,
    border: `1px solid ${t.borderLight}`,
    boxShadow: t.shadow, overflow: "hidden",
  }}>
    {accent && <div style={{ height: 3, background: accent }} />}
    <div style={{ padding: "20px 22px" }}>
      {title && <div style={{ fontSize: 15, fontWeight: 700, color: t.text, marginBottom: subtitle ? 2 : 12 }}>{title}</div>}
      {subtitle && <div style={{ fontSize: 12, color: t.textTertiary, marginBottom: 14 }}>{subtitle}</div>}
      {children}
    </div>
  </div>
);

// ── MODAL ─────────────────────────────────────────────
const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 999,
      display: "flex", alignItems: "center", justifyContent: "center",
      animation: "fadeIn 0.2s ease",
    }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.25)", backdropFilter: "blur(4px)" }} onClick={onClose} />
      <div style={{
        position: "relative", background: t.surface, borderRadius: t.radiusLg,
        padding: "28px 30px", width: 420, maxWidth: "90vw",
        boxShadow: t.shadowLg, animation: "fadeUp 0.3s ease",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <span style={{ fontSize: 16, fontWeight: 700 }}>{title}</span>
          <span onClick={onClose} style={{ cursor: "pointer", fontSize: 18, color: t.textTertiary, lineHeight: 1 }}>✕</span>
        </div>
        {children}
      </div>
    </div>
  );
};

// ── TABLE ─────────────────────────────────────────────
const Table = ({ columns, data }) => (
  <div style={{ borderRadius: t.radius, border: `1px solid ${t.borderLight}`, overflow: "hidden" }}>
    <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: t.font, fontSize: 13 }}>
      <thead>
        <tr style={{ background: t.bg }}>
          {columns.map(col => (
            <th key={col.key} style={{
              padding: "10px 16px", textAlign: "left",
              fontSize: 10, fontWeight: 700, color: t.textTertiary,
              letterSpacing: 1.2, textTransform: "uppercase",
              borderBottom: `1px solid ${t.border}`,
            }}>{col.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i} style={{ borderBottom: i < data.length - 1 ? `1px solid ${t.borderLight}` : "none" }}>
            {columns.map(col => (
              <td key={col.key} style={{ padding: "11px 16px", color: t.text }}>
                {col.render ? col.render(row[col.key], row) : row[col.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ══════════════════════════════════════════════════════
// ── MAIN KIT SHOWCASE ─────────────────────────────────
// ══════════════════════════════════════════════════════

export default function UIKit() {
  const [modalOpen, setModalOpen] = useState(false);

  const tableColumns = [
    { key: "ticker", label: "Ticker", render: (v) => <span style={{ fontWeight: 700 }}>{v}</span> },
    { key: "name", label: "Company" },
    { key: "price", label: "Price", render: (v) => `$${v}` },
    { key: "change", label: "Change", render: (v) => (
      <Badge variant={v > 0 ? "success" : "danger"}>{v > 0 ? "+" : ""}{v}%</Badge>
    )},
    { key: "volume", label: "Volume" },
  ];
  const tableData = [
    { ticker: "AAPL", name: "Apple Inc.", price: "198.11", change: 1.19, volume: "52.4M" },
    { ticker: "NVDA", name: "NVIDIA Corp.", price: "881.86", change: 1.64, volume: "38.1M" },
    { ticker: "MSFT", name: "Microsoft", price: "425.22", change: -0.74, volume: "22.8M" },
    { ticker: "TSLA", name: "Tesla Inc.", price: "248.42", change: -3.33, volume: "91.2M" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: t.bg, fontFamily: t.font, color: t.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Newsreader:opsz,wght@6..72,300;6..72,400;6..72,500;6..72,600&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes shimmer { 0% { background-position:200% 0; } 100% { background-position:-200% 0; } }
        * { margin:0; padding:0; box-sizing:border-box; }
        ::selection { background: ${t.accentMid}; color: ${t.text}; }
      `}</style>

      {/* Header */}
      <div style={{
        padding: "32px 48px 24px", borderBottom: `1px solid ${t.border}`,
        animation: "fadeIn 0.4s ease both",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <div style={{
            width: 34, height: 34, borderRadius: "50%",
            border: `2px solid ${t.accent}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, fontWeight: 700, color: t.accent,
          }}>V</div>
          <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: -0.3 }}>Vault</span>
          <Badge variant="accent">UI Kit</Badge>
        </div>
        <div style={{ fontSize: 12, color: t.textTertiary, marginTop: 6 }}>
          Syne · Newsreader · Teal accent · Light airy theme
        </div>
      </div>

      <div style={{ padding: "36px 48px", maxWidth: 1100, margin: "0 auto" }}>

        {/* ── TYPOGRAPHY ── */}
        <Section title="Typography" delay={0.05}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <span style={{ fontFamily: t.fontSerif, fontSize: 42, fontWeight: 400, lineHeight: 1.1 }}>$189,450.00</span>
            <span style={{ fontSize: 24, fontWeight: 800, letterSpacing: -0.5 }}>Dashboard Heading</span>
            <span style={{ fontSize: 16, fontWeight: 600 }}>Section Title</span>
            <span style={{ fontSize: 13, color: t.textSecondary, lineHeight: 1.6 }}>Body text — The quick brown fox jumps over the lazy dog. Clean, readable, and perfectly weighted for data-dense interfaces.</span>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: t.textTertiary }}>Overline Label</span>
          </div>
        </Section>

        {/* ── COLORS ── */}
        <Section title="Color Palette" delay={0.1}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[
              { c: t.accent, n: "Accent" }, { c: t.accentHover, n: "Accent Hover" },
              { c: t.accentLight, n: "Accent Light" }, { c: t.text, n: "Text" },
              { c: t.textSecondary, n: "Secondary" }, { c: t.textTertiary, n: "Tertiary" },
              { c: t.bg, n: "Background" }, { c: t.surface, n: "Surface" },
              { c: t.border, n: "Border" }, { c: t.gain, n: "Gain" },
              { c: t.loss, n: "Loss" }, { c: t.warning, n: "Warning" },
            ].map(({ c, n }) => (
              <div key={n} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 12, background: c,
                  border: `1px solid ${t.border}`, boxShadow: t.shadow,
                }} />
                <span style={{ fontSize: 10, color: t.textTertiary, fontWeight: 500 }}>{n}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* ── BUTTONS ── */}
        <Section title="Buttons" delay={0.15}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 14 }}>
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button disabled>Disabled</Button>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 14 }}>
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <Button icon="↗">Open Trade</Button>
            <Button variant="secondary" icon="⟳">Refresh</Button>
            <Button variant="ghost" icon="★">Watchlist</Button>
          </div>
        </Section>

        {/* ── INPUTS ── */}
        <Section title="Inputs" delay={0.2}>
          <div style={{ display: "flex", gap: 14, marginBottom: 14 }}>
            <Input label="Stock Symbol" placeholder="e.g. AAPL" />
            <Input label="Amount" placeholder="0.00" prefix="$" suffix="USD" />
            <Input label="Shares" placeholder="Quantity" type="number" />
          </div>
          <div style={{ display: "flex", gap: 14 }}>
            <Input label="Disabled" placeholder="Read only" disabled />
            <Input label="With Error" placeholder="Invalid" error="Symbol not found" />
          </div>
        </Section>

        {/* ── SELECT ── */}
        <Section title="Select" delay={0.25}>
          <div style={{ display: "flex", gap: 14, maxWidth: 600 }}>
            <Select label="Order Type" options={["Market", "Limit", "Stop", "Stop Limit"]} />
            <Select label="Time in Force" options={["Day", "GTC", "IOC", "FOK"]} />
            <Select label="Account" options={["Personal", "IRA", "Trust"]} />
          </div>
        </Section>

        {/* ── TOGGLES & CHECKBOXES ── */}
        <Section title="Toggles & Checkboxes" delay={0.3}>
          <div style={{ display: "flex", gap: 32, alignItems: "flex-start" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <Toggle label="Real-time data" defaultOn />
              <Toggle label="After-hours trading" />
              <Toggle label="Push notifications" defaultOn />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <Checkbox label="Include dividends" defaultChecked />
              <Checkbox label="Show extended hours" />
              <Checkbox label="Auto-reinvest" defaultChecked />
            </div>
          </div>
        </Section>

        {/* ── BADGES ── */}
        <Section title="Badges" delay={0.35}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Badge>Default</Badge>
            <Badge variant="success">+2.34%</Badge>
            <Badge variant="danger">-1.82%</Badge>
            <Badge variant="warning">Pending</Badge>
            <Badge variant="info">Market Open</Badge>
            <Badge variant="accent">PRO</Badge>
          </div>
        </Section>

        {/* ── ALERTS ── */}
        <Section title="Alerts" delay={0.4}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Alert variant="success" title="Trade Executed" message="Bought 12 shares of NVDA at $867.64. Order filled completely." />
            <Alert variant="warning" title="Margin Call" message="Your account is approaching margin requirements. Please review your positions." />
            <Alert variant="danger" title="Order Rejected" message="Insufficient buying power for this trade. Available: $2,140." />
            <Alert variant="info" message="Markets close early today at 1:00 PM EST due to holiday schedule." />
          </div>
        </Section>

        {/* ── TABS ── */}
        <Section title="Tabs" delay={0.45}>
          <Tabs items={[
            { label: "Overview", content: "Portfolio summary showing total value, daily P&L, and asset allocation across all accounts." },
            { label: "Positions", content: "Active holdings with real-time prices, unrealized gains/losses, and cost basis for each position." },
            { label: "Orders", content: "Open and filled orders with execution details, timestamps, and order type information." },
            { label: "History", content: "Complete transaction history with filtering by date range, symbol, and transaction type." },
          ]} />
        </Section>

        {/* ── AVATARS ── */}
        <Section title="Avatars" delay={0.5}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <Avatar name="John Doe" size={44} />
            <Avatar name="Sarah Kim" size={44} color="#e11d48" />
            <Avatar name="Alex Chen" size={44} color="#2563eb" />
            <Avatar name="Maria Lopez" size={44} color="#d97706" />
            <Avatar name="P K" size={36} />
            <Avatar name="Vault" size={28} />
          </div>
        </Section>

        {/* ── PROGRESS BARS ── */}
        <Section title="Progress" delay={0.55}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 500 }}>
            <Progress value={87} label="Portfolio target" />
            <Progress value={52} label="Annual goal" />
            <Progress value={23} label="Risk limit" />
          </div>
        </Section>

        {/* ── CARDS ── */}
        <Section title="Cards" delay={0.6}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
            <Card title="Revenue" subtitle="Last 30 days" accent={t.accent}>
              <div style={{ fontFamily: t.fontSerif, fontSize: 28 }}>$42,850</div>
              <div style={{ fontSize: 12, color: t.gain, marginTop: 6, fontWeight: 600 }}>↑ 12.4% vs prev. month</div>
            </Card>
            <Card title="Active Users" subtitle="Current session" accent={t.info}>
              <div style={{ fontFamily: t.fontSerif, fontSize: 28 }}>1,284</div>
              <div style={{ fontSize: 12, color: t.textTertiary, marginTop: 6 }}>Peak: 2,140 at 10:30 AM</div>
            </Card>
            <Card title="Risk Score" subtitle="Portfolio health" accent={t.warning}>
              <div style={{ fontFamily: t.fontSerif, fontSize: 28 }}>Medium</div>
              <div style={{ marginTop: 8 }}><Progress value={58} /></div>
            </Card>
          </div>
        </Section>

        {/* ── TABLE ── */}
        <Section title="Table" delay={0.65}>
          <Table columns={tableColumns} data={tableData} />
        </Section>

        {/* ── SKELETON ── */}
        <Section title="Skeleton Loaders" delay={0.7}>
          <div style={{
            background: t.surface, borderRadius: t.radiusLg, padding: "22px 24px",
            border: `1px solid ${t.borderLight}`, boxShadow: t.shadow,
            display: "flex", flexDirection: "column", gap: 14, maxWidth: 400,
          }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <Skeleton width={40} height={40} rounded />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                <Skeleton width="60%" height={12} />
                <Skeleton width="40%" height={10} />
              </div>
            </div>
            <Skeleton height={10} />
            <Skeleton width="80%" height={10} />
            <Skeleton width="45%" height={10} />
          </div>
        </Section>

        {/* ── TOOLTIP ── */}
        <Section title="Tooltips" delay={0.75}>
          <div style={{ display: "flex", gap: 16 }}>
            <Tooltip text="View your portfolio"><Button variant="secondary">Hover me</Button></Tooltip>
            <Tooltip text="AAPL: $198.11 (+1.19%)"><Badge variant="success">AAPL ↗</Badge></Tooltip>
          </div>
        </Section>

        {/* ── MODAL ── */}
        <Section title="Modal" delay={0.8}>
          <Button onClick={() => setModalOpen(true)}>Open Modal</Button>
          <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Confirm Trade">
            <div style={{ fontSize: 13, color: t.textSecondary, lineHeight: 1.6, marginBottom: 20 }}>
              You are about to buy <strong style={{ color: t.text }}>12 shares of NVDA</strong> at market price (~$881.86 per share). Total estimated cost: <strong style={{ color: t.text }}>$10,582.32</strong>.
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button onClick={() => setModalOpen(false)}>Confirm Buy</Button>
            </div>
          </Modal>
        </Section>

      </div>
    </div>
  );
}

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Play, Square, Download, Clock, ChevronDown, X, Trash2, Moon, Sun,
  Plus, Check, ArrowLeft,
} from "lucide-react";
import { doc, onSnapshot, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "./firebase";

const TOTAL_GOAL = 50;
const NIGHT_GOAL = 10;

const COLORS = {
  bg: "#F5F1E8",
  card: "#FFFFFF",
  ink: "#2B2A27",
  inkSoft: "#8A8377",
  sage: "#6E9179",
  sageDark: "#587560",
  sageBg: "rgba(110,145,121,0.12)",
  blue: "#4A6C8C",
  blueBg: "rgba(74,108,140,0.12)",
  rose: "#C98A93",
  roseBg: "rgba(201,138,147,0.15)",
  clay: "#B98554",
  clayBg: "rgba(185,133,84,0.15)",
  rust: "#BF5B3E",
  gold: "#D89B4A",
  goldBg: "rgba(216,155,74,0.15)",
  divider: "#E6E1D3",
  locked: "#F0ECE1",
};

const SOFT_SHADOW = "0 1px 2px rgba(43,42,39,0.04), 0 8px 20px -10px rgba(43,42,39,0.10)";

const COMPANIONS = {
  mom: { label: "Mom", color: COLORS.rose, bg: COLORS.roseBg },
  dad: { label: "Dad", color: COLORS.clay, bg: COLORS.clayBg },
};

const MILESTONES = [
  { id: "first", label: "First drive", detail: "Logged your first session", icon: "🚗", test: (t) => t.sessionCount >= 1 },
  { id: "t10", label: "10 hours", detail: "10 hours toward your 50", icon: "①", test: (t) => t.totalHours >= 10 },
  { id: "t25", label: "Halfway", detail: "25 of 50 hours logged", icon: "②", test: (t) => t.totalHours >= 25 },
  { id: "t40", label: "40 hours", detail: "Almost at the finish line", icon: "③", test: (t) => t.totalHours >= 40 },
  { id: "t50", label: "50 hours", detail: "DMV total hours met", icon: "🏁", test: (t) => t.totalHours >= 50 },
  { id: "n5", label: "5 night hours", detail: "Halfway to night minimum", icon: "🌘", test: (t) => t.nightHours >= 5 },
  { id: "n10", label: "10 night hours", detail: "DMV night hours met", icon: "🌕", test: (t) => t.nightHours >= 10 },
];

// Firestore document references — everyone who loads this app shares these two documents.
const sessionsDocRef = doc(db, "drivelog", "sessions");
const activeDocRef = doc(db, "drivelog", "active");
const DEVICE_NAME_KEY = "drivelog:device-name"; // localStorage, local to this browser only

function pad(n) { return String(n).padStart(2, "0"); }

function formatElapsed(ms) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

function formatDuration(minutes) {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h === 0) return `${m} min`;
  return `${h}h ${pad(m)}m`;
}

function formatDateLabel(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

function uid() { return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`; }
function todayStr() { return new Date().toISOString().slice(0, 10); }
function isNightFromHour(h) { return h >= 20 || h < 6; }
function defaultIsNight(date = new Date()) { return isNightFromHour(date.getHours()); }
function combineDateTime(dateStr, timeStr) { return new Date(`${dateStr}T${timeStr}:00`); }

function computeTotals(sessions) {
  const totalMinutes = sessions.reduce((sum, s) => sum + s.durationMinutes, 0);
  const nightMinutes = sessions.filter((s) => s.isNight).reduce((sum, s) => sum + s.durationMinutes, 0);
  return { totalHours: totalMinutes / 60, nightHours: nightMinutes / 60, sessionCount: sessions.length };
}

function achievedSet(totals) {
  const set = new Set();
  MILESTONES.forEach((m) => { if (m.test(totals)) set.add(m.id); });
  return set;
}

function encouragement(pct) {
  if (pct >= 100) return "DMV requirement met — nice work. 🏁";
  if (pct >= 80) return "Final stretch, almost there.";
  if (pct >= 50) return "Halfway there — steady progress.";
  if (pct >= 20) return "Good rhythm — keep it up.";
  if (pct > 0) return "Just getting started.";
  return "Start your first session below.";
}

function ProgressBar({ value, goal, color, ticks }) {
  const pct = Math.min(100, (value / goal) * 100);
  return (
    <div style={{ position: "relative", height: "10px", borderRadius: "999px", background: COLORS.locked, marginTop: "10px", marginBottom: "6px" }}>
      <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: `${pct}%`, borderRadius: "999px", background: `linear-gradient(90deg, ${color}CC, ${color})`, transition: "width 0.4s ease" }} />
      {ticks && ticks.map((t) => (
        <div key={t} title={`${t}h`} style={{ position: "absolute", top: "-3px", left: `${(t / goal) * 100}%`, width: "3px", height: "16px", borderRadius: "2px", background: value >= t ? "#FFFFFF" : COLORS.bg, opacity: 0.9, transform: "translateX(-1.5px)" }} />
      ))}
    </div>
  );
}

function CompanionToggle({ value, onChange, size = "md" }) {
  const pad2 = size === "sm" ? "7px 0" : "10px 0";
  const fs = size === "sm" ? "13px" : "15px";
  return (
    <div className="flex gap-2">
      {Object.entries(COMPANIONS).map(([key, c]) => (
        <button key={key} type="button" onClick={() => onChange(key)} style={{
          flex: 1, padding: pad2, borderRadius: "12px", fontFamily: "Space Grotesk, sans-serif", fontWeight: 600, fontSize: fs,
          border: value === key ? `1.5px solid ${c.color}` : "1.5px solid rgba(43,42,39,0.1)",
          background: value === key ? c.bg : "transparent", color: value === key ? c.color : COLORS.inkSoft, cursor: "pointer", transition: "all 0.15s ease",
        }}>{c.label}</button>
      ))}
    </div>
  );
}

function NightToggle({ value, onChange }) {
  return (
    <button type="button" onClick={() => onChange(!value)} style={{
      width: "100%", display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", borderRadius: "12px",
      border: value ? `1.5px solid ${COLORS.blue}` : "1.5px solid rgba(43,42,39,0.1)",
      background: value ? COLORS.blueBg : "transparent", color: value ? COLORS.blue : COLORS.inkSoft,
      fontFamily: "Work Sans, sans-serif", fontWeight: 500, fontSize: "14px", cursor: "pointer",
    }}>
      {value ? <Moon size={16} /> : <Sun size={16} />} Night driving {value ? "— on" : "— off"}
    </button>
  );
}

const inputStyle = {
  width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1.5px solid rgba(43,42,39,0.12)",
  background: "#FBF9F5", color: COLORS.ink, fontFamily: "Work Sans, sans-serif", fontSize: "14px", outline: "none",
};

const labelStyle = { fontSize: "12px", color: COLORS.inkSoft, fontWeight: 500, marginBottom: "5px", display: "block" };

export default function App() {
  const [sessions, setSessions] = useState([]);
  const [active, setActive] = useState(null);
  const [pendingCompanion, setPendingCompanion] = useState("mom");
  const [pendingNight, setPendingNight] = useState(defaultIsNight());
  const [pendingNightAuto, setPendingNightAuto] = useState(true);
  const [clockNow, setClockNow] = useState(Date.now());
  const [deviceName, setDeviceName] = useState(null);
  const [showWhoPicker, setShowWhoPicker] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [sessionsLoaded, setSessionsLoaded] = useState(false);
  const [activeLoaded, setActiveLoaded] = useState(false);
  const [showLog, setShowLog] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [toast, setToast] = useState(null);
  const tickRef = useRef(null);
  const toastTimerRef = useRef(null);
  const sessionsRef = useRef([]); // mirrors `sessions`, used for milestone diffing without stale closures

  const [sheet, setSheet] = useState(null); // null | 'manual'
  const [manualForm, setManualForm] = useState({ date: todayStr(), startTime: "16:00", endTime: "16:30", companion: "mom", isNight: false });

  // Load device-local "who's this" preference
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(DEVICE_NAME_KEY);
      if (stored === "mom" || stored === "dad") {
        setDeviceName(stored);
        setPendingCompanion(stored);
      }
    } catch (e) { /* localStorage unavailable, ignore */ }
  }, []);

  // Real-time Firestore subscriptions — every connected device updates instantly.
  useEffect(() => {
    const unsubSessions = onSnapshot(sessionsDocRef, (snap) => {
      const list = snap.exists() ? snap.data().list || [] : [];
      setSessions(list);
      sessionsRef.current = list;
      setSessionsLoaded(true);
    }, (err) => { console.error("Sessions listener error", err); setSessionsLoaded(true); });

    const unsubActive = onSnapshot(activeDocRef, (snap) => {
      setActive(snap.exists() ? snap.data() : null);
      setActiveLoaded(true);
    }, (err) => { console.error("Active listener error", err); setActiveLoaded(true); });

    return () => { unsubSessions(); unsubActive(); };
  }, []);

  useEffect(() => {
    if (active) {
      tickRef.current = setInterval(() => setNow(Date.now()), 1000);
      return () => clearInterval(tickRef.current);
    }
  }, [active]);

  useEffect(() => {
    const interval = setInterval(() => setClockNow(Date.now()), 30000);
    return () => clearInterval(interval);
  }, []);

  // Auto-follow the clock for the pre-session night toggle until the user overrides it.
  useEffect(() => {
    if (pendingNightAuto) setPendingNight(defaultIsNight(new Date(clockNow)));
  }, [clockNow, pendingNightAuto]);

  useEffect(() => () => clearTimeout(toastTimerRef.current), []);

  const persistSessions = useCallback(async (next) => {
    sessionsRef.current = next;
    try { await setDoc(sessionsDocRef, { list: next }); } catch (e) { console.error("Failed to save sessions", e); }
  }, []);

  const persistActive = useCallback(async (next) => {
    try {
      if (next) await setDoc(activeDocRef, next);
      else await deleteDoc(activeDocRef);
    } catch (e) { console.error("Failed to save active session", e); }
  }, []);

  const chooseDeviceName = (name) => {
    setDeviceName(name);
    setPendingCompanion(name);
    setShowWhoPicker(false);
    try { window.localStorage.setItem(DEVICE_NAME_KEY, name); } catch (e) { /* ignore */ }
  };

  const fireMilestoneCheck = (beforeSessions, afterSessions) => {
    const beforeAchieved = achievedSet(computeTotals(beforeSessions));
    const afterTotals = computeTotals(afterSessions);
    const afterAchieved = achievedSet(afterTotals);
    const newly = MILESTONES.filter((m) => afterAchieved.has(m.id) && !beforeAchieved.has(m.id));
    if (newly.length > 0) {
      const m = newly[newly.length - 1];
      setToast({ icon: m.icon, label: m.label, detail: m.detail });
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = setTimeout(() => setToast(null), 5000);
    }
  };

  const startSession = () => {
    const startTime = new Date().toISOString();
    persistActive({ id: uid(), date: startTime.slice(0, 10), startTime, companion: pendingCompanion, isNight: pendingNight });
    setPendingNightAuto(true);
  };

  const endSession = () => {
    if (!active) return;
    const endTime = new Date().toISOString();
    const durationMinutes = (new Date(endTime) - new Date(active.startTime)) / 60000;
    const record = { ...active, endTime, durationMinutes };
    const next = [record, ...sessionsRef.current];
    fireMilestoneCheck(sessionsRef.current, next);
    persistSessions(next);
    persistActive(null);
  };

  const addManualSessions = (records) => {
    const withIds = records.map((r) => ({ ...r, id: uid() }));
    const next = [...withIds, ...sessionsRef.current];
    fireMilestoneCheck(sessionsRef.current, next);
    persistSessions(next);
  };

  const deleteSession = (id) => { persistSessions(sessionsRef.current.filter((s) => s.id !== id)); setConfirmDelete(null); };
  const toggleNight = (id) => persistSessions(sessionsRef.current.map((s) => (s.id === id ? { ...s, isNight: !s.isNight } : s)));

  const exportCSV = () => {
    const header = ["Date", "Start Time", "End Time", "Duration (min)", "Companion", "Night Driving"];
    const rows = [...sessions].sort((a, b) => new Date(a.startTime) - new Date(b.startTime)).map((s) => [
      s.date, formatTime(s.startTime), formatTime(s.endTime), Math.round(s.durationMinutes),
      COMPANIONS[s.companion]?.label ?? s.companion, s.isNight ? "Yes" : "No",
    ]);
    const csv = [header, ...rows].map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `driving-log-${todayStr()}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const openManual = () => {
    setManualForm({ date: todayStr(), startTime: "16:00", endTime: "16:30", companion: deviceName || "mom", isNight: isNightFromHour(16) });
    setSheet("manual");
  };

  const submitManual = () => {
    const start = combineDateTime(manualForm.date, manualForm.startTime);
    let end = combineDateTime(manualForm.date, manualForm.endTime);
    if (end <= start) end = new Date(end.getTime() + 24 * 3600 * 1000);
    const durationMinutes = (end - start) / 60000;
    addManualSessions([{
      date: manualForm.date, startTime: start.toISOString(), endTime: end.toISOString(),
      durationMinutes, companion: manualForm.companion, isNight: manualForm.isNight,
    }]);
    setSheet(null);
  };

  const closeSheet = () => setSheet(null);

  const totals = computeTotals(sessions);
  const achieved = achievedSet(totals);
  const totalPct = Math.min(100, (totals.totalHours / TOTAL_GOAL) * 100);

  const grouped = sessions.reduce((acc, s) => { (acc[s.date] = acc[s.date] || []).push(s); return acc; }, {});
  const dateKeys = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a));

  if (!sessionsLoaded || !activeLoaded) {
    return (
      <div style={{ background: COLORS.bg, minHeight: "100vh" }} className="flex items-center justify-center">
        <div style={{ color: COLORS.inkSoft, fontFamily: "Work Sans, sans-serif" }}>Loading…</div>
      </div>
    );
  }

  return (
    <div style={{ background: COLORS.bg, minHeight: "100vh", fontFamily: "Work Sans, sans-serif", position: "relative" }}>
      {toast && (
        <div style={{ position: "sticky", top: 0, zIndex: 30, background: COLORS.ink, color: "#FFF", padding: "12px 16px", display: "flex", alignItems: "center", gap: "10px", boxShadow: SOFT_SHADOW }}>
          <span style={{ fontSize: "18px" }}>{toast.icon}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 600, fontSize: "14px" }}>{toast.label}</div>
            <div style={{ fontSize: "12px", opacity: 0.75 }}>{toast.detail}</div>
          </div>
          <button onClick={() => setToast(null)} style={{ background: "none", border: "none", color: "#FFF", opacity: 0.6, cursor: "pointer" }}><X size={16} /></button>
        </div>
      )}

      <div className="max-w-md mx-auto px-4 pt-8 pb-28">
        {/* Header */}
        <div className="mb-6">
          <div style={{ color: COLORS.gold, fontFamily: "Space Grotesk, sans-serif", letterSpacing: "0.16em", fontSize: "11px", fontWeight: 600 }}>
            50-HOUR DMV LOG
          </div>
          <h1 style={{
            fontFamily: "Space Grotesk, sans-serif", fontSize: "30px", fontWeight: 700, marginTop: "2px",
            background: `linear-gradient(120deg, ${COLORS.ink}, ${COLORS.sageDark})`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
          }}>
            Amelie's Drive Log
          </h1>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "10px" }}>
            <div style={{ display: "flex", gap: "4px" }}>
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} style={{ width: "4px", height: "4px", borderRadius: "999px", background: i % 3 === 0 ? COLORS.gold : COLORS.divider }} />
              ))}
            </div>
            <button onClick={() => setShowWhoPicker((v) => !v)} style={{
              display: "flex", alignItems: "center", gap: "5px", background: COLORS.card, border: "1px solid rgba(43,42,39,0.08)",
              borderRadius: "999px", padding: "4px 10px 4px 4px", cursor: "pointer", boxShadow: SOFT_SHADOW,
            }}>
              <div style={{
                width: "18px", height: "18px", borderRadius: "999px",
                background: deviceName ? COMPANIONS[deviceName].bg : COLORS.locked,
                color: deviceName ? COMPANIONS[deviceName].color : COLORS.inkSoft,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: 700, fontFamily: "Space Grotesk, sans-serif",
              }}>
                {deviceName ? deviceName[0].toUpperCase() : "?"}
              </div>
              <span style={{ fontSize: "11px", color: COLORS.inkSoft, fontWeight: 500 }}>
                {deviceName ? COMPANIONS[deviceName].label : "Who's this?"}
              </span>
            </button>
          </div>
          {showWhoPicker && (
            <div style={{ marginTop: "10px", background: COLORS.card, borderRadius: "14px", padding: "12px", boxShadow: SOFT_SHADOW }}>
              <div style={{ fontSize: "12px", color: COLORS.inkSoft, marginBottom: "8px" }}>This device belongs to</div>
              <div className="flex gap-2">
                {Object.entries(COMPANIONS).map(([key, c]) => (
                  <button key={key} onClick={() => chooseDeviceName(key)} style={{
                    flex: 1, padding: "9px 0", borderRadius: "10px", fontFamily: "Space Grotesk, sans-serif", fontWeight: 600, fontSize: "14px",
                    border: deviceName === key ? `1.5px solid ${c.color}` : "1.5px solid rgba(43,42,39,0.1)",
                    background: deviceName === key ? c.bg : "transparent", color: deviceName === key ? c.color : COLORS.inkSoft, cursor: "pointer",
                  }}>{c.label}</button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Hero session card */}
        <div style={{ background: COLORS.card, borderRadius: "22px", boxShadow: active ? `0 0 0 1.5px ${COLORS.sage}, ${SOFT_SHADOW}` : SOFT_SHADOW, padding: "24px", marginBottom: "20px" }}>
          {!active ? (
            <>
              <div style={{ color: COLORS.inkSoft, fontSize: "13px", marginBottom: "14px" }}>Who's riding along?</div>
              <div className="mb-4"><CompanionToggle value={pendingCompanion} onChange={setPendingCompanion} /></div>
              <div className="mb-1">
                <NightToggle value={pendingNight} onChange={(v) => { setPendingNight(v); setPendingNightAuto(false); }} />
              </div>
              <div style={{ fontSize: "11px", color: COLORS.inkSoft, marginBottom: "18px", display: "flex", alignItems: "center", gap: "6px" }}>
                {pendingNightAuto ? (
                  <>Following the clock — it's currently {formatTime(new Date(clockNow).toISOString())}</>
                ) : (
                  <>
                    Set manually.
                    <button onClick={() => setPendingNightAuto(true)} style={{ background: "none", border: "none", color: COLORS.sageDark, fontWeight: 600, cursor: "pointer", padding: 0, textDecoration: "underline" }}>
                      Follow clock again
                    </button>
                  </>
                )}
              </div>
              <button onClick={startSession} style={{
                width: "100%", background: `linear-gradient(135deg, ${COLORS.sage}, ${COLORS.sageDark})`, color:

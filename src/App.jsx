import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Play, Square, Download, Clock, ChevronDown, X, Trash2, Moon, Sun,
  Plus, Check, ArrowLeft, LogOut, Palette,
} from "lucide-react";
import { doc, onSnapshot, setDoc, deleteDoc } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { db, auth } from "./firebase";
import { getThemeByKey, loadThemePref, saveThemePref, ALL_THEMES } from "./theme";
import { getRoleForEmail, ROLE_LABELS } from "./roles";
import Login from "./Login";

const TOTAL_GOAL = 50;
const NIGHT_GOAL = 10;

const COMPANIONS = {
  mom: { label: "Mom", color: "#C98A93", bg: "rgba(201,138,147,0.15)" },
  dad: { label: "Dad", color: "#B98554", bg: "rgba(185,133,84,0.15)" },
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

const sessionsDocRef = doc(db, "drivelog", "sessions");
const activeDocRef = doc(db, "drivelog", "active");

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

function ProgressBar({ value, goal, color, locked, ticks, bg }) {
  const pct = Math.min(100, (value / goal) * 100);
  return (
    <div style={{ position: "relative", height: "10px", borderRadius: "999px", background: locked, marginTop: "10px", marginBottom: "6px" }}>
      <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: `${pct}%`, borderRadius: "999px", background: `linear-gradient(90deg, ${color}CC, ${color})`, transition: "width 0.4s ease" }} />
      {ticks && ticks.map((t) => (
        <div key={t} title={`${t}h`} style={{ position: "absolute", top: "-3px", left: `${(t / goal) * 100}%`, width: "3px", height: "16px", borderRadius: "2px", background: value >= t ? "#FFFFFF" : bg, opacity: 0.9, transform: "translateX(-1.5px)" }} />
      ))}
    </div>
  );
}

function CompanionToggle({ value, onChange, theme, size = "md" }) {
  const pad2 = size === "sm" ? "7px 0" : "10px 0";
  const fs = size === "sm" ? "13px" : "15px";
  return (
    <div className="flex gap-2">
      {Object.entries(COMPANIONS).map(([key, c]) => (
        <button key={key} type="button" onClick={() => onChange(key)} style={{
          flex: 1, padding: pad2, borderRadius: theme.radiusSm, fontFamily: theme.displayFont, fontWeight: theme.displayWeight, fontSize: fs,
          border: value === key ? `1.5px solid ${c.color}` : `1.5px solid ${theme.inkSoft}33`,
          background: value === key ? c.bg : "transparent", color: value === key ? c.color : theme.inkSoft, cursor: "pointer", transition: "all 0.15s ease",
        }}>{c.label}</button>
      ))}
    </div>
  );
}

function NightToggle({ value, onChange, theme, label }) {
  return (
    <button type="button" onClick={() => onChange(!value)} style={{
      width: "100%", display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", borderRadius: theme.radiusSm,
      border: value ? `1.5px solid ${theme.night}` : `1.5px solid ${theme.inkSoft}33`,
      background: value ? theme.nightBg : "transparent", color: value ? theme.night : theme.inkSoft,
      fontFamily: theme.bodyFont, fontWeight: 500, fontSize: "14px", cursor: "pointer",
    }}>
      {value ? <Moon size={16} /> : <Sun size={16} />} {label} {value ? "— on" : "— off"}
    </button>
  );
}

export default function App() {
  const [authUser, setAuthUser] = useState(undefined); // undefined = still checking, null = signed out
  const [themeKey, setThemeKey] = useState(loadThemePref());
  const [showThemePicker, setShowThemePicker] = useState(false);

  const [sessions, setSessions] = useState([]);
  const [active, setActive] = useState(null);
  const [pendingCompanion, setPendingCompanion] = useState("mom");
  const [pendingNight, setPendingNight] = useState(defaultIsNight());
  const [pendingNightAuto, setPendingNightAuto] = useState(true);
  const [clockNow, setClockNow] = useState(Date.now());
  const [now, setNow] = useState(Date.now());
  const [sessionsLoaded, setSessionsLoaded] = useState(false);
  const [activeLoaded, setActiveLoaded] = useState(false);
  const [showLog, setShowLog] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [toast, setToast] = useState(null);
  const tickRef = useRef(null);
  const toastTimerRef = useRef(null);
  const sessionsRef = useRef([]);

  const [sheet, setSheet] = useState(null);
  const [manualForm, setManualForm] = useState({ date: todayStr(), startTime: "16:00", endTime: "16:30", companion: "mom", isNight: false });

  const theme = getThemeByKey(themeKey);
  const role = authUser ? getRoleForEmail(authUser.email) : null;
  const shoutSectionSize = theme.shout ? "18px" : "15px";
  const shoutButtonSize = theme.shout ? "20px" : "16px";
  const shoutTransform = theme.shout ? "uppercase" : "none";

  // Track login state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setAuthUser(u));
    return () => unsub();
  }, []);

  // Once we know who's logged in, default the companion toggle to them (if mom or dad)
  useEffect(() => {
    if (role === "mom" || role === "dad") setPendingCompanion(role);
  }, [role]);

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

  useEffect(() => {
    if (pendingNightAuto) setPendingNight(defaultIsNight(new Date(clockNow)));
  }, [clockNow, pendingNightAuto]);

  useEffect(() => () => clearTimeout(toastTimerRef.current), []);

  const chooseTheme = (key) => {
    setThemeKey(key);
    saveThemePref(key);
    setShowThemePicker(false);
  };

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
    a.href = url; a.download = `${theme.exportPrefix}-${todayStr()}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const openManual = () => {
    setManualForm({ date: todayStr(), startTime: "16:00", endTime: "16:30", companion: (role === "mom" || role === "dad") ? role : "mom", isNight: isNightFromHour(16) });
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

  const inputStyle = {
    width: "100%", padding: "10px 12px", borderRadius: theme.radiusSm, border: `1.5px solid ${theme.inkSoft}33`,
    background: theme.dark ? "#1B1919" : "#FBF9F5", color: theme.ink, fontFamily: theme.bodyFont, fontSize: "14px", outline: "none",
  };
  const labelStyle = { fontSize: "12px", color: theme.inkSoft, fontWeight: 500, marginBottom: "5px", display: "block" };

  // Still checking auth state
  if (authUser === undefined) {
    return (
      <div style={{ background: theme.bg, minHeight: "100vh" }} className="flex items-center justify-center">
        <div style={{ color: theme.inkSoft, fontFamily: theme.bodyFont }}>Loading…</div>
      </div>
    );
  }

  // Not signed in
  if (!authUser) {
    return <Login theme={theme} />;
  }

  if (!sessionsLoaded || !activeLoaded) {
    return (
      <div style={{ background: theme.bg, minHeight: "100vh" }} className="flex items-center justify-center">
        <div style={{ color: theme.inkSoft, fontFamily: theme.bodyFont }}>Loading…</div>
      </div>
    );
  }

  return (
    <div style={{ background: theme.bg, minHeight: "100vh", fontFamily: theme.bodyFont, position: "relative", transition: "background 0.3s ease" }}>
      {toast && (
        <div style={{ position: "sticky", top: 0, zIndex: 30, background: theme.ink, color: theme.bg, padding: "12px 16px", display: "flex", alignItems: "center", gap: "10px", boxShadow: theme.shadow }}>
          <span style={{ fontSize: "18px" }}>{toast.icon}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: theme.displayFont, fontWeight: theme.displayWeight, fontSize: "14px" }}>{toast.label}</div>
            <div style={{ fontSize: "12px", opacity: 0.75 }}>{toast.detail}</div>
          </div>
          <button onClick={() => setToast(null)} style={{ background: "none", border: "none", color: theme.bg, opacity: 0.6, cursor: "pointer" }}><X size={16} /></button>
        </div>
      )}

      <div className="max-w-md mx-auto px-4 pt-8 pb-28">
        {/* Header */}
        <div className="mb-6">
          <div style={{ color: theme.gold, fontFamily: theme.displayFont, letterSpacing: "0.16em", fontSize: "11px", fontWeight: 600 }}>
            {theme.eyebrow}
          </div>
          <h1 style={{
            fontFamily: theme.displayFont, fontSize: "30px", fontWeight: theme.displayWeight, marginTop: "2px",
            letterSpacing: theme.displayLetterSpacing, fontStyle: theme.displayStyle, color: theme.ink,
          }}>
            {theme.title}
          </h1>
          <div style={{ width: "64px", height: "4px", borderRadius: "999px", marginTop: "6px", background: `linear-gradient(90deg, ${theme.accent}, ${theme.accentDark})` }} />

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "10px" }}>
            <div style={{ display: "flex", gap: theme.dividerStyle === "chain" ? "6px" : "4px" }}>
              {theme.dividerStyle === "chain"
                ? Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} style={{ width: "8px", height: "5px", borderRadius: "3px", border: `1.5px solid ${theme.gold}`, opacity: 0.6 }} />
                  ))
                : Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} style={{ width: "4px", height: "4px", borderRadius: "999px", background: i % 3 === 0 ? theme.gold : theme.divider }} />
                  ))}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowThemePicker((v) => !v)} style={{
                display: "flex", alignItems: "center", gap: "5px", background: theme.card, border: `1px solid ${theme.inkSoft}22`,
                borderRadius: "999px", padding: "5px 10px", cursor: "pointer", boxShadow: theme.shadow, color: theme.inkSoft, fontSize: "11px", fontWeight: 500,
              }}>
                <Palette size={13} /> {theme.label}
              </button>
              <button onClick={() => signOut(auth)} title="Sign out" style={{
                display: "flex", alignItems: "center", gap: "4px", background: "transparent", border: "none",
                color: theme.inkSoft, fontSize: "11px", cursor: "pointer", padding: "5px",
              }}>
                <LogOut size={13} />
              </button>
            </div>
          </div>

          <div style={{ marginTop: "6px", fontSize: "11px", color: theme.inkSoft }}>
            Signed in as {ROLE_LABELS[role] || authUser.email}
          </div>

          {showThemePicker && (
            <div style={{ marginTop: "10px", background: theme.card, borderRadius: theme.radiusSm, padding: "12px", boxShadow: theme.shadow }}>
              <div style={{ fontSize: "12px", color: theme.inkSoft, marginBottom: "8px" }}>Choose a look — anyone can switch this anytime</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px" }}>
                {ALL_THEMES.map((t) => (
                  <button key={t.key} onClick={() => chooseTheme(t.key)} style={{
                    padding: "9px 0", borderRadius: theme.radiusSm, fontFamily: theme.displayFont, fontWeight: theme.displayWeight, fontSize: "14px",
                    border: themeKey === t.key ? `1.5px solid ${theme.accent}` : `1.5px solid ${theme.inkSoft}33`,
                    background: themeKey === t.key ? theme.accentBg : "transparent", color: themeKey === t.key ? theme.accent : theme.inkSoft, cursor: "pointer",
                  }}>{t.label}</button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Hero session card */}
        <div style={{ background: theme.card, borderRadius: theme.radius, boxShadow: active ? `0 0 0 1.5px ${theme.accent}, ${theme.shadow}` : theme.shadow, padding: "24px", marginBottom: "20px" }}>
          {!active ? (
            <>
              <div style={{ color: theme.inkSoft, fontSize: "13px", marginBottom: "14px" }}>{theme.copy.whoRiding}</div>
              <div className="mb-4"><CompanionToggle value={pendingCompanion} onChange={setPendingCompanion} theme={theme} /></div>
              <div className="mb-1">
                <NightToggle value={pendingNight} onChange={(v) => { setPendingNight(v); setPendingNightAuto(false); }} theme={theme} label="Night driving" />
              </div>
              <div style={{ fontSize: "11px", color: theme.inkSoft, marginBottom: "18px", display: "flex", alignItems: "center", gap: "6px" }}>
                {pendingNightAuto ? (
                  <>Following the clock — it's currently {formatTime(new Date(clockNow).toISOString())}</>
                ) : (
                  <>
                    Set manually.
                    <button onClick={() => setPendingNightAuto(true)} style={{ background: "none", border: "none", color: theme.accentDark, fontWeight: 600, cursor: "pointer", padding: 0, textDecoration: "underline" }}>
                      Follow clock again
                    </button>
                  </>
                )}
              </div>
              <button onClick={startSession} style={{
                width: "100%", background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentDark})`, color: theme.onAccent, border: "none",
                borderRadius: theme.radiusSm, padding: "14px 0", fontFamily: theme.displayFont, fontWeight: theme.displayWeight, fontSize: shoutButtonSize,
                letterSpacing: theme.displayLetterSpacing, textTransform: shoutTransform,
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", cursor: "pointer",
                boxShadow: `0 8px 20px -6px ${theme.accent}88`,
              }}>
                <Play size={18} fill={theme.onAccent} /> {theme.copy.startSession}
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between mb-3">
                <div style={{ color: theme.accent, fontSize: "12px", fontWeight: 600, letterSpacing: "0.08em" }}>● SESSION IN PROGRESS</div>
                <div className="flex items-center gap-2">
                  {active.isNight && (
                    <div style={{ color: theme.night, background: theme.nightBg, borderRadius: "999px", padding: "3px 8px", display: "flex", alignItems: "center" }}><Moon size={12} /></div>
                  )}
                  <div style={{ color: COMPANIONS[active.companion].color, background: COMPANIONS[active.companion].bg, fontFamily: theme.displayFont, fontSize: "12px", fontWeight: 600, padding: "3px 10px", borderRadius: "999px" }}>
                    {COMPANIONS[active.companion].label}
                  </div>
                </div>
              </div>
              <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "42px", fontWeight: 700, color: theme.ink, fontVariantNumeric: "tabular-nums", margin: "8px 0 4px" }}>
                {formatElapsed(now - new Date(active.startTime).getTime())}
              </div>
              <div style={{ color: theme.inkSoft, fontSize: "13px", marginBottom: "18px" }}>Started {formatTime(active.startTime)}</div>
              <button onClick={endSession} style={{
                width: "100%", background: theme.rust, color: theme.onRust, border: "none", borderRadius: theme.radiusSm, padding: "14px 0",
                fontFamily: theme.displayFont, fontWeight: theme.displayWeight, fontSize: shoutButtonSize,
                textTransform: shoutTransform, display: "flex", alignItems: "center",
                justifyContent: "center", gap: "8px", cursor: "pointer", boxShadow: `0 8px 20px -6px ${theme.rust}88`,
              }}>
                <Square size={16} fill={theme.onRust} /> {theme.copy.endSession}
              </button>
            </>
          )}
        </div>

        {/* Progress */}
        <div style={{ background: theme.card, borderRadius: theme.radius, boxShadow: theme.shadow, padding: "22px", marginBottom: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <div style={{ fontFamily: theme.displayFont, fontWeight: theme.displayWeight, fontSize: shoutSectionSize, color: theme.ink, letterSpacing: theme.displayLetterSpacing }}>
              {theme.copy.totalHoursLabel}
            </div>
            <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "14px", color: theme.accentDark, fontWeight: 700 }}>
              {totals.totalHours.toFixed(1)} <span style={{ color: theme.inkSoft, fontWeight: 400 }}>/ {TOTAL_GOAL}h</span>
            </div>
          </div>
          <ProgressBar value={totals.totalHours} goal={TOTAL_GOAL} color={theme.accent} locked={theme.locked} bg={theme.bg} ticks={[10, 25, 40]} />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: "18px" }}>
            <div style={{ fontFamily: theme.displayFont, fontWeight: theme.displayWeight, fontSize: shoutSectionSize, color: theme.ink, display: "flex", alignItems: "center", gap: "6px", letterSpacing: theme.displayLetterSpacing }}>
              <Moon size={14} color={theme.night} /> {theme.copy.nightHoursLabel}
            </div>
            <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "14px", color: theme.night, fontWeight: 700 }}>
              {totals.nightHours.toFixed(1)} <span style={{ color: theme.inkSoft, fontWeight: 400 }}>/ {NIGHT_GOAL}h</span>
            </div>
          </div>
          <ProgressBar value={totals.nightHours} goal={NIGHT_GOAL} color={theme.night} locked={theme.locked} bg={theme.bg} ticks={[5]} />

          <div style={{ color: theme.inkSoft, fontSize: "13px", marginTop: "12px" }}>{encouragement(totalPct)}</div>
        </div>

        {/* Milestone shelf */}
        <div style={{ marginBottom: "22px" }}>
          <div style={{ fontFamily: theme.displayFont, fontWeight: theme.displayWeight, fontSize: shoutSectionSize, color: theme.ink, marginBottom: "10px", letterSpacing: theme.displayLetterSpacing }}>
            Milestones
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
            {MILESTONES.map((m) => {
              const done = achieved.has(m.id);
              return (
                <div key={m.id} title={m.detail} style={{ background: done ? theme.goldBg : theme.locked, borderRadius: theme.radiusSm, padding: "12px 6px", textAlign: "center", opacity: done ? 1 : 0.55, boxShadow: done ? `0 4px 12px -6px ${theme.gold}88` : "none" }}>
                  <div style={{ fontSize: "18px", marginBottom: "4px" }}>{m.icon}</div>
                  <div style={{ fontSize: "10px", color: done ? theme.ink : theme.inkSoft, fontWeight: 500, lineHeight: 1.2 }}>{m.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Log header */}
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => setShowLog((v) => !v)} style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: "none", color: theme.ink, fontFamily: theme.displayFont, fontWeight: theme.displayWeight, fontSize: shoutButtonSize, cursor: "pointer", padding: 0 }}>
            Session Log
            <ChevronDown size={16} color={theme.inkSoft} style={{ transform: showLog ? "rotate(180deg)" : "none", transition: "transform 0.15s ease" }} />
          </button>
          {sessions.length > 0 && (
            <button onClick={exportCSV} style={{ display: "flex", alignItems: "center", gap: "6px", background: "transparent", border: `1px solid ${theme.gold}`, color: theme.gold, borderRadius: theme.radiusSm, padding: "6px 12px", fontFamily: theme.bodyFont, fontWeight: 500, fontSize: "13px", cursor: "pointer" }}>
              <Download size={14} /> Export CSV
            </button>
          )}
        </div>

        {showLog && (
          sessions.length === 0 ? (
            <div style={{ color: theme.inkSoft, fontSize: "14px", background: theme.card, borderRadius: theme.radius, padding: "24px 18px", textAlign: "center", border: `1px dashed ${theme.divider}` }}>
              No sessions yet. Start one above, or tap + to add one manually.
            </div>
          ) : (
            <div>
              {dateKeys.map((date, idx) => (
                <div key={date}>
                  <div style={{ color: theme.inkSoft, fontFamily: theme.displayFont, fontSize: "12px", letterSpacing: "0.04em", fontWeight: 500, margin: idx === 0 ? "0 0 8px" : "18px 0 8px", borderBottom: `1px dashed ${theme.divider}`, paddingBottom: "6px" }}>
                    {formatDateLabel(date)}
                  </div>
                  {grouped[date].sort((a, b) => new Date(b.startTime) - new Date(a.startTime)).map((s) => (
                    <div key={s.id} style={{ background: theme.card, borderRadius: theme.radiusSm, padding: "12px 14px", marginBottom: "8px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: theme.shadow }}>
                      <div className="flex items-center gap-3">
                        <button onClick={() => toggleNight(s.id)} title="Toggle night driving" style={{ width: "28px", height: "28px", borderRadius: "999px", border: "none", background: s.isNight ? theme.nightBg : theme.locked, color: s.isNight ? theme.night : theme.inkSoft, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
                          {s.isNight ? <Moon size={13} /> : <Sun size={13} />}
                        </button>
                        <div style={{ color: COMPANIONS[s.companion]?.color ?? theme.inkSoft, background: COMPANIONS[s.companion]?.bg ?? "transparent", fontFamily: theme.displayFont, fontSize: "11px", fontWeight: 600, padding: "3px 9px", borderRadius: "999px", minWidth: "38px", textAlign: "center" }}>
                          {COMPANIONS[s.companion]?.label ?? s.companion}
                        </div>
                        <div>
                          <div style={{ color: theme.ink, fontSize: "14px" }}>{formatTime(s.startTime)} – {formatTime(s.endTime)}</div>
                          <div style={{ color: theme.inkSoft, fontSize: "12px", fontFamily: "JetBrains Mono, monospace", display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                            <Clock size={11} /> {formatDuration(s.durationMinutes)}
                          </div>
                        </div>
                      </div>
                      {confirmDelete === s.id ? (
                        <div className="flex items-center gap-1">
                          <button onClick={() => deleteSession(s.id)} style={{ background: theme.rust, border: "none", color: "#FFF", fontSize: "11px", fontWeight: 600, borderRadius: theme.radiusSm, padding: "5px 8px", cursor: "pointer" }}>Delete</button>
                          <button onClick={() => setConfirmDelete(null)} style={{ background: "transparent", border: "none", color: theme.inkSoft, cursor: "pointer", padding: "5px" }}><X size={14} /></button>
                        </div>
                      ) : (
                        <button onClick={() => setConfirmDelete(s.id)} style={{ background: "transparent", border: "none", color: theme.inkSoft, cursor: "pointer", padding: "4px", opacity: 0.6 }}><Trash2 size={15} /></button>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* Floating add button */}
      {!sheet && (
        <button onClick={openManual} style={{
          position: "fixed", bottom: "24px", right: "24px", width: "58px", height: "58px", borderRadius: "999px",
          background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentDark})`, border: "none", color: theme.onAccent,
          display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
          boxShadow: `0 10px 24px -6px ${theme.accent}88`, zIndex: 25,
        }}>
          <Plus size={26} />
        </button>
      )}

      {/* Bottom sheet: manual add */}
      {sheet === "manual" && (
        <div style={{ position: "fixed", inset: 0, zIndex: 40 }}>
          <div onClick={closeSheet} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)" }} />
          <div className="max-w-md mx-auto" style={{
            position: "absolute", left: 0, right: 0, bottom: 0, background: theme.bg,
            borderTopLeftRadius: "24px", borderTopRightRadius: "24px", padding: "20px 20px 28px",
            maxHeight: "85vh", overflowY: "auto", boxShadow: "0 -12px 32px rgba(0,0,0,0.3)",
          }}>
            <div style={{ width: "36px", height: "4px", borderRadius: "999px", background: theme.divider, margin: "0 auto 18px" }} />
            <div className="flex items-center gap-2 mb-4">
              <button onClick={closeSheet} style={{ background: "none", border: "none", color: theme.inkSoft, cursor: "pointer", padding: "4px" }}><ArrowLeft size={18} /></button>
              <div style={{ fontFamily: theme.displayFont, fontWeight: theme.displayWeight, fontSize: "18px", color: theme.ink }}>Add a session</div>
            </div>
            <div className="mb-3">
              <label style={labelStyle}>Date</label>
              <input type="date" value={manualForm.date} onChange={(e) => setManualForm((f) => ({ ...f, date: e.target.value }))} style={inputStyle} />
            </div>
            <div className="flex gap-3 mb-3">
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Start time</label>
                <input type="time" value={manualForm.startTime} onChange={(e) => setManualForm((f) => ({ ...f, startTime: e.target.value, isNight: isNightFromHour(parseInt(e.target.value.split(":")[0], 10)) }))} style={inputStyle} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>End time</label>
                <input type="time" value={manualForm.endTime} onChange={(e) => setManualForm((f) => ({ ...f, endTime: e.target.value }))} style={inputStyle} />
              </div>
            </div>
            <div className="mb-3">
              <label style={labelStyle}>Who was along</label>
              <CompanionToggle value={manualForm.companion} onChange={(v) => setManualForm((f) => ({ ...f, companion: v }))} theme={theme} />
            </div>
            <div className="mb-5">
              <NightToggle value={manualForm.isNight} onChange={(v) => setManualForm((f) => ({ ...f, isNight: v }))} theme={theme} label="Night driving" />
            </div>
            <button onClick={submitManual} style={{ width: "100%", background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentDark})`, color: theme.onAccent, border: "none", borderRadius: theme.radiusSm, padding: "14px 0", fontFamily: theme.displayFont, fontWeight: theme.displayWeight, fontSize: "16px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              <Check size={18} /> Add session
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Visual "skins" for the app. Anyone can pick any of these, regardless of
// who's logged in — the last choice is remembered locally per device.
//
// onAccent / onRust: safe text/icon colors to place on top of the accent-
// or rust-colored buttons for that theme (some accents are light, some dark).
// shout: if true, buttons and section headers go uppercase and a bit bigger
// (fits loud/poster-y themes); if false, they stay understated.

export const THEME_PREF_KEY = "drivelog:theme-pref";

export const MOM_THEME = {
  key: "mom",
  dark: false,
  label: "Cozy",
  title: "Amelie's Drive Log",
  eyebrow: "50-HOUR DMV LOG",
  exportPrefix: "driving-log",

  bg: "#F5F1E8",
  card: "#FFFFFF",
  ink: "#2B2A27",
  inkSoft: "#8A8377",
  accent: "#6E9179",
  accentDark: "#587560",
  accentBg: "rgba(110,145,121,0.12)",
  onAccent: "#FFFFFF",
  night: "#4A6C8C",
  nightBg: "rgba(74,108,140,0.12)",
  rust: "#BF5B3E",
  onRust: "#FFFFFF",
  gold: "#D89B4A",
  goldBg: "rgba(216,155,74,0.15)",
  divider: "#E6E1D3",
  locked: "#F0ECE1",

  displayFont: "Space Grotesk, sans-serif",
  bodyFont: "Work Sans, sans-serif",
  radius: "22px",
  radiusSm: "12px",
  shadow: "0 1px 2px rgba(43,42,39,0.04), 0 8px 20px -10px rgba(43,42,39,0.10)",
  dividerStyle: "dots",
  displayWeight: 700,
  displayLetterSpacing: "0",
  displayStyle: "normal",
  shout: false,

  copy: {
    whoRiding: "Who's riding along?",
    startSession: "Start session",
    endSession: "End session",
    totalHoursLabel: "Total hours",
    nightHoursLabel: "Night hours",
    dayHoursLabel: "Day hours",
  },
};

export const DAD_THEME = {
  key: "dad",
  dark: true,
  label: "Biker",
  title: "Road Rage Log",
  eyebrow: "50-HOUR RIDE-OR-DIE LOG",
  exportPrefix: "road-rage-log",

  bg: "#161414",
  card: "#221F1F",
  ink: "#F2EFE9",
  inkSoft: "#9C9490",
  accent: "#FF6A3D",
  accentDark: "#C81E1E",
  accentBg: "rgba(255,106,61,0.14)",
  onAccent: "#161414",
  night: "#7A93A6",
  nightBg: "rgba(122,147,166,0.16)",
  rust: "#8B0000",
  onRust: "#FFFFFF",
  gold: "#D4AF37",
  goldBg: "rgba(212,175,55,0.16)",
  divider: "#3A3535",
  locked: "#2C2828",

  displayFont: "'Bebas Neue', sans-serif",
  bodyFont: "Oswald, sans-serif",
  radius: "6px",
  radiusSm: "4px",
  shadow: "0 1px 2px rgba(0,0,0,0.4), 0 10px 26px -10px rgba(255,80,30,0.25)",
  dividerStyle: "chain",
  displayWeight: 400,
  displayLetterSpacing: "0.03em",
  displayStyle: "italic",
  shout: true,

  copy: {
    whoRiding: "Who's riding shotgun?",
    startSession: "Start the ride",
    endSession: "End the ride",
    totalHoursLabel: "Miles on the clock",
    nightHoursLabel: "Night run",
    dayHoursLabel: "Day miles",
  },
};

export const NEON_THEME = {
  key: "neon",
  dark: true,
  label: "Arcade",
  title: "Level Up Log",
  eyebrow: "50-HOUR HIGH SCORE RUN",
  exportPrefix: "level-up-log",

  bg: "#120B24",
  card: "#1B1130",
  ink: "#F5F0FF",
  inkSoft: "#9C8FC2",
  accent: "#00E5FF",
  accentDark: "#FF2FD1",
  accentBg: "rgba(0,229,255,0.14)",
  onAccent: "#0B0716",
  night: "#B14EFF",
  nightBg: "rgba(177,78,255,0.16)",
  rust: "#FF3864",
  onRust: "#FFFFFF",
  gold: "#C6FF00",
  goldBg: "rgba(198,255,0,0.16)",
  divider: "#2E2050",
  locked: "#241A3D",

  displayFont: "'Orbitron', sans-serif",
  bodyFont: "Rubik, sans-serif",
  radius: "16px",
  radiusSm: "10px",
  shadow: "0 0 0 1px rgba(0,229,255,0.25), 0 0 24px -4px rgba(0,229,255,0.35)",
  dividerStyle: "dots",
  displayWeight: 700,
  displayLetterSpacing: "0.04em",
  displayStyle: "normal",
  shout: true,

  copy: {
    whoRiding: "Choose your co-pilot",
    startSession: "Press start",
    endSession: "Game over",
    totalHoursLabel: "XP earned",
    nightHoursLabel: "Night mode XP",
    dayHoursLabel: "Day mode XP",
  },
};

export const KAWAII_THEME = {
  key: "kawaii",
  dark: false,
  label: "Kawaii",
  title: "Sparkle Drive Log",
  eyebrow: "50 HOURS OF SPARKLE",
  exportPrefix: "sparkle-drive-log",

  bg: "#FFF6FA",
  card: "#FFFFFF",
  ink: "#6B4C5C",
  inkSoft: "#B79AA8",
  accent: "#FF9FC8",
  accentDark: "#F4739E",
  accentBg: "rgba(255,159,200,0.16)",
  onAccent: "#FFFFFF",
  night: "#A78BFA",
  nightBg: "rgba(167,139,250,0.16)",
  rust: "#FF8A8A",
  onRust: "#6B4C5C",
  gold: "#FFD166",
  goldBg: "rgba(255,209,102,0.2)",
  divider: "#FCE1EC",
  locked: "#FCEEF4",

  displayFont: "'Baloo 2', cursive",
  bodyFont: "Nunito, sans-serif",
  radius: "26px",
  radiusSm: "16px",
  shadow: "0 2px 4px rgba(255,159,200,0.15), 0 12px 24px -10px rgba(255,159,200,0.35)",
  dividerStyle: "dots",
  displayWeight: 600,
  displayLetterSpacing: "0",
  displayStyle: "normal",
  shout: false,

  copy: {
    whoRiding: "Who's coming along? 🌸",
    startSession: "Let's go! 🚗💫",
    endSession: "We made it! 🎀",
    totalHoursLabel: "Hours of sparkle",
    nightHoursLabel: "Starlight hours",
    dayHoursLabel: "Daylight hours",
  },
};

export const RETRO_THEME = {
  key: "retro",
  dark: false,
  label: "Retro",
  title: "Rewind Drive Log",
  eyebrow: "50-HOUR THROWBACK LOG",
  exportPrefix: "rewind-drive-log",

  bg: "#F4ECD8",
  card: "#FFF9EC",
  ink: "#2B2118",
  inkSoft: "#8A7660",
  accent: "#FF5A36",
  accentDark: "#C23B1E",
  accentBg: "rgba(255,90,54,0.14)",
  onAccent: "#FFFFFF",
  night: "#2E7D8C",
  nightBg: "rgba(46,125,140,0.14)",
  rust: "#B3312C",
  onRust: "#FFFFFF",
  gold: "#FFC93C",
  goldBg: "rgba(255,201,60,0.18)",
  divider: "#E4D5B0",
  locked: "#ECE0C4",

  displayFont: "'Bungee', cursive",
  bodyFont: "Poppins, sans-serif",
  radius: "10px",
  radiusSm: "8px",
  shadow: "3px 3px 0 rgba(43,33,24,0.12), 0 10px 24px -12px rgba(43,33,24,0.25)",
  dividerStyle: "chain",
  displayWeight: 400,
  displayLetterSpacing: "0.02em",
  displayStyle: "normal",
  shout: true,

  copy: {
    whoRiding: "Who's riding shotgun?",
    startSession: "Hit the gas",
    endSession: "Pull over",
    totalHoursLabel: "Total hours",
    nightHoursLabel: "Night hours",
    dayHoursLabel: "Day hours",
  },
};

export const MONO_THEME = {
  key: "mono",
  dark: false,
  label: "Mono",
  title: "Amelie's Drive Log",
  eyebrow: "50 HOUR LOG",
  exportPrefix: "drive-log",

  bg: "#FFFFFF",
  card: "#FFFFFF",
  ink: "#111111",
  inkSoft: "#767676",
  accent: "#111111",
  accentDark: "#000000",
  accentBg: "rgba(17,17,17,0.06)",
  onAccent: "#FFFFFF",
  night: "#444444",
  nightBg: "rgba(68,68,68,0.08)",
  rust: "#555555",
  onRust: "#FFFFFF",
  gold: "#111111",
  goldBg: "rgba(17,17,17,0.08)",
  divider: "#E5E5E5",
  locked: "#F2F2F2",

  displayFont: "Archivo, sans-serif",
  bodyFont: "Inter, sans-serif",
  radius: "4px",
  radiusSm: "2px",
  shadow: "0 0 0 1px rgba(17,17,17,0.08)",
  dividerStyle: "dots",
  displayWeight: 700,
  displayLetterSpacing: "-0.01em",
  displayStyle: "normal",
  shout: false,

  copy: {
    whoRiding: "Who's riding along?",
    startSession: "Start session",
    endSession: "End session",
    totalHoursLabel: "Total hours",
    nightHoursLabel: "Night hours",
    dayHoursLabel: "Day hours",
  },
};

export const ALL_THEMES = [MOM_THEME, DAD_THEME, NEON_THEME, KAWAII_THEME, RETRO_THEME, MONO_THEME];

const THEME_BY_KEY = ALL_THEMES.reduce((acc, t) => { acc[t.key] = t; return acc; }, {});

export function getThemeByKey(key) {
  return THEME_BY_KEY[key] || MOM_THEME;
}

// Generic fallback used only before login resolves, to avoid a flash of the
// default theme while we're still figuring out who's signed in.
export function loadThemePref() {
  try {
    const stored = window.localStorage.getItem(THEME_PREF_KEY);
    return THEME_BY_KEY[stored] ? stored : "mom";
  } catch (e) {
    return "mom";
  }
}

export function saveThemePref(key) {
  try {
    window.localStorage.setItem(THEME_PREF_KEY, key);
  } catch (e) {
    /* ignore */
  }
}

// Per-person theme preference, so it follows whoever is logged in regardless
// of which device they're on. Firestore is the source of truth (see App.jsx);
// this local cache is just a fast fallback for instant load on this device.
export function loadThemePrefForRole(role) {
  try {
    const stored = window.localStorage.getItem(`${THEME_PREF_KEY}:${role}`);
    return THEME_BY_KEY[stored] ? stored : null;
  } catch (e) {
    return null;
  }
}

export function saveThemePrefForRole(role, key) {
  try {
    window.localStorage.setItem(`${THEME_PREF_KEY}:${role}`, key);
  } catch (e) {
    /* ignore */
  }
}


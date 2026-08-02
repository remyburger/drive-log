// Two visual "skins" for the app, switched based on the device's "Who's this?" picker.

export const MOM_THEME = {
  key: "mom",
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
  night: "#4A6C8C",
  nightBg: "rgba(74,108,140,0.12)",
  rust: "#BF5B3E",
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

  copy: {
    whoRiding: "Who's riding along?",
    startSession: "Start session",
    endSession: "End session",
    totalHoursLabel: "Total hours",
    nightHoursLabel: "Night hours",
  },
};

export const DAD_THEME = {
  key: "dad",
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
  night: "#7A93A6",
  nightBg: "rgba(122,147,166,0.16)",
  rust: "#8B0000",
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

  copy: {
    whoRiding: "Who's riding shotgun?",
    startSession: "Start the ride",
    endSession: "End the ride",
    totalHoursLabel: "Miles on the clock",
    nightHoursLabel: "Night run",
  },
};

export function getTheme(deviceName) {
  return deviceName === "dad" ? DAD_THEME : MOM_THEME;
}

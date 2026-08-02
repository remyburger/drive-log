import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";
import { LogIn } from "lucide-react";

export default function Login({ theme }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (err) {
      console.error(err);
      setError("Couldn't sign in — check the email and password and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: theme.radiusSm,
    border: `1.5px solid ${theme.inkSoft}33`,
    background: theme.key === "dad" ? "#1B1919" : "#FBF9F5",
    color: theme.ink,
    fontFamily: theme.bodyFont,
    fontSize: "15px",
    outline: "none",
  };

  return (
    <div style={{ background: theme.bg, minHeight: "100vh", fontFamily: theme.bodyFont, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ width: "100%", maxWidth: "360px", background: theme.card, borderRadius: theme.radius, boxShadow: theme.shadow, padding: "28px 24px" }}>
        <div style={{ color: theme.gold, fontFamily: theme.displayFont, letterSpacing: "0.16em", fontSize: "11px", fontWeight: 600 }}>
          {theme.eyebrow}
        </div>
        <h1 style={{
          fontFamily: theme.displayFont, fontSize: "26px", fontWeight: theme.displayWeight, color: theme.ink,
          letterSpacing: theme.displayLetterSpacing, fontStyle: theme.displayStyle, marginTop: "2px", marginBottom: "22px",
        }}>
          Sign in
        </h1>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "12px" }}>
            <label style={{ fontSize: "12px", color: theme.inkSoft, fontWeight: 500, marginBottom: "5px", display: "block" }}>Email</label>
            <input
              type="email"
              autoCapitalize="none"
              autoCorrect="off"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
              required
            />
          </div>
          <div style={{ marginBottom: "18px" }}>
            <label style={{ fontSize: "12px", color: theme.inkSoft, fontWeight: 500, marginBottom: "5px", display: "block" }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
              required
            />
          </div>

          {error && (
            <div style={{ color: theme.rust, fontSize: "13px", marginBottom: "14px" }}>{error}</div>
          )}

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: "100%", background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentDark})`,
              color: theme.key === "dad" ? "#161414" : "#FFFFFF", border: "none", borderRadius: theme.radiusSm,
              padding: "13px 0", fontFamily: theme.displayFont, fontWeight: theme.displayWeight, fontSize: "16px",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              cursor: submitting ? "default" : "pointer", opacity: submitting ? 0.7 : 1,
            }}
          >
            <LogIn size={17} /> {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}

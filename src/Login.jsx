import React, { useState } from "react";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "./firebase";
import { LogIn, Mail } from "lucide-react";

export default function Login({ theme }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetStatus, setResetStatus] = useState(""); // "", "sending", "sent", "error"

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

  const handleReset = async (e) => {
    e.preventDefault();
    setResetStatus("sending");
    try {
      await sendPasswordResetEmail(auth, resetEmail.trim());
      setResetStatus("sent");
    } catch (err) {
      console.error(err);
      setResetStatus("error");
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: theme.radiusSm,
    border: `1.5px solid ${theme.inkSoft}33`,
    background: theme.dark ? "#1B1919" : "#FBF9F5",
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
          {showReset ? "Reset password" : "Sign in"}
        </h1>

        {!showReset ? (
          <>
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
              <div style={{ marginBottom: "10px" }}>
                <label style={{ fontSize: "12px", color: theme.inkSoft, fontWeight: 500, marginBottom: "5px", display: "block" }}>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={inputStyle}
                  required
                />
              </div>

              <div style={{ textAlign: "right", marginBottom: "16px" }}>
                <button
                  type="button"
                  onClick={() => { setShowReset(true); setResetEmail(email); setResetStatus(""); }}
                  style={{ background: "none", border: "none", color: theme.inkSoft, fontSize: "12px", cursor: "pointer", padding: 0, textDecoration: "underline" }}
                >
                  Forgot password?
                </button>
              </div>

              {error && (
                <div style={{ color: theme.rust, fontSize: "13px", marginBottom: "14px" }}>{error}</div>
              )}

              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: "100%", background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentDark})`,
                  color: theme.onAccent, border: "none", borderRadius: theme.radiusSm,
                  padding: "13px 0", fontFamily: theme.displayFont, fontWeight: theme.displayWeight, fontSize: "16px",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                  cursor: submitting ? "default" : "pointer", opacity: submitting ? 0.7 : 1,
                }}
              >
                <LogIn size={17} /> {submitting ? "Signing in…" : "Sign in"}
              </button>
            </form>
          </>
        ) : (
          <>
            {resetStatus === "sent" ? (
              <div>
                <div style={{ color: theme.ink, fontSize: "14px", marginBottom: "18px", lineHeight: 1.5 }}>
                  If an account exists for <strong>{resetEmail.trim()}</strong>, a password reset email is on its way. Check your inbox (and spam folder).
                </div>
                <button
                  onClick={() => { setShowReset(false); setResetStatus(""); }}
                  style={{
                    width: "100%", background: "transparent", border: `1.5px solid ${theme.inkSoft}33`, color: theme.ink,
                    borderRadius: theme.radiusSm, padding: "12px 0", fontFamily: theme.displayFont, fontWeight: theme.displayWeight, fontSize: "15px", cursor: "pointer",
                  }}
                >
                  Back to sign in
                </button>
              </div>
            ) : (
              <form onSubmit={handleReset}>
                <div style={{ color: theme.inkSoft, fontSize: "13px", marginBottom: "16px", lineHeight: 1.5 }}>
                  Enter the account email and we'll send a link to reset the password.
                </div>
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ fontSize: "12px", color: theme.inkSoft, fontWeight: 500, marginBottom: "5px", display: "block" }}>Email</label>
                  <input
                    type="email"
                    autoCapitalize="none"
                    autoCorrect="off"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    style={inputStyle}
                    required
                  />
                </div>

                {resetStatus === "error" && (
                  <div style={{ color: theme.rust, fontSize: "13px", marginBottom: "14px" }}>
                    Couldn't send that — double check the email address and try again.
                  </div>
                )}

                <button
                  type="submit"
                  disabled={resetStatus === "sending"}
                  style={{
                    width: "100%", background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentDark})`,
                    color: theme.onAccent, border: "none", borderRadius: theme.radiusSm,
                    padding: "13px 0", fontFamily: theme.displayFont, fontWeight: theme.displayWeight, fontSize: "16px",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                    cursor: resetStatus === "sending" ? "default" : "pointer", opacity: resetStatus === "sending" ? 0.7 : 1, marginBottom: "12px",
                  }}
                >
                  <Mail size={17} /> {resetStatus === "sending" ? "Sending…" : "Send reset email"}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowReset(false); setResetStatus(""); }}
                  style={{ width: "100%", background: "transparent", border: "none", color: theme.inkSoft, fontSize: "13px", cursor: "pointer", padding: "6px 0" }}
                >
                  Back to sign in
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}

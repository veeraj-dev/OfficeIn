import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../state/auth.jsx";

function useLoginFlavor() {
  const loc = useLocation();
  const params = new URLSearchParams(loc.search || "");
  const as = String(params.get("as") || "").toLowerCase();
  if (as === "admin") return "admin";
  if (as === "employee") return "employee";
  return "generic";
}

export default function LoginPage() {
  const { login, normalizeError } = useAuth();
  const nav = useNavigate();
  const flavor = useLoginFlavor();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const u = await login(email, password);
      nav("/app", { replace: true });
      // If user picked a portal but logged in as the other role,
      // we still route into the app; UI/permissions are enforced by role.
      // (No extra redirect needed here.)
    } catch (err) {
      setError(normalizeError(err));
    } finally {
      setBusy(false);
    }
  }

  const title =
    flavor === "admin"
      ? "Admin login"
      : flavor === "employee"
        ? "Employee login"
        : "Welcome back";

  const subtitle =
    flavor === "admin"
      ? "Sign in to review employee leave requests."
      : flavor === "employee"
        ? "Sign in to request leave and track approvals."
        : "Sign in to manage departments, employees and leave requests.";

  return (
    <div className="container" style={{ maxWidth: 460 }}>
      <div className="card">
        <h1 className="title">{title}</h1>
        <p className="subtitle">{subtitle}</p>

        <form onSubmit={onSubmit}>
          <label>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
          <label>Password</label>
          <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" type="password" />
          <div style={{ height: 12 }} />
          {error && <div className="error">{error}</div>}
          <div style={{ height: 12 }} />
          <button className="primary" disabled={busy} style={{ width: "100%" }}>
            {busy ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}


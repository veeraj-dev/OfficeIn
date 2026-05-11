import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../state/auth.jsx";

function LoginPanel({ heading, accent = "admin", onSubmit, busy, error }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className={`loginPanel loginPanel--${accent}`}>
      <div className="loginPanelHeader">
        <div className="loginPanelTitle">{heading}</div>
      </div>

      <div className="loginPanelBody">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit({ email, password });
          }}
        >
          <label>{accent === "employee" ? "Employee Email / ID" : "Admin Email / Username"}</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />

          <label>Password</label>
          <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" />

          <div className="loginPanelRow">
            <button type="button" className="btnLink" disabled>
              Forgot Password?
            </button>
          </div>

          {error && <div className="error" style={{ marginTop: 10 }}>{error}</div>}

          <div style={{ height: 12 }} />
          <button className={`primary ${accent === "employee" ? "primaryEmployee" : ""}`} disabled={busy} style={{ width: "100%" }}>
            {busy ? "Signing in..." : (accent === "employee" ? "Employee Login" : "Admin Login")}
          </button>
        </form>
      </div>

      <div className="loginPanelFooter">
        <div style={{ height: 16 }} />
      </div>
    </div>
  );
}

export default function LandingPage() {
  const { login, normalizeError } = useAuth();
  const nav = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState({ admin: "", employee: "" });

  async function doLogin(which, { email, password }) {
    setBusy(true);
    setError((p) => ({ ...p, [which]: "" }));
    try {
      await login(email, password);
      nav("/app", { replace: true });
    } catch (e) {
      setError((p) => ({ ...p, [which]: normalizeError(e) }));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container" style={{ maxWidth: 1080 }}>
      <div className="loginLandingHeader">
        <h1 className="loginLandingTitle">Office Management</h1>
      </div>

      <div className="loginLandingGrid">
        <LoginPanel
          heading="Administrator Access"
          accent="admin"
          busy={busy}
          error={error.admin}
          onSubmit={(payload) => doLogin("admin", payload)}
        />
        <LoginPanel
          heading="Employee Access"
          accent="employee"
          busy={busy}
          error={error.employee}
          onSubmit={(payload) => doLogin("employee", payload)}
        />
      </div>
    </div>
  );
}


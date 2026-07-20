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

const MSG_EMPLOYEE_ONLY =
  "This sign-in is for employees only. Use Administrator Access if you are an admin or manager.";
const MSG_ADMIN_ONLY =
  "This sign-in is for administrators and managers only. Use Employee Access if you are an employee.";

export default function LandingPage() {
  const { login, logout, normalizeError } = useAuth();
  const nav = useNavigate();
  const [busy, setBusy] = useState({ admin: false, employee: false });
  const [error, setError] = useState({ admin: "", employee: "" });

  async function doLogin(which, { email, password }) {
    setBusy((b) => ({ ...b, [which]: true }));
    setError((p) => ({ ...p, [which]: "" }));
    try {
      const user = await login(email, password);
      if (which === "employee") {
        if (user.role !== "employee") {
          logout();
          setError((p) => ({ ...p, employee: MSG_EMPLOYEE_ONLY }));
          return;
        }
      } else if (which === "admin") {
        if (user.role !== "admin" && user.role !== "manager") {
          logout();
          setError((p) => ({ ...p, admin: MSG_ADMIN_ONLY }));
          return;
        }
      }
      nav("/app", { replace: true });
    } catch (e) {
      setError((p) => ({ ...p, [which]: normalizeError(e) }));
    } finally {
      setBusy((b) => ({ ...b, [which]: false }));
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
          busy={busy.admin}
          error={error.admin}
          onSubmit={(payload) => doLogin("admin", payload)}
        />
        <LoginPanel
          heading="Employee Access"
          accent="employee"
          busy={busy.employee}
          error={error.employee}
          onSubmit={(payload) => doLogin("employee", payload)}
        />
      </div>
    </div>
  );
}


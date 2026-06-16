import React, { useMemo } from "react";
import { useAuth } from "../state/auth.jsx";
import { useGetHealthQuery } from "../store/officeApi.js";

export default function DashboardPage() {
  const { user, isManager, normalizeError } = useAuth();
  const { data: health, error: healthError, isError } = useGetHealthQuery();
  const error = useMemo(() => (isError ? normalizeError(healthError) : ""), [isError, healthError, normalizeError]);

  return (
    <div className="grid">
      <div className="card">
        <div className="row">
          <div>
            <h2 className="title" style={{ marginBottom: 2 }}>Hi, {user?.name}</h2>
            <p className="subtitle">
              Role: <b>{user?.role}</b>. {isManager ? "You can manage departments and employees." : "You can request leave and view your requests."}
            </p>
          </div>
          <div className="spacer" />
          {health && <div className="ok">API: {health.service}</div>}
        </div>
        {error && <div className="error" style={{ marginTop: 12 }}>{error}</div>}
      </div>

      <div className="grid" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
        <div className="card">
          <h3 className="title">Departments</h3>
          <p className="subtitle">Create and organize teams.</p>
        </div>
        <div className="card">
          <h3 className="title">Employees</h3>
          <p className="subtitle">Onboard and maintain profiles.</p>
        </div>
        <div className="card">
          <h3 className="title">Leaves</h3>
          <p className="subtitle">Request, approve, and track leave.</p>
        </div>
      </div>
    </div>
  );
}


import React, { useState } from "react";
import { useAuth } from "../state/auth.jsx";
import { useCreateLeaveMutation, useGetMyLeavesQuery } from "../store/officeApi.js";

function formatDate(d) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString();
  } catch {
    return "—";
  }
}

export default function EmployeeLeavesPage() {
  const { normalizeError } = useAuth();
  const { data: mine = [], error: loadError, isError: loadFailed } = useGetMyLeavesQuery();
  const [createLeave, { isLoading: submitting }] = useCreateLeaveMutation();
  const [error, setError] = useState("");
  const [form, setForm] = useState({ from: "", to: "", reason: "" });

  const combinedError = loadFailed ? normalizeError(loadError) : error;

  async function requestLeave(e) {
    e.preventDefault();
    setError("");
    try {
      await createLeave(form).unwrap();
      setForm({ from: "", to: "", reason: "" });
    } catch (err) {
      setError(normalizeError(err));
    }
  }

  return (
    <div className="grid">
      <div className="card">
        <h2 className="title">My Leaves</h2>
        <p className="subtitle">Apply for leave and track approval status.</p>
        {combinedError && <div className="error" style={{ marginTop: 12 }}>{combinedError}</div>}
      </div>

      <div className="card">
        <h3 className="title">Apply leave</h3>
        <form onSubmit={requestLeave}>
          <div className="cols2">
            <div>
              <label>From</label>
              <input type="date" value={form.from} onChange={(e) => setForm((p) => ({ ...p, from: e.target.value }))} />
            </div>
            <div>
              <label>To</label>
              <input type="date" value={form.to} onChange={(e) => setForm((p) => ({ ...p, to: e.target.value }))} />
            </div>
          </div>
          <label>Reason</label>
          <textarea
            rows={3}
            value={form.reason}
            onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))}
            placeholder="Optional"
          />
          <div style={{ height: 12 }} />
          <button className="primary" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit request"}
          </button>
        </form>
      </div>

      <div className="card">
        <h3 className="title">Requests</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Period</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Review</th>
            </tr>
          </thead>
          <tbody>
            {mine.map((r) => (
              <tr key={r._id}>
                <td>
                  {formatDate(r.from)} → {formatDate(r.to)}
                </td>
                <td className="hint">{r.reason || "—"}</td>
                <td>
                  <b>{r.status}</b>
                </td>
                <td className="hint">{r.reviewNote ? r.reviewNote : "—"}</td>
              </tr>
            ))}
            {mine.length === 0 && (
              <tr>
                <td colSpan={4} className="hint">
                  No leave requests yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

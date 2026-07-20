import React, { useMemo, useState } from "react";
import { useAuth } from "../state/auth.jsx";
import { useGetAllLeavesQuery, useUpdateLeaveStatusMutation } from "../store/officeApi.js";

function formatDate(d) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString();
  } catch {
    return "—";
  }
}

export default function AdminLeavesPage() {
  const { normalizeError } = useAuth();
  const { data: all = [], error: loadError, isError: loadFailed } = useGetAllLeavesQuery();
  const [updateLeaveStatus, { isLoading: reviewing }] = useUpdateLeaveStatusMutation();
  const [error, setError] = useState("");
  const [reviewNotes, setReviewNotes] = useState({});

  const allSorted = useMemo(() => [...all], [all]);

  const combinedError = loadFailed ? normalizeError(loadError) : error;

  async function setStatus(id, status) {
    setError("");
    try {
      const reviewNote = String(reviewNotes[id] || "").trim();
      if ((status === "approved" || status === "denied") && !reviewNote) {
        setError("Comment is required to approve or deny a leave request.");
        return;
      }
      await updateLeaveStatus({ id, status, reviewNote }).unwrap();
    } catch (err) {
      setError(normalizeError(err));
    }
  }

  return (
    <div className="grid">
      <div className="card">
        <h2 className="title">Leave Approvals</h2>
        <p className="subtitle">Review employee leave requests. Comment is required for approve/deny.</p>
        {combinedError && <div className="error" style={{ marginTop: 12 }}>{combinedError}</div>}
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Department</th>
              <th>Period</th>
              <th>Status</th>
              <th>Comment</th>
              <th style={{ width: 220 }} />
            </tr>
          </thead>
          <tbody>
            {allSorted.map((r) => (
              <tr key={r._id}>
                <td>
                  <b>{r.employee?.user?.name || "—"}</b>
                  <div className="hint">{r.employee?.user?.email || ""}</div>
                </td>
                <td className="hint">{r.employee?.department?.name || "—"}</td>
                <td>
                  {formatDate(r.from)} → {formatDate(r.to)}
                </td>
                <td>
                  <b>{r.status}</b>
                </td>
                <td>
                  <textarea
                    rows={2}
                    value={reviewNotes[r._id] ?? r.reviewNote ?? ""}
                    onChange={(e) => setReviewNotes((p) => ({ ...p, [r._id]: e.target.value }))}
                    placeholder="Required for approve/deny"
                    style={{ minWidth: 220 }}
                  />
                </td>
                <td>
                  <div className="row" style={{ justifyContent: "flex-end" }}>
                    <button
                      onClick={() => setStatus(r._id, "approved")}
                      className="primary"
                      disabled={reviewing}
                    >
                      Approve
                    </button>
                    <button onClick={() => setStatus(r._id, "denied")} className="danger" disabled={reviewing}>
                      Deny
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {allSorted.length === 0 && (
              <tr>
                <td colSpan={6} className="hint">
                  No leave requests.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

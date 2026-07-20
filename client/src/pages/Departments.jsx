import React, { useMemo, useState } from "react";
import { useAuth } from "../state/auth.jsx";
import {
  useCreateDepartmentMutation,
  useDeleteDepartmentMutation,
  useGetDepartmentsQuery,
} from "../store/officeApi.js";

export default function DepartmentsPage() {
  const { isManager, normalizeError } = useAuth();
  const { data: items = [], error: loadError, isError: loadFailed } = useGetDepartmentsQuery();
  const [createDepartment, { isLoading: creating }] = useCreateDepartmentMutation();
  const [deleteDepartment] = useDeleteDepartmentMutation();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const sorted = useMemo(() => [...items].sort((a, b) => a.name.localeCompare(b.name)), [items]);

  const combinedError = loadFailed ? normalizeError(loadError) : error;

  async function createDept(e) {
    e.preventDefault();
    setError("");
    try {
      await createDepartment({ name, description }).unwrap();
      setName("");
      setDescription("");
    } catch (err) {
      setError(normalizeError(err));
    }
  }

  async function removeDept(id) {
    if (!confirm("Delete this department?")) return;
    try {
      await deleteDepartment(id).unwrap();
    } catch (err) {
      setError(normalizeError(err));
    }
  }

  return (
    <div className="grid">
      <div className="card">
        <div className="row">
          <div>
            <h2 className="title">Departments</h2>
            <p className="subtitle">Create departments and keep the org structured.</p>
          </div>
          <div className="spacer" />
        </div>
        {combinedError && <div className="error" style={{ marginTop: 12 }}>{combinedError}</div>}
      </div>

      {!isManager ? (
        <div className="card">
          <div className="error">You don’t have access to manage departments.</div>
        </div>
      ) : (
        <div className="card">
          <h3 className="title">Add department</h3>
          <form onSubmit={createDept}>
            <div className="cols2">
              <div>
                <label>Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Engineering" />
              </div>
              <div>
                <label>Description</label>
                <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional" />
              </div>
            </div>
            <div style={{ height: 12 }} />
            <button className="primary" disabled={creating}>
              {creating ? "Saving..." : "Create"}
            </button>
          </form>
        </div>
      )}

      <div className="card">
        <h3 className="title">All departments</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th style={{ width: 140 }} />
            </tr>
          </thead>
          <tbody>
            {sorted.map((d) => (
              <tr key={d._id}>
                <td><b>{d.name}</b></td>
                <td className="hint">{d.description || "—"}</td>
                <td>
                  {isManager ? (
                    <button className="danger" onClick={() => removeDept(d._id)}>Delete</button>
                  ) : (
                    <span className="hint">—</span>
                  )}
                </td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={3} className="hint">No departments yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


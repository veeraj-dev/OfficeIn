import React, { useEffect, useMemo, useState } from "react";
import api from "../lib/api.js";
import { useAuth } from "../state/auth.jsx";

export default function DepartmentsPage() {
  const { isManager, normalizeError } = useAuth();
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const sorted = useMemo(() => [...items].sort((a, b) => a.name.localeCompare(b.name)), [items]);

  async function load() {
    const { data } = await api.get("/departments");
    setItems(data.items);
  }
  
  useEffect(() => {
    load().catch((e) => setError(normalizeError(e)));
  }, [normalizeError]);

  async function createDept(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const { data } = await api.post("/departments", { name, description });
      setItems((prev) => [data.item, ...prev]);
      setName("");
      setDescription("");
    } catch (err) {
      setError(normalizeError(err));
    } finally {
      setBusy(false);
    }
  }

  async function removeDept(id) {
    if (!confirm("Delete this department?")) return;
    try {
      await api.delete(`/departments/${id}`);
      setItems((prev) => prev.filter((d) => d._id !== id));
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
        {error && <div className="error" style={{ marginTop: 12 }}>{error}</div>}
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
            <button className="primary" disabled={busy}>
              {busy ? "Saving..." : "Create"}
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


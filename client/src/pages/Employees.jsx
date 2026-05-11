import React, { useEffect, useMemo, useState } from "react";
import api from "../lib/api.js";
import { useAuth } from "../state/auth.jsx";

export default function EmployeesPage() {
  const { isManager, normalizeError } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [depts, setDepts] = useState([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "employee",
    employeeId: "",
    departmentId: "",
    title: "",
    phone: "",
    location: "",
    dateOfJoining: "",
  });

  const deptOptions = useMemo(() => depts.map((d) => ({ value: d._id, label: d.name })), [depts]);

  async function load() {
    const [empRes, deptRes] = await Promise.all([api.get("/employees"), api.get("/departments")]);
    setEmployees(empRes.data.items);
    setDepts(deptRes.data.items);
    if (!form.departmentId && deptRes.data.items[0]?._id) {
      setForm((p) => ({ ...p, departmentId: deptRes.data.items[0]._id }));
    }
  }

  useEffect(() => {
    if (!isManager) return;
    load().catch((e) => setError(normalizeError(e)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isManager]);

  async function createEmployeeWithUser(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const payload = {
        ...form,
        dateOfJoining: form.dateOfJoining || null,
      };
      const { data } = await api.post("/employees/with-user", payload);
      setEmployees((prev) => [data.item, ...prev]);
      setForm((p) => ({ ...p, name: "", email: "", password: "", employeeId: "", title: "", phone: "", location: "" }));
    } catch (err) {
      setError(normalizeError(err));
    } finally {
      setBusy(false);
    }
  }

  async function removeEmployee(id) {
    if (!confirm("Delete this employee profile?")) return;
    try {
      await api.delete(`/employees/${id}`);
      setEmployees((prev) => prev.filter((e) => e._id !== id));
    } catch (err) {
      setError(normalizeError(err));
    }
  }

  if (!isManager) {
    return (
      <div className="grid">
        <div className="card">
          <h2 className="title">Employees</h2>
          <div className="error">You don’t have access to manage employees.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid">
      <div className="card">
        <h2 className="title">Employees</h2>
        <p className="subtitle">Create employee profiles (this also creates their login account).</p>
        {error && <div className="error" style={{ marginTop: 12 }}>{error}</div>}
      </div>

      <div className="card">
        <h3 className="title">Add employee</h3>
        {depts.length === 0 ? (
          <div className="error">Create a department first.</div>
        ) : (
          <form onSubmit={createEmployeeWithUser}>
            <div className="cols2">
              <div>
                <label>Name</label>
                <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
              </div>
              <div>
                <label>Email</label>
                <input value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
              </div>
            </div>

            <div className="cols2">
              <div>
                <label>Temp password</label>
                <input type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} />
              </div>
              <div>
                <label>Role</label>
                <select value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}>
                  <option value="employee">employee</option>
                  <option value="manager">manager</option>
                  <option value="admin">admin</option>
                </select>
              </div>
            </div>

            <div className="cols2">
              <div>
                <label>Employee ID</label>
                <input value={form.employeeId} onChange={(e) => setForm((p) => ({ ...p, employeeId: e.target.value }))} placeholder="EMP-001" />
              </div>
              <div>
                <label>Department</label>
                <select value={form.departmentId} onChange={(e) => setForm((p) => ({ ...p, departmentId: e.target.value }))}>
                  {deptOptions.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="cols2">
              <div>
                <label>Title</label>
                <input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="Software Engineer" />
              </div>
              <div>
                <label>Date of joining</label>
                <input type="date" value={form.dateOfJoining} onChange={(e) => setForm((p) => ({ ...p, dateOfJoining: e.target.value }))} />
              </div>
            </div>

            <div className="cols2">
              <div>
                <label>Phone</label>
                <input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
              </div>
              <div>
                <label>Location</label>
                <input value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} />
              </div>
            </div>

            <div style={{ height: 12 }} />
            <button className="primary" disabled={busy}>{busy ? "Saving..." : "Create employee"}</button>
          </form>
        )}
      </div>

      <div className="card">
        <h3 className="title">All employees</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Department</th>
              <th>Title</th>
              <th>Status</th>
              <th style={{ width: 140 }} />
            </tr>
          </thead>
          <tbody>
            {employees.map((e) => (
              <tr key={e._id}>
                <td>
                  <b>{e.user?.name}</b>
                  <div className="hint">{e.user?.email} · {e.employeeId}</div>
                </td>
                <td>{e.department?.name || "—"}</td>
                <td className="hint">{e.title || "—"}</td>
                <td className="hint">{e.isActive ? "active" : "inactive"}</td>
                <td><button className="danger" onClick={() => removeEmployee(e._id)}>Delete</button></td>
              </tr>
            ))}
            {employees.length === 0 && (
              <tr><td colSpan={5} className="hint">No employees yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../state/auth.jsx";

function Tab({ to, label, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => (isActive ? "pill pillActive" : "pill")}
    >
      {label}
    </NavLink>
  );
}

export default function Layout() {
  const { user, logout, isManager } = useAuth();

  return (
    <>
      <div className="nav">
        <div className="navInner">
          <div className="brand">Office Management</div>
          <div className="spacer" />
          <Tab to="/app" label="Dashboard" end />
          {isManager && <Tab to="/app/departments" label="Departments" />}
          {isManager && <Tab to="/app/employees" label="Employees" />}
          <Tab to="/app/leaves" label="Leaves" />
          <div className="spacer" />
          <div className="pill">{user?.name} · {user?.role}</div>
          <button onClick={logout} className="danger">Logout</button>
        </div>
      </div>
      <div className="container">
        <Outlet />
      </div>
    </>
  );
}


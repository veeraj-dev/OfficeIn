import React, { useMemo } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../state/auth.jsx";

function Item({ to, label, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => (isActive ? "sideItem sideItemActive" : "sideItem")}
    >
      {label}
    </NavLink>
  );
}

export default function OfficeLayout() {
  const { user, logout, isManager } = useAuth();
  const nav = useNavigate();

  const base = useMemo(() => {
    if (user?.role === "employee") return "/app/employee";
    return "/app/admin";
  }, [user?.role]);

  return (
    <div className="officeShell">
      <div className="officeTop">
        <div className="officeBrand" onClick={() => nav(base)} role="button" tabIndex={0}>
          Office Management
        </div>
        <div className="spacer" />
        <div className="pill">{user?.name} · {user?.role}</div>
        <button
          onClick={() => {
            logout();
            nav("/", { replace: true });
          }}
          className="danger"
        >
          Logout
        </button>
      </div>

      <div className="officeBody">
        <aside className="officeSide">
          {user?.role === "employee" ? (
            <>
              <div className="sideGroup">Employee</div>
              <Item to="/app/employee" label="Dashboard" end />
              <Item to="/app/employee/leaves" label="My Leaves" />
            </>
          ) : (
            <>
              <div className="sideGroup">Administration</div>
              <Item to="/app/admin" label="Dashboard" end />
              {isManager && <Item to="/app/admin/departments" label="Departments" />}
              {isManager && <Item to="/app/admin/employees" label="Employees" />}
              <Item to="/app/admin/leaves" label="Leave Approvals" />
            </>
          )}
        </aside>

        <main className="officeMain">
          <Outlet />
        </main>
      </div>
    </div>
  );
}


import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import OfficeLayout from "./components/OfficeLayout.jsx";
import LandingPage from "./pages/Landing.jsx";
import LoginPage from "./pages/Login.jsx";
import DashboardPage from "./pages/Dashboard.jsx";
import DepartmentsPage from "./pages/Departments.jsx";
import EmployeesPage from "./pages/Employees.jsx";
import EmployeeLeavesPage from "./pages/EmployeeLeaves.jsx";
import AdminLeavesPage from "./pages/AdminLeaves.jsx";
import { useAuth } from "./state/auth.jsx";

function AppIndexRedirect() {
  const { user } = useAuth();
  if (user?.role === "employee") return <Navigate to="/app/employee" replace />;
  return <Navigate to="/app/admin" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/app" element={<OfficeLayout />}>
          <Route index element={<AppIndexRedirect />} />

          <Route element={<ProtectedRoute roles={["employee"]} />}>
            <Route path="employee">
              <Route index element={<DashboardPage />} />
              <Route path="leaves" element={<EmployeeLeavesPage />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute roles={["admin", "manager"]} />}>
            <Route path="admin">
              <Route index element={<DashboardPage />} />
              <Route path="departments" element={<DepartmentsPage />} />
              <Route path="employees" element={<EmployeesPage />} />
              <Route path="leaves" element={<AdminLeavesPage />} />
            </Route>
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}


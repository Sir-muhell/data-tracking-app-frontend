import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "./app/store";
import Auth from "./pages/Auth";
import PersonForm from "./pages/PersonForm";
import AdminReports from "./pages/AdminReports";
// Import the component you'll build next
import Dashboard from "./pages/Dashboard";
import PersonHistoryPage from "./components/PersonHistoryPage";

// Placeholder for the main application component
// const Dashboard: React.FC = () => <h1>Application Dashboard (Protected)</h1>;

// Component to protect routes
const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useSelector(
    (state: RootState) => state.auth
  );

  // Still loading the initial state from localStorage
  if (isLoading) {
    return (
      <div className="p-8 text-center text-lg">Loading user session...</div>
    );
  }

  // If authenticated, render the child routes/components
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Auth />} />
        <Route
          path="/register"
          element={<Navigate to="/login" replace />}
        />{" "}
        {/* Redirect register to login form */}
        {/* Protected Routes (Requires JWT) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          {/* Future Routes: */}
          <Route path="/persons/new" element={<PersonForm />} />
          <Route
            path="/persons/:personId/history"
            element={<PersonHistoryPage />}
          />
          {/* Admin Route - Protected both by ProtectedRoute and internal component check */}
          <Route path="/admin/reports" element={<AdminReports />} />
        </Route>
        {/* Catch-all for 404/Unknown routes, redirect to home if logged in, or login if not */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
};

export default App;

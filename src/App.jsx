import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import ManagerDashboard from './pages/ManagerDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import Profile from './pages/Profile';
import ErrorPage from './pages/ErrorPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="font-sans text-slate-900 bg-slate-50 min-h-screen">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/manager-dashboard" element={<ManagerDashboard />} />
            <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/db-error" element={<ErrorPage type="db" />} />
            <Route path="/404" element={<ErrorPage type="404" />} />
            <Route path="*" element={<ErrorPage type="404" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

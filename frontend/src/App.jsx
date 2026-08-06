import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { RoleBasedRoute } from './components/auth/RoleBasedRoute';
import { LoginPage } from './pages/LoginPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { ClerkDashboard } from './pages/ClerkDashboard';
import { UserDashboard } from './pages/UserDashboard';
import { EmployeeDetailsPage } from './pages/EmployeeDetailsPage';
import { AddEmployeePage } from './pages/AddEmployeePage';
import { EmployeeRecordsPage } from './pages/EmployeeRecordsPage';
import { SearchPage } from './pages/SearchPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { UserManagementPage } from './pages/UserManagementPage';
import { ProfilePage } from './pages/ProfilePage';

function App() {
  const { isAuthenticated, isAdmin, isClerk, isUser } = useContext(AuthContext);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Root Route - Redirect based on role */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              isAdmin ? <Navigate to="/admin" /> :
              isClerk ? <Navigate to="/clerk" /> :
              isUser ? <Navigate to="/user" /> :
              <Navigate to="/login" />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* ============= Admin Routes ============= */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </RoleBasedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/employees"
          element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['admin']}>
                <EmployeeRecordsPage />
              </RoleBasedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/add-employee"
          element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['admin']}>
                <AddEmployeePage />
              </RoleBasedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/search"
          element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['admin']}>
                <SearchPage />
              </RoleBasedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/audit"
          element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['admin']}>
                <AuditLogsPage />
              </RoleBasedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['admin']}>
                <UserManagementPage />
              </RoleBasedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/edit/:id"
          element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['admin']}>
                <AddEmployeePage editMode />
              </RoleBasedRoute>
            </ProtectedRoute>
          }
        />

        {/* ============= Clerk Routes ============= */}
        <Route
          path="/clerk"
          element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['clerk']}>
                <ClerkDashboard />
              </RoleBasedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/clerk/add-employee"
          element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['clerk']}>
                <AddEmployeePage />
              </RoleBasedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/clerk/edit/:id"
          element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['clerk']}>
                <AddEmployeePage editMode />
              </RoleBasedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/clerk/search"
          element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['clerk']}>
                <SearchPage />
              </RoleBasedRoute>
            </ProtectedRoute>
          }
        />

        {/* ============= User (Viewer) Routes ============= */}
        <Route
          path="/user"
          element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['user']}>
                <UserDashboard />
              </RoleBasedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/search"
          element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['user']}>
                <SearchPage />
              </RoleBasedRoute>
            </ProtectedRoute>
          }
        />

        {/* ============= Shared Routes ============= */}
        <Route
          path="/employee/:id"
          element={
            <ProtectedRoute>
              <EmployeeDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Catch-all - Redirect to root */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;

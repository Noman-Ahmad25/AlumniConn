import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { useEffect, useState, type ReactNode } from "react"
import Register from "./features/auth/pages/Register"
import Login from "./features/auth/pages/Login"
import SuperAdminLogin from "./pages/SuperAdminLogin"

import CreateProfile from "./pages/CreateProfile"
import Feed from "./pages/Feed"
import Connections from "./pages/Connections"
import Profile from "./pages/Profile"
import Chat from "./pages/Chat"
import Messages from "./pages/Messages"
import RequestCollege from "./pages/RequestCollege"
import SuperAdminCollegeRequests from "./pages/SuperAdminCollegeRequests"
import AdminAlumniRequests from "./pages/AdminAlumniRequests"
import Topbar from "./layouts/AppShell/Topbar"
import { AUTH_CHANGE_EVENT, getCurrentUserRoleFromToken, getRoleHomePath, hasAuthToken } from "./features/auth/utils/auth"
import type { UserRole } from "./features/auth/types/auth"

function ProtectedRoute({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(hasAuthToken)

  useEffect(() => {
    const handleAuthChange = () => setIsAuthenticated(hasAuthToken())
    window.addEventListener("storage", handleAuthChange)
    window.addEventListener(AUTH_CHANGE_EVENT, handleAuthChange)
    return () => {
      window.removeEventListener("storage", handleAuthChange)
      window.removeEventListener(AUTH_CHANGE_EVENT, handleAuthChange)
    }
  }, [])

  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

function RoleRoute({ children, roles }: { children: ReactNode; roles: UserRole[] }) {
  const [role, setRole] = useState(getCurrentUserRoleFromToken)

  useEffect(() => {
    const handleAuthChange = () => setRole(getCurrentUserRoleFromToken())
    window.addEventListener("storage", handleAuthChange)
    window.addEventListener(AUTH_CHANGE_EVENT, handleAuthChange)
    return () => {
      window.removeEventListener("storage", handleAuthChange)
      window.removeEventListener(AUTH_CHANGE_EVENT, handleAuthChange)
    }
  }, [])

  if (!hasAuthToken()) return <Navigate to="/login" replace />
  if (!role) return <Navigate to="/login" replace />
  if (!roles.includes(role)) return <Navigate to={getRoleHomePath(role)} replace />

  return <>{children}</>
}

function App() {
  const [showNavbar, setShowNavbar] = useState(hasAuthToken)

  useEffect(() => {
    const handleAuthChange = () => setShowNavbar(hasAuthToken())
    window.addEventListener("storage", handleAuthChange)
    window.addEventListener(AUTH_CHANGE_EVENT, handleAuthChange)
    return () => {
      window.removeEventListener("storage", handleAuthChange)
      window.removeEventListener(AUTH_CHANGE_EVENT, handleAuthChange)
    }
  }, [])

  return (
    <BrowserRouter>
      {showNavbar && <Topbar />}
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Navigate to="/register" replace />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/super-admin-login" element={<SuperAdminLogin />} />
        <Route
          path="/request-college"
          element={<RequestCollege />}
        />

        {/* Protected routes */}
        <Route
          path="/create-profile"
          element={<ProtectedRoute><CreateProfile /></ProtectedRoute>}
        />
        <Route
          path="/feed"
          element={<RoleRoute roles={["admin", "alumni", "student"]}><Feed /></RoleRoute>}
        />
        <Route
          path="/connections"
          element={<RoleRoute roles={["admin", "alumni", "student"]}><Connections /></RoleRoute>}
        />
        <Route
          path="/admin/alumni-requests"
          element={<RoleRoute roles={["admin"]}><AdminAlumniRequests /></RoleRoute>}
        />
        <Route
          path="/super-admin/college-requests"
          element={<RoleRoute roles={["super_admin"]}><SuperAdminCollegeRequests /></RoleRoute>}
        />
        <Route
          path="/profile"
          element={<RoleRoute roles={["admin", "alumni", "student"]}><Profile /></RoleRoute>}
        />
        <Route
          path="/profile/:userId"
          element={<RoleRoute roles={["admin", "alumni", "student"]}><Profile /></RoleRoute>}
        />

        {/*
          Desktop: /messages shows sidebar + empty panel
          Desktop: /messages/:conversationId shows sidebar + chat panel
          Mobile:  /messages shows inbox list (full screen)
          Mobile:  /messages/:conversationId redirects to /chat/:conversationId
        */}
        <Route
          path="/messages"
          element={<RoleRoute roles={["admin", "alumni", "student"]}><Messages /></RoleRoute>}
        />
        <Route
          path="/messages/:conversationId"
          element={<RoleRoute roles={["admin", "alumni", "student"]}><Messages /></RoleRoute>}
        />

        {/* Mobile-only full-screen chat */}
        <Route
          path="/chat/:conversationId"
          element={<RoleRoute roles={["admin", "alumni", "student"]}><Chat /></RoleRoute>}
        />

        {/* Catch-all */}
        <Route
          path="*"
          element={
            hasAuthToken()
              ? <Navigate to={getRoleHomePath(getCurrentUserRoleFromToken())} replace />
              : <Navigate to="/login" replace />
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App

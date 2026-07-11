import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom"
import { useEffect, useState, type ReactNode } from "react"
import Register from "../../features/auth/pages/Register"
import Login from "../../features/auth/pages/Login"
import ForgotPassword from "../../features/auth/pages/ForgotPassword"
import ResetPassword from "../../features/auth/pages/ResetPassword"
import VerifyEmail from "../../features/auth/pages/VerifyEmail"
import VerifyEmailPending from "../../features/auth/pages/VerifyEmailPending"
import SuperAdminLogin from "../../features/admin/pages/SuperAdminLogin"

import CreateProfile from "../../features/profile/pages/CreateProfile"
import Feed from "../../features/feed/pages/Feed"
import Connections from "../../features/connections/pages/Connections"
import Profile from "../../features/profile/pages/Profile"
import Chat from "../../features/messages/pages/Chat"
import Messages from "../../features/messages/pages/Messages"
import RequestCollege from "../../features/college/pages/RequestCollege"
import VerifyCollegeEmail from "../../features/college/pages/VerifyCollegeEmail"
import SuperAdminCollegeRequests from "../../features/admin/pages/SuperAdminCollegeRequests"
import AdminAlumniRequests from "../../features/admin/pages/AdminAlumniRequests"
import Topbar from "../../layouts/AppShell/Topbar"
import TenantResolver from "../../features/college/pages/TenantResolver"
import LandingPage from "../../shared/pages/LandingPage"
import { AUTH_CHANGE_EVENT, getCurrentUserRoleFromToken, getRoleHomePath, hasAuthToken } from "../../features/auth/utils/auth"
import type { UserRole } from "../../features/auth/types/auth"

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { collegeSlug } = useParams<{ collegeSlug: string }>();
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

  if (!isAuthenticated) return <Navigate to={collegeSlug ? `/c/${collegeSlug}/login` : "/"} replace />
  return <>{children}</>
}

function RoleRoute({ children, roles }: { children: ReactNode; roles: UserRole[] }) {
  const { collegeSlug } = useParams<{ collegeSlug: string }>();
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

  if (!hasAuthToken()) return <Navigate to={collegeSlug ? `/c/${collegeSlug}/login` : "/"} replace />
  if (!role) return <Navigate to={collegeSlug ? `/c/${collegeSlug}/login` : "/"} replace />
  
  if (!roles.includes(role)) {
      const homePath = getRoleHomePath(role);
      // Ensure super_admin goes to root super admin path
      if (role === "super_admin") return <Navigate to={homePath} replace />
      // Otherwise route to tenant path
      return <Navigate to={collegeSlug ? `/c/${collegeSlug}${homePath}` : "/"} replace />
  }

  return <>{children}</>
}

export default function AppRouter() {
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
        {/* Global Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/super-admin-login" element={<SuperAdminLogin />} />
        <Route path="/request-college" element={<RequestCollege />} />
        <Route path="/verify-college-email" element={<VerifyCollegeEmail />} />
        
        {/* Global Protected routes */}
        <Route
          path="/super-admin/college-requests"
          element={<RoleRoute roles={["super_admin"]}><SuperAdminCollegeRequests /></RoleRoute>}
        />

        {/* Tenant Routes */}
        <Route path="/c/:collegeSlug" element={<TenantResolver />}>
            {/* Public Tenant Routes */}
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="reset-password" element={<ResetPassword />} />
            <Route path="verify-email" element={<VerifyEmail />} />
            <Route path="verify-email-pending" element={<VerifyEmailPending />} />

            {/* Protected Tenant Routes */}
            <Route
              path="create-profile"
              element={<ProtectedRoute><CreateProfile /></ProtectedRoute>}
            />
            <Route
              path="feed"
              element={<RoleRoute roles={["admin", "alumni", "student"]}><Feed /></RoleRoute>}
            />
            <Route
              path="connections"
              element={<RoleRoute roles={["admin", "alumni", "student"]}><Connections /></RoleRoute>}
            />
            <Route
              path="admin/alumni-requests"
              element={<RoleRoute roles={["admin"]}><AdminAlumniRequests /></RoleRoute>}
            />
            <Route
              path="profile"
              element={<RoleRoute roles={["admin", "alumni", "student"]}><Profile /></RoleRoute>}
            />
            <Route
              path="profile/:userId"
              element={<RoleRoute roles={["admin", "alumni", "student"]}><Profile /></RoleRoute>}
            />
            <Route
              path="messages"
              element={<RoleRoute roles={["admin", "alumni", "student"]}><Messages /></RoleRoute>}
            />
            <Route
              path="messages/:conversationId"
              element={<RoleRoute roles={["admin", "alumni", "student"]}><Messages /></RoleRoute>}
            />
            <Route
              path="chat/:conversationId"
              element={<RoleRoute roles={["admin", "alumni", "student"]}><Chat /></RoleRoute>}
            />
            
            {/* Catch-all for Tenant Routes */}
            <Route path="*" element={<Navigate to="login" replace />} />
        </Route>

        {/* Global Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

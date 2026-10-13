import { BrowserRouter, Routes, Route, Navigate, useParams, useLocation } from "react-router-dom"
import { Suspense, lazy, useEffect, useState, type ReactNode } from "react"
import { updateFavicon } from "../../features/college/utils/branding"
import { PageFallbackSkeleton } from "../../shared/components/skeletons"

// Immediate landing & tenant core pages
import LandingPage from "../../shared/pages/LandingPage"
import TenantResolver from "../../features/college/pages/TenantResolver"
import TenantHome from "../../features/college/pages/TenantHome"
import Login from "../../features/auth/pages/Login"
import Register from "../../features/auth/pages/Register"

// Code-split dynamic routes for optimal bundle distribution
const ForgotPassword = lazy(() => import("../../features/auth/pages/ForgotPassword"))
const ResetPassword = lazy(() => import("../../features/auth/pages/ResetPassword"))
const VerifyEmail = lazy(() => import("../../features/auth/pages/VerifyEmail"))
const VerifyEmailPending = lazy(() => import("../../features/auth/pages/VerifyEmailPending"))
const SuperAdminLogin = lazy(() => import("../../features/admin/pages/SuperAdminLogin"))

const CreateProfile = lazy(() => import("../../features/profile/pages/CreateProfile"))
const Feed = lazy(() => import("../../features/feed/pages/Feed"))
const Connections = lazy(() => import("../../features/connections/pages/Connections"))
const Discover = lazy(() => import("../../features/connections/pages/Discover"))
const Recommendations = lazy(() => import("../../features/recommendations/pages/Recommendations"))
const Notifications = lazy(() => import("../../features/notifications/pages/Notifications"))
const Profile = lazy(() => import("../../features/profile/pages/Profile"))
const Chat = lazy(() => import("../../features/messages/pages/Chat"))
const Messages = lazy(() => import("../../features/messages/pages/Messages"))
const RequestCollege = lazy(() => import("../../features/college/pages/RequestCollege"))
const VerifyCollegeEmail = lazy(() => import("../../features/college/pages/VerifyCollegeEmail"))
const SuperAdminDashboard = lazy(() => import("../../features/admin/pages/SuperAdminDashboard"))
const SuperAdminUniversities = lazy(() => import("../../features/admin/pages/SuperAdminUniversities"))
const SuperAdminUsers = lazy(() => import("../../features/admin/pages/SuperAdminUsers"))
const SuperAdminCollegeRequests = lazy(() => import("../../features/admin/pages/SuperAdminCollegeRequests"))
const CollegeAdminUsers = lazy(() => import("../../features/admin/pages/CollegeAdminUsers"))
const AdminAlumniRequests = lazy(() => import("../../features/admin/pages/AdminAlumniRequests"))
const CollegeAdminBranding = lazy(() => import("../../features/admin/pages/CollegeAdminBranding"))

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

const GLOBAL_TITLES: Record<string, string> = {
  "/": "AlumniConn",
  "/super-admin-login": "Super Admin Sign In | AlumniConn",
  "/request-college": "Register University | AlumniConn",
  "/verify-college-email": "Verify University Email | AlumniConn",
  "/super-admin/dashboard": "Platform Dashboard | AlumniConn",
  "/super-admin/universities": "Manage Universities | AlumniConn",
  "/super-admin/users": "Manage Platform Users | AlumniConn",
  "/super-admin/college-requests": "University Onboarding Requests | AlumniConn",
}

function RouteMetadataHandler() {
  const location = useLocation()

  useEffect(() => {
    // Only apply global metadata if not inside a college tenant route (/c/:collegeSlug)
    if (!location.pathname.startsWith("/c/")) {
      const matchedTitle = GLOBAL_TITLES[location.pathname] || "AlumniConn"
      document.title = matchedTitle
      updateFavicon("/favicon.svg")
    }
  }, [location.pathname])

  return null
}

export default function AppRouter() {
  
  return (
    <BrowserRouter>
      <RouteMetadataHandler />

      <Suspense fallback={<PageFallbackSkeleton />}>
        <Routes>
        {/* Global Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/super-admin-login" element={<SuperAdminLogin />} />
        <Route path="/request-college" element={<RequestCollege />} />
        <Route path="/verify-college-email" element={<VerifyCollegeEmail />} />
        
        {/* Global Protected routes */}
        <Route
          path="/super-admin/dashboard"
          element={<RoleRoute roles={["super_admin"]}><SuperAdminDashboard /></RoleRoute>}
        />
        <Route
          path="/super-admin/universities"
          element={<RoleRoute roles={["super_admin"]}><SuperAdminUniversities /></RoleRoute>}
        />
        <Route
          path="/super-admin/users"
          element={<RoleRoute roles={["super_admin"]}><SuperAdminUsers /></RoleRoute>}
        />
        <Route
          path="/super-admin/college-requests"
          element={<RoleRoute roles={["super_admin"]}><SuperAdminCollegeRequests /></RoleRoute>}
        />

        {/* Tenant Routes */}
        <Route path="/c/:collegeSlug" element={<TenantResolver />}>
            {/* Public Tenant Routes */}
            <Route index element={<TenantHome />} />
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
              path="discover"
              element={<RoleRoute roles={["admin", "alumni", "student"]}><Discover /></RoleRoute>}
            />
            <Route
              path="recommendations"
              element={<RoleRoute roles={["admin", "alumni", "student"]}><Recommendations /></RoleRoute>}
            />
            <Route
              path="notifications"
              element={<RoleRoute roles={["admin", "alumni", "student"]}><Notifications /></RoleRoute>}
            />
            <Route
              path="connections"
              element={<RoleRoute roles={["admin", "alumni", "student"]}><Connections /></RoleRoute>}
            />
            <Route
              path="admin/users"
              element={<RoleRoute roles={["admin"]}><CollegeAdminUsers /></RoleRoute>}
            />
            <Route
              path="admin/alumni-requests"
              element={<RoleRoute roles={["admin"]}><AdminAlumniRequests /></RoleRoute>}
            />
            <Route
              path="admin/branding"
              element={<RoleRoute roles={["admin"]}><CollegeAdminBranding /></RoleRoute>}
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
            <Route path="*" element={<Navigate to="" replace />} />
        </Route>

        {/* Global Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

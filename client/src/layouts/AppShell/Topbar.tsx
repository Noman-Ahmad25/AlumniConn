import { Link, useLocation, useNavigate, useParams } from "react-router-dom"
import { useState, useEffect } from "react"
import { AUTH_CHANGE_EVENT, getCurrentUserRoleFromToken, getRoleHomePath, hasAuthToken, logout } from "../../features/auth/utils/auth"
import { getUnreadNotificationCount } from "../../features/notifications/api/notification"
import { useTenant } from "../../providers/TenantProvider"

export default function Topbar() {
  const { collegeSlug: routeSlug } = useParams<{ collegeSlug: string }>()
  const { tenant } = useTenant()
  const collegeSlug = routeSlug || tenant?.slug
  const location = useLocation()
  const navigate = useNavigate()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [role, setRole] = useState(getCurrentUserRoleFromToken)
  const [unreadCount, setUnreadCount] = useState(0)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const checkAuth = () => {
      const auth = hasAuthToken()
      setIsLoggedIn(auth)
      setRole(getCurrentUserRoleFromToken())
      if (auth && role !== "super_admin") {
        try {
          const promise = getUnreadNotificationCount()
          if (promise && typeof promise.then === "function") {
            promise
              .then((res) => {
                if (res && typeof res.unread_count === "number") {
                  setUnreadCount(res.unread_count)
                }
              })
              .catch(() => {})
          }
        } catch {
          // ignore notification count failure
        }
      }
    }
    
    checkAuth()
    window.addEventListener("storage", checkAuth)
    window.addEventListener(AUTH_CHANGE_EVENT, checkAuth)
    return () => {
      window.removeEventListener("storage", checkAuth)
      window.removeEventListener(AUTH_CHANGE_EVENT, checkAuth)
    }
  }, [location, role])

  const handleLogout = () => {
    logout()
    setIsLoggedIn(false)
    setRole(null)
    setIsMobileMenuOpen(false)
    navigate(collegeSlug ? `/c/${collegeSlug}/login` : "/login")
  }

  const prefix = collegeSlug ? `/c/${collegeSlug}` : ""
  const homePath = role === "super_admin" ? "/super-admin/dashboard" : `${prefix}${getRoleHomePath(role)}`

  const mainLinks = role === "super_admin"
    ? [
        { to: "/super-admin/dashboard", label: "Dashboard" },
        { to: "/super-admin/universities", label: "Universities" },
        { to: "/super-admin/users", label: "Users" },
        { to: "/super-admin/college-requests", label: "College Requests" },
      ]
    : [
        { to: `${prefix}/feed`, label: "Feed" },
        { to: `${prefix}/discover`, label: "Discover" },
        { to: `${prefix}/recommendations`, label: "Recommendations" },
        { to: `${prefix}/connections`, label: "Connections" },
        { to: `${prefix}/messages`, label: "Messages" },
        { to: `${prefix}/profile`, label: "Profile" },
        ...(role === "admin"
          ? [
              { to: `${prefix}/admin/users`, label: "Manage Users" },
              { to: `${prefix}/admin/alumni-requests`, label: "Alumni Requests" },
              { to: `${prefix}/admin/branding`, label: "Branding" },
            ]
          : []),
      ]

  const isLinkActive = (path: string) => {
    if (location.pathname === path) return true
    if (path.endsWith("/profile") && location.pathname.startsWith(`${prefix}/profile`)) return true
    return false
  }

  const isActive = (path: string) => {
    return isLinkActive(path)
      ? "bg-[var(--primary)]/10 text-[var(--primary)] font-semibold"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 font-medium"
  }

  const getActiveLabel = () => {
    const matched = mainLinks.find((link) => isLinkActive(link.to))
    if (matched) return matched.label
    if (location.pathname.startsWith(`${prefix}/notifications`)) return "Notifications"
    if (location.pathname.startsWith(`${prefix}/messages`)) return "Messages"
    return "Menu"
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/88 shadow-sm backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to={homePath} className="group flex items-center gap-3 font-bold text-xl text-slate-950">
            {tenant?.branding?.logo_url ? (
              <img
                src={tenant.branding.logo_url}
                alt={`${tenant.name} Logo`}
                className="h-8 w-8 object-contain rounded-md"
              />
            ) : (
              <span className="brand-mark brand-mark-sm" aria-hidden="true">
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m3 8.5 9-4 9 4-9 4-9-4Z" />
                  <path d="M7 11v4.5c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5V11" />
                  <path d="M21 8.5v5" />
                </svg>
              </span>
            )}
            <span className="hidden sm:inline">{tenant ? tenant.name : "AlumniConn"}</span>
          </Link>

          {isLoggedIn && (
            <div className="hidden md:flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
              {mainLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`rounded-md px-3 py-1.5 text-xs transition-colors duration-200 ${isActive(link.to)}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2">
            {isLoggedIn && role !== "super_admin" && (
              <>
                {/* Notification Bell */}
                <Link
                  to={`${prefix}/notifications`}
                  className="icon-button relative"
                  title="Notifications"
                >
                  <svg
                    width="19"
                    height="19"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-sm">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Link>

                {/* Messages Icon */}
                <Link
                  to={`${prefix}/messages`}
                  className="icon-button"
                  title="Messages"
                >
                  <svg
                    width="19"
                    height="19"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </Link>
              </>
            )}
            {isLoggedIn && (
              <button
                onClick={handleLogout}
                className="btn btn-danger min-h-0 px-3 py-1.5 text-xs"
              >
                Logout
              </button>
            )}
          </div>
        </div>

        {isLoggedIn && (
          <div className="border-t border-slate-200/80 md:hidden">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <span className="h-2 w-2 rounded-full bg-[var(--primary)]" aria-hidden="true" />
                <span>{getActiveLabel()}</span>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                aria-expanded={isMobileMenuOpen}
                aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              >
                <span>{isMobileMenuOpen ? "Close" : "Menu"}</span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`transition-transform duration-200 ${isMobileMenuOpen ? "rotate-180" : ""}`}
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
            </div>

            {isMobileMenuOpen && (
              <div
                data-testid="mobile-nav-dropdown"
                className="space-y-1 pb-3 pt-1 border-t border-slate-100"
              >
                {mainLinks.map((link) => {
                  const active = isLinkActive(link.to)
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors duration-150 ${
                        active
                          ? "bg-[var(--primary)]/10 text-[var(--primary)] font-bold"
                          : "text-slate-700 hover:bg-slate-100 hover:text-slate-950 font-medium"
                      }`}
                    >
                      <span>{link.label}</span>
                      {active && (
                        <span className="text-xs font-semibold text-[var(--primary)]">Active</span>
                      )}
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

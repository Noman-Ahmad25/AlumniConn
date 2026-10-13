import { Link, useLocation, useNavigate, useParams } from "react-router-dom"
import { useState, useEffect, useRef } from "react"
import { AUTH_CHANGE_EVENT, getCurrentUserRoleFromToken, getRoleHomePath, hasAuthToken, logout } from "../../features/auth/utils/auth"
import { getUnreadNotificationCount } from "../../features/notifications/api/notification"
import { useTenant } from "../../providers/TenantProvider"

export default function Topbar() {
  const { collegeSlug: routeSlug } = useParams<{ collegeSlug: string }>()
  const { tenant } = useTenant()
  const collegeSlug = routeSlug || tenant?.slug
  const location = useLocation()
  const navigate = useNavigate()
  const [isLoggedIn, setIsLoggedIn] = useState(hasAuthToken)
  const [role, setRole] = useState(getCurrentUserRoleFromToken)
  const [unreadCount, setUnreadCount] = useState(0)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false)
  const [isMobileAdminOpen, setIsMobileAdminOpen] = useState(true)
  const adminDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsMobileMenuOpen(false)
    setIsAdminMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (adminDropdownRef.current && !adminDropdownRef.current.contains(event.target as Node)) {
        setIsAdminMenuOpen(false)
      }
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsAdminMenuOpen(false)
      }
    }

    if (isAdminMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("keydown", handleKeyDown)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isAdminMenuOpen])

  useEffect(() => {
    let isMounted = true
    const checkAuth = () => {
      const auth = hasAuthToken()
      setIsLoggedIn(auth)
      const currentRole = getCurrentUserRoleFromToken()
      setRole(currentRole)
      if (auth && currentRole !== "super_admin") {
        try {
          const promise = getUnreadNotificationCount()
          if (promise && typeof promise.then === "function") {
            promise
              .then((res) => {
                if (isMounted && res && typeof res.unread_count === "number") {
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
      isMounted = false
      window.removeEventListener("storage", checkAuth)
      window.removeEventListener(AUTH_CHANGE_EVENT, checkAuth)
    }
  }, [location, role])

  const handleLogout = () => {
    logout()
    setIsLoggedIn(false)
    setRole(null)
    setIsMobileMenuOpen(false)
    setIsAdminMenuOpen(false)
    navigate(collegeSlug ? `/c/${collegeSlug}/login` : "/login")
  }

  const prefix = collegeSlug ? `/c/${collegeSlug}` : ""
  const homePath = role === "super_admin" ? "/super-admin/dashboard" : `${prefix}${getRoleHomePath(role)}`

  const superAdminLinks = [
    { to: "/super-admin/dashboard", label: "Dashboard" },
    { to: "/super-admin/universities", label: "Universities" },
    { to: "/super-admin/users", label: "Users" },
    { to: "/super-admin/college-requests", label: "College Requests" },
  ]

  // 5 primary text links on desktop (Messages is accessible via icon)
  const collegePrimaryLinks = [
    { to: `${prefix}/feed`, label: "Feed" },
    { to: `${prefix}/discover`, label: "Discover" },
    { to: `${prefix}/recommendations`, label: "Recommendations" },
    { to: `${prefix}/connections`, label: "Connections" },
    { to: `${prefix}/profile`, label: "Profile" },
  ]

  // College Admin links grouped in dropdown
  const adminLinks = role === "admin"
    ? [
        { to: `${prefix}/admin/users`, label: "Manage Users" },
        { to: `${prefix}/admin/alumni-requests`, label: "Alumni Requests" },
        { to: `${prefix}/admin/branding`, label: "Branding" },
      ]
    : []

  // Mobile navigation includes Messages as a listed option
  const mobileCollegeLinks = [
    { to: `${prefix}/feed`, label: "Feed" },
    { to: `${prefix}/discover`, label: "Discover" },
    { to: `${prefix}/recommendations`, label: "Recommendations" },
    { to: `${prefix}/connections`, label: "Connections" },
    { to: `${prefix}/messages`, label: "Messages" },
    { to: `${prefix}/profile`, label: "Profile" },
  ]

  const isLinkActive = (path: string) => {
    if (location.pathname === path) return true
    if (path === `${prefix}/profile` && location.pathname.startsWith(`${prefix}/profile`)) return true
    if (path === `${prefix}/messages` && (location.pathname.startsWith(`${prefix}/messages`) || location.pathname.startsWith(`${prefix}/chat`))) return true
    if (path === `${prefix}/admin/users` && location.pathname.startsWith(`${prefix}/admin/users`)) return true
    if (path === `${prefix}/admin/alumni-requests` && location.pathname.startsWith(`${prefix}/admin/alumni-requests`)) return true
    if (path === `${prefix}/admin/branding` && location.pathname.startsWith(`${prefix}/admin/branding`)) return true
    if (path.startsWith("/super-admin/") && location.pathname.startsWith(path)) return true
    return false
  }

  const isAdminChildActive = adminLinks.some((link) => isLinkActive(link.to))

  const isActive = (path: string) => {
    return isLinkActive(path)
      ? "bg-[var(--primary)]/10 text-[var(--primary)] font-semibold"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 font-medium"
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/88 shadow-sm backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-2 sm:gap-4">
          {/* Compact College Identity */}
          <Link
            to={homePath}
            className="group flex items-center gap-2.5 font-bold text-base sm:text-lg text-slate-950 shrink min-w-0 max-w-[200px] sm:max-w-xs md:max-w-[240px] lg:max-w-sm"
            title={tenant ? tenant.name : "AlumniConn"}
          >
            {tenant?.branding?.logo_url ? (
              <img
                src={tenant.branding.logo_url}
                alt={`${tenant.name} Logo`}
                className="h-8 w-8 object-contain rounded-md shrink-0"
              />
            ) : (
              <span className="brand-mark brand-mark-sm shrink-0" aria-hidden="true">
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m3 8.5 9-4 9 4-9 4-9-4Z" />
                  <path d="M7 11v4.5c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5V11" />
                  <path d="M21 8.5v5" />
                </svg>
              </span>
            )}
            <span className="hidden sm:inline truncate">{tenant ? tenant.name : "AlumniConn"}</span>
          </Link>

          {/* Desktop Navigation */}
          {isLoggedIn && (
            <div className="hidden md:flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1 shrink-0">
              {role === "super_admin" ? (
                superAdminLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    aria-current={isLinkActive(link.to) ? "page" : undefined}
                    className={`rounded-md px-3 py-1.5 text-xs transition-colors duration-200 ${isActive(link.to)}`}
                  >
                    {link.label}
                  </Link>
                ))
              ) : (
                <>
                  {collegePrimaryLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      aria-current={isLinkActive(link.to) ? "page" : undefined}
                      className={`rounded-md px-2.5 lg:px-3 py-1.5 text-xs transition-colors duration-200 ${isActive(link.to)}`}
                    >
                      {link.label}
                    </Link>
                  ))}

                  {/* College Admin Dropdown */}
                  {role === "admin" && (
                    <div className="relative" ref={adminDropdownRef}>
                      <button
                        type="button"
                        onClick={() => setIsAdminMenuOpen((prev) => !prev)}
                        aria-expanded={isAdminMenuOpen}
                        aria-haspopup="true"
                        aria-label="Admin menu"
                        className={`inline-flex items-center gap-1 rounded-md px-2.5 lg:px-3 py-1.5 text-xs transition-colors duration-200 ${
                          isAdminChildActive || isAdminMenuOpen
                            ? "bg-[var(--primary)]/10 text-[var(--primary)] font-semibold"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 font-medium"
                        }`}
                      >
                        <span>Admin</span>
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className={`transition-transform duration-200 ${isAdminMenuOpen ? "rotate-180" : ""}`}
                        >
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      </button>

                      <div
                        role="menu"
                        aria-orientation="vertical"
                        className={`absolute right-0 mt-1 w-44 rounded-lg border border-slate-200 bg-white p-1 shadow-lg ring-1 ring-slate-950/5 z-50 transition-all ${
                          isAdminMenuOpen ? "opacity-100 scale-100 pointer-events-auto" : "hidden pointer-events-none"
                        }`}
                      >
                        {adminLinks.map((link) => {
                          const active = isLinkActive(link.to)
                          return (
                            <Link
                              key={link.to}
                              to={link.to}
                              role="menuitem"
                              onClick={() => setIsAdminMenuOpen(false)}
                              aria-current={active ? "page" : undefined}
                              className={`block rounded-md px-3 py-2 text-xs transition-colors ${
                                active
                                  ? "bg-[var(--primary)]/10 text-[var(--primary)] font-semibold"
                                  : "text-slate-700 hover:bg-slate-100 hover:text-slate-950 font-medium"
                              }`}
                            >
                              {link.label}
                            </Link>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Action Icons and Logout */}
          <div className="flex items-center gap-2 shrink-0">
            {isLoggedIn && role !== "super_admin" && (
              <>
                {/* Notification Bell */}
                <Link
                  to={`${prefix}/notifications`}
                  className={`icon-button relative ${
                    location.pathname.startsWith(`${prefix}/notifications`)
                      ? "text-[var(--primary)] bg-[var(--primary)]/10"
                      : ""
                  }`}
                  title="Notifications"
                  aria-label="Notifications"
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
                  className={`icon-button relative ${
                    location.pathname.startsWith(`${prefix}/messages`) || location.pathname.startsWith(`${prefix}/chat`)
                      ? "text-[var(--primary)] bg-[var(--primary)]/10"
                      : ""
                  }`}
                  title="Messages"
                  aria-label="Messages"
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
                className="btn btn-danger min-h-0 px-3 py-1.5 text-xs shrink-0"
              >
                Logout
              </button>
            )}
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isLoggedIn && (
          <div className="border-t border-slate-200/80 md:hidden">
            <div className="flex items-center justify-end py-1.5">
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
                {role === "super_admin" ? (
                  superAdminLinks.map((link) => {
                    const active = isLinkActive(link.to)
                    return (
                      <Link
                        key={link.to}
                        to={link.to}
                        onClick={() => setIsMobileMenuOpen(false)}
                        aria-current={active ? "page" : undefined}
                        className={`block rounded-lg px-3 py-2 text-sm transition-colors duration-150 ${
                          active
                            ? "bg-[var(--primary)]/10 text-[var(--primary)] font-bold"
                            : "text-slate-700 hover:bg-slate-100 hover:text-slate-950 font-medium"
                        }`}
                      >
                        {link.label}
                      </Link>
                    )
                  })
                ) : (
                  <>
                    {mobileCollegeLinks.map((link) => {
                      const active = isLinkActive(link.to)
                      return (
                        <Link
                          key={link.to}
                          to={link.to}
                          onClick={() => setIsMobileMenuOpen(false)}
                          aria-current={active ? "page" : undefined}
                          className={`block rounded-lg px-3 py-2 text-sm transition-colors duration-150 ${
                            active
                              ? "bg-[var(--primary)]/10 text-[var(--primary)] font-bold"
                              : "text-slate-700 hover:bg-slate-100 hover:text-slate-950 font-medium"
                          }`}
                        >
                          {link.label}
                        </Link>
                      )
                    })}

                    {/* Admin section for College Admin */}
                    {role === "admin" && (
                      <div className="pt-2 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setIsMobileAdminOpen((prev) => !prev)}
                          aria-expanded={isMobileAdminOpen}
                          aria-label="Admin section"
                          className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold transition-colors duration-150 ${
                            isAdminChildActive
                              ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                              : "text-slate-700 hover:bg-slate-100 hover:text-slate-950"
                          }`}
                        >
                          <span>Admin</span>
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className={`transition-transform duration-200 ${isMobileAdminOpen ? "rotate-180" : ""}`}
                          >
                            <path d="m6 9 6 6 6-6" />
                          </svg>
                        </button>
                        {isMobileAdminOpen && (
                          <div className="space-y-1 pl-3 pt-1">
                            {adminLinks.map((link) => {
                              const active = isLinkActive(link.to)
                              return (
                                <Link
                                  key={link.to}
                                  to={link.to}
                                  onClick={() => setIsMobileMenuOpen(false)}
                                  aria-current={active ? "page" : undefined}
                                  className={`block rounded-lg px-3 py-2 text-sm transition-colors duration-150 ${
                                    active
                                      ? "bg-[var(--primary)]/10 text-[var(--primary)] font-bold"
                                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-950 font-medium"
                                  }`}
                                >
                                  {link.label}
                                </Link>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}


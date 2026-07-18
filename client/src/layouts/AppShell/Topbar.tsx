import { Link, useLocation, useNavigate, useParams } from "react-router-dom"
import { useState, useEffect } from "react"
import { AUTH_CHANGE_EVENT, getCurrentUserRoleFromToken, getRoleHomePath, hasAuthToken, logout } from "../../features/auth/utils/auth"

export default function Topbar() {
  const { collegeSlug } = useParams<{ collegeSlug: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [role, setRole] = useState(getCurrentUserRoleFromToken)

  console.log("Topbar collegeSlug:", collegeSlug);

  useEffect(() => {
    const checkAuth = () => {
      setIsLoggedIn(hasAuthToken())
      setRole(getCurrentUserRoleFromToken())
    }
    
    checkAuth()
    window.addEventListener("storage", checkAuth)
    window.addEventListener(AUTH_CHANGE_EVENT, checkAuth)
    return () => {
      window.removeEventListener("storage", checkAuth)
      window.removeEventListener(AUTH_CHANGE_EVENT, checkAuth)
    }
  }, [location])

  const handleLogout = () => {
    logout()
    setIsLoggedIn(false)
    setRole(null)
    navigate(collegeSlug ? `/c/${collegeSlug}/login` : "/login")
  }

  const isActive = (path: string) => {
    return location.pathname === path
      ? "bg-blue-50 text-blue-700"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
  }

  const prefix = collegeSlug ? `/c/${collegeSlug}` : ""
  const homePath = role === "super_admin" ? "/super-admin/college-requests" : `${prefix}${getRoleHomePath(role)}`

  const mainLinks = role === "super_admin"
    ? [{ to: "/super-admin/college-requests", label: "College Approvals" }]
    : [
        { to: `${prefix}/feed`, label: "Feed" },
        { to: `${prefix}/connections`, label: "Connections" },
        { to: `${prefix}/profile`, label: "Profile" },
        { to: `${prefix}/messages`, label: "Messages" },
        ...(role === "admin" ? [{ to: `${prefix}/admin/alumni-requests`, label: "Alumni Requests" }] : []),
      ]

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/88 shadow-sm backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to={homePath} className="group flex items-center gap-3 font-bold text-xl text-slate-950">
            <span className="brand-mark brand-mark-sm" aria-hidden="true">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m3 8.5 9-4 9 4-9 4-9-4Z" />
                <path d="M7 11v4.5c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5V11" />
                <path d="M21 8.5v5" />
              </svg>
            </span>
            <span className="hidden sm:inline">AluminiConn</span>
          </Link>

          {isLoggedIn && (
            <div className="hidden sm:flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
              {mainLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`rounded-md px-3 py-2 text-sm font-semibold transition-colors duration-200 ${isActive(link.to)}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2">
            {isLoggedIn && role !== "super_admin" && (
              <>
                <Link
                  to={`${prefix}/messages`}
                  className="icon-button"
                  title="Messages"
                >
                  <svg
                    width="20"
                    height="20"
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
                className="btn btn-danger min-h-0 px-3 py-2 text-sm"
              >
                Logout
              </button>
            )}
          </div>
        </div>
        {isLoggedIn && (
          <div className="flex flex-wrap gap-1 border-t border-slate-100 py-2 sm:hidden">
            {mainLinks.map((link) => (
              <Link key={link.to} to={link.to} className={`rounded-md px-2 py-2 text-center text-xs font-semibold ${isActive(link.to)}`}>
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}

import { Link } from "react-router-dom"
import { useTenant } from "../../providers/TenantProvider"

export default function Footer() {
  const { tenant } = useTenant()
  const collegeSlug = tenant?.slug
  const prefix = collegeSlug ? `/c/${collegeSlug}` : ""

  return (
    <footer className="border-t border-slate-200/80 bg-white/90 text-slate-500 text-sm mt-auto backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <span className="font-semibold text-slate-800">
              {tenant ? tenant.name : "AlumniConn"}
            </span>
            <span>•</span>
            <span className="text-xs text-slate-500">
              © {new Date().getFullYear()} {tenant ? tenant.name : "AlumniConn"}. All rights reserved.
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-slate-600">
            {collegeSlug ? (
              <Link to={`${prefix}#about`} className="hover:text-slate-900 transition-colors">
                About
              </Link>
            ) : null}
            <a href="#privacy" onClick={(e) => e.preventDefault()} className="hover:text-slate-900 transition-colors">
              Privacy Policy
            </a>
            <a href="#terms" onClick={(e) => e.preventDefault()} className="hover:text-slate-900 transition-colors">
              Terms of Service
            </a>
            <a href="#contact" onClick={(e) => e.preventDefault()} className="hover:text-slate-900 transition-colors">
              Contact Support
            </a>
            {!collegeSlug && (
              <Link to="/super-admin-login" className="hover:text-slate-900 transition-colors">
                Platform Admin
              </Link>
            )}
          </div>

          {collegeSlug && (
            <div className="text-xs text-slate-400 text-center sm:text-right">
              Powered by <span className="font-semibold text-slate-600">AlumniConn</span>
            </div>
          )}
        </div>
      </div>
    </footer>
  )
}

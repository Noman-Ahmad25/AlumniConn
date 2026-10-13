import { Link } from "react-router-dom"
import { useTenant } from "../../providers/TenantProvider"

export default function Footer() {
  const { tenant } = useTenant()
  const collegeSlug = tenant?.slug
  const prefix = collegeSlug ? `/c/${collegeSlug}` : ""

  return (
    <footer className="border-t border-slate-200/80 bg-white/95 text-slate-500 text-sm mt-auto backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-6 space-y-2.5 sm:space-y-4">
        {/* Main Footer Row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-2 sm:gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-0.5 sm:gap-2 text-center sm:text-left">
            <span className="font-semibold text-slate-800 text-sm">
              {tenant ? tenant.name : "AlumniConn"}
            </span>
            <span className="hidden sm:inline text-slate-300">•</span>
            <span className="text-xs text-slate-500 max-w-sm sm:max-w-none text-center sm:text-left">
              © {new Date().getFullYear()} {tenant ? tenant.name : "AlumniConn"}. All rights reserved.
            </span>
          </div>

          {/* Nav & Info Links */}
          <div className="flex flex-wrap items-center justify-center gap-x-3.5 sm:gap-x-6 gap-y-1 sm:gap-y-2 text-xs font-medium text-slate-600">
            {collegeSlug ? (
              <Link to={`${prefix}#about`} className="hover:text-slate-900 transition-colors py-0.5">
                About
              </Link>
            ) : null}
            <a href="#privacy" onClick={(e) => e.preventDefault()} className="hover:text-slate-900 transition-colors py-0.5">
              Privacy Policy
            </a>
            <a href="#terms" onClick={(e) => e.preventDefault()} className="hover:text-slate-900 transition-colors py-0.5">
              Terms of Service
            </a>
            <a href="#contact" onClick={(e) => e.preventDefault()} className="hover:text-slate-900 transition-colors py-0.5">
              Contact Support
            </a>
            {!collegeSlug && (
              <Link to="/super-admin-login" className="hover:text-slate-900 transition-colors py-0.5">
                Platform Admin
              </Link>
            )}
          </div>

          {collegeSlug && (
            <div className="text-[11px] sm:text-xs text-slate-400 text-center md:text-right">
              Powered by <span className="font-semibold text-slate-600">AlumniConn</span>
            </div>
          )}
        </div>

        {/* Portfolio Showcase & Attribution Row */}
        <div className="pt-2 sm:pt-4 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-2 sm:gap-3 text-xs text-slate-500">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-2.5 sm:gap-x-3 gap-y-1">
            <span className="font-medium text-slate-700">Built by Noman Ahmad</span>
            <span className="text-slate-300">•</span>
            <a
              href="https://github.com/Noman-Ahmad25"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-1 font-medium"
            >
              GitHub
            </a>
            <span className="text-slate-300">•</span>
            <a
              href="https://github.com/Noman-Ahmad25/AlumniConn"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 transition-colors font-medium flex items-center gap-1"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                <path d="M9 18c-4.51 2-5-2-7-2" />
              </svg>
              View source on GitHub
            </a>
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:py-1 rounded-full bg-slate-100/80 text-slate-500 text-[10px] sm:text-[11px] max-w-full truncate text-center">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
            <span className="truncate">Interactive Demo • Synthetic Showcase Data</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

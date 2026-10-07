import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { adminManagementAPI } from "../../admin/api/management"
import type { DemoRole } from "../../admin/types/management"
import { setAuthToken, getRoleHomePath } from "../utils/auth"
import { getApiErrorMessage } from "../../../utils/error"

interface DemoAccountPickerProps {
  className?: string
  compact?: boolean
}

export default function DemoAccountPicker({ className = "", compact = false }: DemoAccountPickerProps) {
  const navigate = useNavigate()
  const [loadingRole, setLoadingRole] = useState<DemoRole | null>(null)
  const [error, setError] = useState("")

  const handleDemoLogin = async (role: DemoRole) => {
    setLoadingRole(role)
    setError("")
    try {
      const data = await adminManagementAPI.demoLogin(role)
      setAuthToken(data.access_token)

      if (role === "super_admin") {
        navigate("/super-admin/dashboard")
      } else if (data.college_slug) {
        const home = getRoleHomePath(data.role as any)
        navigate(`/c/${data.college_slug}${home}`)
      } else {
        navigate("/feed")
      }
    } catch (err) {
      setError(getApiErrorMessage(err, `Failed to log in as ${role}`))
    } finally {
      setLoadingRole(null)
    }
  }

  const accounts = [
    {
      role: "super_admin" as DemoRole,
      title: "Super Admin",
      badge: "Platform-Wide",
      badgeColor: "bg-purple-100 text-purple-800 border-purple-200",
      description: "Manage platform stats, review university requests, manage cross-campus users.",
      accent: "hover:border-purple-300 hover:shadow-purple-500/10",
      btnClass: "bg-purple-600 hover:bg-purple-700 text-white",
    },
    {
      role: "college_admin" as DemoRole,
      title: "College Admin",
      badge: "NITK Administrator",
      badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
      description: "Manage NITK campus roster, promote/demote students, review alumni verifications.",
      accent: "hover:border-amber-300 hover:shadow-amber-500/10",
      btnClass: "bg-amber-600 hover:bg-amber-700 text-white",
    },
    {
      role: "alumni" as DemoRole,
      title: "Demo Alumni",
      badge: "NITK '20 • Microsoft",
      badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
      description: "Senior AI Engineer profile, alumni connections, career posts, mentorship outreach.",
      accent: "hover:border-blue-300 hover:shadow-blue-500/10",
      btnClass: "bg-blue-600 hover:bg-blue-700 text-white",
    },
    {
      role: "student" as DemoRole,
      title: "Demo Student",
      badge: "NITK '26 • Undergrad",
      badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
      description: "Computer Science student, explore alumni network, recommendations, connection requests.",
      accent: "hover:border-emerald-300 hover:shadow-emerald-500/10",
      btnClass: "bg-emerald-600 hover:bg-emerald-700 text-white",
    },
  ]

  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3.5 border-b border-slate-100 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
            <h3 className="font-bold text-slate-900 text-base">Instant 1-Click Demo Evaluation</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Test realistic multi-tenant features without entering credentials or configuring passwords.
          </p>
        </div>
        <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md self-start sm:self-auto">
          Local Development
        </span>
      </div>

      {error && (
        <div className="mt-3 rounded-lg bg-rose-50 p-2.5 border border-rose-200 text-xs text-rose-700">
          {error}
        </div>
      )}

      <div className={`mt-4 grid grid-cols-1 ${compact ? "gap-2.5" : "sm:grid-cols-2 lg:grid-cols-4 gap-3.5"}`}>
        {accounts.map((acc) => (
          <div
            key={acc.role}
            className={`rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 flex flex-col justify-between transition-all shadow-sm ${acc.accent}`}
          >
            <div>
              <div className="flex items-center justify-between gap-1.5 mb-1.5">
                <span className="font-bold text-sm text-slate-900">{acc.title}</span>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${acc.badgeColor}`}
                >
                  {acc.badge}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mb-3">
                {acc.description}
              </p>
            </div>

            <button
              onClick={() => handleDemoLogin(acc.role)}
              disabled={loadingRole !== null}
              className={`w-full rounded-lg px-3 py-2 text-xs font-semibold shadow-sm transition-all text-center flex items-center justify-center gap-1.5 disabled:opacity-50 ${acc.btnClass}`}
            >
              {loadingRole === acc.role ? (
                <>
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-r-transparent"></div>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign in as {acc.title}</span>
                  <span>&rarr;</span>
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

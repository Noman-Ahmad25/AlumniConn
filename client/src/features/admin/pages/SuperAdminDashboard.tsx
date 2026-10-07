import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import Topbar from "../../../layouts/AppShell/Topbar"
import Footer from "../../../layouts/AppShell/Footer"
import { adminManagementAPI } from "../api/management"
import type { PlatformOverview } from "../types/management"
import { getApiErrorMessage } from "../../../utils/error"

export default function SuperAdminDashboard() {
  const [overview, setOverview] = useState<PlatformOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let cancelled = false
    const fetchOverview = async () => {
      setLoading(true)
      setError("")
      try {
        const data = await adminManagementAPI.getPlatformOverview()
        if (!cancelled) setOverview(data)
      } catch (err) {
        if (!cancelled) setError(getApiErrorMessage(err, "Failed to load platform overview"))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchOverview()
    return () => {
      cancelled = true
    }
  }, [])

  const getActivityBadgeClass = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-amber-100 text-amber-800 border-amber-200"
      case "approved":
      case "active":
        return "bg-emerald-100 text-emerald-800 border-emerald-200"
      case "rejected":
      case "deactivated":
      case "inactive":
        return "bg-rose-100 text-rose-800 border-rose-200"
      default:
        return "bg-slate-100 text-slate-700 border-slate-200"
    }
  }

  const formatActivityTime = (isoString: string) => {
    try {
      const date = new Date(isoString)
      return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return isoString
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Topbar />
      <main className="app-main-wide flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-200 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">
                Super Admin Console
              </span>
              <span className="text-xs text-slate-500 font-medium">Platform-Wide Overview</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Platform Overview</h1>
            <p className="mt-1 text-sm text-slate-600">
              Real-time platform metrics, university network health, and recent cross-tenant activity.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex flex-wrap gap-2.5">
            <Link
              to="/super-admin/universities"
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
            >
              Manage Universities
            </Link>
            <Link
              to="/super-admin/users"
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
            >
              Manage Users
            </Link>
            <Link
              to="/super-admin/college-requests"
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
            >
              College Requests
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-rose-50 p-4 border border-rose-200 text-sm text-rose-800">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-2 text-sm text-slate-500 font-medium">Aggregating platform metrics...</p>
          </div>
        ) : overview ? (
          <div className="space-y-8">
            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Total Colleges
                </span>
                <p className="mt-2 text-3xl font-extrabold text-slate-900">{overview.total_colleges}</p>
                <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
                  <span>{overview.active_colleges} Active</span>
                  <Link to="/super-admin/universities" className="text-blue-600 font-medium hover:underline">
                    View all &rarr;
                  </Link>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Active Colleges
                </span>
                <p className="mt-2 text-3xl font-extrabold text-emerald-600">{overview.active_colleges}</p>
                <p className="mt-2 text-xs text-slate-500">
                  {overview.total_colleges - overview.active_colleges} deactivated
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Pending Requests
                </span>
                <p className="mt-2 text-3xl font-extrabold text-amber-600">{overview.pending_requests}</p>
                <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
                  <span>Awaiting approval</span>
                  <Link to="/super-admin/college-requests" className="text-blue-600 font-medium hover:underline">
                    Review &rarr;
                  </Link>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Total Users
                </span>
                <p className="mt-2 text-3xl font-extrabold text-slate-900">{overview.total_users}</p>
                <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
                  <span>Cross-tenant</span>
                  <Link to="/super-admin/users" className="text-blue-600 font-medium hover:underline">
                    Manage &rarr;
                  </Link>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Total Alumni
                </span>
                <p className="mt-2 text-3xl font-extrabold text-blue-600">{overview.alumni_count}</p>
                <p className="mt-2 text-xs text-slate-500">Verified graduates</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Total Students
                </span>
                <p className="mt-2 text-3xl font-extrabold text-indigo-600">{overview.student_count}</p>
                <p className="mt-2 text-xs text-slate-500">Undergrad / Enrolled</p>
              </div>
            </div>

            {/* Platform Management Modules & Activity Stream */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Quick Actions & Navigation Cards */}
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-slate-900">Platform Management</h2>

                <Link
                  to="/super-admin/universities"
                  className="block rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-blue-400 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                      Universities & Colleges
                    </h3>
                    <span className="text-slate-400 group-hover:translate-x-1 transition-transform">&rarr;</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    Monitor university onboarding, domain validation, activate or deactivate tenant access, and view college statistics.
                  </p>
                </Link>

                <Link
                  to="/super-admin/users"
                  className="block rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-blue-400 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                      Platform-Wide Users
                    </h3>
                    <span className="text-slate-400 group-hover:translate-x-1 transition-transform">&rarr;</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    Inspect user accounts across all institutions, search profiles, adjust global role privileges, and toggle active status.
                  </p>
                </Link>

                <Link
                  to="/super-admin/college-requests"
                  className="block rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-blue-400 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                      College Onboarding Requests
                    </h3>
                    <span className="text-slate-400 group-hover:translate-x-1 transition-transform">&rarr;</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    Review and verify incoming university creation requests submitted by prospective institutional administrators.
                  </p>
                </Link>
              </div>

              {/* Dynamic Recent Platform Activity */}
              <div className="lg:col-span-2">
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                    <h2 className="text-lg font-bold text-slate-900">Recent Platform Activity</h2>
                    <span className="text-xs text-slate-400 font-medium">Live Audit Log</span>
                  </div>

                  {overview.recent_activity.length === 0 ? (
                    <p className="text-sm text-slate-500 py-8 text-center">No platform activity recorded yet.</p>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {overview.recent_activity.map((item) => (
                        <div key={item.id} className="py-3.5 flex items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-semibold text-slate-900 truncate">{item.title}</h4>
                              {item.status && (
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getActivityBadgeClass(
                                    item.status
                                  )}`}
                                >
                                  {item.status}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-600 mt-0.5 truncate">{item.description}</p>
                          </div>
                          <span className="text-xs text-slate-400 whitespace-nowrap">
                            {formatActivityTime(item.timestamp)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </main>
      <Footer />
    </div>
  )
}

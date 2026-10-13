import { useEffect, useState } from "react"
import Topbar from "../../../layouts/AppShell/Topbar"
import Footer from "../../../layouts/AppShell/Footer"
import { adminManagementAPI } from "../api/management"
import type { AdminCollege } from "../types/management"
import { getApiErrorMessage } from "../../../utils/error"
import { TableSkeleton } from "../../../shared/components/skeletons"

export default function SuperAdminUniversities() {
  const [colleges, setColleges] = useState<AdminCollege[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null)
  const [selectedCollege, setSelectedCollege] = useState<AdminCollege | null>(null)
  const [deletingCollege, setDeletingCollege] = useState<AdminCollege | null>(null)

  const fetchColleges = async () => {
    setLoading(true)
    setError("")
    try {
      const data = await adminManagementAPI.getAdminColleges({
        search: searchTerm.trim() || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
      })
      setColleges(data)
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to load universities"))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchColleges()
  }, [statusFilter])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchColleges()
  }

  const handleToggleStatus = async (college: AdminCollege) => {
    setActionLoadingId(college.id)
    try {
      const updated = await adminManagementAPI.updateCollegeStatus(college.id, !college.is_active)
      setColleges((prev) => prev.map((c) => (c.id === college.id ? updated : c)))
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to update college status"))
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleDeleteCollege = async () => {
    if (!deletingCollege) return
    setActionLoadingId(deletingCollege.id)
    try {
      await adminManagementAPI.deleteCollege(deletingCollege.id)
      setColleges((prev) => prev.filter((c) => c.id !== deletingCollege.id))
      setDeletingCollege(null)
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to delete college"))
    } finally {
      setActionLoadingId(null)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Topbar />
      <main className="app-main-wide flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Page Heading */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-200 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">
                Super Admin Console
              </span>
              <span className="text-xs text-slate-500 font-medium">Platform Management</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Universities & Colleges</h1>
            <p className="mt-1 text-sm text-slate-600">
              Manage onboarded universities, inspect tenant statistics, toggle active access, and review administrator contacts.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-rose-50 p-4 border border-rose-200 text-sm text-rose-800 flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => setError("")} className="text-rose-600 font-semibold hover:underline">
              Dismiss
            </button>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex rounded-lg bg-slate-100 p-1">
            <button
              onClick={() => setStatusFilter("all")}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                statusFilter === "all" ? "bg-white text-slate-950 shadow-sm" : "text-slate-600 hover:text-slate-950"
              }`}
            >
              All Colleges
            </button>
            <button
              onClick={() => setStatusFilter("active")}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                statusFilter === "active" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-600 hover:text-slate-950"
              }`}
            >
              Active Only
            </button>
            <button
              onClick={() => setStatusFilter("deactivated")}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                statusFilter === "deactivated" ? "bg-white text-rose-700 shadow-sm" : "text-slate-600 hover:text-slate-950"
              }`}
            >
              Deactivated
            </button>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2 flex-1 sm:max-w-md">
            <input
              type="text"
              placeholder="Search by name, domain, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3.5 py-1.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="rounded-lg bg-slate-900 px-4 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 transition-colors"
            >
              Search
            </button>
          </form>
        </div>

        {/* Content Table */}
        {loading ? (
          <TableSkeleton columns={6} rows={5} />
        ) : colleges.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <p className="text-base font-semibold text-slate-900">No universities found</p>
            <p className="text-sm text-slate-500 mt-1">Try refining your search terms or filters.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">University</th>
                    <th className="px-4 py-3.5">Domain & Slug</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5">Users & Breakdown</th>
                    <th className="px-4 py-3.5">Institutional Admin</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {colleges.map((college) => (
                    <tr key={college.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-900">{college.name}</div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {college.location || "Location not specified"} • Est. {college.established_year || "N/A"}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="font-mono text-xs text-slate-800">{college.domain}</div>
                        <div className="font-mono text-xs text-slate-500 mt-0.5">/c/{college.slug}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {college.is_active ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
                            Deactivated
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-900">{college.total_users} Total Users</div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {college.alumni_count} Alumni • {college.student_count} Students
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {college.admin_user ? (
                          <div>
                            <div className="font-medium text-slate-900 text-xs">
                              {college.admin_user.full_name || college.admin_user.username}
                            </div>
                            <div className="text-xs text-slate-500">{college.admin_user.email}</div>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">No assigned admin</span>
                        )}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-right text-xs">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedCollege(college)}
                            className="rounded px-2.5 py-1 text-slate-700 bg-slate-100 hover:bg-slate-200 font-semibold transition-colors"
                          >
                            Details
                          </button>
                          <button
                            onClick={() => handleToggleStatus(college)}
                            disabled={actionLoadingId === college.id}
                            className={`rounded px-2.5 py-1 font-semibold transition-colors ${
                              college.is_active
                                ? "bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200"
                                : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200"
                            }`}
                          >
                            {actionLoadingId === college.id
                              ? "Updating..."
                              : college.is_active
                              ? "Deactivate"
                              : "Activate"}
                          </button>
                          <button
                            onClick={() => setDeletingCollege(college)}
                            disabled={actionLoadingId === college.id || college.slug === "nitk"}
                            title={college.slug === "nitk" ? "Cannot delete primary demo college" : "Delete college"}
                            className="rounded px-2.5 py-1 font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Details Modal */}
        {selectedCollege && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl border border-slate-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-900">{selectedCollege.name}</h3>
                <button
                  onClick={() => setSelectedCollege(null)}
                  className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  &times;
                </button>
              </div>
              <div className="mt-4 space-y-3 text-sm">
                <div>
                  <span className="font-semibold text-slate-700">Domain:</span>{" "}
                  <span className="font-mono text-slate-900">{selectedCollege.domain}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Tenant Slug:</span>{" "}
                  <span className="font-mono text-slate-900">/c/{selectedCollege.slug}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Location:</span>{" "}
                  <span className="text-slate-900">{selectedCollege.location || "N/A"}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Established Year:</span>{" "}
                  <span className="text-slate-900">{selectedCollege.established_year || "N/A"}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Status:</span>{" "}
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                      selectedCollege.is_active
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    {selectedCollege.is_active ? "Active" : "Deactivated"}
                  </span>
                </div>
                {selectedCollege.description && (
                  <div>
                    <span className="font-semibold text-slate-700">Description:</span>
                    <p className="mt-1 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-md border border-slate-200">
                      {selectedCollege.description}
                    </p>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-100">
                  <span className="font-semibold text-slate-700">Registered Users:</span>{" "}
                  <span className="text-slate-900">
                    {selectedCollege.total_users} total ({selectedCollege.alumni_count} alumni, {selectedCollege.student_count} students)
                  </span>
                </div>
                {selectedCollege.admin_user && (
                  <div>
                    <span className="font-semibold text-slate-700">Designated Administrator:</span>{" "}
                    <span className="text-slate-900">
                      {selectedCollege.admin_user.full_name} ({selectedCollege.admin_user.email})
                    </span>
                  </div>
                )}
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedCollege(null)}
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deletingCollege && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl border border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">Confirm Deletion</h3>
              <p className="mt-2 text-sm text-slate-600">
                Are you sure you want to permanently delete{" "}
                <span className="font-semibold text-slate-900">{deletingCollege.name}</span>?
              </p>
              <p className="mt-2 text-xs text-rose-700 bg-rose-50 p-2.5 rounded-md border border-rose-200">
                Warning: This action will permanently remove the college record, its branding configurations, and associated demo records.
              </p>
              <div className="mt-6 flex justify-end gap-2.5">
                <button
                  onClick={() => setDeletingCollege(null)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteCollege}
                  disabled={actionLoadingId === deletingCollege.id}
                  className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 transition-colors disabled:opacity-50"
                >
                  {actionLoadingId === deletingCollege.id ? "Deleting..." : "Permanently Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}

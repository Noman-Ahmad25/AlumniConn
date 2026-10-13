import { useEffect, useState } from "react"
import { adminManagementAPI } from "../api/management"
import type { AdminUser } from "../types/management"
import { getApiErrorMessage } from "../../../utils/error"
import { useTenant } from "../../../providers/TenantProvider"
import { getCurrentUserIdFromToken } from "../../auth/utils/auth"
import { TableSkeleton } from "../../../shared/components/skeletons"

export default function CollegeAdminUsers() {
  const { tenant } = useTenant()
  const currentUserId = getCurrentUserIdFromToken()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [successMsg, setSuccessMsg] = useState("")

  // Filters
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  
  // Pagination
  const [page, setPage] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [totalStudents, setTotalStudents] = useState<number | null>(null)
  const [totalAlumni, setTotalAlumni] = useState<number | null>(null)
  const PAGE_SIZE = 25
  
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null)
  const [deleteModalUser, setDeleteModalUser] = useState<AdminUser | null>(null)
  const [confirmPromoteUser, setConfirmPromoteUser] = useState<AdminUser | null>(null)
  const [confirmDemoteUser, setConfirmDemoteUser] = useState<AdminUser | null>(null)

  const fetchUsers = async (targetPage = page) => {
    setLoading(true)
    setError("")
    try {
      const res = await adminManagementAPI.getCollegeUsers({
        search: searchTerm.trim() || undefined,
        role: roleFilter !== "all" ? roleFilter : undefined,
        is_active: statusFilter === "all" ? undefined : statusFilter === "active",
        skip: targetPage * PAGE_SIZE,
        limit: PAGE_SIZE,
      })
      setUsers(res.users)
      setTotalCount(res.total)
      if (res.studentCount !== undefined) setTotalStudents(res.studentCount)
      if (res.alumniCount !== undefined) setTotalAlumni(res.alumniCount)
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to load college users"))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setPage(0)
    fetchUsers(0)
  }, [roleFilter, statusFilter])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(0)
    fetchUsers(0)
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    fetchUsers(newPage)
  }

  const handleToggleStatus = async (user: AdminUser) => {
    setActionLoadingId(user.id)
    try {
      const res = await adminManagementAPI.updateUserStatus(user.id, !user.is_active)
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, is_active: res.is_active } : u))
      )
      setSuccessMsg(`User status updated to ${res.is_active ? "active" : "inactive"}`)
      setTimeout(() => setSuccessMsg(""), 3500)
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to update user status"))
    } finally {
      setActionLoadingId(null)
    }
  }

  const handlePromoteToAlumni = async (user: AdminUser) => {
    setActionLoadingId(user.id)
    try {
      await adminManagementAPI.updateUserRole(user.id, "alumni")
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, role: "alumni" } : u))
      )
      setSuccessMsg(`Successfully promoted @${user.username} to Alumni`)
      setTimeout(() => setSuccessMsg(""), 3500)
      setConfirmPromoteUser(null)
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to promote user to Alumni"))
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleDemoteToStudent = async (user: AdminUser) => {
    setActionLoadingId(user.id)
    try {
      await adminManagementAPI.updateUserRole(user.id, "student")
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, role: "student" } : u))
      )
      setSuccessMsg(`Successfully converted @${user.username} to Student role`)
      setTimeout(() => setSuccessMsg(""), 3500)
      setConfirmDemoteUser(null)
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to demote user to Student"))
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleDeleteUser = async () => {
    if (!deleteModalUser) return
    setActionLoadingId(deleteModalUser.id)
    try {
      await adminManagementAPI.deleteUser(deleteModalUser.id)
      setUsers((prev) => prev.filter((u) => u.id !== deleteModalUser.id))
      setSuccessMsg(`User account @${deleteModalUser.username} removed successfully`)
      setTimeout(() => setSuccessMsg(""), 3500)
      setDeleteModalUser(null)
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to delete user"))
    } finally {
      setActionLoadingId(null)
    }
  }

  const studentCount = totalStudents !== null ? totalStudents : users.filter((u) => u.role === "student").length
  const alumniCount = totalAlumni !== null ? totalAlumni : users.filter((u) => u.role === "alumni").length

  return (
    <div className="app-main-wide py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-200 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                Institutional Administration
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {tenant?.name || "College User Roster"}
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Manage Users</h1>
            <p className="mt-1 text-sm text-slate-600">
              Manage your university's enrolled students and graduated alumni, adjust roles, and verify alumni records.
            </p>
          </div>

          {/* Quick Counter */}
          <div className="mt-4 sm:mt-0 flex gap-3">
            <div className="rounded-lg bg-white border border-slate-200 px-3.5 py-2 text-center shadow-sm">
              <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Students</div>
              <div className="text-lg font-bold text-slate-900">{studentCount}</div>
            </div>
            <div className="rounded-lg bg-white border border-slate-200 px-3.5 py-2 text-center shadow-sm">
              <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Alumni</div>
              <div className="text-lg font-bold text-slate-900">{alumniCount}</div>
            </div>
          </div>
        </div>

        {/* Feedback Alerts */}
        {error && (
          <div className="mb-4 rounded-lg bg-rose-50 p-4 border border-rose-200 text-sm text-rose-800 flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => setError("")} className="text-rose-600 font-semibold hover:underline">
              Dismiss
            </button>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 rounded-lg bg-emerald-50 p-4 border border-emerald-200 text-sm text-emerald-800">
            {successMsg}
          </div>
        )}

        {/* Filter Bar */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm mb-6 space-y-3">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* Search */}
            <form onSubmit={handleSearchSubmit} className="flex gap-2 flex-1 max-w-lg">
              <input
                type="text"
                placeholder="Search students & alumni by name, email, major, or company..."
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

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2.5">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Roles (Student & Alumni)</option>
                <option value="student">Students Only</option>
                <option value="alumni">Alumni Only</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Accounts</option>
                <option value="inactive">Inactive Accounts</option>
              </select>
            </div>
          </div>
        </div>

        {/* User Table */}
        {loading ? (
          <TableSkeleton columns={5} rows={6} />
        ) : users.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <p className="text-base font-semibold text-slate-900">No users found</p>
            <p className="text-sm text-slate-500 mt-1">Try clearing filters or broadening search parameters.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">Name & Account</th>
                    <th className="px-4 py-3.5">Role</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5">Academic / Major</th>
                    <th className="px-4 py-3.5">Professional Details</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                            {user.full_name?.charAt(0) || user.username.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-900 truncate">
                              {user.full_name || user.username}
                            </div>
                            <div className="text-xs text-slate-500 truncate">
                              @{user.username} • {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {user.role === "admin" ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
                            College Admin
                          </span>
                        ) : user.role === "alumni" ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                            Alumni
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Student
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {user.is_active ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-xs font-medium text-slate-800">
                          {user.major || "Major not specified"}
                        </div>
                        {user.grad_year && (
                          <div className="text-xs text-slate-500 mt-0.5">
                            Class of {user.grad_year}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-xs text-slate-700">
                          {user.job_title ? (
                            <span>
                              <span className="font-medium">{user.job_title}</span>
                              {user.company && <span className="text-slate-500"> @ {user.company}</span>}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">No job title added</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-right text-xs">
                        <div className="flex items-center justify-end gap-1.5">
                          {user.role === "admin" ? (
                            <span className="text-xs font-semibold text-slate-400 italic px-2">
                              Administrator
                            </span>
                          ) : (
                            <>
                              {user.role === "student" ? (
                                <button
                                  onClick={() => setConfirmPromoteUser(user)}
                                  disabled={actionLoadingId === user.id}
                                  className="rounded px-2.5 py-1 font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors"
                                >
                                  Promote to Alumni
                                </button>
                              ) : (
                                <button
                                  onClick={() => setConfirmDemoteUser(user)}
                                  disabled={actionLoadingId === user.id}
                                  className="rounded px-2.5 py-1 font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors"
                                >
                                  Demote to Student
                                </button>
                              )}

                              <button
                                onClick={() => handleToggleStatus(user)}
                                disabled={actionLoadingId === user.id || user.id === currentUserId}
                                title={user.id === currentUserId ? "Cannot deactivate yourself" : "Toggle status"}
                                className={`rounded px-2.5 py-1 font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                                  user.is_active
                                    ? "bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200"
                                    : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200"
                                }`}
                              >
                                {actionLoadingId === user.id
                                  ? "..."
                                  : user.is_active
                                  ? "Deactivate"
                                  : "Activate"}
                              </button>

                              <button
                                onClick={() => setDeleteModalUser(user)}
                                disabled={actionLoadingId === user.id || user.id === currentUserId}
                                title={user.id === currentUserId ? "Cannot delete yourself" : "Delete user"}
                                className="rounded px-2.5 py-1 font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalCount > PAGE_SIZE && (
              <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-200 px-4 py-3 sm:px-6 bg-slate-50 gap-3">
                <div className="text-xs sm:text-sm text-slate-700">
                  Showing <span className="font-semibold text-slate-900">{page * PAGE_SIZE + 1}</span> to{" "}
                  <span className="font-semibold text-slate-900">{Math.min((page + 1) * PAGE_SIZE, totalCount)}</span> of{" "}
                  <span className="font-semibold text-slate-900">{totalCount}</span> users
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 0 || loading}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-xs font-medium text-slate-600 px-1">
                    Page {page + 1} of {Math.ceil(totalCount / PAGE_SIZE)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={(page + 1) * PAGE_SIZE >= totalCount || loading}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Promote Confirmation Modal */}
        {confirmPromoteUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl border border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">Promote to Alumni</h3>
              <p className="mt-2 text-sm text-slate-600">
                Are you sure you want to promote <span className="font-semibold text-slate-900">{confirmPromoteUser.full_name || confirmPromoteUser.username}</span> to Alumni status?
              </p>
              <p className="mt-2 text-xs text-blue-700 bg-blue-50 p-2.5 rounded-md border border-blue-200">
                This grants full alumni capabilities including alumni badges and mentorship outreach.
              </p>
              <div className="mt-6 flex justify-end gap-2.5">
                <button
                  onClick={() => setConfirmPromoteUser(null)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handlePromoteToAlumni(confirmPromoteUser)}
                  disabled={actionLoadingId === confirmPromoteUser.id}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {actionLoadingId === confirmPromoteUser.id ? "Promoting..." : "Confirm Promotion"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Demote Confirmation Modal */}
        {confirmDemoteUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl border border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">Demote to Student</h3>
              <p className="mt-2 text-sm text-slate-600">
                Change role of <span className="font-semibold text-slate-900">{confirmDemoteUser.full_name || confirmDemoteUser.username}</span> back to Student?
              </p>
              <div className="mt-6 flex justify-end gap-2.5">
                <button
                  onClick={() => setConfirmDemoteUser(null)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDemoteToStudent(confirmDemoteUser)}
                  disabled={actionLoadingId === confirmDemoteUser.id}
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                  {actionLoadingId === confirmDemoteUser.id ? "Demoting..." : "Confirm Role Change"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {deleteModalUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl border border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">Delete User Account</h3>
              <p className="mt-2 text-sm text-slate-600">
                Permanently delete account for <span className="font-semibold text-slate-900">@{deleteModalUser.username}</span>?
              </p>
              <p className="mt-2 text-xs text-rose-700 bg-rose-50 p-2.5 rounded-md border border-rose-200">
                Notice: This will erase all profile information, connections, and posts created by this user.
              </p>
              <div className="mt-6 flex justify-end gap-2.5">
                <button
                  onClick={() => setDeleteModalUser(null)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteUser}
                  disabled={actionLoadingId === deleteModalUser.id}
                  className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 transition-colors disabled:opacity-50"
                >
                  {actionLoadingId === deleteModalUser.id ? "Deleting..." : "Permanently Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  )
}

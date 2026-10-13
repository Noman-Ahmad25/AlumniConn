import { useEffect, useState } from "react"
import Topbar from "../../../layouts/AppShell/Topbar"
import Footer from "../../../layouts/AppShell/Footer"
import { adminManagementAPI } from "../api/management"
import type { AdminUser, AdminCollege } from "../types/management"
import { getApiErrorMessage } from "../../../utils/error"
import { getCurrentUserIdFromToken } from "../../auth/utils/auth"
import { TableSkeleton } from "../../../shared/components/skeletons"

export default function SuperAdminUsers() {
  const currentUserId = getCurrentUserIdFromToken()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [colleges, setColleges] = useState<AdminCollege[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [successMsg, setSuccessMsg] = useState("")
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCollegeId, setSelectedCollegeId] = useState<string>("all")
  const [selectedRole, setSelectedRole] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null)
  const [roleModalUser, setRoleModalUser] = useState<AdminUser | null>(null)
  const [newRole, setNewRole] = useState<string>("")
  const [deleteModalUser, setDeleteModalUser] = useState<AdminUser | null>(null)

  useEffect(() => {
    adminManagementAPI
      .getAdminColleges()
      .then(setColleges)
      .catch(() => {})
  }, [])

  // Pagination
  const [page, setPage] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const PAGE_SIZE = 25

  const fetchUsers = async (targetPage = page) => {
    setLoading(true)
    setError("")
    try {
      const res = await adminManagementAPI.getPlatformUsers({
        search: searchTerm.trim() || undefined,
        college_id: selectedCollegeId !== "all" ? Number(selectedCollegeId) : undefined,
        role: selectedRole !== "all" ? selectedRole : undefined,
        is_active: selectedStatus === "all" ? undefined : selectedStatus === "active",
        skip: targetPage * PAGE_SIZE,
        limit: PAGE_SIZE,
      })
      setUsers(res.users)
      setTotalCount(res.total)
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to load platform users"))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setPage(0)
    fetchUsers(0)
  }, [selectedCollegeId, selectedRole, selectedStatus])

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

  const handleUpdateRole = async () => {
    if (!roleModalUser || !newRole) return
    setActionLoadingId(roleModalUser.id)
    try {
      await adminManagementAPI.updateUserRole(roleModalUser.id, newRole)
      setUsers((prev) =>
        prev.map((u) => (u.id === roleModalUser.id ? { ...u, role: newRole } : u))
      )
      setSuccessMsg(`Role updated to ${newRole} for @${roleModalUser.username}`)
      setTimeout(() => setSuccessMsg(""), 3500)
      setRoleModalUser(null)
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to change user role"))
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
      setSuccessMsg(`User @${deleteModalUser.username} removed successfully`)
      setTimeout(() => setSuccessMsg(""), 3500)
      setDeleteModalUser(null)
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to delete user"))
    } finally {
      setActionLoadingId(null)
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role.toLowerCase()) {
      case "super_admin":
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">Super Admin</span>
      case "admin":
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">College Admin</span>
      case "alumni":
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">Alumni</span>
      case "student":
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">Student</span>
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">{role}</span>
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Topbar />
      <main className="app-main-wide flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-200 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">
                Super Admin Console
              </span>
              <span className="text-xs text-slate-500 font-medium">Cross-Tenant Users</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Platform Users</h1>
            <p className="mt-1 text-sm text-slate-600">
              Complete view of all registered student, alumni, and administrator accounts across all institutions.
            </p>
          </div>
        </div>

        {/* Feedback messages */}
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

        {/* Search & Filters */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm mb-6 space-y-3">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="flex gap-2 flex-1 max-w-lg">
              <input
                type="text"
                placeholder="Search by name, username, email, or company..."
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
              {/* College Filter */}
              <select
                value={selectedCollegeId}
                onChange={(e) => setSelectedCollegeId(e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Universities</option>
                {colleges.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              {/* Role Filter */}
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Roles</option>
                <option value="super_admin">Super Admin</option>
                <option value="admin">College Admin</option>
                <option value="alumni">Alumni</option>
                <option value="student">Student</option>
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        {loading ? (
          <TableSkeleton columns={6} rows={6} />
        ) : users.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <p className="text-base font-semibold text-slate-900">No users match your criteria</p>
            <p className="text-sm text-slate-500 mt-1">Try resetting filters or adjusting search keywords.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">User</th>
                    <th className="px-4 py-3.5">University</th>
                    <th className="px-4 py-3.5">Role</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5">Professional Background</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs uppercase shrink-0">
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
                        {user.college_name ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">
                            {user.college_name}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Platform Level</span>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">{getRoleBadge(user.role)}</td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {user.is_active ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-xs text-slate-700">
                          {user.job_title && <span className="font-medium">{user.job_title}</span>}
                          {user.company && <span className="text-slate-500"> at {user.company}</span>}
                        </div>
                        {user.major && (
                          <div className="text-xs text-slate-400 mt-0.5">
                            {user.major} {user.grad_year ? `('Class of ${user.grad_year})` : ""}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-right text-xs">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setRoleModalUser(user)
                              setNewRole(user.role)
                            }}
                            disabled={user.id === currentUserId}
                            title={user.id === currentUserId ? "Cannot modify own role" : "Change role"}
                            className="rounded px-2.5 py-1 font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            Change Role
                          </button>
                          <button
                            onClick={() => handleToggleStatus(user)}
                            disabled={actionLoadingId === user.id || user.id === currentUserId}
                            title={user.id === currentUserId ? "Cannot modify own status" : "Toggle status"}
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

        {/* Role Change Modal */}
        {roleModalUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl border border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">Change User Role</h3>
              <p className="mt-1 text-sm text-slate-600">
                Updating role for <span className="font-semibold">{roleModalUser.full_name || roleModalUser.username}</span> (@{roleModalUser.username}).
              </p>
              <div className="mt-4">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Select New Role
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
                >
                  <option value="student">Student</option>
                  <option value="alumni">Alumni</option>
                  <option value="admin">College Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
              <div className="mt-6 flex justify-end gap-2.5">
                <button
                  onClick={() => setRoleModalUser(null)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateRole}
                  disabled={actionLoadingId === roleModalUser.id || newRole === roleModalUser.role}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {actionLoadingId === roleModalUser.id ? "Updating..." : "Save Role"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteModalUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl border border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">Confirm User Deletion</h3>
              <p className="mt-2 text-sm text-slate-600">
                Are you sure you want to delete user account{" "}
                <span className="font-semibold text-slate-900">@{deleteModalUser.username}</span>?
              </p>
              <p className="mt-2 text-xs text-rose-700 bg-rose-50 p-2.5 rounded-md border border-rose-200">
                This will delete the user's profile, posts, connections, and direct messages permanently.
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
                  {actionLoadingId === deleteModalUser.id ? "Deleting..." : "Confirm Delete"}
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

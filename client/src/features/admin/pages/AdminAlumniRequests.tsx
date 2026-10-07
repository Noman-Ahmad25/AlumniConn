import { useEffect, useState } from "react"
import { alumniRequestsAPI } from "../api/requests"
import { getApiErrorMessage } from "../../../utils/error"
import type { AlumniRequest, RequestStatus } from "../types/request"

export default function AdminAlumniRequests() {
  const [requests, setRequests] = useState<AlumniRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [statusFilter, setStatusFilter] = useState<RequestStatus | undefined>(undefined)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [rejectionReason, setRejectionReason] = useState<string>("")
  const [rejectingId, setRejectingId] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    const fetchRequests = async () => {
      setLoading(true)
      setError("")

      try {
        const data = await alumniRequestsAPI.getAlumniRequests(statusFilter)
        if (!cancelled) setRequests(data)
      } catch (err: unknown) {
        if (!cancelled) setError(getApiErrorMessage(err, "Failed to fetch alumni requests"))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchRequests()
    return () => {
      cancelled = true
    }
  }, [statusFilter])

  const handleApprove = async (requestId: number) => {
    setActionLoading(requestId)
    try {
      const updatedRequest = await alumniRequestsAPI.approveAlumniRequest(requestId)
      setRequests((current) => current.map((request) => (request.id === requestId ? updatedRequest : request)))
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Failed to approve request"))
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (requestId: number) => {
    setActionLoading(requestId)
    try {
      const updatedRequest = await alumniRequestsAPI.rejectAlumniRequest(requestId, rejectionReason || undefined)
      setRequests((current) => current.map((request) => (request.id === requestId ? updatedRequest : request)))
      setRejectingId(null)
      setRejectionReason("")
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Failed to reject request"))
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">Pending</span>
      case "approved":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">Approved</span>
      case "rejected":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">Rejected</span>
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">{status}</span>
    }
  }

  const pendingCount = requests.filter((r) => r.status === "pending").length

  return (
    <div className="app-page">
      <main className="app-main-wide">
        <div className="page-heading mb-6">
          <h1 className="page-title">Alumni Requests</h1>
          <p className="page-subtitle">Manage student alumni upgrade requests for your college.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm flex items-center justify-between shadow-sm">
            <span>{error}</span>
            <button onClick={() => setError("")} className="text-rose-500 hover:text-rose-700 font-bold ml-2">✕</button>
          </div>
        )}

        <div className="mb-6 flex flex-wrap gap-2 items-center">
          <button
            onClick={() => setStatusFilter(undefined)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              statusFilter === undefined
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            All ({requests.length})
          </button>
          <button
            onClick={() => setStatusFilter("pending")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              statusFilter === "pending"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            <span>Pending</span>
            {pendingCount > 0 && (
              <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${statusFilter === "pending" ? "bg-white text-blue-600" : "bg-amber-100 text-amber-800"}`}>
                {pendingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setStatusFilter("approved")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              statusFilter === "approved"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => setStatusFilter("rejected")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              statusFilter === "rejected"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            Rejected
          </button>
        </div>

        {loading ? (
          <div className="surface-card p-12 text-center text-slate-500 rounded-xl">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-3 text-sm text-slate-500">Loading requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="surface-card p-12 text-center text-slate-500 rounded-xl border border-slate-200/80">
            <svg
              className="mx-auto h-12 w-12 text-slate-300 mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M12 14l9-5-9-5-9 5 9 5z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M12 14v7"
              />
            </svg>
            <p className="font-semibold text-slate-700">No alumni requests</p>
            <p className="text-xs text-slate-400 mt-1">
              {statusFilter
                ? `There are currently no ${statusFilter} alumni upgrade requests.`
                : "There are currently no student requests to upgrade to alumni status."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request.id} className="surface-card p-5 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow bg-white">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {request.full_name || request.username || `User #${request.user_id}`}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {request.email && <span className="mr-3">{request.email}</span>}
                      <span>User ID: {request.user_id}</span>
                    </p>
                  </div>
                  <div>
                    {getStatusBadge(request.status)}
                  </div>
                </div>

                <div className="text-xs text-slate-500 mb-4 flex flex-wrap gap-x-6 gap-y-1">
                  <div>
                    <span className="font-semibold text-slate-600">Requested: </span>
                    {request.created_at ? new Date(request.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : "N/A"}
                  </div>
                  {request.reviewed_at && (
                    <div>
                      <span className="font-semibold text-slate-600">Reviewed: </span>
                      {new Date(request.reviewed_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </div>
                  )}
                </div>

                {request.rejection_reason && (
                  <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs">
                    <p className="font-semibold text-rose-800 mb-0.5">Rejection Reason:</p>
                    <p className="text-rose-700">{request.rejection_reason}</p>
                  </div>
                )}

                {request.status === "pending" && (
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => handleApprove(request.id)}
                      disabled={actionLoading === request.id}
                      className="btn btn-primary flex-1 text-sm py-2 bg-emerald-600 hover:bg-emerald-700 border-none text-white font-semibold rounded-lg shadow-sm"
                    >
                      {actionLoading === request.id ? "Approving..." : "Approve Alumni Role"}
                    </button>
                    <button
                      onClick={() => setRejectingId(request.id)}
                      disabled={actionLoading === request.id}
                      className="btn btn-secondary flex-1 text-sm py-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 border border-slate-200 font-semibold rounded-lg"
                    >
                      Reject
                    </button>
                  </div>
                )}

                {rejectingId === request.id && (
                  <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                    <label className="block text-xs font-semibold text-slate-700">
                      Reason for Rejection (Optional):
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                      placeholder="Explain why this request is being rejected..."
                      rows={2}
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => setRejectingId(null)}
                        className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleReject(request.id)}
                        disabled={actionLoading === request.id}
                        className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700 disabled:opacity-50 shadow-sm"
                      >
                        {actionLoading === request.id ? "Rejecting..." : "Confirm Reject"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}


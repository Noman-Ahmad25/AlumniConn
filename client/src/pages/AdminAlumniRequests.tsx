import { useEffect, useState } from "react"
import { alumniRequestsAPI } from "../api/requests"
import { getApiErrorMessage } from "../utils/error"
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "approved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const pendingCount = requests.filter((r) => r.status === "pending").length

  return (
    <div className="app-page">
      <main className="app-main-wide">
        <div className="page-heading">
          <h1 className="page-title">Alumni Requests</h1>
          <p className="page-subtitle">Manage student alumni upgrade requests for your college.</p>
        </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="mb-6 flex flex-wrap gap-2 items-center">
        <button
          onClick={() => setStatusFilter(undefined)}
          className={`px-4 py-2 rounded ${
            statusFilter === undefined ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          All ({requests.length})
        </button>
        <button
          onClick={() => setStatusFilter("pending")}
          className={`px-4 py-2 rounded flex items-center gap-2 ${
            statusFilter === "pending" ? "bg-yellow-500 text-white" : "bg-gray-200"
          }`}
        >
          Pending
          {pendingCount > 0 && (
            <span className="bg-red-500 text-white rounded-full px-2 py-1 text-xs font-bold">
              {pendingCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setStatusFilter("approved")}
          className={`px-4 py-2 rounded ${
            statusFilter === "approved" ? "bg-green-500 text-white" : "bg-gray-200"
          }`}
        >
          Approved
        </button>
        <button
          onClick={() => setStatusFilter("rejected")}
          className={`px-4 py-2 rounded ${
            statusFilter === "rejected" ? "bg-red-500 text-white" : "bg-gray-200"
          }`}
        >
          Rejected
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : requests.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No alumni requests found</div>
      ) : (
        <div className="space-y-3">
          {requests.map((request) => (
            <div key={request.id} className="border rounded-lg p-4 bg-white shadow hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <p className="text-lg font-semibold">User ID: {request.user_id}</p>
                  <p className="text-sm text-gray-600">College ID: {request.college_id}</p>
                </div>
                <span className={`px-3 py-1 rounded text-sm font-semibold ${getStatusColor(request.status)}`}>
                  {request.status.toUpperCase()}
                </span>
              </div>

              <div className="text-xs text-gray-500 mb-3">
                Requested: {new Date(request.created_at).toLocaleDateString()}
                {request.reviewed_at && (
                  <>
                    <br />
                    Reviewed: {new Date(request.reviewed_at).toLocaleDateString()}
                  </>
                )}
              </div>

              {request.rejection_reason && (
                <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-sm">
                  <p className="font-semibold text-red-700">Rejection Reason:</p>
                  <p className="text-red-600">{request.rejection_reason}</p>
                </div>
              )}

              {request.status === "pending" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(request.id)}
                    disabled={actionLoading === request.id}
                    className="btn btn-success flex-1 text-sm"
                  >
                    {actionLoading === request.id ? "Approving..." : "Approve Alumni Role"}
                  </button>
                  <button
                    onClick={() => setRejectingId(request.id)}
                    disabled={actionLoading === request.id}
                    className="btn btn-danger flex-1 text-sm"
                  >
                    Reject
                  </button>
                </div>
              )}

              {rejectingId === request.id && (
                <div className="mt-3 space-y-2 border-t pt-3">
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full px-3 py-2 border rounded text-sm"
                    placeholder="Optional rejection reason..."
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => setRejectingId(null)}
                      className="flex-1 bg-gray-300 text-gray-700 py-1 rounded text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleReject(request.id)}
                      disabled={actionLoading === request.id}
                      className="flex-1 bg-red-500 text-white py-1 rounded text-sm disabled:opacity-50"
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

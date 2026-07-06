import { useEffect, useState } from "react"
import { collegeRequestsAPI } from "../api/requests"
import { getApiErrorMessage } from "../../../utils/error"
import type { CollegeRequest, RequestStatus } from "../types/request"

export default function SuperAdminCollegeRequests() {
  const [requests, setRequests] = useState<CollegeRequest[]>([])
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
        const data = await collegeRequestsAPI.getCollegeRequests(statusFilter)
        if (!cancelled) setRequests(data)
      } catch (err: unknown) {
        if (!cancelled) setError(getApiErrorMessage(err, "Failed to fetch college requests"))
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
      const updatedRequest = await collegeRequestsAPI.approveCollegeRequest(requestId)
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
      const updatedRequest = await collegeRequestsAPI.rejectCollegeRequest(requestId, rejectionReason || undefined)
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

  return (
    <div className="app-page">
      <main className="app-main-wide">
        <div className="page-heading">
          <h1 className="page-title">College Requests</h1>
          <p className="page-subtitle">Review pending college creation requests.</p>
        </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setStatusFilter(undefined)}
          className={`px-4 py-2 rounded ${
            statusFilter === undefined ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setStatusFilter("pending")}
          className={`px-4 py-2 rounded ${
            statusFilter === "pending" ? "bg-yellow-500 text-white" : "bg-gray-200"
          }`}
        >
          Pending
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
        <div className="text-center py-8 text-gray-500">No college requests found</div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request.id} className="border rounded-lg p-4 bg-white shadow">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-bold">{request.name}</h3>
                  <p className="text-sm text-gray-600">Domain: {request.domain}</p>
                  <p className="text-sm text-gray-600">Admin: {request.admin_name}</p>
                  <p className="text-sm text-gray-600">Email: {request.admin_email}</p>
                </div>
                <span className={`px-3 py-1 rounded text-sm font-semibold ${getStatusColor(request.status)}`}>
                  {request.status.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                {request.location && <p>Location: {request.location}</p>}
                {request.established_year && <p>Established: {request.established_year}</p>}
              </div>

              {request.description && (
                <p className="text-sm text-gray-700 mb-3">{request.description}</p>
              )}

              <div className="text-xs text-gray-500 mb-3">
                {request.requested_by && (
                  <>
                    Requested by: User #{request.requested_by}
                    <br />
                  </>
                )}
                Created: {new Date(request.created_at).toLocaleDateString()}
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
                    className="btn btn-success flex-1"
                  >
                    {actionLoading === request.id ? "Approving..." : "Approve"}
                  </button>
                  <button
                    onClick={() => setRejectingId(request.id)}
                    disabled={actionLoading === request.id}
                    className="btn btn-danger flex-1"
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

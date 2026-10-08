import { useEffect, useState } from "react"
import { alumniRequestsAPI } from "../../admin/api/requests"
import { getApiErrorMessage } from "../../../utils/error"
import type { RequestStatus } from "../../admin/types/request"

export interface RequestAlumniRoleProps {
  onSuccess?: () => void
  onError?: (error: string) => void
  isOpen?: boolean
  onClose?: () => void
}

export default function RequestAlumniRole({
  onSuccess,
  onError,
  isOpen = true,
  onClose,
}: RequestAlumniRoleProps) {
  const [loading, setLoading] = useState(false)
  const [fetchingStatus, setFetchingStatus] = useState(true)
  const [currentStatus, setCurrentStatus] = useState<RequestStatus | "not_requested" | null>(null)
  const [rejectionReason, setRejectionReason] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    if (!isOpen || !onClose) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = prevOverflow
    }
  }, [isOpen, onClose])

  useEffect(() => {
    if (!isOpen) return
    let mounted = true
    const checkStatus = async () => {
      try {
        const req = await alumniRequestsAPI.getMyAlumniRequest()
        if (mounted && req) {
          setCurrentStatus((req.status as RequestStatus) || "not_requested")
          setRejectionReason(req.rejection_reason || null)
        }
      } catch {
        // If endpoint fails or user has no request, fall back to not_requested
        if (mounted) setCurrentStatus("not_requested")
      } finally {
        if (mounted) setFetchingStatus(false)
      }
    }
    checkStatus()
    return () => {
      mounted = false
    }
  }, [isOpen])

  if (!isOpen) {
    return null
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError("")
    setSuccess(false)

    try {
      await alumniRequestsAPI.requestAlumniRole()

      setSuccess(true)
      setCurrentStatus("pending")
      setShowConfirm(false)
      onSuccess?.()
    } catch (err: unknown) {
      const errorMessage = getApiErrorMessage(err, "Failed to submit alumni request")
      setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (fetchingStatus) {
    if (onClose) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl flex flex-col items-center justify-center py-10">
            <div className="spinner" />
            <p className="mt-3 text-xs font-medium text-slate-500">Checking application status...</p>
          </div>
        </div>
      )
    }
    return null
  }

  if (currentStatus === "approved") {
    return null
  }

  const isPendingState = currentStatus === "pending" || success

  const content = isPendingState ? (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="flex h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse" />
        <h2 className="text-xl font-bold text-slate-900">Alumni Status Pending Review</h2>
      </div>
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-900 space-y-2">
        <p className="font-semibold">Your request has been submitted to your college administrator.</p>
        <p className="text-xs text-amber-800 leading-relaxed">
          You are currently active with Student access. Your college admin will verify your graduation details and approve your upgrade to the Alumni role.
        </p>
      </div>
      {onClose && (
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary px-4 text-xs"
          >
            Close
          </button>
        </div>
      )}
    </div>
  ) : (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-slate-900">Apply for Alumni Status</h2>

      {currentStatus === "rejected" && !success && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-sm">
          <p className="font-semibold mb-1">Previous Request Declined</p>
          <p>{rejectionReason || "Your previous request was not approved. You can submit an updated application below."}</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded text-sm">
          Alumni request submitted successfully! Your college ADMIN will review it.
        </div>
      )}

      {!showConfirm && !success && (
        <div className="space-y-4">
          <p className="text-slate-600 text-sm leading-relaxed">
            As a STUDENT, you can request to upgrade your role to ALUMNI. Your college
            administrator will review and approve your request.
          </p>

          <div className="p-3.5 bg-blue-50/80 border border-blue-200/80 rounded-lg text-sm text-blue-900">
            <p className="font-semibold mb-2 text-xs uppercase tracking-wider text-blue-800">What happens next?</p>
            <ul className="list-disc list-inside space-y-1 text-xs text-blue-800 leading-relaxed">
              <li>Your request is sent to your college administrator</li>
              <li>ADMIN will review and verify your graduation status</li>
              <li>You will retain student access during review</li>
              <li>ALUMNI can access graduation features, opportunities, and alumni directory</li>
            </ul>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary px-4 text-xs"
              >
                Cancel
              </button>
            )}
            <button
              onClick={() => setShowConfirm(true)}
              className="btn btn-primary px-5 text-sm"
            >
              Apply for Alumni Status
            </button>
          </div>
        </div>
      )}

      {showConfirm && !success && (
        <div className="space-y-4">
          <p className="text-slate-800 font-semibold text-sm">
            Are you sure? This action will send an upgrade request to your college administrator.
          </p>

          <div className="flex gap-3 justify-end pt-2">
            <button
              onClick={() => setShowConfirm(false)}
              disabled={loading}
              className="btn btn-secondary px-4 text-xs"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="btn btn-primary px-5 text-sm"
            >
              {loading ? "Submitting..." : "Confirm"}
            </button>
          </div>
        </div>
      )}
    </div>
  )

  if (onClose) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose()
          }
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="alumni-status-modal-title"
      >
        <div
          className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden p-6 relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            aria-label="Close"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          {content}
        </div>
      </div>
    )
  }

  return (
    <div className="surface-card mx-auto max-w-md p-6">
      {content}
    </div>
  )
}

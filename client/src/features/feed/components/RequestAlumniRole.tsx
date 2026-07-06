import { useState } from "react"
import { alumniRequestsAPI } from "../../admin/api/requests"
import { getApiErrorMessage } from "../../../utils/error"

interface RequestAlumniRoleProps {
  onSuccess?: () => void
  onError?: (error: string) => void
}

export default function RequestAlumniRole({ onSuccess, onError }: RequestAlumniRoleProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    setError("")
    setSuccess(false)

    try {
      await alumniRequestsAPI.requestAlumniRole()

      setSuccess(true)
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

  return (
    <div className="surface-card mx-auto max-w-md p-6">
      <h2 className="text-2xl font-bold mb-4">Apply for Alumni Status</h2>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          Alumni request submitted successfully! Your college ADMIN will review it.
        </div>
      )}

      {!showConfirm && !success && (
        <div className="space-y-4">
          <p className="text-gray-700">
            As a STUDENT, you can request to upgrade your role to ALUMNI. Your college
            administrator will review and approve your request.
          </p>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
            <p className="font-semibold mb-2">What happens next?</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Your request is sent to your college ADMIN</li>
              <li>ADMIN will review and approve/reject within 1-2 days</li>
              <li>You'll be notified of the decision</li>
              <li>ALUMNI can access graduation features and network</li>
            </ul>
          </div>

          <button
            onClick={() => setShowConfirm(true)}
            className="btn btn-success w-full"
          >
            Apply for Alumni Status
          </button>
        </div>
      )}

      {showConfirm && !success && (
        <div className="space-y-4">
          <p className="text-gray-700 font-semibold">
            Are you sure? This action will send a request to your college ADMIN.
          </p>

          <div className="flex gap-3">
            <button
              onClick={() => setShowConfirm(false)}
              disabled={loading}
              className="btn btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="btn btn-success flex-1"
            >
              {loading ? "Submitting..." : "Confirm"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

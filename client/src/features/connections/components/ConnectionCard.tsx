import { acceptRequest, rejectRequest } from "../api/connection"
import { useState } from "react"
import { getApiErrorMessage } from "../../../utils/error"

interface Connection {
  id: number
  username: string
  status: "pending" | "accepted" | "rejected"
}

interface ConnectionCardProps {
  req: Connection
  refresh: () => void
}

export default function ConnectionCard({ req, refresh }: ConnectionCardProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleAccept = async () => {
    setLoading(true)
    setError("")
    try {
      await acceptRequest(req.id)
      refresh()
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Failed to accept request"))
    }
    finally {
      setLoading(false)
    }
  }

  const handleReject = async () => {
    setLoading(true)
    setError("")
    try {
      await rejectRequest(req.id)
      refresh()
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Failed to reject request"))
    }
    finally {
      setLoading(false)
    }
  }

  return (
    <div className="surface-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 w-full">
      <div className="min-w-0 flex-1">
        <p className="font-bold text-slate-950 truncate">{req.username}</p>
        <p className="text-xs text-slate-500">wants to connect</p>
        {error && <p className="mt-1 text-xs font-medium text-rose-500 truncate">{error}</p>}
      </div>

      <div className="flex gap-2 flex-shrink-0 justify-end pt-2 sm:pt-0 border-t border-slate-100 sm:border-0">
        <button
          onClick={handleAccept}
          className="btn btn-success min-h-0 px-3 py-1.5 text-xs flex-1 sm:flex-initial"
          disabled={loading}
        >
          Accept
        </button>
        <button
          onClick={handleReject}
          className="btn btn-danger min-h-0 px-3 py-1.5 text-xs flex-1 sm:flex-initial"
          disabled={loading}
        >
          Reject
        </button>
      </div>
    </div>
  )
}

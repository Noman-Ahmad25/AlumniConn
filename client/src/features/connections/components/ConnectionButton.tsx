import { useState } from "react"
import { sendRequest } from "../api/connection"
import { getApiErrorMessage } from "../../../utils/error"

type ConnectionButtonStatus = "self" | "none" | "pending" | "connected"

export default function ConnectionButton({
  userId,
  initialStatus,
}: {
  userId: number
  initialStatus: ConnectionButtonStatus
}) {
  const [status, setStatus] = useState(initialStatus)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  if (status === "self") return null

  const handleConnect = async () => {
    if (status !== "none" || loading) return

    setLoading(true)
    setError("")
    try {
      await sendRequest(userId)
      setStatus("pending") // optimistic
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Failed to send connection request"))
    } finally {
      setLoading(false)
    }
  }

  const styles = {
    none: "btn-primary",
    pending: "border-amber-200 bg-amber-50 text-amber-700",
    connected: "border-emerald-200 bg-emerald-50 text-emerald-700",
  }

  const text = {
    none: "Connect",
    pending: "Pending",
    connected: "Connected",
  }

  return (
    <div>
      <button
        onClick={handleConnect}
        disabled={status !== "none" || loading}
        className={`btn min-h-0 rounded-full px-3 py-1.5 text-sm ${styles[status]}`}
        title={error ? error : ""}
      >
        {loading ? "..." : text[status]}
      </button>
      {error && (
        <p className="mt-1 text-xs text-rose-600">{error}</p>
      )}
    </div>
  )
}

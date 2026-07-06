import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  acceptRequest,
  getConnections,
  getDiscoverUsers,
  getRequests,
  rejectRequest,
  sendRequest,
} from "../api/connection"
import UserCard from "../../profile/components/UserCard"
import type { Connection, DiscoverUser } from "../types/connection"
import { getApiErrorMessage } from "../../../utils/error"

function connectionToDiscoverUser(connection: Connection): DiscoverUser {
  return {
    id: connection.user.id,
    username: connection.user.username,
    profile_picture: connection.user.profile_pic_url,
    connection_status: "pending_received",
  }
}

function connectionToCardUser(connection: Connection) {
  return {
    id: connection.user.id,
    username: connection.user.username,
    profile_picture: connection.user.profile_pic_url,
  }
}

export default function Connections() {
  const navigate = useNavigate()
  const [discoverUsers, setDiscoverUsers] = useState<DiscoverUser[]>([])
  const [requests, setRequests] = useState<Connection[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  const [loading, setLoading] = useState(true)
  const [busyKey, setBusyKey] = useState<string | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    let cancelled = false

    const fetchData = async () => {
      setLoading(true)
      setError("")

      try {
        const [discover, pendingRequests, acceptedConnections] = await Promise.all([
          getDiscoverUsers(),
          getRequests(),
          getConnections(),
        ])

        if (!cancelled) {
          setDiscoverUsers(discover)
          setRequests(pendingRequests)
          setConnections(acceptedConnections)
        }
      } catch (err: unknown) {
        console.error("Failed to load connections", err)
        if (!cancelled) {
          setError(getApiErrorMessage(err, "Failed to load connections"))
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchData()

    return () => {
      cancelled = true
    }
  }, [])

  const handleSendRequest = async (user: DiscoverUser) => {
    const key = `send-${user.id}`
    setBusyKey(key)
    setError("")

    try {
      await sendRequest(user.id)
      setDiscoverUsers((current) =>
        current.map((item) =>
          item.id === user.id
            ? { ...item, connection_status: "pending_sent" }
            : item
        )
      )
    } catch (err: unknown) {
      console.error("Failed to send request", err)
      setError(getApiErrorMessage(err, "Failed to send request"))
    } finally {
      setBusyKey(null)
    }
  }

  const handleAcceptRequest = async (request: Connection) => {
    const key = `accept-${request.id}`
    setBusyKey(key)
    setError("")

    try {
      const accepted = await acceptRequest(request.id)
      setRequests((current) => current.filter((item) => item.id !== request.id))
      setDiscoverUsers((current) =>
        current.filter((item) => item.id !== accepted.user.id)
      )
      setConnections((current) =>
        current.some((item) => item.id === accepted.id)
          ? current
          : [accepted, ...current]
      )
    } catch (err: unknown) {
      console.error("Failed to accept request", err)
      setError(getApiErrorMessage(err, "Failed to accept request"))
    } finally {
      setBusyKey(null)
    }
  }

  const handleRejectRequest = async (request: Connection) => {
    const key = `reject-${request.id}`
    setBusyKey(key)
    setError("")

    try {
      const rejected = await rejectRequest(request.id)
      setRequests((current) => current.filter((item) => item.id !== request.id))
      setDiscoverUsers((current) =>
        current.filter((item) => item.id !== rejected.user.id)
      )
    } catch (err: unknown) {
      console.error("Failed to reject request", err)
      setError(getApiErrorMessage(err, "Failed to reject request"))
    } finally {
      setBusyKey(null)
    }
  }

  const findReceivedRequest = (userId: number) =>
    requests.find((request) => request.user.id === userId)

  const renderDiscoverAction = (user: DiscoverUser) => {
    if (user.connection_status === "pending_sent") {
      return (
        <span className="status-pill bg-amber-50 text-amber-700 ring-1 ring-amber-200">
          Request Sent
        </span>
      )
    }

    if (user.connection_status === "pending_received") {
      const request = findReceivedRequest(user.id)
      if (!request) return null

      return (
        <>
          <button
            type="button"
            onClick={() => handleAcceptRequest(request)}
            disabled={busyKey === `accept-${request.id}`}
            className="btn btn-success min-h-0 px-3 py-2"
          >
            Accept
          </button>
          <button
            type="button"
            onClick={() => handleRejectRequest(request)}
            disabled={busyKey === `reject-${request.id}`}
            className="btn btn-secondary min-h-0 px-3 py-2"
          >
            Reject
          </button>
        </>
      )
    }

    return (
      <button
        type="button"
        onClick={() => handleSendRequest(user)}
        disabled={busyKey === `send-${user.id}`}
        className="btn btn-primary min-h-0 px-4 py-2"
      >
        {busyKey === `send-${user.id}` ? "Sending..." : "Connect"}
      </button>
    )
  }

  return (
    <div className="app-page">
      <main className="app-main-wide space-y-8">
        <div className="page-heading">
          <h1 className="page-title">Connections</h1>
          <p className="page-subtitle">
            Discover people in your college and manage your network.
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="spinner" />
            <p className="mt-4 text-sm font-medium text-slate-500">Loading connections...</p>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
            <section className="space-y-3">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-950">Discover users</h2>
                  <p className="text-sm text-slate-500">
                    People from your college who are not already connected.
                  </p>
                </div>
                <span className="status-pill bg-white text-slate-600 ring-1 ring-slate-200">
                  {discoverUsers.length}
                </span>
              </div>

              {discoverUsers.length === 0 ? (
                <div className="empty-state text-slate-500">
                  No new people to discover right now.
                </div>
              ) : (
                discoverUsers.map((user) => (
                  <UserCard
                    key={user.id}
                    user={user}
                    description={
                      user.connection_status === "pending_received"
                        ? "Sent you a connection request"
                        : "Same college"
                    }
                    action={renderDiscoverAction(user)}
                    onClick={() => navigate(`/profile/${user.id}`)}
                  />
                ))
              )}
            </section>

            <section className="space-y-3">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-950">Pending requests</h2>
                  <p className="text-sm text-slate-500">Requests waiting for your response.</p>
                </div>
                <span className="status-pill bg-white text-slate-600 ring-1 ring-slate-200">
                  {requests.length}
                </span>
              </div>

              {requests.length === 0 ? (
                <div className="empty-state text-slate-500">
                  No pending requests.
                </div>
              ) : (
                requests.map((request) => (
                  <UserCard
                    key={request.id}
                    user={connectionToDiscoverUser(request)}
                    description="Wants to connect"
                    action={
                      <>
                        <button
                          type="button"
                          onClick={() => handleAcceptRequest(request)}
                          disabled={busyKey === `accept-${request.id}`}
                          className="btn btn-success min-h-0 px-3 py-2"
                        >
                          Accept
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRejectRequest(request)}
                          disabled={busyKey === `reject-${request.id}`}
                          className="btn btn-secondary min-h-0 px-3 py-2"
                        >
                          Reject
                        </button>
                      </>
                    }
                    onClick={() => navigate(`/profile/${request.user.id}`)}
                  />
                ))
              )}
            </section>

            <section className="space-y-3 pb-8 lg:col-span-2">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-950">My connections</h2>
                  <p className="text-sm text-slate-500">People already in your network.</p>
                </div>
                <span className="status-pill bg-white text-slate-600 ring-1 ring-slate-200">
                  {connections.length}
                </span>
              </div>

              {connections.length === 0 ? (
                <div className="empty-state text-slate-500">
                  No connections yet.
                </div>
              ) : (
                connections.map((connection) => (
                  <UserCard
                    key={connection.id}
                    user={connectionToCardUser(connection)}
                    description="Already Connected"
                    action={
                      <span className="status-pill bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
                        Already Connected
                      </span>
                    }
                    onClick={() => navigate(`/profile/${connection.user.id}`)}
                  />
                ))
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  )
}

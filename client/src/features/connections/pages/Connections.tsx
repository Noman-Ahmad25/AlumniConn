import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import {
  acceptRequest,
  getConnections,
  getDiscoverUsers,
  getRequests,
  rejectRequest,
  sendRequest,
  disconnect,
} from "../api/connection"
import UserCard from "../../profile/components/UserCard"
import type { Connection, DiscoverUser } from "../types/connection"
import { useCollegeNavigation } from "../../../shared/utils/navigation"
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
  const { navigate } = useCollegeNavigation()
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get("tab")
  const initialTab: "discover" | "requests" | "network" =
    tabParam === "requests" || tabParam === "network" ? tabParam : "discover"

  const [activeTab, setActiveTabState] = useState<"discover" | "requests" | "network">(initialTab)
  const [requestFilter, setRequestFilter] = useState<"received" | "sent">("received")
  const [discoverSearch, setDiscoverSearch] = useState("")
  const [networkSearch, setNetworkSearch] = useState("")

  const [discoverUsers, setDiscoverUsers] = useState<DiscoverUser[]>([])
  const [requests, setRequests] = useState<Connection[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  const [loading, setLoading] = useState(true)
  const [busyKey, setBusyKey] = useState<string | null>(null)
  const [error, setError] = useState("")

  const setActiveTab = (tab: "discover" | "requests" | "network") => {
    setActiveTabState(tab)
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (tab === "discover") {
          next.delete("tab")
        } else {
          next.set("tab", tab)
        }
        return next
      },
      { replace: true }
    )
  }

  useEffect(() => {
    let cancelled = false

    const fetchData = async () => {
      setLoading(true)
      setError("")

      try {
        const [discover, pendingRequests, acceptedConnections] = await Promise.all([
          getDiscoverUsers({ limit: 12 }),
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

  const handleDisconnect = async (connection: Connection) => {
    const key = `disc-${connection.id}`
    setBusyKey(key)
    setError("")

    try {
      await disconnect(connection.id)
      setConnections((current) => current.filter((item) => item.id !== connection.id))
    } catch (err: unknown) {
      console.error("Failed to disconnect", err)
      setError(getApiErrorMessage(err, "Failed to disconnect"))
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
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => handleAcceptRequest(request)}
            disabled={busyKey === `accept-${request.id}`}
            className="btn btn-success min-h-0 px-2.5 py-1 text-xs"
          >
            Accept
          </button>
          <button
            type="button"
            onClick={() => handleRejectRequest(request)}
            disabled={busyKey === `reject-${request.id}`}
            className="btn btn-secondary min-h-0 px-2.5 py-1 text-xs"
          >
            Reject
          </button>
        </div>
      )
    }

    return (
      <button
        type="button"
        onClick={() => handleSendRequest(user)}
        disabled={busyKey === `send-${user.id}`}
        className="btn btn-primary min-h-0 px-3.5 py-1.5 text-xs"
      >
        {busyKey === `send-${user.id}` ? "Sending..." : "Connect"}
      </button>
    )
  }

  const outgoingRequests = discoverUsers.filter((u) => u.connection_status === "pending_sent")

  const filteredDiscoverUsers = discoverSearch.trim()
    ? discoverUsers.filter((u) =>
        u.username.toLowerCase().includes(discoverSearch.toLowerCase()) ||
        (u.full_name && u.full_name.toLowerCase().includes(discoverSearch.toLowerCase())) ||
        (u.job_title && u.job_title.toLowerCase().includes(discoverSearch.toLowerCase())) ||
        (u.company && u.company.toLowerCase().includes(discoverSearch.toLowerCase()))
      )
    : discoverUsers

  const filteredConnections = networkSearch.trim()
    ? connections.filter((c) =>
        c.user.username.toLowerCase().includes(networkSearch.toLowerCase())
      )
    : connections

  return (
    <div className="app-page">
      <main className="app-main-wide space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
          <div className="min-w-0">
            <h1 className="page-title text-xl sm:text-2xl font-bold text-slate-950">
              Connections & Network
            </h1>
            <p className="page-subtitle text-xs sm:text-sm text-slate-500 mt-0.5">
              Manage your network, incoming requests, and connect with people from your college.
            </p>
          </div>
          <button
            onClick={() => navigate("/discover")}
            className="btn btn-secondary text-xs px-3.5 py-1.5 self-start sm:self-auto flex-shrink-0"
          >
            🔍 Advanced People Search →
          </button>
        </div>

        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {error}
          </div>
        )}

        {/* Mobile Section Selector (Segmented Control) */}
        <div className="md:hidden" role="tablist" aria-label="Connection sections">
          <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1 border border-slate-200/80">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "discover"}
              onClick={() => setActiveTab("discover")}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-2 px-2 text-xs font-semibold transition-all ${
                activeTab === "discover"
                  ? "bg-white text-slate-950 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>Discover</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                  activeTab === "discover" ? "bg-slate-100 text-slate-700" : "bg-white/80 text-slate-500"
                }`}
              >
                {discoverUsers.length}
              </span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "requests"}
              onClick={() => setActiveTab("requests")}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-2 px-2 text-xs font-semibold transition-all ${
                activeTab === "requests"
                  ? "bg-white text-slate-950 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>Requests</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                  requests.length > 0
                    ? "bg-rose-100 text-rose-700"
                    : activeTab === "requests"
                    ? "bg-slate-100 text-slate-700"
                    : "bg-white/80 text-slate-500"
                }`}
              >
                {requests.length}
              </span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "network"}
              onClick={() => setActiveTab("network")}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-2 px-2 text-xs font-semibold transition-all ${
                activeTab === "network"
                  ? "bg-white text-slate-950 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>My Network</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                  activeTab === "network" ? "bg-slate-100 text-slate-700" : "bg-white/80 text-slate-500"
                }`}
              >
                {connections.length}
              </span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="spinner" />
            <p className="mt-4 text-sm font-medium text-slate-500">Loading connections...</p>
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 w-full items-start">
            {/* Column 1: Discover People */}
            <section
              data-testid="section-discover"
              className={`${
                activeTab === "discover" ? "flex" : "hidden"
              } md:flex flex-col min-w-0 w-full surface-card rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-sm`}
            >
              <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="min-w-0">
                  <h2 className="text-base sm:text-lg font-bold text-slate-950 truncate">
                    Discover People
                  </h2>
                  <p className="text-xs text-slate-500 truncate">
                    Alumni and students from your campus
                  </p>
                </div>
                <span className="status-pill bg-slate-100 text-slate-700 ring-1 ring-slate-200 text-xs flex-shrink-0">
                  {discoverUsers.length}
                </span>
              </div>

              {discoverUsers.length > 5 && (
                <div className="mt-3">
                  <input
                    type="text"
                    value={discoverSearch}
                    onChange={(e) => setDiscoverSearch(e.target.value)}
                    placeholder="Filter discover people..."
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
                  />
                </div>
              )}

              <div className="mt-3.5 space-y-2.5 max-h-none md:max-h-[640px] overflow-y-auto pr-1">
                {filteredDiscoverUsers.length === 0 ? (
                  <div className="empty-state text-slate-500 py-8 text-center text-sm">
                    {discoverSearch ? "No people match your filter." : "No new people to discover right now."}
                  </div>
                ) : (
                  filteredDiscoverUsers.map((user) => (
                    <UserCard
                      key={user.id}
                      user={user}
                      description={
                        user.job_title && user.company
                          ? `${user.job_title} @ ${user.company}`
                          : user.connection_status === "pending_received"
                          ? "Sent you a connection request"
                          : "Same college"
                      }
                      action={renderDiscoverAction(user)}
                      onClick={() => navigate(`/profile/${user.id}`)}
                    />
                  ))
                )}
              </div>
            </section>

            {/* Column 2: Pending Requests */}
            <section
              data-testid="section-requests"
              className={`${
                activeTab === "requests" ? "flex" : "hidden"
              } md:flex flex-col min-w-0 w-full surface-card rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-sm`}
            >
              <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="min-w-0">
                  <h2 className="text-base sm:text-lg font-bold text-slate-950 truncate">
                    Pending Requests
                  </h2>
                  <p className="text-xs text-slate-500 truncate">
                    Requests waiting for your response
                  </p>
                </div>
                <span
                  className={`status-pill ring-1 text-xs flex-shrink-0 ${
                    requests.length > 0
                      ? "bg-rose-50 text-rose-700 ring-rose-200 font-bold"
                      : "bg-slate-100 text-slate-700 ring-slate-200"
                  }`}
                >
                  {requests.length}
                </span>
              </div>

              {/* Sub-tabs if outgoing requests exist */}
              {outgoingRequests.length > 0 && (
                <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-0.5 mt-3 mb-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setRequestFilter("received")}
                    className={`flex-1 rounded-md py-1 px-2 font-medium transition-all text-center ${
                      requestFilter === "received"
                        ? "bg-white text-slate-950 shadow-sm font-semibold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Received ({requests.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setRequestFilter("sent")}
                    className={`flex-1 rounded-md py-1 px-2 font-medium transition-all text-center ${
                      requestFilter === "sent"
                        ? "bg-white text-slate-950 shadow-sm font-semibold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Sent ({outgoingRequests.length})
                  </button>
                </div>
              )}

              <div className="mt-3.5 space-y-2.5 max-h-none md:max-h-[640px] overflow-y-auto pr-1">
                {requestFilter === "received" ? (
                  requests.length === 0 ? (
                    <div className="empty-state text-slate-500 py-8 text-center text-sm">
                      No pending requests.
                    </div>
                  ) : (
                    requests.map((request) => (
                      <UserCard
                        key={request.id}
                        user={connectionToDiscoverUser(request)}
                        description="Wants to connect"
                        action={
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <button
                              type="button"
                              onClick={() => handleAcceptRequest(request)}
                              disabled={busyKey === `accept-${request.id}`}
                              className="btn btn-success min-h-0 px-2.5 py-1 text-xs"
                            >
                              Accept
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRejectRequest(request)}
                              disabled={busyKey === `reject-${request.id}`}
                              className="btn btn-secondary min-h-0 px-2.5 py-1 text-xs"
                            >
                              Reject
                            </button>
                          </div>
                        }
                        onClick={() => navigate(`/profile/${request.user.id}`)}
                      />
                    ))
                  )
                ) : (
                  outgoingRequests.length === 0 ? (
                    <div className="empty-state text-slate-500 py-8 text-center text-sm">
                      No sent requests waiting for approval.
                    </div>
                  ) : (
                    outgoingRequests.map((user) => (
                      <UserCard
                        key={user.id}
                        user={user}
                        description="Pending response"
                        action={
                          <span className="status-pill bg-amber-50 text-amber-700 ring-1 ring-amber-200 text-xs">
                            Pending Approval
                          </span>
                        }
                        onClick={() => navigate(`/profile/${user.id}`)}
                      />
                    ))
                  )
                )}
              </div>
            </section>

            {/* Column 3: My Network */}
            <section
              data-testid="section-network"
              className={`${
                activeTab === "network" ? "flex" : "hidden"
              } md:flex md:col-span-2 xl:col-span-1 flex-col min-w-0 w-full surface-card rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-sm`}
            >
              <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="min-w-0">
                  <h2 className="text-base sm:text-lg font-bold text-slate-950 truncate">
                    My Network
                  </h2>
                  <p className="text-xs text-slate-500 truncate">
                    People already in your network
                  </p>
                </div>
                <span className="status-pill bg-slate-100 text-slate-700 ring-1 ring-slate-200 text-xs flex-shrink-0">
                  {connections.length}
                </span>
              </div>

              {connections.length > 5 && (
                <div className="mt-3">
                  <input
                    type="text"
                    value={networkSearch}
                    onChange={(e) => setNetworkSearch(e.target.value)}
                    placeholder="Search my network..."
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
                  />
                </div>
              )}

              <div className="mt-3.5 space-y-2.5 max-h-none md:max-h-[640px] overflow-y-auto pr-1">
                {filteredConnections.length === 0 ? (
                  <div className="empty-state text-slate-500 py-8 text-center text-sm">
                    {networkSearch ? "No connections match your search." : "No connections yet."}
                  </div>
                ) : (
                  filteredConnections.map((connection) => (
                    <UserCard
                      key={connection.id}
                      user={connectionToCardUser(connection)}
                      description="Connected"
                      action={
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="status-pill bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 text-xs">
                            Connected
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDisconnect(connection)}
                            disabled={busyKey === `disc-${connection.id}`}
                            className="btn btn-danger min-h-0 text-xs px-2.5 py-1 opacity-80 hover:opacity-100"
                          >
                            Disconnect
                          </button>
                        </div>
                      }
                      onClick={() => navigate(`/profile/${connection.user.id}`)}
                    />
                  ))
                )}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  )
}

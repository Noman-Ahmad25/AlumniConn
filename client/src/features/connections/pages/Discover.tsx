import { useEffect, useState } from "react"
import { getDiscoverUsers, sendRequest } from "../api/connection"
import type { DiscoverUser } from "../types/connection"
import { useCollegeNavigation } from "../../../shared/utils/navigation"
import { getApiErrorMessage } from "../../../utils/error"
import { UserCardSkeleton } from "../../../shared/components/skeletons"

function getInitials(name?: string | null) {
  if (!name) return "U"
  return name
    .split(/[\s._-]+/)
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase() || "U"
}

export default function Discover() {
  const { navigate } = useCollegeNavigation()
  const [users, setUsers] = useState<DiscoverUser[]>([])
  const [search, setSearch] = useState("")
  const [skill, setSkill] = useState("")
  const [company, setCompany] = useState("")
  const [location, setLocation] = useState("")
  const [major, setMajor] = useState("")
  const [gradYear, setGradYear] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [skip, setSkip] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState("")
  const [busyId, setBusyId] = useState<number | null>(null)
  const PAGE_SIZE = 20

  const fetchUsers = async (currentSkip = 0, isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true)
    } else {
      setLoading(true)
      setError("")
    }

    try {
      const data = await getDiscoverUsers({
        skip: currentSkip,
        limit: PAGE_SIZE,
        search: search.trim() || undefined,
        skill: skill.trim() || undefined,
        company: company.trim() || undefined,
        location: location.trim() || undefined,
        major: major.trim() || undefined,
        grad_year: gradYear ? parseInt(gradYear, 10) : undefined,
      })

      if (isLoadMore) {
        setUsers((prev) => [...prev, ...data])
      } else {
        setUsers(data)
      }

      setHasMore(data.length === PAGE_SIZE)
      setSkip(currentSkip + data.length)
    } catch (err: unknown) {
      console.error("Failed to load discover users", err)
      setError(getApiErrorMessage(err, "Failed to load users"))
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    fetchUsers(0, false)
  }, [skill, company, location, major, gradYear])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchUsers(0, false)
  }

  const handleSendRequest = async (e: React.MouseEvent, user: DiscoverUser) => {
    e.stopPropagation()
    setBusyId(user.id)
    try {
      await sendRequest(user.id)
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, connection_status: "pending_sent" } : u
        )
      )
    } catch (err: unknown) {
      console.error("Failed to send connection request", err)
      setError(getApiErrorMessage(err, "Failed to send request"))
    } finally {
      setBusyId(null)
    }
  }

  const handleClearFilters = () => {
    setSearch("")
    setSkill("")
    setCompany("")
    setLocation("")
    setMajor("")
    setGradYear("")
  }

  return (
    <div className="app-page">
      <main className="app-main-wide space-y-6 max-w-6xl mx-auto px-4 sm:px-6 py-6 w-full">
        <div>
          <h1 className="page-title text-2xl font-bold text-slate-950">Discover Alumni & Students</h1>
          <p className="page-subtitle text-sm text-slate-500 mt-1">
            Search and connect with alumni across your campus network.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="surface-card p-4 space-y-3 border border-slate-200 w-full">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1 min-w-0">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, role, company, skills..."
                className="w-full min-w-0 rounded-lg border border-slate-300 bg-white pl-9 pr-4 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 placeholder:text-slate-400"
              />
              <svg
                className="absolute left-3 top-2.5 h-4 w-4 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <button type="submit" className="btn btn-primary text-xs px-4 py-2 flex-shrink-0">
              Search
            </button>
          </form>

          {/* Filter Pills Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 pt-1">
            <input
              type="text"
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              placeholder="Skill (e.g. Python)"
              className="w-full min-w-0 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs outline-none focus:bg-white focus:border-blue-500"
            />
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Company (e.g. Google)"
              className="w-full min-w-0 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs outline-none focus:bg-white focus:border-blue-500"
            />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location (e.g. Bengaluru)"
              className="w-full min-w-0 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs outline-none focus:bg-white focus:border-blue-500"
            />
            <input
              type="text"
              value={major}
              onChange={(e) => setMajor(e.target.value)}
              placeholder="Major / Dept"
              className="w-full min-w-0 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs outline-none focus:bg-white focus:border-blue-500"
            />
            <input
              type="number"
              value={gradYear}
              onChange={(e) => setGradYear(e.target.value)}
              placeholder="Grad Year"
              className="w-full min-w-0 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs outline-none focus:bg-white focus:border-blue-500"
            />
          </div>

          {(search || skill || company || location || major || gradYear) && (
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-xs text-slate-500 hover:text-slate-800 underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" data-testid="discover-skeletons">
            {Array.from({ length: 6 }).map((_, i) => (
              <UserCardSkeleton key={i} />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="empty-state surface-card p-12 text-center text-slate-500">
            <p className="font-semibold text-slate-700">No alumni found</p>
            <p className="text-xs text-slate-400 mt-1">
              Try adjusting your search query or removing filters.
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {users.map((user) => {
                const displayName = user.full_name || user.username
                return (
                  <div
                    key={user.id}
                    onClick={() => navigate(`/profile/${user.id}`)}
                    className="surface-card interactive-card flex flex-col justify-between p-4 cursor-pointer border border-slate-200/80 hover:border-blue-300 hover:shadow-sm transition-all w-full"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      {user.profile_picture ? (
                        <img
                          src={user.profile_picture}
                          alt={displayName}
                          className="avatar h-12 w-12 object-cover border border-slate-100 flex-shrink-0"
                        />
                      ) : (
                        <div className="avatar h-12 w-12 bg-slate-200 text-slate-700 font-bold text-sm flex-shrink-0">
                          {getInitials(displayName)}
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-bold text-slate-950 truncate hover:text-blue-600 transition-colors">
                          {displayName}
                        </h3>
                        <p className="text-xs text-slate-500 truncate">@{user.username}</p>

                        {(user.job_title || user.company) && (
                          <p className="text-xs text-slate-700 mt-1 truncate">
                            {user.job_title}
                            {user.job_title && user.company && " · "}
                            <span className="text-slate-500">{user.company}</span>
                          </p>
                        )}

                        {user.location && (
                          <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                            📍 {user.location}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="border-t border-slate-100 mt-4 pt-3 flex items-center justify-between gap-2">
                      <span className="text-xs text-blue-600 font-medium hover:underline truncate">
                        View Profile
                      </span>

                      <div className="flex-shrink-0">
                        {user.connection_status === "pending_sent" ? (
                          <span className="status-pill bg-amber-50 text-amber-700 ring-1 ring-amber-200 text-xs">
                            Request Sent
                          </span>
                        ) : user.connection_status === "pending_received" ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              navigate("/connections")
                            }}
                            className="btn btn-secondary text-xs px-2.5 py-1"
                          >
                            Respond
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => handleSendRequest(e, user)}
                            disabled={busyId === user.id}
                            className="btn btn-primary text-xs px-3 py-1.5"
                          >
                            {busyId === user.id ? "Sending..." : "Connect"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {hasMore && (
              <div className="flex justify-center pt-4 pb-8">
                <button
                  onClick={() => fetchUsers(skip, true)}
                  disabled={loadingMore}
                  className="btn btn-secondary text-xs px-5 py-2.5 disabled:opacity-50"
                >
                  {loadingMore ? "Loading more..." : "Load More People"}
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

import { useEffect, useState } from "react"
import { getRecommendations } from "../api/recommendation"
import type { RecommendationItem } from "../types/recommendation"
import { useCollegeNavigation } from "../../../shared/utils/navigation"
import ConnectionButton from "../../connections/components/ConnectionButton"
import { getApiErrorMessage } from "../../../utils/error"

function getInitials(name?: string | null) {
  if (!name) return "U"
  return name
    .split(/[\s._-]+/)
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase() || "U"
}

export default function Recommendations() {
  const { navigate } = useCollegeNavigation()
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([])
  const [nextCursor, setNextCursor] = useState<number | null>(null)
  const [roleFilter, setRoleFilter] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState("")

  const fetchRecommendations = async (cursor?: number | null, isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true)
    } else {
      setLoading(true)
      setError("")
    }

    try {
      const data = await getRecommendations({
        cursor: cursor ?? undefined,
        limit: 12,
        role_filter: roleFilter || undefined,
      })

      if (isLoadMore) {
        setRecommendations((prev) => [...prev, ...(data.items || [])])
      } else {
        setRecommendations(data.items || [])
      }
      setNextCursor(data.next_cursor ?? null)
    } catch (err: unknown) {
      console.error("Failed to load recommendations", err)
      setError(getApiErrorMessage(err, "Failed to load recommendations"))
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    fetchRecommendations(null, false)
  }, [roleFilter])

  const handleLoadMore = () => {
    if (nextCursor && !loadingMore) {
      fetchRecommendations(nextCursor, true)
    }
  }

  return (
    <div className="app-page">
      <main className="app-main-wide space-y-6 max-w-6xl mx-auto px-4 sm:px-6 py-6 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-600 flex-shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </span>
              <h1 className="page-title text-2xl font-bold text-slate-950">AI Alumni Recommendations</h1>
            </div>
            <p className="page-subtitle text-sm text-slate-500 mt-1">
              Personalized semantic matching using your skills, major, career path, and shared background.
            </p>
          </div>

          <div className="flex w-full sm:w-auto gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1 flex-shrink-0">
            <button
              onClick={() => setRoleFilter(null)}
              className={`flex-1 sm:flex-initial text-center rounded-md px-2.5 sm:px-3 py-1.5 text-xs font-bold transition-colors whitespace-nowrap ${
                roleFilter === null
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All Matches
            </button>
            <button
              onClick={() => setRoleFilter("mentors")}
              className={`flex-1 sm:flex-initial text-center rounded-md px-2.5 sm:px-3 py-1.5 text-xs font-bold transition-colors whitespace-nowrap ${
                roleFilter === "mentors"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Mentors
            </button>
            <button
              onClick={() => setRoleFilter("alumni")}
              className={`flex-1 sm:flex-initial text-center rounded-md px-2.5 sm:px-3 py-1.5 text-xs font-bold transition-colors whitespace-nowrap ${
                roleFilter === "alumni"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Alumni Only
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="spinner" />
            <p className="mt-4 text-sm font-medium text-slate-500">Calculating semantic recommendations...</p>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="empty-state surface-card p-12 text-center text-slate-500">
            <svg
              className="mx-auto h-12 w-12 text-slate-300 mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            <p className="font-semibold text-slate-700">No recommendations available</p>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Make sure your profile is complete with skills, bio, major, and company info to receive accurate AI recommendations.
            </p>
            <button
              onClick={() => navigate("/profile")}
              className="btn btn-primary mt-4 text-xs"
            >
              Complete My Profile
            </button>
          </div>
        ) : (
          <>
            <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 w-full">
              {recommendations.map((item) => {
                const displayName = item.full_name || item.username
                const scorePercentage = Math.round(item.match_score * 100)

                return (
                  <div
                    key={item.id}
                    onClick={() => navigate(`/profile/${item.user_id}`)}
                    className="surface-card interactive-card flex flex-col justify-between p-5 cursor-pointer border border-slate-200/80 hover:border-blue-300 hover:shadow-md transition-all duration-200 w-full"
                  >
                    <div>
                      {/* Top Header: Score & Avatar */}
                      <div className="flex items-start justify-between gap-2 mb-3 min-w-0">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          {item.profile_picture ? (
                            <img
                              src={item.profile_picture}
                              alt={displayName}
                              className="avatar h-12 w-12 object-cover border border-slate-100 flex-shrink-0"
                            />
                          ) : (
                            <div className="avatar h-12 w-12 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-sm flex-shrink-0">
                              {getInitials(displayName)}
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <h3 className="text-sm font-bold text-slate-950 truncate hover:text-blue-600 transition-colors">
                              {displayName}
                            </h3>
                            <p className="text-xs text-slate-500 truncate">@{item.username}</p>
                          </div>
                        </div>

                        <span
                          className={`status-pill font-bold text-xs whitespace-nowrap flex-shrink-0 ${
                            scorePercentage >= 50
                              ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                              : scorePercentage >= 30
                              ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                              : "bg-slate-100 text-slate-700 ring-1 ring-slate-200"
                          }`}
                        >
                          {scorePercentage}% Match
                        </span>
                      </div>

                      {/* Headline / Job Info */}
                      {(item.job_title || item.company) && (
                        <p className="text-xs font-semibold text-slate-700 mb-2 truncate">
                          {item.job_title}
                          {item.job_title && item.company && " · "}
                          <span className="text-slate-500">{item.company}</span>
                        </p>
                      )}

                      {/* Explanation Callout */}
                      {item.explanation && (
                        <div className="mb-3 rounded-lg bg-blue-50/70 border border-blue-100 px-2.5 py-1.5 text-xs font-medium text-blue-900 flex items-start gap-1.5 min-w-0">
                          <span className="text-blue-600 text-xs flex-shrink-0 mt-0.5">✨</span>
                          <span className="line-clamp-2 break-words min-w-0">{item.explanation}</span>
                        </div>
                      )}

                      {/* Metadata tags */}
                      <div className="flex flex-wrap gap-1.5 mb-3 text-[11px] text-slate-500">
                        {item.major && (
                          <span className="bg-slate-100 px-2 py-0.5 rounded-md truncate max-w-full">
                            🎓 {item.major}
                          </span>
                        )}
                        {item.grad_year && (
                          <span className="bg-slate-100 px-2 py-0.5 rounded-md flex-shrink-0">
                            Batch of {item.grad_year}
                          </span>
                        )}
                        {item.location && (
                          <span className="bg-slate-100 px-2 py-0.5 rounded-md truncate max-w-full">
                            📍 {item.location}
                          </span>
                        )}
                      </div>

                      {/* Skills */}
                      {item.skills && item.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {item.skills.slice(0, 4).map((s) => (
                            <span
                              key={s}
                              className="rounded bg-slate-50 border border-slate-200 px-1.5 py-0.5 text-[10px] font-medium text-slate-600"
                            >
                              {s}
                            </span>
                          ))}
                          {item.skills.length > 4 && (
                            <span className="text-[10px] text-slate-400 self-center">
                              +{item.skills.length - 4} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Connect Action */}
                    <div
                      className="border-t border-slate-100 pt-3 flex items-center justify-between gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => navigate(`/profile/${item.user_id}`)}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors truncate"
                      >
                        View Profile →
                      </button>
                      <ConnectionButton
                        userId={item.user_id}
                        initialStatus={(item.connection_status || "none") as "self" | "none" | "pending" | "connected"}
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            {nextCursor && (
              <div className="flex justify-center pt-4 pb-8">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="btn btn-secondary text-xs px-5 py-2.5 disabled:opacity-50"
                >
                  {loadingMore ? "Loading more..." : "Load More Recommendations"}
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

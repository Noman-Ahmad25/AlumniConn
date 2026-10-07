import { useEffect, useState } from "react"
import { getFeed } from "../api/post"
import PostCard from "../components/PostCard"
import CreatePost from "../components/CreatePost"
import RequestAlumniRole from "../components/RequestAlumniRole"
import type { Post } from "../types/post"
import { useCollegeNavigation } from "../../../shared/utils/navigation"
import { getApiErrorMessage } from "../../../utils/error"
import { getCurrentUserRoleFromToken, hasAuthToken } from "../../auth/utils/auth"

export default function Feed() {
  const { navigate } = useCollegeNavigation()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState("")
  const [filterOpportunity, setFilterOpportunity] = useState<boolean | undefined>(undefined)
  const [skip, setSkip] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const PAGE_SIZE = 15

  const role = getCurrentUserRoleFromToken()

  const handleNewPost = (post: Post) => {
    setPosts((prev) => [post, ...prev])
  }

  const fetchFeed = async (currentSkip = 0, isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true)
    } else {
      setLoading(true)
      setError("")
    }

    try {
      const data = await getFeed({
        skip: currentSkip,
        limit: PAGE_SIZE,
        is_opportunity: filterOpportunity,
      })

      if (isLoadMore) {
        setPosts((prev) => [...prev, ...data])
      } else {
        setPosts(data)
      }

      setHasMore(data.length === PAGE_SIZE)
      setSkip(currentSkip + data.length)
    } catch (err: unknown) {
      console.error("Error fetching feed", err)
      setError(getApiErrorMessage(err, "Failed to load feed"))
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    if (!hasAuthToken()) {
      navigate("/login")
      return
    }

    fetchFeed(0, false)
  }, [filterOpportunity])

  return (
    <div className="app-page">
      <main className="app-main space-y-5 max-w-2xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="page-heading">
            <h1 className="page-title text-2xl font-bold text-slate-950">Campus Feed</h1>
            <p className="page-subtitle text-sm text-slate-500">See what is happening across your alumni network.</p>
          </div>

          <div className="flex gap-1.5 rounded-lg border border-slate-200 bg-slate-50 p-1 self-start sm:self-auto">
            <button
              onClick={() => setFilterOpportunity(undefined)}
              className={`rounded-md px-3 py-1.5 text-xs font-bold transition-colors ${
                filterOpportunity === undefined
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All Posts
            </button>
            <button
              onClick={() => setFilterOpportunity(true)}
              className={`rounded-md px-3 py-1.5 text-xs font-bold transition-colors ${
                filterOpportunity === true
                  ? "bg-white text-emerald-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Opportunities
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            <svg className="mt-0.5 h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4" />
              <path d="M12 16h.01" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <CreatePost onPostCreated={handleNewPost} />

        {role === "student" && <RequestAlumniRole />}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="spinner" />
            <p className="mt-4 text-sm font-medium text-slate-500">Loading your feed...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="empty-state surface-card p-12 text-center text-slate-500">
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 15V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9" />
                <path d="M3 15h5l2 3h4l2-3h5" />
              </svg>
            </div>
            <p className="font-semibold text-slate-700">
              {filterOpportunity ? "No opportunity posts yet" : "No posts yet"}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {filterOpportunity ? "Check back later or post an opportunity above." : "Be the first to share something with your campus."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}

            {hasMore && (
              <div className="flex justify-center pt-4 pb-8">
                <button
                  onClick={() => fetchFeed(skip, true)}
                  disabled={loadingMore}
                  className="btn btn-secondary text-xs px-5 py-2.5 disabled:opacity-50"
                >
                  {loadingMore ? "Loading more..." : "Load More Posts"}
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

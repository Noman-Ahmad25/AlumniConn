import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getFeed } from "../api/post"
import PostCard from "../components/PostCard"
import CreatePost from "../components/CreatePost"
import RequestAlumniRole from "../components/RequestAlumniRole"
import type { Post } from "../types/post"
import { getApiErrorMessage } from "../utils/error"
import { getCurrentUserRoleFromToken } from "../features/auth/utils/auth"

export default function Feed() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const navigate = useNavigate()
  const role = getCurrentUserRoleFromToken()

  const handleNewPost = (post: Post) => {
    setPosts(prev => [post, ...prev])
  }

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const data = await getFeed()
        setPosts(data)
        setError("")
      } catch (error: unknown) {
        console.error("Error fetching feed", error)
        setError(getApiErrorMessage(error, "Failed to load feed"))
      } finally {
        setLoading(false)
      }
    }

    fetchFeed()
  }, [])

  useEffect(() => {
    const token = localStorage.getItem("access_token")
    if (!token) {
      navigate("/login")
    }
  }, [navigate])

  return (
    <div className="app-page">
      <main className="app-main space-y-5">
        <div className="page-heading">
          <h1 className="page-title">Feed</h1>
          <p className="page-subtitle">See what is happening in your college.</p>
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
          <div className="empty-state">
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 15V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9" />
                <path d="M3 15h5l2 3h4l2-3h5" />
              </svg>
            </div>
            <p className="font-semibold text-slate-700">No posts yet</p>
            <p className="mt-1 text-sm text-slate-500">Be the first to share something.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

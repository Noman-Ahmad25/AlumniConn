import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toggleLike } from "../api/post"
import CommentSection from "./CommentSection"
import ConnectionButton from "../../../components/ConnectionButton"
import type { Post } from "../types/post"


function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || name[0]?.toUpperCase() || "U"
}

function timeAgo(dateStr: string) {
  const normalized = dateStr.endsWith("Z") ? dateStr : dateStr + "Z"
  const diff = Date.now() - new Date(normalized).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "Just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width={15}
      height={15}
      viewBox="0 0 24 24"
      fill={filled ? "#D4537E" : "none"}
      stroke={filled ? "#D4537E" : "currentColor"}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}

function CommentIcon() {
  return (
    <svg
      width={15}
      height={15}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function ShareIcon() {
  return (
    <svg
      width={15}
      height={15}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  )
}

export default function PostCard({ post }: { post: Post }) {
  const navigate = useNavigate()
  const [liked, setLiked] = useState<boolean>(post.liked_by_current_user)
  const [likesCount, setLikesCount] = useState<number>(post.likes_count)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [showComments, setShowComments] = useState<boolean>(false)
  const connectionStatus = (post.connection_status || "none") as "self" | "none" | "pending" | "connected"

  const handleLikeToggle = async () => {
    if (isLoading) return
    setIsLoading(true)
    const newLiked = !liked
    setLiked(newLiked)
    setLikesCount((prev) => (newLiked ? prev + 1 : prev - 1))
    try {
      await toggleLike(post.id)
    } catch (error) {
      console.error("Error toggling like:", error)
      setLiked(!newLiked)
      setLikesCount((prev) => (newLiked ? prev - 1 : prev + 1))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <article className="surface-card interactive-card w-full overflow-hidden">
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center gap-2.5 mb-3">
          <button
            onClick={() => navigate(`/profile/${post.user_id}`)}
            className="flex items-center gap-2.5 flex-1 min-w-0 hover:opacity-80 transition-opacity"
          >
            {post.profile_picture ? (
              <img
                src={post.profile_picture}
                alt={post.username}
                className="avatar h-9 w-9 object-cover"
              />
            ) : (
              <div className="avatar h-9 w-9 text-xs">
                {getInitials(post.username)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-bold text-slate-950">{post.username}</p>
              <p className="mt-0.5 text-xs text-slate-400">{timeAgo(post.created_at)} · Public</p>
            </div>
          </button>
          <button
            onClick={() => navigate(`/profile/${post.user_id}`)}
            className="icon-button h-9 w-9 flex-shrink-0"
            title="View profile"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M7 17 17 7" />
              <path d="M7 7h10v10" />
            </svg>
          </button>
        </div>

        {post.is_opportunity && (
          <span className="mb-3 inline-flex rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
            Opportunity
          </span>
        )}

        {post.content && (
          <p className="mb-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{post.content}</p>
        )}

        {post.image_url && (
          <img
            src={post.image_url}
            alt="Post"
            className="w-full rounded-lg border border-slate-100 object-cover"
          />
        )}
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 px-4 py-2 text-xs font-medium text-slate-500">
        <span>{likesCount} likes</span>
        <button
          onClick={() => setShowComments((prev) => !prev)}
          className="transition-colors hover:text-slate-900"
        >
          {post.comments_count} comments
        </button>
      </div>

      {connectionStatus !== "self" && (
        <div className="border-t border-slate-100 px-4 py-3">
          <ConnectionButton
            userId={post.user_id}
            initialStatus={connectionStatus}
          />
        </div>
      )}

      <div className="flex border-t border-slate-100">
        <button
          onClick={handleLikeToggle}
          disabled={isLoading}
          className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-all duration-150 active:scale-95 disabled:opacity-60 ${
            liked
              ? "text-pink-500 bg-pink-50 hover:bg-pink-100"
              : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          <HeartIcon filled={liked} />
          {liked ? "Liked" : "Like"}
        </button>

        <div className="w-px bg-slate-100" />

        <button
          onClick={() => setShowComments((prev) => !prev)}
          className="flex flex-1 items-center justify-center gap-1.5 py-2.5 text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900 active:scale-95"
        >
          <CommentIcon />
          Comment
        </button>

        <div className="w-px bg-slate-100" />

        <button className="flex flex-1 items-center justify-center gap-1.5 py-2.5 text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900 active:scale-95">
          <ShareIcon />
          Share
        </button>
      </div>

      {showComments && <CommentSection postId={post.id} />}
    </article>
  )
}

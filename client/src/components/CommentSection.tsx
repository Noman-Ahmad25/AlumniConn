import { useEffect, useRef, useState } from "react"
import { getComments, createComment } from "../api/comment"

interface Comment {
  id: number
  user_id: number
  post_id: number
  username: string
  profile_picture?: string | null
  content: string
  created_at: string
}

function getDisplayName(c: Comment): string {
  return c.username
}

function getAvatar(c: Comment): string | undefined {
  return c.profile_picture || undefined
}

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0] ?? "").join("").slice(0, 2).toUpperCase() || "U"
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

function SendIcon() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  )
}

function SpinnerIcon() {
  return (
    <svg className="animate-spin" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  )
}

export default function CommentSection({ postId }: { postId: number }) {
  const [comments, setComments] = useState<Comment[]>([])
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [fetchError, setFetchError] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const normalizeList = (data: unknown): Comment[] => {
    if (Array.isArray(data)) return data as Comment[]
    if (data && typeof data === "object") {
      const value = data as { comments?: unknown; data?: unknown }
      if (Array.isArray(value.comments)) return value.comments as Comment[]
      if (Array.isArray(value.data)) return value.data as Comment[]
    }
    return []
  }

  const loadComments = async () => {
    setFetching(true)
    setFetchError(false)
    try {
      const data = await getComments(postId)
      setComments(normalizeList(data))
    } catch (err) {
      console.error("Failed to load comments", err)
      setFetchError(true)
    } finally {
      setFetching(false)
    }
  }

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      setFetching(true)
      setFetchError(false)
      try {
        const data = await getComments(postId)
        if (!cancelled) setComments(normalizeList(data))
      } catch (err) {
        console.error("Failed to load comments", err)
        if (!cancelled) setFetchError(true)
      } finally {
        if (!cancelled) setFetching(false)
      }
    }
    run()
    return () => { cancelled = true }
  }, [postId])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleAddComment = async () => {
    const trimmed = content.trim()
    if (!trimmed || loading) return

    setLoading(true)
    setSubmitError(null)

    setContent("")

    try {
      const newComment = await createComment(trimmed, postId)
      setComments((prev) => [newComment, ...prev])
      listRef.current?.scrollTo?.({ top: 0, behavior: "smooth" })
    } catch (err) {
      console.error("Error adding comment", err)
      setContent(trimmed)
      setSubmitError("Failed to post. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border-t border-slate-100 bg-slate-50 px-4 py-3">
      <div className="flex items-center gap-2 mb-3">
        <input
          ref={inputRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              handleAddComment()
            }
          }}
          placeholder="Write a comment..."
          disabled={loading}
          className="flex-1 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 placeholder:text-slate-400 disabled:opacity-60"
        />
        <button
          type="button"
          onClick={handleAddComment}
          disabled={loading || !content.trim()}
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-blue-600 transition-colors hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? <SpinnerIcon /> : <SendIcon />}
        </button>
      </div>

      {submitError && (
        <p className="mb-2 px-1 text-xs font-medium text-rose-500">{submitError}</p>
      )}

      <div ref={listRef} className="max-h-52 space-y-2.5 overflow-y-auto pr-1">
        {fetching && (
          <p className="py-2 text-center text-xs text-slate-400">Loading comments...</p>
        )}

        {fetchError && (
          <p className="py-2 text-center text-xs text-rose-500">
            Could not load comments.{" "}
            <button type="button" onClick={loadComments} className="underline hover:text-rose-600">
              Retry
            </button>
          </p>
        )}

        {!fetching && !fetchError && comments.length === 0 && (
          <p className="py-2 text-center text-xs text-slate-400">
            No comments yet. Be the first!
          </p>
        )}

        {comments.map((c) => {
          const name = getDisplayName(c)
          const avatar = getAvatar(c)
          return (
            <div key={c.id} className="flex gap-2 items-start">
              {avatar ? (
                <img
                  src={avatar}
                  alt={name}
                  className="avatar h-7 w-7 border border-slate-200 object-cover"
                />
              ) : (
                <div className="avatar h-7 w-7 border border-slate-200 bg-slate-100 text-[11px] text-slate-500">
                  {getInitials(name)}
                </div>
              )}
              <div className="min-w-0 flex-1 rounded-lg rounded-tl-sm border border-slate-200 bg-white px-3 py-2">
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  <span className="text-xs font-bold text-slate-800">{name}</span>
                  <span className="text-[11px] text-slate-400">{timeAgo(c.created_at)}</span>
                </div>
                <p className="mt-0.5 break-words text-[13px] leading-snug text-slate-600">
                  {c.content}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

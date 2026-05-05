import { useCallback, useEffect, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { getMessages, sendMessage } from "../api/message"
import type { MessageResponse, MessageSocketEvent } from "../api/message"
import { useMessagesSocket } from "../hooks/useMessagesSocket"
import { getCurrentUserIdFromToken } from "../utils/auth"
import { getApiErrorMessage } from "../utils/error"

function getInitials(username?: string | null) {
  if (!username) return "U"
  return (
    username
      .split(/[\s._-]+/)
      .map((part) => part[0] ?? "")
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U"
  )
}

function getImageUrl(path: string) {
  if (/^https?:\/\//i.test(path)) return path
  const apiUrl = import.meta.env.VITE_API_URL
  if (!apiUrl) return path
  return new URL(path, apiUrl).toString()
}

function appendUniqueMessage(messages: MessageResponse[], message: MessageResponse) {
  return messages.some((item) => item.id === message.id)
    ? messages
    : [...messages, message]
}

function BackIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </svg>
  )
}

function ImageIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}

function SendIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  )
}

/**
 * Chat — mobile-only full-screen conversation view.
 * On desktop, conversations are displayed inline inside Messages.tsx.
 */
export default function Chat() {
  const { conversationId } = useParams<{ conversationId: string }>()
  const navigate = useNavigate()
  const currentUserId = getCurrentUserIdFromToken()

  const [messages, setMessages] = useState<MessageResponse[]>([])
  const [content, setContent] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState("")
  const bottomRef = useRef<HTMLDivElement>(null)

  const parsedConversationId = Number(conversationId)
  const isReady = Number.isFinite(parsedConversationId) && parsedConversationId > 0 && Boolean(currentUserId)
  const otherUser = messages.find((m) => m.sender.id !== currentUserId)?.sender
  const canSend = Boolean(content.trim() || imageFile) && !sending && isReady

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
  }, [messages.length])

  const handleSocketEvent = useCallback(
    (data: MessageSocketEvent) => {
      if (data.type === "pong") return
      if (data.payload.conversation_id === parsedConversationId) {
        setMessages((prev) => appendUniqueMessage(prev, data.payload))
      }
    },
    [parsedConversationId],
  )

  useMessagesSocket(isReady, handleSocketEvent)

  // Fetch messages
  useEffect(() => {
    let cancelled = false

    const fetchMessages = async () => {
      if (!isReady) {
        setLoading(false)
        setError("This conversation could not be opened.")
        return
      }

      try {
        setLoading(true)
        setError("")
        const data = await getMessages(parsedConversationId)
        if (!cancelled) setMessages(data)
      } catch (err) {
        if (!cancelled) setError(getApiErrorMessage(err, "Failed to load messages"))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchMessages()
    return () => { cancelled = true }
  }, [isReady, parsedConversationId])

  const handleSend = async () => {
    if (!canSend) return

    const formData = new FormData()
    formData.append("conversation_id", String(parsedConversationId))
    if (content.trim()) formData.append("content", content.trim())
    if (imageFile) formData.append("image", imageFile)

    try {
      setSending(true)
      setError("")
      const realMsg = await sendMessage(formData)
      setMessages((prev) => appendUniqueMessage(prev, realMsg))
      setContent("")
      setImageFile(null)
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to send message"))
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex h-screen flex-col bg-white">
      {/* Header */}
      <header className="flex items-center border-b border-slate-200 bg-white px-4 py-3 shadow-sm">
        <button
          type="button"
          onClick={() => navigate("/messages")}
          className="icon-button h-9 w-9 hover:bg-slate-100 mr-3"
          title="Back to messages"
        >
          <BackIcon />
        </button>

        {otherUser?.profile_picture ? (
          <img
            src={getImageUrl(otherUser.profile_picture)}
            alt={otherUser.username}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center text-sm font-bold">
            {getInitials(otherUser?.username)}
          </div>
        )}

        <div className="ml-3 min-w-0">
          <h1 className="truncate text-base font-bold text-slate-950">
            {otherUser?.username ?? "Conversation"}
          </h1>
          <p className="text-xs font-medium text-slate-500">Active now</p>
        </div>
      </header>

      {error && (
        <div className="border-b border-rose-100 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {error}
        </div>
      )}

      {/* Messages */}
      <section className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-slate-50 to-white">
        {loading ? (
          <div className="flex h-full flex-col items-center justify-center">
            <div className="spinner" />
            <p className="mt-4 text-sm font-medium text-slate-500">Loading messages…</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="empty-state mt-6">
            <p className="font-semibold text-slate-700">No messages yet</p>
            <p className="mt-1 text-sm text-slate-500">Start the conversation below.</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isOwn = msg.sender.id === currentUserId
            const showAvatar = idx === 0 || messages[idx - 1]?.sender.id !== msg.sender.id

            return (
              <div
                key={msg.id}
                className={`flex items-end gap-2 ${isOwn ? "justify-end" : "justify-start"} ${
                  !showAvatar && !isOwn ? "ml-12" : ""
                }`}
              >
                {!isOwn && (
                  <div className={`flex-shrink-0 ${!showAvatar ? "opacity-0" : ""}`}>
                    {msg.sender.profile_picture ? (
                      <img
                        src={getImageUrl(msg.sender.profile_picture)}
                        alt={msg.sender.username}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">
                        {getInitials(msg.sender.username)}
                      </div>
                    )}
                  </div>
                )}

                <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"} max-w-[70%]`}>
                  {!isOwn && showAvatar && (
                    <p className="text-xs font-semibold text-slate-600 mb-1">
                      {msg.sender.username}
                    </p>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-2 text-sm shadow-md ${
                      isOwn
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "bg-white border border-slate-200 text-slate-700 rounded-bl-none"
                    }`}
                  >
                    {msg.image_url && (
                      <img
                        src={getImageUrl(msg.image_url)}
                        className="mb-2 max-h-48 w-full rounded-lg object-cover"
                        alt="Attachment"
                      />
                    )}
                    {msg.content && (
                      <p className="whitespace-pre-wrap break-words leading-relaxed">
                        {msg.content}
                      </p>
                    )}
                  </div>
                  <p className="text-xs mt-1 text-slate-400">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </section>

      {/* Input */}
      <footer className="border-t border-slate-200 bg-white p-4 shadow-lg">
        {imageFile && (
          <div className="mb-3 flex min-w-0 items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700">
            <ImageIcon />
            <span className="truncate">{imageFile.name}</span>
            <button
              type="button"
              onClick={() => setImageFile(null)}
              className="ml-auto flex h-5 w-5 flex-shrink-0 items-center justify-center hover:bg-blue-200 rounded"
              title="Remove"
            >
              <XIcon />
            </button>
          </div>
        )}

        <div className="flex items-end gap-3">
          <label
            className="icon-button h-10 w-10 cursor-pointer hover:bg-slate-100 rounded-lg flex items-center justify-center"
            title="Attach image"
          >
            <ImageIcon />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
            />
          </label>

          <input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Aa"
            className="form-field flex-1 rounded-full bg-slate-100 border-0 px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
          />

          <button
            type="button"
            onClick={handleSend}
            disabled={!canSend}
            className="btn btn-primary h-10 w-10 rounded-full p-0 flex items-center justify-center hover:shadow-lg disabled:opacity-50"
            title="Send"
          >
            <SendIcon />
          </button>
        </div>
      </footer>
    </div>
  )
}

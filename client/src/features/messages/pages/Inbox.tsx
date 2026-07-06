// src/pages/Inbox.tsx

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getInbox } from "../api/message"
import { getApiErrorMessage } from "../../../utils/error"
import type { InboxMessage } from "../api/message"

function getInitials(username?: string | null) {
  if (!username) return "U"
  return username
    .split(/[\s._-]+/)
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase() || "U"
}

export default function Inbox() {
  const [chats, setChats] = useState<InboxMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getInbox()
        setChats(data)
        setError("")
      } catch (err: unknown) {
        setError(getApiErrorMessage(err, "Failed to load messages"))
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  return (
    <div className="app-page">
      <main className="app-main">
        <div className="page-heading">
          <h1 className="page-title">Messages</h1>
          <p className="page-subtitle">Continue conversations with your connections.</p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="spinner" />
            <p className="mt-4 text-sm font-medium text-slate-500">Loading messages...</p>
          </div>
        ) : chats.length === 0 ? (
          <div className="empty-state">
            <p className="font-semibold text-slate-700">No conversations yet</p>
            <p className="mt-1 text-sm text-slate-500">Start a message from a profile or the navbar.</p>
          </div>
        ) : (
          <div className="surface-card overflow-hidden">
            {chats.map((chat) => (
              <button
                key={chat.conversation_id}
                onClick={() => navigate(`/chat/${chat.conversation_id}`)}
                className="flex w-full items-center gap-3 border-b border-slate-100 p-4 text-left transition-colors last:border-b-0 hover:bg-slate-50"
              >
                {chat.profile_picture ? (
                  <img
                    src={chat.profile_picture}
                    alt={chat.username}
                    className="avatar h-11 w-11 object-cover"
                  />
                ) : (
                  <div className="avatar h-11 w-11 text-sm">
                    {getInitials(chat.username)}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-slate-950">{chat.username}</p>
                  <p className="truncate text-sm text-slate-500">
                    {chat.last_message || "No messages yet"}
                  </p>
                </div>

                <p className="flex-shrink-0 text-xs font-medium text-slate-400">
                  {chat.last_time
                    ? new Date(chat.last_time).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                    : ""}
                </p>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

import { useEffect, useState } from "react"
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "../api/notification"
import type { NotificationItem, NotificationType } from "../types/notification"
import { useCollegeNavigation } from "../../../shared/utils/navigation"
import { getApiErrorMessage } from "../../../utils/error"
import { NotificationSkeleton } from "../../../shared/components/skeletons"

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

function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case "POST_LIKED":
      return (
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-100 text-pink-600">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </span>
      )
    case "POST_COMMENTED":
      return (
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </span>
      )
    case "CONNECTION_RECEIVED":
    case "CONNECTION_ACCEPTED":
      return (
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <line x1="19" y1="8" x2="19" y2="14" />
            <line x1="22" y1="11" x2="16" y2="11" />
          </svg>
        </span>
      )
    case "MESSAGE_RECEIVED":
      return (
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-600">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        </span>
      )
    case "RECOMMENDATIONS_AVAILABLE":
      return (
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </span>
      )
    default:
      return (
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </span>
      )
  }
}

export default function Notifications() {
  const { navigate } = useCollegeNavigation()
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [unreadOnly, setUnreadOnly] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)

  const fetchList = async () => {
    setLoading(true)
    setError("")
    try {
      const data = await getNotifications({ unread_only: unreadOnly, limit: 50 })
      setNotifications(data.items || [])
    } catch (err: unknown) {
      console.error("Failed to load notifications", err)
      setError(getApiErrorMessage(err, "Failed to load notifications"))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchList()
  }, [unreadOnly])

  const handleNotificationClick = async (notif: NotificationItem) => {
    if (!notif.is_read) {
      try {
        await markNotificationAsRead(notif.id)
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
        )
      } catch (err) {
        console.error("Error marking notification read", err)
      }
    }

    // Determine college-scoped target URL based on type
    switch (notif.notification_type) {
      case "POST_LIKED":
      case "POST_COMMENTED":
        navigate("/feed")
        break
      case "CONNECTION_RECEIVED":
      case "CONNECTION_ACCEPTED":
        navigate("/connections")
        break
      case "MESSAGE_RECEIVED":
        if (notif.metadata_?.conversation_id) {
          navigate(`/messages/${notif.metadata_.conversation_id}`)
        } else {
          navigate("/messages")
        }
        break
      case "RECOMMENDATIONS_AVAILABLE":
        navigate("/recommendations")
        break
      default:
        navigate("/feed")
    }
  }

  const handleMarkAllRead = async () => {
    setBusy(true)
    try {
      await markAllNotificationsAsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    } catch (err: unknown) {
      console.error("Failed to mark all as read", err)
      setError(getApiErrorMessage(err, "Failed to mark all as read"))
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation()
    try {
      await deleteNotification(id)
      setNotifications((prev) => prev.filter((n) => n.id !== id))
    } catch (err) {
      console.error("Failed to delete notification", err)
    }
  }

  return (
    <div className="app-page">
      <main className="app-main space-y-6 max-w-3xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="page-title text-2xl font-bold text-slate-950">Notifications</h1>
            <p className="page-subtitle text-sm text-slate-500">
              Stay updated on connections, messages, post interactions, and recommendations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleMarkAllRead}
              disabled={busy || notifications.every((n) => n.is_read)}
              className="btn btn-secondary text-xs px-3 py-2 disabled:opacity-50"
            >
              Mark all as read
            </button>
          </div>
        </div>

        {/* Filter Toggle */}
        <div className="flex gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setUnreadOnly(false)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              !unreadOnly
                ? "bg-blue-50 text-blue-700"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setUnreadOnly(true)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              unreadOnly
                ? "bg-blue-50 text-blue-700"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Unread Only
          </button>
        </div>

        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-3" data-testid="notifications-skeletons">
            {Array.from({ length: 5 }).map((_, i) => (
              <NotificationSkeleton key={i} />
            ))}
          </div>
        ) : notifications.length === 0 ? (
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
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <p className="font-semibold text-slate-700">No notifications</p>
            <p className="text-xs text-slate-400 mt-1">
              {unreadOnly ? "You have no unread notifications." : "You're all caught up!"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`surface-card interactive-card flex items-start gap-4 p-4 cursor-pointer transition-all duration-150 ${
                  !notif.is_read
                    ? "border-l-4 border-l-blue-600 bg-blue-50/30"
                    : "bg-white"
                }`}
              >
                {getNotificationIcon(notif.notification_type)}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-slate-900 truncate">
                      {notif.title}
                    </p>
                    <span className="text-xs text-slate-400 whitespace-nowrap">
                      {timeAgo(notif.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mt-0.5 leading-snug">
                    {notif.message}
                  </p>
                </div>

                <button
                  onClick={(e) => handleDelete(e, notif.id)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
                  title="Dismiss notification"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

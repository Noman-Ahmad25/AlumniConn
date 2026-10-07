import { useEffect, useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { getDemoEmails, clearDemoEmails, getEmailMode } from "../api/auth"
import type { DemoEmailEvent } from "../types/auth"

interface DemoEmailInboxProps {
  filterEmail?: string
  className?: string
  title?: string
}

export default function DemoEmailInbox({
  filterEmail,
  className = "",
  title = "Demo Email Delivery Inbox",
}: DemoEmailInboxProps) {
  const navigate = useNavigate()
  const [isDemoMode, setIsDemoMode] = useState<boolean | null>(null)
  const [emails, setEmails] = useState<DemoEmailEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const fetchEmails = useCallback(async () => {
    try {
      const modeRes = await getEmailMode()
      if (modeRes.email_mode !== "demo") {
        setIsDemoMode(false)
        return
      }
      setIsDemoMode(true)
      const data = await getDemoEmails(filterEmail)
      setEmails(data.emails || [])
    } catch {
      // In production or when endpoint fails, gracefully hide
      setIsDemoMode(false)
    }
  }, [filterEmail])

  useEffect(() => {
    fetchEmails()
    const interval = setInterval(fetchEmails, 3000)
    return () => clearInterval(interval)
  }, [fetchEmails])

  if (isDemoMode === false || isDemoMode === null) {
    return null
  }

  const handleClear = async () => {
    setLoading(true)
    try {
      await clearDemoEmails()
      setEmails([])
    } finally {
      setLoading(false)
    }
  }

  const handleActionClick = (url: string) => {
    try {
      // If it's a relative URL or starts with our origin, use router navigation
      const parsed = new URL(url, window.location.origin)
      if (parsed.origin === window.location.origin) {
        navigate(parsed.pathname + parsed.search)
      } else {
        window.location.href = url
      }
    } catch {
      window.location.href = url
    }
  }

  const getActionLabel = (actionType: string) => {
    switch (actionType) {
      case "user_verification":
        return "Verify Email"
      case "password_reset":
        return "Reset Password"
      case "college_verification":
        return "Verify College"
      case "college_approval":
        return "Login to College"
      default:
        return "Open Link"
    }
  }

  return (
    <div
      className={`rounded-xl border border-amber-200/90 bg-amber-50/60 p-4 text-left shadow-sm ${className}`}
    >
      <div className="flex items-center justify-between border-b border-amber-200/60 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
            {title}
          </h4>
          <span className="rounded-full bg-amber-200/70 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
            EMAIL_MODE=demo
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchEmails}
            className="text-[11px] font-medium text-amber-800 hover:text-amber-950 underline"
          >
            Refresh
          </button>
          {emails.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              disabled={loading}
              className="text-[11px] font-medium text-amber-700 hover:text-rose-700 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <p className="mt-2 text-xs text-amber-800/90 leading-relaxed">
        Outbound emails are intercepted locally so you can test registration, verification, and password resets in 1-click without configuring SMTP.
      </p>

      {emails.length === 0 ? (
        <div className="mt-3 rounded-lg border border-dashed border-amber-300/80 bg-white/60 p-3 text-center text-xs text-amber-700">
          No intercepted emails yet. Perform an action (e.g. register, reset password) to see them appear here.
        </div>
      ) : (
        <div className="mt-3 space-y-2.5 max-h-80 overflow-y-auto pr-1">
          {emails.map((email) => {
            const isExpanded = expandedId === email.id
            return (
              <div
                key={email.id}
                className="rounded-lg border border-amber-200 bg-white p-3 shadow-xs transition-all hover:border-amber-300"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-900 uppercase">
                        {email.action_type.replace("_", " ")}
                      </span>
                      <span className="text-[11px] text-slate-500 truncate">
                        To: <span className="font-semibold text-slate-700">{email.to_email}</span>
                      </span>
                    </div>
                    <div className="mt-1 font-semibold text-xs text-slate-900">
                      {email.subject}
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0">
                    {new Date(email.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </span>
                </div>

                {email.action_url && (
                  <div className="mt-2.5 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleActionClick(email.action_url!)}
                      className="inline-flex items-center gap-1.5 rounded-md bg-amber-600 px-2.5 py-1 text-xs font-semibold text-white shadow-xs hover:bg-amber-700 transition-colors"
                    >
                      <span>{getActionLabel(email.action_type)}</span>
                      <span>&rarr;</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : email.id)}
                      className="text-xs font-medium text-slate-600 hover:text-slate-900 underline"
                    >
                      {isExpanded ? "Hide preview" : "View email body"}
                    </button>
                  </div>
                )}

                {!email.action_url && (
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : email.id)}
                      className="text-xs font-medium text-slate-600 hover:text-slate-900 underline"
                    >
                      {isExpanded ? "Hide preview" : "View email body"}
                    </button>
                  </div>
                )}

                {isExpanded && (
                  <div className="mt-3 rounded border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-700">
                    <div
                      className="prose prose-xs max-w-none"
                      dangerouslySetInnerHTML={{ __html: email.html_body }}
                    />
                    {email.action_url && (
                      <div className="mt-2 pt-2 border-t border-slate-200 text-[11px] text-slate-500 break-all font-mono">
                        Target URL: {email.action_url}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

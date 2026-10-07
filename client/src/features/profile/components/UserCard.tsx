import type { ReactNode } from "react"

interface UserCardUser {
  id: number
  username: string
  profile_picture?: string | null
}

function getInitials(username?: string | null) {
  if (!username) return "U"

  return username
    .split(/[\s._-]+/)
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase() || "U"
}

export default function UserCard({
  user,
  description,
  action,
  onClick,
}: {
  user: UserCardUser
  description?: string
  action?: ReactNode
  onClick: () => void
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          onClick()
        }
      }}
      className="surface-card interactive-card cursor-pointer p-4 w-full"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {user.profile_picture ? (
            <img
              src={user.profile_picture}
              alt={user.username}
              className="avatar h-12 w-12 object-cover flex-shrink-0"
            />
          ) : (
            <div className="avatar h-12 w-12 text-sm flex-shrink-0">
              {getInitials(user.username)}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <p className="truncate font-bold text-slate-950">{user.username}</p>
            {description && (
              <p className="truncate text-sm text-slate-500">{description}</p>
            )}
          </div>
        </div>

        {action && (
          <div
            className="flex items-center gap-2 flex-shrink-0 justify-end pt-2 sm:pt-0 border-t border-slate-100 sm:border-0"
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
          >
            {action}
          </div>
        )}
      </div>
    </div>
  )
}


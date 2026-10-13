import { Skeleton } from "./Skeleton"

export function NotificationSkeleton() {
  return (
    <div className="surface-card flex items-start gap-4 p-4 border border-slate-200/80 bg-white">
      <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
      <div className="flex-1 min-w-0 space-y-2">
        <Skeleton className="h-3.5 w-3/4" />
        <Skeleton className="h-3 w-1/3" />
      </div>
      <Skeleton className="h-4 w-4 rounded flex-shrink-0" />
    </div>
  )
}

export default NotificationSkeleton

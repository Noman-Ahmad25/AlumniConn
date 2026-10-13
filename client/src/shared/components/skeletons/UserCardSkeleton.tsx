import { Skeleton } from "./Skeleton"

export function UserCardSkeleton({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-100 bg-white">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
          <div className="space-y-1.5 flex-1 min-w-0">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-2.5 w-16" />
          </div>
        </div>
        <Skeleton className="h-7 w-16 rounded-md flex-shrink-0" />
      </div>
    )
  }

  return (
    <div className="surface-card flex flex-col justify-between p-4 border border-slate-200/80 w-full">
      <div className="flex items-start gap-3 min-w-0 mb-3">
        <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
        <div className="space-y-1.5 flex-1 min-w-0">
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-2.5 w-20" />
          <Skeleton className="h-2.5 w-32 mt-1" />
        </div>
      </div>
      <div className="flex gap-2 pt-2 border-t border-slate-100">
        <Skeleton className="h-7 flex-1 rounded-md" />
        <Skeleton className="h-7 w-20 rounded-md" />
      </div>
    </div>
  )
}

export default UserCardSkeleton

import { Skeleton } from "./Skeleton"

export function PostCardSkeleton() {
  return (
    <article className="surface-card w-full overflow-hidden border border-slate-200/80 p-4">
      {/* Header: avatar + author info */}
      <div className="flex items-center gap-2.5 mb-3">
        <Skeleton className="h-9 w-9 rounded-full flex-shrink-0" />
        <div className="flex-1 min-w-0 space-y-1.5">
          <Skeleton className="h-3.5 w-32" />
          <Skeleton className="h-2.5 w-20" />
        </div>
      </div>

      {/* Content lines */}
      <div className="space-y-2 mb-4">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <Skeleton className="h-3 w-2/3" />
      </div>

      {/* Stats bar */}
      <div className="flex items-center justify-between border-t border-slate-100 pt-3">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-20" />
      </div>
    </article>
  )
}

export default PostCardSkeleton

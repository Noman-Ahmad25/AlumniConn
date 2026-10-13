import { Skeleton } from "./Skeleton"

export function RecommendationCardSkeleton() {
  return (
    <div className="surface-card flex flex-col justify-between p-5 border border-slate-200/80 w-full min-h-[260px]">
      <div>
        {/* Top Header: Avatar, Name, and Match Pill */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
            <div className="space-y-1.5 flex-1 min-w-0">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-2.5 w-16" />
            </div>
          </div>
          <Skeleton className="h-5 w-20 rounded-full flex-shrink-0" />
        </div>

        {/* Headline / Job Info */}
        <Skeleton className="h-3 w-40 mb-3" />

        {/* Semantic Explanation Callout */}
        <div className="mb-3 rounded-lg border border-slate-100 bg-slate-50/60 p-2.5">
          <Skeleton className="h-3 w-11/12 mb-1.5" />
          <Skeleton className="h-3 w-3/4" />
        </div>

        {/* Metadata tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <Skeleton className="h-5 w-20 rounded-md" />
          <Skeleton className="h-5 w-24 rounded-md" />
        </div>

        {/* Skills */}
        <div className="flex flex-wrap gap-1 mb-4">
          <Skeleton className="h-4 w-12 rounded" />
          <Skeleton className="h-4 w-16 rounded" />
          <Skeleton className="h-4 w-14 rounded" />
        </div>
      </div>

      {/* Action buttons */}
      <div className="pt-3 border-t border-slate-100 flex gap-2">
        <Skeleton className="h-8 flex-1 rounded-lg" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
    </div>
  )
}

export default RecommendationCardSkeleton

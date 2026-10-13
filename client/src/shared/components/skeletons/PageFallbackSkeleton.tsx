import { Skeleton } from "./Skeleton"

export function PageFallbackSkeleton() {
  return (
    <div className="app-page min-h-screen">
      <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Top Heading Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>

        {/* Content Skeleton Grid/Cards */}
        <div className="surface-card p-6 space-y-4 border border-slate-200/80">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
          <div className="pt-4 flex gap-3">
            <Skeleton className="h-9 w-28 rounded-lg" />
            <Skeleton className="h-9 w-24 rounded-lg" />
          </div>
        </div>
      </main>
    </div>
  )
}

export default PageFallbackSkeleton

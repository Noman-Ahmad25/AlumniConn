import { Skeleton } from "./Skeleton"
import { PostCardSkeleton } from "./PostCardSkeleton"

export function ProfileSkeleton() {
  return (
    <div className="app-page">
      <main className="app-main-wide space-y-6">
        {/* Profile Card Header */}
        <section className="surface-card overflow-hidden">
          {/* Cover */}
          <div className="h-32 bg-slate-200/90" />

          {/* Profile Header Bar */}
          <div className="px-6 pb-6 pt-0">
            <div className="-mt-16 mb-4 flex flex-col gap-4 sm:flex-row sm:items-end">
              <Skeleton className="h-32 w-32 rounded-lg border-4 border-white shadow-lg flex-shrink-0" />
              <div className="min-w-0 flex-1 pb-2 space-y-2">
                <Skeleton className="h-7 w-48" />
                <Skeleton className="h-4 w-28" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-9 w-24 rounded-lg" />
              </div>
            </div>

            {/* Quick Details Chips */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
              <Skeleton className="h-6 w-32 rounded-full" />
              <Skeleton className="h-6 w-28 rounded-full" />
              <Skeleton className="h-6 w-36 rounded-full" />
            </div>
          </div>
        </section>

        {/* Profile Content Grid */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
          {/* Left Column: Details */}
          <div className="lg:col-span-1 space-y-6">
            <div className="surface-card p-6 space-y-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-3.5 w-4/5" />
            </div>
            <div className="surface-card p-6 space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-3.5 w-3/4" />
            </div>
          </div>

          {/* Right Column: Posts */}
          <div className="lg:col-span-2 space-y-4">
            <PostCardSkeleton />
            <PostCardSkeleton />
          </div>
        </div>
      </main>
    </div>
  )
}

export default ProfileSkeleton

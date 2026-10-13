import { Skeleton } from "./Skeleton"

export function InboxListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="divide-y divide-slate-100">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-3 flex items-center gap-3">
          <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-2.5 w-3/4" />
          </div>
          <Skeleton className="h-2.5 w-10 flex-shrink-0" />
        </div>
      ))}
    </div>
  )
}

export function ChatMessagesSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="p-6 space-y-4">
      {Array.from({ length: count }).map((_, i) => {
        const isOwn = i % 2 !== 0
        return (
          <div
            key={i}
            className={`flex items-end gap-2 ${isOwn ? "justify-end" : "justify-start"}`}
          >
            {!isOwn && <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />}
            <div className={`space-y-1.5 ${isOwn ? "items-end" : "items-start"}`}>
              <Skeleton
                className={`h-10 rounded-2xl ${
                  isOwn
                    ? "w-48 bg-blue-100/70 rounded-br-none"
                    : "w-56 bg-slate-200/80 rounded-bl-none"
                }`}
              />
              <Skeleton className={`h-2.5 w-12 ${isOwn ? "ml-auto" : "mr-auto"}`} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

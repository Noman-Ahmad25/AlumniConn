interface SkeletonProps {
  className?: string
  style?: React.CSSProperties
}

export function Skeleton({ className = "", style }: SkeletonProps) {
  return (
    <div
      className={`bg-slate-200/80 animate-pulse rounded motion-reduce:animate-none ${className}`}
      style={style}
      aria-hidden="true"
    />
  )
}

export default Skeleton

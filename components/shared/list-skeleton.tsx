import { Skeleton } from "@/components/ui/skeleton"

type ListSkeletonProps = {
  variant?: "rows" | "cards" | "stats" | "detail" | "calendar"
  count?: number
}

export function ListSkeleton({ variant = "rows", count }: ListSkeletonProps) {
  const n = count ?? (variant === "stats" ? 3 : variant === "cards" ? 6 : 5)

  if (variant === "stats") {
    return (
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
        role="status"
        aria-label="Carregando"
      >
        {Array.from({ length: n }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full" />
        ))}
      </div>
    )
  }

  if (variant === "cards") {
    return (
      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        role="status"
        aria-label="Carregando"
      >
        {Array.from({ length: n }).map((_, i) => (
          <Skeleton key={i} className="h-40 w-full" />
        ))}
      </div>
    )
  }

  if (variant === "detail") {
    return (
      <div
        className="flex-1 min-h-0 flex flex-col rounded-xl border overflow-hidden"
        role="status"
        aria-label="Carregando caso"
      >
        <Skeleton className="h-24 w-full rounded-none" />
        <div className="p-4 space-y-3">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    )
  }

  if (variant === "calendar") {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" role="status" aria-label="Carregando agenda">
        <Skeleton className="lg:col-span-2 h-80 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    )
  }

  return (
    <div className="grid gap-4" role="status" aria-label="Carregando">
      {Array.from({ length: n }).map((_, i) => (
        <Skeleton key={i} className="h-[5.5rem] w-full" />
      ))}
    </div>
  )
}

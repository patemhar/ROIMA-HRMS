import { Skeleton } from "@/components/ui/skeleton"

export function SkeletonTable() {
  return (
    <div className="flex w-full flex-col gap-2">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index}>
            <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
  )
}

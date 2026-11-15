import type { ReactNode } from "react"
import type { UseQueryResult } from "@tanstack/react-query"
import { TriangleAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "./EmptyState"

type QueryStateProps<T> = {
  query: UseQueryResult<T>
  /** Shown instead of children when the data is empty (null, undefined or an empty array unless isEmpty says otherwise). */
  empty?: { title: string; description?: string; action?: ReactNode; isEmpty?: (data: T) => boolean }
  children: (data: T) => ReactNode
}

function defaultIsEmpty(data: unknown) {
  return data == null || (Array.isArray(data) && data.length === 0)
}

export function QueryState<T>({ query, empty, children }: QueryStateProps<T>) {
  if (query.isPending) {
    return (
      <div className="space-y-3" role="status" aria-label="Loading">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    )
  }
  if (query.isError) {
    return (
      <EmptyState
        icon={TriangleAlert}
        title="Something went wrong"
        description={query.error instanceof Error ? query.error.message : "Please try again."}
        action={
          <Button variant="outline" onClick={() => void query.refetch()}>
            Retry
          </Button>
        }
      />
    )
  }
  const data = query.data
  if (empty && (empty.isEmpty ?? defaultIsEmpty)(data)) {
    return <EmptyState title={empty.title} description={empty.description} action={empty.action} />
  }
  return <>{children(data)}</>
}

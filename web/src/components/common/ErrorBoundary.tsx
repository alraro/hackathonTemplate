import { isRouteErrorResponse, Link, useRouteError } from "react-router"
import { TriangleAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EmptyState } from "./EmptyState"

/** Route-level error element: registered on every route in routes.tsx. */
export function ErrorBoundary() {
  const error = useRouteError()
  const notFound = isRouteErrorResponse(error) && error.status === 404
  const message = error instanceof Error ? error.message : undefined
  return (
    <div className="mx-auto max-w-xl p-6">
      <EmptyState
        icon={TriangleAlert}
        title={notFound ? "Page not found" : "Something went wrong"}
        description={notFound ? undefined : message}
        action={
          <Button asChild variant="outline">
            <Link to="/">Back home</Link>
          </Button>
        }
      />
    </div>
  )
}

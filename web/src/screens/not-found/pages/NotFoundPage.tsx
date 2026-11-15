import { Link } from "react-router"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/common/EmptyState"

export default function NotFoundPage() {
  return (
    <EmptyState
      title="Page not found"
      description="The page you are looking for does not exist."
      action={
        <Button asChild>
          <Link to="/">Back home</Link>
        </Button>
      }
    />
  )
}

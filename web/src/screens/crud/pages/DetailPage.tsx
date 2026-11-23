import { useState } from "react"
import { Link, useNavigate, useParams } from "react-router"
import { Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { PageHeader } from "@/components/common/PageHeader"
import { QueryState } from "@/components/common/QueryState"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useDeleteItem, useItem } from "../api"
import { DeleteDialog } from "../components/DeleteDialog"

export default function DetailPage() {
  const id = Number(useParams().id)
  const navigate = useNavigate()
  const query = useItem(Number.isFinite(id) ? id : undefined)
  const del = useDeleteItem()
  const [confirming, setConfirming] = useState(false)

  return (
    <QueryState query={query} empty={{ title: "Item not found", description: "It may have been deleted.", action: <Button asChild variant="outline"><Link to="/items">Back to items</Link></Button> }}>
      {(item) => item && (
        <>
          <PageHeader
            title={item.title}
            description={`${item.status}${item.category ? ` · ${item.category}` : ""}`}
            actions={
              <>
                <Button variant="outline" asChild>
                  <Link to={`/items/${item.id}/edit`}>
                    <Pencil aria-hidden /> Edit
                  </Link>
                </Button>
                <Button variant="destructive" onClick={() => setConfirming(true)}>
                  <Trash2 aria-hidden /> Delete
                </Button>
              </>
            }
          />
          <Card>
            <CardContent className="space-y-2 text-sm">
              <p>{item.description || <span className="text-muted-foreground">No description</span>}</p>
              <p className="text-muted-foreground">Created {new Date(item.created_at).toLocaleString()}</p>
            </CardContent>
          </Card>
          <Button variant="link" asChild className="mt-4 px-0">
            <Link to="/items">Back to items</Link>
          </Button>
          <DeleteDialog
            name={confirming ? item.title : null}
            pending={del.isPending}
            onCancel={() => setConfirming(false)}
            onConfirm={() =>
              del.mutate(item.id, {
                onSuccess: () => {
                  toast.success("Item deleted")
                  void navigate("/items")
                },
                onError: (e) => toast.error(e.message),
                onSettled: () => setConfirming(false),
              })
            }
          />
        </>
      )}
    </QueryState>
  )
}

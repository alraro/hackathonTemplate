import { Link, useNavigate, useParams } from "react-router"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { PageHeader } from "@/components/common/PageHeader"
import { QueryState } from "@/components/common/QueryState"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { STATUSES, useItem, useSaveItem } from "../api"

const schema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string(),
  category: z.string(),
  status: z.enum(STATUSES as [string, ...string[]]),
})
type Values = z.infer<typeof schema>
const blank: Values = { title: "", description: "", category: "", status: "todo" }

/** Create (/items/new) and edit (/items/:id/edit) share this page: react-hook-form + zod, toast on result. */
export default function FormPage() {
  const rawId = useParams().id
  const id = rawId === undefined ? undefined : Number(rawId)
  const existing = useItem(id)
  const title = id === undefined ? "New item" : "Edit item"

  if (id === undefined) return <ItemForm title={title} />
  return (
    <QueryState query={existing} empty={{ title: "Item not found", description: "It may have been deleted.", action: <Button asChild variant="outline"><Link to="/items">Back to items</Link></Button> }}>
      {(item) => <ItemForm key={item.id} title={title} id={id} initial={item as Values} />}
    </QueryState>
  )
}

function ItemForm({ title, id, initial = blank }: { title: string; id?: number; initial?: Values }) {
  const navigate = useNavigate()
  const save = useSaveItem(id)
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: initial })

  const onSubmit = form.handleSubmit((values) =>
    save.mutate(values as Parameters<typeof save.mutate>[0], {
      onSuccess: (item) => {
        toast.success(id === undefined ? "Item created" : "Item saved")
        void navigate(`/items/${item.id}`)
      },
      onError: (e) => toast.error(e.message),
    }),
  )

  return (
    <>
      <PageHeader title={title} />
      <Form {...form}>
        <form onSubmit={onSubmit} className="max-w-lg space-y-4" noValidate>
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <FormControl>
                  <select {...field} className="h-9 w-full rounded-md border bg-background px-3 text-sm">
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex gap-2">
            <Button type="submit" disabled={save.isPending}>
              Save
            </Button>
            <Button type="button" variant="outline" onClick={() => void navigate(-1)}>
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </>
  )
}

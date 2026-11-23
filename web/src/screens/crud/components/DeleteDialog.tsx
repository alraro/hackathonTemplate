import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

type DeleteDialogProps = {
  /** Name shown in the prompt; the dialog is open while this is set. */
  name: string | null
  pending?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function DeleteDialog({ name, pending, onConfirm, onCancel }: DeleteDialogProps) {
  return (
    <Dialog open={name !== null} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete item?</DialogTitle>
          <DialogDescription>"{name}" will be removed. This cannot be undone.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="destructive" disabled={pending} onClick={onConfirm}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Pencil, Trash2 } from "lucide-react"

type RecentChat = { id: string; title: string; time: string }

export default function RecentChats({
  items,
  onOpen,
  onRename,
  onDelete,
}: {
  items: RecentChat[]
  onOpen: (id: string) => void
  onRename: (id: string, title: string) => void
  onDelete: (id: string) => void
}) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState("")

  const startEdit = (item: RecentChat) => {
    setEditingId(item.id)
    setDraft(item.title)
  }

  const submitEdit = (id: string) => {
    const next = draft.trim()
    if (next) onRename(id, next)
    setEditingId(null)
    setDraft("")
  }

  return (
    <div className="w-full">
      {items.map((chat) => (
        <div key={chat.id} className="flex items-center gap-2 px-1 py-0.5">
          <button
            onClick={() => onOpen(chat.id)}
            className="flex-1 min-w-0 text-left rounded-md px-2 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors leading-none"
          >
            {editingId === chat.id ? (
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={() => submitEdit(chat.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") submitEdit(chat.id)
                  if (e.key === "Escape") { setEditingId(null); setDraft("") }
                }}
                className="h-7 px-2 text-xs"
                autoFocus
              />
            ) : (
              <>
                <p className="truncate">{chat.title}</p>
              </>
            )}
          </button>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => startEdit(chat)}
              aria-label="Rename chat"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive"
                  aria-label="Delete chat"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this chat?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently remove the chat and its messages.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(chat.id)}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      ))}
    </div>
  )
}

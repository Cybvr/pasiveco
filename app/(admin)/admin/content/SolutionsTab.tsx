"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { solutionsService } from "@/services/solutionsService"
import { useEditor } from "@tiptap/react"
import { Eye, Trash2, Plus } from "lucide-react"
import { uploadImage } from "@/services/cloudinaryService"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import EditorContent from "./EditorContent"
import { AdminSidebarList } from "../components/AdminSidebarList"

interface Solution {
  id?: string
  title: string
  description: string
  content: string
  slug: string
  imageUrl?: string
}

interface SolutionsTabProps {
  editor: ReturnType<typeof useEditor> | null
}

const SolutionsTab: React.FC<SolutionsTabProps> = ({ editor }) => {
  const [solutions, setSolutions] = useState<Solution[]>([])
  const [loading, setLoading] = useState(true)
  const [currentSolution, setCurrentSolution] = useState<Solution | null>(null)

  useEffect(() => {
    const fetchSolutions = async () => {
      try {
        const data = await solutionsService.getAllSolutions()
        setSolutions(data)
      } catch (error) {
        console.error("Error fetching solutions:", error)
      }
      setLoading(false)
    }
    fetchSolutions()
  }, [])

  useEffect(() => {
    if (editor && currentSolution?.content) {
      editor.commands.setContent(currentSolution.content)
    }
  }, [currentSolution?.content, editor])

  const handleSave = async () => {
    if (!currentSolution || !editor) return
    try {
      const solutionToSave = {
        ...currentSolution,
        content: editor.getHTML()
      }
      if (currentSolution.id) {
        await solutionsService.updateSolution(currentSolution.id, solutionToSave)
      } else {
        await solutionsService.createSolution(solutionToSave)
      }
      // Refresh the list
      const data = await solutionsService.getAllSolutions()
      setSolutions(data)
      toast({
        title: "Success",
        description: `Solution "${currentSolution.title}" saved successfully.`,
      })
    } catch (error) {
      console.error("Error saving solution:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save solution.",
      })
    }
  }

  const handleImageUpload = async (file: File): Promise<string> => {
    try {
      return await uploadImage(file)
    } catch (error) {
      console.error("Upload error:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to upload image",
      })
      throw error
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await solutionsService.deleteSolution(id)
        setSolutions(solutions.filter((solution) => solution.id !== id))
        if (currentSolution?.id === id) {
          setCurrentSolution(null)
          if (editor) editor.commands.clearContent()
        }
        toast({
          title: "Success",
          description: `Solution "${title}" deleted successfully.`,
        })
      } catch (error) {
        console.error("Error deleting solution:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to delete solution.",
        })
      }
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-12 h-[calc(100vh-140px)]">
      <div className="col-span-1 min-w-0 rounded-lg border p-4 md:col-span-4 md:mb-0 flex flex-col">
        <div className="flex items-center justify-between mb-4 px-1 shrink-0">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Solutions</h3>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => {
              setCurrentSolution({ title: "", description: "", content: "", slug: "" })
              if (editor) {
                editor.commands.setContent("")
              }
            }} 
            className="h-6 w-6 rounded-full hover:bg-primary/10 hover:text-primary"
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
        
        <div className="flex-1 overflow-hidden">
          <AdminSidebarList
            items={solutions}
            selectedId={currentSolution?.id}
            onSelect={(solution) => {
              setCurrentSolution(null)
              setTimeout(() => setCurrentSolution(solution), 0)
            }}
            onDelete={(solution) => handleDelete(solution.id!, solution.title)}
            getId={(solution) => solution.id!}
            getTitle={(solution) => solution.title}
            getSubtitle={(solution) => (
              <p className="text-[10px] text-muted-foreground font-medium truncate">
                {solution.slug}
              </p>
            )}
            renderActions={(solution) => (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full hover:bg-background"
                onClick={(e) => {
                  e.stopPropagation()
                  window.open(`/solutions/${solution.slug}`, "_blank")
                }}
              >
                <Eye className="h-3.5 w-3.5" />
              </Button>
            )}
            loading={loading}
            loadingMessage="Loading solutions..."
          />
        </div>
      </div>
      <div className="col-span-1 min-w-0 rounded-lg border md:col-span-8 bg-card flex flex-col overflow-hidden">
        {currentSolution ? (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <Input
                value={currentSolution.title}
                onChange={(e) => {
                  const title = e.target.value
                  const slug = title
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/(^-|-$)/g, "")
                  setCurrentSolution({ ...currentSolution, title, slug })
                }}
                placeholder="Title"
                className="text-lg font-bold border-none px-0 shadow-none focus-visible:ring-0"
              />
              <Input
                value={currentSolution.description}
                onChange={(e) => setCurrentSolution({ ...currentSolution, description: e.target.value })}
                placeholder="Description"
                className="border-none px-0 shadow-none focus-visible:ring-0 text-sm text-muted-foreground"
              />
              <Input
                value={currentSolution.slug}
                onChange={(e) => setCurrentSolution({ ...currentSolution, slug: e.target.value })}
                placeholder="URL Slug"
                className="h-7 text-[10px] w-fit bg-muted/50 border-none rounded-full px-3"
              />
              <div className="min-h-[300px] border rounded-xl overflow-hidden bg-background">
                <EditorContent editor={editor} />
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      try {
                        const imageUrl = await handleImageUpload(file)
                        setCurrentSolution({ ...currentSolution, imageUrl })
                      } catch (error) {
                        // Error is already handled
                      }
                    }
                  }}
                  className="max-w-xs"
                />
                {currentSolution.imageUrl && (
                  <img
                    src={currentSolution.imageUrl || "/placeholder.svg"}
                    alt="Preview"
                    className="w-12 h-12 object-cover rounded-lg border"
                  />
                )}
              </div>
            </div>
            
            <div className="p-3 border-t bg-background flex justify-start shrink-0">
              <Button 
                onClick={handleSave} 
                className="bg-indigo-600 hover:bg-indigo-700 font-bold text-xs uppercase tracking-widest px-8 rounded-full shadow-lg shadow-indigo-500/20"
              >
                Save Changes
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8">
            <p className="text-sm font-medium">Select a solution to edit or create a new one</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default SolutionsTab
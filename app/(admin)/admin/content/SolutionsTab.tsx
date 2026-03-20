"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { solutionsService } from "@/services/solutionsService"
import { useEditor } from "@tiptap/react"
import { Eye, Trash2 } from "lucide-react"
import { uploadImage } from "@/services/cloudinaryService"
import { toast } from "@/hooks/use-toast"
import EditorContent from "./EditorContent"

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
    <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
      <div className="col-span-1 min-w-0 rounded-lg border p-4 md:col-span-4 md:mb-0">
        <h2 className="text-lg font-semibold mb-4">Solutions List</h2>
        <div className="space-y-4">
          <Button
            onClick={() => {
              setCurrentSolution({ title: "", description: "", content: "", slug: "" })
              if (editor) {
                editor.commands.setContent("")
              }
            }}
            className="w-full"
          >
            + Create New
          </Button>
          <div className="space-y-2">
            {solutions.map((solution) => (
              <Card key={solution.id} className="p-3 hover:bg-accent">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <h3
                    className="cursor-pointer break-words font-medium"
                    onClick={() => {
                      setCurrentSolution(null) // Reset first
                      setTimeout(() => setCurrentSolution(solution), 0) // Then set new item
                    }}
                  >
                    {solution.title}
                  </h3>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => window.open(`/solutions/${solution.slug}`, "_blank")}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDelete(solution.id!, solution.title)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
      <div className="col-span-1 min-w-0 rounded-lg border p-4 md:col-span-8">
        <h2 className="text-lg font-semibold mb-4">Edit Solution</h2>
        {currentSolution && (
          <div className="space-y-4">
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
            />
            <Input
              value={currentSolution.description}
              onChange={(e) => setCurrentSolution({ ...currentSolution, description: e.target.value })}
              placeholder="Description"
            />
            <Input
              value={currentSolution.slug}
              onChange={(e) => setCurrentSolution({ ...currentSolution, slug: e.target.value })}
              placeholder="URL Slug"
            />
            <div className="min-h-[200px] border rounded-md">
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
                      // Error is already handled in handleImageUpload
                    }
                  }
                }}
              />
              {currentSolution.imageUrl && (
                <img
                  src={currentSolution.imageUrl || "/placeholder.svg"}
                  alt="Preview"
                  className="w-full sm:w-20 h-auto sm:h-20 max-w-[200px] object-cover rounded mt-2 sm:mt-0"
                />
              )}
            </div>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default SolutionsTab
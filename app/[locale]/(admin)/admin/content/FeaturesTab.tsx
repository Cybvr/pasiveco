"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { featuresService } from "@/services/featuresService"
import { useEditor } from "@tiptap/react"
import { Eye, Trash2 } from "lucide-react"
import { uploadImage } from "@/services/cloudinaryService"
import { toast } from "@/hooks/use-toast"
import EditorContent from "./EditorContent"

interface Feature {
  id?: string
  title: string
  description: string
  content: string
  slug: string
  imageUrl?: string
}

interface FeaturesTabProps {
  editor: ReturnType<typeof useEditor> | null
}

const FeaturesTab: React.FC<FeaturesTabProps> = ({ editor }) => {
  const [features, setFeatures] = useState<Feature[]>([])
  const [loading, setLoading] = useState(true)
  const [currentFeature, setCurrentFeature] = useState<Feature | null>(null)

  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        const data = await featuresService.getAllFeatures()
        setFeatures(data)
      } catch (error) {
        console.error("Error fetching features:", error)
      }
      setLoading(false)
    }
    fetchFeatures()
  }, [])

  useEffect(() => {
    if (editor && currentFeature?.content) {
      editor.commands.setContent(currentFeature.content)
    }
  }, [currentFeature?.content, editor])

  const handleSave = async () => {
    if (!currentFeature || !editor) return
    try {
      const featureToSave = {
        ...currentFeature,
        content: editor.getHTML()
      }
      if (currentFeature.id) {
        await featuresService.updateFeature(currentFeature.id, featureToSave)
      } else {
        await featuresService.createFeature(featureToSave)
      }
      // Refresh the list
      const data = await featuresService.getAllFeatures()
      setFeatures(data)
      toast({
        title: "Success",
        description: `Feature "${currentFeature.title}" saved successfully.`,
      })
    } catch (error) {
      console.error("Error saving feature:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save feature.",
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
        await featuresService.deleteFeature(id)
        setFeatures(features.filter((feature) => feature.id !== id))
        if (currentFeature?.id === id) {
          setCurrentFeature(null)
          if (editor) editor.commands.clearContent()
        }
        toast({
          title: "Success",
          description: `Feature "${title}" deleted successfully.`,
        })
      } catch (error) {
        console.error("Error deleting feature:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to delete feature.",
        })
      }
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
      <div className="col-span-1 min-w-0 rounded-lg border p-4 md:col-span-4 md:mb-0">
        <h2 className="text-lg font-semibold mb-4">Features List</h2>
        <div className="space-y-4">
          <Button
            onClick={() => {
              setCurrentFeature({ title: "", description: "", content: "", slug: "" })
              if (editor) {
                editor.commands.setContent("")
              }
            }}
            className="w-full"
          >
            + Create New
          </Button>
          <div className="space-y-2">
            {features.map((feature) => (
              <Card key={feature.id} className="p-3 hover:bg-accent">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <h3
                    className="cursor-pointer break-words font-medium"
                    onClick={() => {
                      setCurrentFeature(null) // Reset first
                      setTimeout(() => setCurrentFeature(feature), 0) // Then set new item
                    }}
                  >
                    {feature.title}
                  </h3>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => window.open(`/features/${feature.slug}`, "_blank")}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDelete(feature.id!, feature.title)}
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
        <h2 className="text-lg font-semibold mb-4">Edit Feature</h2>
        {currentFeature && (
          <div className="space-y-4">
            <Input
              value={currentFeature.title}
              onChange={(e) => {
                const title = e.target.value
                const slug = title
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-")
                  .replace(/(^-|-$)/g, "")
                setCurrentFeature({ ...currentFeature, title, slug })
              }}
              placeholder="Title"
            />
            <Input
              value={currentFeature.description}
              onChange={(e) => setCurrentFeature({ ...currentFeature, description: e.target.value })}
              placeholder="Description"
            />
            <Input
              value={currentFeature.slug}
              onChange={(e) => setCurrentFeature({ ...currentFeature, slug: e.target.value })}
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
                      setCurrentFeature({ ...currentFeature, imageUrl })
                    } catch (error) {
                      // Error is already handled in handleImageUpload
                    }
                  }
                }}
              />
              {currentFeature.imageUrl && (
                <img
                  src={currentFeature.imageUrl || "/placeholder.svg"}
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

export default FeaturesTab
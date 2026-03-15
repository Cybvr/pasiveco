"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { blogService } from "@/services/blogService"
import { useEditor } from "@tiptap/react"
import { Eye, Trash2 } from "lucide-react"
import { uploadImage } from "@/services/cloudinaryService"
import { toast } from "@/hooks/use-toast"
import EditorContent from "./EditorContent"

interface BlogPost {
  id?: string
  title: string
  description: string
  content: string
  slug: string
  imageUrl?: string
}

interface BlogTabProps {
  editor: ReturnType<typeof useEditor> | null
}

const BlogTab: React.FC<BlogTabProps> = ({ editor }) => {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPost, setCurrentPost] = useState<BlogPost | null>(null)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await blogService.getAllPosts()
        setPosts(data)
      } catch (error) {
        console.error("Error fetching blog posts:", error)
      }
      setLoading(false)
    }
    fetchPosts()
      }, [])

      useEffect(() => {
        if (editor && currentPost?.content) {
          editor.commands.setContent(currentPost.content)
        }
      }, [currentPost?.content, editor])

      const handleSave = async () => {
        if (!currentPost || !editor) return
        try {
          const postToSave = {
            ...currentPost,
            content: editor.getHTML()
          }
          if (currentPost.id) {
            await blogService.updatePost(currentPost.id, postToSave)
          } else {
            await blogService.createPost(postToSave)
          }
          // Refresh the list
          const data = await blogService.getAllPosts()
          setPosts(data)
          toast({
            title: "Success",
            description: `Blog post "${currentPost.title}" saved successfully.`,
          })
        } catch (error) {
          console.error("Error saving blog post:", error)
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to save blog post.",
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
            await blogService.deletePost(id)
            setPosts(posts.filter((post) => post.id !== id))
            if (currentPost?.id === id) {
              setCurrentPost(null)
              if (editor) editor.commands.clearContent()
            }
            toast({
              title: "Success",
              description: `Blog post "${title}" deleted successfully.`,
            })
          } catch (error) {
            console.error("Error deleting blog post:", error)
            toast({
              variant: "destructive",
              title: "Error",
              description: "Failed to delete blog post.",
            })
          }
        }
      }

      return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="col-span-1 md:col-span-4 border rounded-lg p-4 mb-4 md:mb-0">
            <h2 className="text-lg font-semibold mb-4">Blog Posts</h2>
            <div className="space-y-4">
              <Button
                onClick={() => {
                  setCurrentPost({ title: "", description: "", content: "", slug: "" })
                  if (editor) {
                    editor.commands.setContent("")
                  }
                }}
                className="w-full"
              >
                + Create New
              </Button>
              <div className="space-y-2">
                {posts.map((post) => (
                  <Card key={post.id} className="p-3 hover:bg-accent">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                      <h3
                        className="font-medium cursor-pointer"
                        onClick={() => {
                          setCurrentPost(null) // Reset first
                          setTimeout(() => setCurrentPost(post), 0) // Then set new item
                        }}
                      >
                        {post.title}
                      </h3>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => window.open(`/blog/${post.slug}`, "_blank")}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDelete(post.id!, post.title)}
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
          <div className="col-span-1 md:col-span-8 border rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-4">Edit Post</h2>
            {currentPost && (
              <div className="space-y-4">
                <Input
                  value={currentPost.title}
                  onChange={(e) => {
                    const title = e.target.value
                    const slug = title
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/(^-|-$)/g, "")
                    setCurrentPost({ ...currentPost, title, slug })
                  }}
                  placeholder="Title"
                />
                <Input
                  value={currentPost.description}
                  onChange={(e) => setCurrentPost({ ...currentPost, description: e.target.value })}
                  placeholder="Description"
                />
                <Input
                  value={currentPost.slug}
                  onChange={(e) => setCurrentPost({ ...currentPost, slug: e.target.value })}
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
                          setCurrentPost({ ...currentPost, imageUrl })
                        } catch (error) {
                          // Error is already handled in handleImageUpload
                        }
                      }
                    }}
                  />
                  {currentPost.imageUrl && (
                    <img
                      src={currentPost.imageUrl || "/placeholder.svg"}
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

    export default BlogTab
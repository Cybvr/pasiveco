"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { blogService, type BlogPost } from "@/services/blogService"
import { useEditor } from "@tiptap/react"
import { Eye, Trash2, Sparkles, Loader2 } from "lucide-react"
import { uploadImage } from "@/services/cloudinaryService"
import { toast } from "@/hooks/use-toast"
import EditorContent from "./EditorContent"


interface BlogTabProps {
  editor: ReturnType<typeof useEditor> | null
}

const BlogTab: React.FC<BlogTabProps> = ({ editor }) => {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPost, setCurrentPost] = useState<BlogPost | null>(null)
  const [isGeneratingContent, setIsGeneratingContent] = useState(false)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await blogService.getAllPosts() as BlogPost[]
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
          const data = await blogService.getAllPosts() as BlogPost[]
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

      const handleGenerateAI = async () => {
        if (!currentPost?.title || !currentPost?.excerpt || !editor) {
          toast({
            variant: "destructive",
            title: "Missing Info",
            description: "Please provide a title and description first.",
          })
          return
        }

        setIsGeneratingContent(true)
        try {
          const response = await fetch("/api/generate-blog-content", {
            method: "POST",
            body: JSON.stringify({
              title: currentPost.title,
              description: currentPost.excerpt,
            }),
          })
          const data = await response.json()
          if (data.error) throw new Error(data.error)
          
          editor.commands.setContent(data.content)
          toast({
            title: "Content Generated",
            description: "AI has successfully generated your blog content.",
          })
        } catch (error: any) {
          console.error("AI Generation failed:", error)
          toast({
            variant: "destructive",
            title: "Generation Failed",
            description: error.message || "Failed to generate AI content.",
          })
        } finally {
          setIsGeneratingContent(false)
        }
      }

      return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
          <div className="col-span-1 min-w-0 rounded-lg border p-4 md:col-span-4 md:mb-0">
            <h2 className="text-lg font-semibold mb-4">Blog Posts</h2>
            <div className="space-y-4">
              <Button
                onClick={() => {
                  setCurrentPost({ title: "", excerpt: "", content: "", slug: "", image: "", date: new Date().toISOString() })
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
                        className="cursor-pointer break-words font-medium"
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
          <div className="col-span-1 min-w-0 rounded-lg border p-4 md:col-span-8">
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
                  value={currentPost.excerpt}
                  onChange={(e) => setCurrentPost({ ...currentPost, excerpt: e.target.value })}
                  placeholder="Description"
                />
                <Input
                  value={currentPost.slug}
                  onChange={(e) => setCurrentPost({ ...currentPost, slug: e.target.value })}
                  placeholder="URL Slug"
                />
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Post Content</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 text-primary"
                    onClick={handleGenerateAI}
                    disabled={isGeneratingContent || !currentPost.title || !currentPost.excerpt}
                  >
                    {isGeneratingContent ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                    Generate with AI
                  </Button>
                </div>
                <div className="min-h-[200px] border rounded-md">
                  <EditorContent editor={editor} />
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (file && currentPost) {
                        try {
                          const imageUrl = await handleImageUpload(file)
                          setCurrentPost({ ...currentPost, image: imageUrl, imageUrl })
                        } catch (error) {
                          // Error is already handled in handleImageUpload
                        }
                      }
                    }}
                  />
                  {(currentPost.imageUrl || currentPost.image) && (
                    <img
                      src={currentPost.imageUrl || currentPost.image || "/placeholder.svg"}
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
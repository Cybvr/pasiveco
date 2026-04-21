"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { blogService, type BlogPost } from "@/services/blogService"
import { useEditor } from "@tiptap/react"
import { Eye, Trash2, Sparkles, Loader2, Plus } from "lucide-react"
import { uploadImage } from "@/services/cloudinaryService"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import EditorContent from "./EditorContent"
import { AdminSidebarList } from "../components/AdminSidebarList"

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
    <div className="grid grid-cols-1 gap-4 md:grid-cols-12 h-[calc(100vh-140px)]">
      <div className="col-span-1 min-w-0 rounded-lg border p-4 md:col-span-4 md:mb-0 flex flex-col">
        <div className="flex items-center justify-between mb-4 px-1 shrink-0">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Blog</h3>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => {
              setCurrentPost({ title: "", excerpt: "", content: "", slug: "", image: "", date: new Date().toISOString() })
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
            items={posts}
            selectedId={currentPost?.id}
            onSelect={(post) => {
              setCurrentPost(null)
              setTimeout(() => setCurrentPost(post), 0)
            }}
            onDelete={(post) => handleDelete(post.id!, post.title)}
            getId={(post) => post.id!}
            getTitle={(post) => post.title}
            getSubtitle={(post) => (
              <p className="text-[10px] text-muted-foreground font-medium truncate">
                {post.slug}
              </p>
            )}
            renderActions={(post) => (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full hover:bg-background"
                onClick={(e) => {
                  e.stopPropagation()
                  window.open(`/blog/${post.slug}`, "_blank")
                }}
              >
                <Eye className="h-3.5 w-3.5" />
              </Button>
            )}
            loading={loading}
            loadingMessage="Loading posts..."
          />
        </div>
      </div>
      <div className="col-span-1 min-w-0 rounded-lg border md:col-span-8 bg-card flex flex-col overflow-hidden">
        {currentPost ? (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                className="text-lg font-bold border-none px-0 shadow-none focus-visible:ring-0"
              />
              <Input
                value={currentPost.excerpt}
                onChange={(e) => setCurrentPost({ ...currentPost, excerpt: e.target.value })}
                placeholder="Excerpt / Description"
                className="border-none px-0 shadow-none focus-visible:ring-0 text-sm text-muted-foreground"
              />
              <Input
                value={currentPost.slug}
                onChange={(e) => setCurrentPost({ ...currentPost, slug: e.target.value })}
                placeholder="URL Slug"
                className="h-7 text-[10px] w-fit bg-muted/50 border-none rounded-full px-3"
              />
              
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Post Content</h3>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 text-primary h-7 text-[10px] font-bold uppercase rounded-full border-primary/20 hover:bg-primary/5"
                  onClick={handleGenerateAI}
                  disabled={isGeneratingContent || !currentPost.title || !currentPost.excerpt}
                >
                  {isGeneratingContent ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Sparkles className="h-3 w-3" />
                  )}
                  AI Generate
                </Button>
              </div>
              
              <div className="min-h-[300px] border rounded-xl overflow-hidden bg-background">
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
                        // Error is already handled
                      }
                    }
                  }}
                  className="max-w-xs"
                />
                {(currentPost.imageUrl || currentPost.image) && (
                  <img
                    src={currentPost.imageUrl || currentPost.image || "/placeholder.svg"}
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
            <p className="text-sm font-medium">Select a blog post to edit or create a new one</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default BlogTab
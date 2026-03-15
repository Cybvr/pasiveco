"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { Image as TiptapImage } from "@tiptap/extension-image"
import Dropcursor from "@tiptap/extension-dropcursor"
import FeaturesTab from "./FeaturesTab"
import SolutionsTab from "./SolutionsTab"
import BlogTab from "./BlogTab"

export default function ContentManagementPage() {
  const [activeTab, setActiveTab] = useState("features")
  const editor = useEditor({
    extensions: [StarterKit, TiptapImage, Dropcursor],
  })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Content Management</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="solutions">Solutions</TabsTrigger>
          <TabsTrigger value="blog">Blog Posts</TabsTrigger>
        </TabsList>

        <TabsContent value="features" className="space-y-4">
          <FeaturesTab editor={editor} />
        </TabsContent>

        <TabsContent value="solutions" className="space-y-4">
          <SolutionsTab editor={editor} />
        </TabsContent>

        <TabsContent value="blog" className="space-y-4">
          <BlogTab editor={editor} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
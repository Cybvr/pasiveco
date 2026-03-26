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
import CommunityTab from "./CommunityTab"

export default function ContentManagementPage() {
  const [activeTab, setActiveTab] = useState("features")
  const editor = useEditor({
    extensions: [StarterKit, TiptapImage, Dropcursor],
  })

  return (
    <div className="w-full min-w-0 space-y-4 overflow-x-hidden">
      <h1 className="text-2xl font-bold">Content Management</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full min-w-0 space-y-4">
        <div className="w-full overflow-x-auto pb-1">
          <TabsList className="inline-flex min-w-max">
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="solutions">Solutions</TabsTrigger>
          <TabsTrigger value="blog">Blog Posts</TabsTrigger>
          <TabsTrigger value="communities">Communities</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="features" className="space-y-4">
          <FeaturesTab editor={editor} />
        </TabsContent>

        <TabsContent value="solutions" className="space-y-4">
          <SolutionsTab editor={editor} />
        </TabsContent>

        <TabsContent value="blog" className="space-y-4">
          <BlogTab editor={editor} />
        </TabsContent>

        <TabsContent value="communities" className="space-y-4">
          <CommunityTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
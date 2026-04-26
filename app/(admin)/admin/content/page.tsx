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
import ProductsTab from "./ProductsTab"
import JobsTab from "./JobsTab"

export default function ContentManagementPage() {
  const [activeTab, setActiveTab] = useState("features")
  const editor = useEditor({
    extensions: [StarterKit, TiptapImage, Dropcursor],
  })

  return (
    <div className="flex h-full w-full min-w-0 flex-col overflow-hidden">

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex h-full w-full min-w-0 flex-col gap-4 overflow-hidden">
        <div className="shrink-0 w-full overflow-x-auto pb-1">
          <TabsList className="inline-flex min-w-max">
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="solutions">Solutions</TabsTrigger>
            <TabsTrigger value="blog">Blog Posts</TabsTrigger>
            <TabsTrigger value="communities">Spaces</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="jobs">Jobs</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="features" className="mt-0 min-h-0 flex-1 overflow-hidden">
          <FeaturesTab editor={editor} />
        </TabsContent>

        <TabsContent value="solutions" className="mt-0 min-h-0 flex-1 overflow-hidden">
          <SolutionsTab editor={editor} />
        </TabsContent>

        <TabsContent value="blog" className="mt-0 min-h-0 flex-1 overflow-hidden">
          <BlogTab editor={editor} />
        </TabsContent>

        <TabsContent value="communities" className="mt-0 min-h-0 flex-1 overflow-hidden">
          <CommunityTab />
        </TabsContent>

        <TabsContent value="products" className="mt-0 min-h-0 flex-1 overflow-hidden">
          <ProductsTab />
        </TabsContent>

        <TabsContent value="jobs" className="mt-0 min-h-0 flex-1 overflow-hidden">
          <JobsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

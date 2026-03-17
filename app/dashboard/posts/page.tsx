'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export default function NewPostPage() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">New Post</h2>
        <p className="text-sm text-muted-foreground">Create a post for your audience.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Post details</CardTitle>
          <CardDescription>Add your title and content, then publish when ready.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input placeholder="Post title" />
          <Textarea placeholder="Write your post..." rows={8} />
          <div className="flex justify-end">
            <Button>Publish Post</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

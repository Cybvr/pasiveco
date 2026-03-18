'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { createSocialPost } from '@/lib/social-data'

export default function NewPostPage() {
  const router = useRouter()
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedMessage = message.trim()
    if (!trimmedMessage) return

    setIsSubmitting(true)
    const newPost = await createSocialPost(trimmedMessage, 'viewer-me')
    router.push(`/dashboard/posts/${newPost.id}`)
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <Button asChild variant="ghost" className="w-fit px-0 hover:bg-transparent">
        <Link href="/dashboard">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
      </Button>

      <form onSubmit={(event) => void handleSubmit(event)} className="rounded-2xl border bg-card p-4">
        <label htmlFor="new-post-message" className="sr-only">
          Message
        </label>
        <Textarea
          id="new-post-message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="What do you want to say?"
          className="min-h-[180px] resize-none border-0 px-0 text-sm shadow-none focus-visible:ring-0"
        />
        <div className="mt-4 flex justify-end">
          <Button type="submit" disabled={!message.trim() || isSubmitting}>
            Post
          </Button>
        </div>
      </form>
    </div>
  )
}

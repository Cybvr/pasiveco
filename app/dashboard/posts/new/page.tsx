'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/hooks/useAuth'
import { getUserProfile } from '@/services/userProfilesService'
import { createCustomFeedPost } from '@/lib/dashboard-feed'

export default function NewPostPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [author, setAuthor] = useState({
    id: 'current-user',
    name: 'Creator',
    handle: '@creator',
    image: '',
  })

  useEffect(() => {
    const loadAuthor = async () => {
      if (!user?.uid) {
        if (user?.displayName || user?.photoURL) {
          setAuthor({
            id: 'current-user',
            name: user.displayName || 'Creator',
            handle: '@creator',
            image: user.photoURL || '',
          })
        }
        return
      }

      try {
        const profile = await getUserProfile(user.uid)
        setAuthor({
          id: user.uid,
          name: profile?.displayName || user.displayName || 'Creator',
          handle: profile?.username ? `@${profile.username}` : '@creator',
          image: profile?.profilePicture || user.photoURL || '',
        })
      } catch (error) {
        console.error('Error loading new post author:', error)
      }
    }

    loadAuthor()
  }, [user])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedMessage = message.trim()
    if (!trimmedMessage) return

    setIsSubmitting(true)
    const newPost = createCustomFeedPost(trimmedMessage, author)
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

      <form onSubmit={handleSubmit} className="rounded-2xl border bg-card p-4">
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
            Send
          </Button>
        </div>
      </form>
    </div>
  )
}

'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Send } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/hooks/useAuth'
import { createSocialPost } from '@/lib/social-data'
import { getUserProfile } from '@/services/userProfilesService'

export default function NewPostPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [profilePicture, setProfilePicture] = useState<string>('')
  const [displayName, setDisplayName] = useState('You')

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.uid) return

      try {
        const profile = await getUserProfile(user.uid)
        setProfilePicture(profile?.profilePicture || user.photoURL || '')
        setDisplayName(profile?.displayName || user.displayName || 'You')
      } catch (error) {
        console.error('Error loading profile for new post:', error)
      }
    }

    void loadProfile()
  }, [user])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedMessage = message.trim()
    if (!trimmedMessage) return

    setIsSubmitting(true)
    const newPost = await createSocialPost(trimmedMessage, 'viewer-me')
    router.push(`/dashboard/posts/${newPost.id}`)
  }

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="flex min-h-[calc(100vh-8.5rem)] flex-col">
      <div className="flex flex-1 gap-3 rounded-none bg-background pt-2 sm:gap-4">
        <Avatar className="mt-1 h-11 w-11 shrink-0 border">
          <AvatarImage src={profilePicture} alt={displayName} />
          <AvatarFallback>{displayName.slice(0, 1).toUpperCase()}</AvatarFallback>
        </Avatar>

        <div className="flex min-h-0 flex-1 flex-col gap-4">
          <label htmlFor="new-post-message" className="sr-only">
            Message
          </label>
          <Textarea
            id="new-post-message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="What do you want to say?"
            className="min-h-[calc(100vh-13rem)] flex-1 resize-none border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0"
          />
          <div className="flex justify-end pb-4">
            <Button type="submit" disabled={!message.trim() || isSubmitting} className="gap-2">
              <Send className="h-4 w-4" />
              Post
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}

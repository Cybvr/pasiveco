import React, { useMemo, useState } from 'react'
import { Check, Copy, Facebook, Instagram, Linkedin, Share2, Twitter, X } from 'lucide-react'

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  profileUrl?: string
  profileData?: { username?: string }
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, profileUrl: propProfileUrl, profileData }) => {
  const [copied, setCopied] = useState(false)

  const finalShareUrl = useMemo(() => {
    if (propProfileUrl) return propProfileUrl
    if (typeof window === 'undefined') return ''

    const cleanUsername = profileData?.username?.replace(/^@/, '').trim()
    return cleanUsername ? `${window.location.origin}/${cleanUsername}` : window.location.href
  }, [profileData?.username, propProfileUrl])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(finalShareUrl)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check out my profile',
          url: finalShareUrl,
        })
        return
      } catch (error) {
        console.error('Share failed:', error)
      }
    }

    await handleCopy()
  }

  const handleSocialShare = (platform: 'twitter' | 'facebook' | 'linkedin' | 'instagram') => {
    const encodedUrl = encodeURIComponent(finalShareUrl)
    const text = encodeURIComponent('Check out my profile')

    const urls = {
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${text}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      instagram: `https://www.instagram.com/`,
    }

    window.open(urls[platform], '_blank', 'width=600,height=400')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative mx-4 w-full max-w-sm rounded-2xl border border-border bg-background p-5 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-base font-semibold">Share</h2>
            <p className="text-sm text-muted-foreground">Copy your link or share it directly.</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-muted transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => void handleShare()}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Share2 className="h-4 w-4" />
            Share profile
          </button>

          <div className="flex justify-center gap-3">
            <button onClick={() => handleSocialShare('twitter')} className="rounded-lg bg-blue-500 p-2 text-white transition-colors hover:bg-blue-600"><Twitter className="h-4 w-4" /></button>
            <button onClick={() => handleSocialShare('facebook')} className="rounded-lg bg-blue-600 p-2 text-white transition-colors hover:bg-blue-700"><Facebook className="h-4 w-4" /></button>
            <button onClick={() => handleSocialShare('linkedin')} className="rounded-lg bg-blue-700 p-2 text-white transition-colors hover:bg-blue-800"><Linkedin className="h-4 w-4" /></button>
            <button onClick={() => handleSocialShare('instagram')} className="rounded-lg bg-pink-500 p-2 text-white transition-colors hover:bg-pink-600"><Instagram className="h-4 w-4" /></button>
          </div>

          <div className="rounded-xl bg-muted p-3">
            <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">Profile link</p>
            <div className="flex items-center gap-2">
              <span className="flex-1 truncate text-xs text-foreground">{finalShareUrl}</span>
              <button
                onClick={() => void handleCopy()}
                className="flex items-center gap-1 rounded-lg bg-background px-2 py-1 text-xs font-medium transition-colors hover:bg-accent"
              >
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ShareModal

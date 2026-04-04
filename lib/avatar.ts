import { createAvatar } from '@dicebear/core'
import { bigSmile } from '@dicebear/collection'

export function getDicebearAvatar(seed: string) {
  const normalizedSeed = seed.trim() || 'pasive-user'
  const avatar = createAvatar(bigSmile, {
    seed: normalizedSeed,
  })
  
  const svg = avatar.toString()
  // base64 is universally supported; unescape+encodeURIComponent handles any Unicode chars
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`
}

export function getDisplayAvatar({
  image,
  displayName,
  handle,
}: {
  image?: string | null
  displayName?: string | null
  handle?: string | null
}) {
  if (image?.trim()) {
    return image
  }

  return getDicebearAvatar(displayName || handle || 'pasive-user')
}

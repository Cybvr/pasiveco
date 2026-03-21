import { createAvatar } from '@dicebear/core'
import { glass } from '@dicebear/collection'

export function getDicebearAvatar(seed: string) {
  const normalizedSeed = seed.trim() || 'pasive-user'
  const avatar = createAvatar(glass, {
    seed: normalizedSeed,
  })

  return avatar.toDataUri()
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

export function getDicebearAvatar(seed: string, style: 'initials' | 'shapes' = 'initials') {
  const normalizedSeed = seed.trim() || 'pasive-user'
  return `https://api.dicebear.com/9.x/${style}/svg?seed=${encodeURIComponent(normalizedSeed)}`
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

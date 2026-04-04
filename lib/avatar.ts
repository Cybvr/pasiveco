export function getDicebearAvatar(seed: string) {
  const normalizedSeed = encodeURIComponent(seed.trim() || 'pasive-user')
  return `https://api.dicebear.com/9.x/big-smile/svg?seed=${normalizedSeed}`
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

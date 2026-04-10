export const POPULAR_COMMUNITY_CATEGORIES = [
  "Business",
  "Creators",
  "Design",
  "Education",
  "Faith",
  "Fashion",
  "Fitness",
  "Gaming",
  "Health",
  "Marketing",
  "Music",
  "Networking",
  "Personal Growth",
  "Technology",
  "Travel",
] as const

export const normalizeCommunityTags = (value: string | string[]) => {
  const source = Array.isArray(value) ? value.join(",") : value

  return Array.from(
    new Set(
      source
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        .map((item) => item.replace(/^#/, ""))
    )
  )
}

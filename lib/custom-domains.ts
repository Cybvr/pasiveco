export type CustomDomainStatus = "pending" | "active" | "error"

export interface DomainVerificationRecord {
  type: string
  domain: string
  value: string
  reason?: string
}

export interface CustomDomainRecord {
  id?: string
  domain: string
  userId: string
  username: string
  status: CustomDomainStatus
  verified: boolean
  verification?: DomainVerificationRecord[]
  error?: string | null
  createdAt?: unknown
  updatedAt?: unknown
  verifiedAt?: unknown
}

const blockedHostnames = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "pasive.co",
  "www.pasive.co",
])

export function normalizeCustomDomain(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\.(?=www\.)/, "")
    .split("/")[0]
    .replace(/:\d+$/, "")
    .replace(/\.$/, "")
}

export function validateCustomDomain(input: string) {
  const domain = normalizeCustomDomain(input)

  if (!domain) return { domain, error: "Enter a domain." }
  if (blockedHostnames.has(domain)) return { domain, error: "Use a domain you own, not Pasive's main domain." }
  if (domain.endsWith(".vercel.app")) return { domain, error: "Use your own domain, not a vercel.app domain." }
  if (domain.includes("_")) return { domain, error: "Domains cannot contain underscores." }
  if (!domain.includes(".")) return { domain, error: "Enter a full domain, like yourbrand.com." }
  if (domain.length > 253) return { domain, error: "That domain is too long." }

  const labels = domain.split(".")
  const valid = labels.every((label) =>
    label.length > 0 &&
    label.length <= 63 &&
    /^[a-z0-9-]+$/.test(label) &&
    !label.startsWith("-") &&
    !label.endsWith("-")
  )

  if (!valid) return { domain, error: "Enter a valid domain, like yourbrand.com." }

  return { domain, error: null }
}

export function isPlatformHostname(hostname: string) {
  const host = normalizeCustomDomain(hostname)
  return (
    blockedHostnames.has(host) ||
    host.endsWith(".localhost") ||
    host.endsWith(".vercel.app") ||
    host.endsWith(".pasive.co")
  )
}

export function getDomainDocId(domain: string) {
  return normalizeCustomDomain(domain)
}

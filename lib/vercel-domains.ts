import "server-only"

import type { DomainVerificationRecord } from "@/lib/custom-domains"

interface VercelDomainResponse {
  name: string
  apexName?: string
  projectId?: string
  verified?: boolean
  verification?: DomainVerificationRecord[]
  error?: {
    code?: string
    message?: string
  }
}

const VERCEL_API_BASE = "https://api.vercel.com"

function getVercelConfig() {
  return {
    token: process.env.VERCEL_TOKEN,
    projectId: process.env.VERCEL_PROJECT_ID,
    teamId: process.env.VERCEL_TEAM_ID,
  }
}

function getVercelUrl(path: string) {
  const { teamId } = getVercelConfig()
  const url = new URL(`${VERCEL_API_BASE}${path}`)
  if (teamId) url.searchParams.set("teamId", teamId)
  return url
}

async function vercelRequest<T>(path: string, init: RequestInit = {}) {
  const { token } = getVercelConfig()

  if (!token || !getVercelConfig().projectId) {
    throw new Error("Missing Vercel config. Add VERCEL_TOKEN and VERCEL_PROJECT_ID.")
  }

  const response = await fetch(getVercelUrl(path), {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  })
  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const message = data?.error?.message || data?.message || "Vercel request failed."
    const error = new Error(message) as Error & { status?: number; data?: unknown }
    error.status = response.status
    error.data = data
    throw error
  }

  return data as T
}

export async function addProjectDomain(domain: string) {
  const { projectId } = getVercelConfig()
  return vercelRequest<VercelDomainResponse>(`/v10/projects/${projectId}/domains`, {
    method: "POST",
    body: JSON.stringify({ name: domain, gitBranch: null }),
  })
}

export async function getProjectDomain(domain: string) {
  const { projectId } = getVercelConfig()
  return vercelRequest<VercelDomainResponse>(`/v9/projects/${projectId}/domains/${encodeURIComponent(domain)}`)
}

export async function verifyProjectDomain(domain: string) {
  const { projectId } = getVercelConfig()
  return vercelRequest<VercelDomainResponse>(`/v9/projects/${projectId}/domains/${encodeURIComponent(domain)}/verify`, {
    method: "POST",
  })
}

export async function removeProjectDomain(domain: string) {
  const { projectId } = getVercelConfig()
  return vercelRequest<{ name?: string }>(`/v9/projects/${projectId}/domains/${encodeURIComponent(domain)}`, {
    method: "DELETE",
  })
}

export async function addOrGetProjectDomain(domain: string) {
  try {
    return await addProjectDomain(domain)
  } catch (error) {
    const status = (error as Error & { status?: number }).status
    if (status === 400 || status === 409) {
      return getProjectDomain(domain)
    }
    throw error
  }
}

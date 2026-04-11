import "server-only"

import { auth } from "@/lib/firebase-admin"
import { cookies, headers } from "next/headers"

export interface AuthenticatedUser {
  uid: string
  email: string | null
}

export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  const cookieStore = await cookies()
  const headersList = await headers()
  const sessionToken = cookieStore.get("session")?.value
  const bearerToken = headersList.get("authorization")?.replace(/^Bearer\s+/i, "").trim()
  const idToken = bearerToken || sessionToken

  if (!idToken) return null

  try {
    const decoded = await auth.verifyIdToken(idToken)
    return {
      uid: decoded.uid,
      email: decoded.email ?? null,
    }
  } catch (error) {
    console.error("Failed to verify Firebase session:", error)
    return null
  }
}

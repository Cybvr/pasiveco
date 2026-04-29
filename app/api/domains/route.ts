import { NextRequest, NextResponse } from "next/server"
import { FieldValue } from "firebase-admin/firestore"
import { db } from "@/lib/firebase-admin"
import { getAuthenticatedUser } from "@/lib/server-auth"
import { getDomainDocId, validateCustomDomain } from "@/lib/custom-domains"
import { sanitizeUsername } from "@/lib/username"
import { addOrGetProjectDomain } from "@/lib/vercel-domains"

export async function GET() {
  const authUser = await getAuthenticatedUser()
  if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

  const snapshot = await db
    .collection("customDomains")
    .where("userId", "==", authUser.uid)
    .get()

  const domains = snapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }))
    .sort((a: any, b: any) => {
      const aTime = typeof a.createdAt?.toMillis === "function" ? a.createdAt.toMillis() : 0
      const bTime = typeof b.createdAt?.toMillis === "function" ? b.createdAt.toMillis() : 0
      return bTime - aTime
    })
  return NextResponse.json({ domains })
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser()
    if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

    const body = await request.json().catch(() => ({}))
    const { domain, error } = validateCustomDomain(String(body?.domain || ""))
    if (error) return NextResponse.json({ error }, { status: 400 })

    const userSnap = await db.collection("users").doc(authUser.uid).get()
    const user = userSnap.exists ? userSnap.data() : null
    const username = sanitizeUsername(String(user?.username || user?.slug || ""))

    if (!username) {
      return NextResponse.json({ error: "Set your Pasive username before connecting a domain." }, { status: 400 })
    }

    const domainId = getDomainDocId(domain)
    const domainRef = db.collection("customDomains").doc(domainId)
    const existing = await domainRef.get()

    if (existing.exists && existing.data()?.userId !== authUser.uid) {
      return NextResponse.json({ error: "That domain is already connected to another Pasive account." }, { status: 409 })
    }

    const vercelDomain = await addOrGetProjectDomain(domain)
    const verified = Boolean(vercelDomain.verified)
    const status = verified ? "active" : "pending"

    await domainRef.set(
      {
        domain,
        userId: authUser.uid,
        username,
        status,
        verified,
        verification: vercelDomain.verification || [],
        error: null,
        updatedAt: FieldValue.serverTimestamp(),
        createdAt: existing.exists ? existing.data()?.createdAt || FieldValue.serverTimestamp() : FieldValue.serverTimestamp(),
        ...(verified ? { verifiedAt: FieldValue.serverTimestamp() } : {}),
      },
      { merge: true }
    )

    return NextResponse.json({
      domain: {
        id: domainId,
        domain,
        userId: authUser.uid,
        username,
        status,
        verified,
        verification: vercelDomain.verification || [],
      },
    })
  } catch (error) {
    console.error("Create custom domain error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to connect domain." },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from "next/server"
import { FieldValue } from "firebase-admin/firestore"
import { db } from "@/lib/firebase-admin"
import { getAuthenticatedUser } from "@/lib/server-auth"
import { getDomainDocId, validateCustomDomain } from "@/lib/custom-domains"
import { getProjectDomain, verifyProjectDomain } from "@/lib/vercel-domains"

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ domain: string }> }
) {
  try {
    const authUser = await getAuthenticatedUser()
    if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

    const { domain: rawDomain } = await params
    const { domain, error } = validateCustomDomain(decodeURIComponent(rawDomain))
    if (error) return NextResponse.json({ error }, { status: 400 })

    const domainRef = db.collection("customDomains").doc(getDomainDocId(domain))
    const snapshot = await domainRef.get()

    if (!snapshot.exists || snapshot.data()?.userId !== authUser.uid) {
      return NextResponse.json({ error: "Domain not found." }, { status: 404 })
    }

    let vercelDomain = await getProjectDomain(domain)

    if (!vercelDomain.verified) {
      vercelDomain = await verifyProjectDomain(domain).catch(async () => getProjectDomain(domain))
    }

    const verified = Boolean(vercelDomain.verified)
    const status = verified ? "active" : "pending"

    await domainRef.set(
      {
        status,
        verified,
        verification: vercelDomain.verification || [],
        error: null,
        updatedAt: FieldValue.serverTimestamp(),
        ...(verified ? { verifiedAt: FieldValue.serverTimestamp() } : {}),
      },
      { merge: true }
    )

    return NextResponse.json({
      domain: {
        id: getDomainDocId(domain),
        ...snapshot.data(),
        status,
        verified,
        verification: vercelDomain.verification || [],
      },
    })
  } catch (error) {
    console.error("Verify custom domain error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to verify domain." },
      { status: 500 }
    )
  }
}

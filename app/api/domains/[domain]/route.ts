import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/firebase-admin"
import { getAuthenticatedUser } from "@/lib/server-auth"
import { getDomainDocId, validateCustomDomain } from "@/lib/custom-domains"
import { removeProjectDomain } from "@/lib/vercel-domains"

export async function DELETE(
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

    await removeProjectDomain(domain).catch((error) => {
      console.warn("Unable to remove domain from Vercel:", error)
    })
    await domainRef.delete()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete custom domain error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to remove domain." },
      { status: 500 }
    )
  }
}

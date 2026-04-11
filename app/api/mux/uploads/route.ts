import { NextRequest, NextResponse } from "next/server"

import { db } from "@/lib/firebase-admin"
import { getAuthenticatedUser } from "@/lib/server-auth"
import { assertMuxConfigured, createMuxPassthrough, mux } from "@/lib/mux"

interface CreateUploadBody {
  lessonId?: string
  productId?: string
  productSlug?: string
}

export async function POST(request: NextRequest) {
  try {
    assertMuxConfigured()

    const user = await getAuthenticatedUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = (await request.json()) as CreateUploadBody
    const lessonId = body.lessonId?.trim()
    const productId = body.productId?.trim()
    const productSlug = body.productSlug?.trim()

    if (!lessonId) {
      return NextResponse.json({ error: "Lesson ID is required" }, { status: 400 })
    }

    if (!productId && !productSlug) {
      return NextResponse.json({ error: "Product identifier is required" }, { status: 400 })
    }

    if (productId) {
      const productSnap = await db.collection("products").doc(productId).get()
      if (!productSnap.exists) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 })
      }

      const product = productSnap.data()
      if (product?.userId !== user.uid) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    }

    const upload = await mux!.video.uploads.create({
      cors_origin: request.nextUrl.origin,
      new_asset_settings: {
        playback_policies: ["signed"],
        passthrough: createMuxPassthrough({
          userId: user.uid,
          lessonId,
          productId,
          productSlug,
        }),
      },
    })

    return NextResponse.json({
      uploadId: upload.id,
      uploadUrl: upload.url,
      status: upload.status,
    })
  } catch (error) {
    console.error("Error creating Mux upload:", error)
    return NextResponse.json({ error: "Failed to create upload" }, { status: 500 })
  }
}

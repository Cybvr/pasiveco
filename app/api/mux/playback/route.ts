import { NextRequest, NextResponse } from "next/server"

import { db } from "@/lib/firebase-admin"
import { assertMuxSigningConfigured, mux } from "@/lib/mux"
import { getAuthenticatedUser } from "@/lib/server-auth"
import type { Product } from "@/services/productsService"

interface PlaybackBody {
  lessonId?: string
  productId?: string
}

function findLesson(product: Product, lessonId: string) {
  const lessons = product.details?.lessons || []
  return lessons.find((lesson) => lesson.id === lessonId) || null
}

export async function POST(request: NextRequest) {
  try {
    assertMuxSigningConfigured()

    const user = await getAuthenticatedUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = (await request.json()) as PlaybackBody
    const productId = body.productId?.trim()
    const lessonId = body.lessonId?.trim()

    if (!productId || !lessonId) {
      return NextResponse.json({ error: "Product ID and lesson ID are required" }, { status: 400 })
    }

    const productSnap = await db.collection("products").doc(productId).get()
    if (!productSnap.exists) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    const product = { id: productSnap.id, ...productSnap.data() } as Product
    const lesson = findLesson(product, lessonId)

    if (!lesson?.muxPlaybackId) {
      return NextResponse.json({ error: "Mux playback is not ready for this lesson" }, { status: 404 })
    }

    const isSeller = product.userId === user.uid
    let hasAccess = isSeller

    if (!hasAccess && user.email) {
      const txSnapshot = await db
        .collection("transactions")
        .where("customerEmail", "==", user.email)
        .where("productId", "==", productId)
        .where("status", "==", "success")
        .limit(1)
        .get()

      hasAccess = !txSnapshot.empty
    }

    if (!hasAccess) {
      return NextResponse.json({ error: "You do not have access to this lesson" }, { status: 403 })
    }

    const tokens = await mux!.jwt.signPlaybackId(lesson.muxPlaybackId, {
      expiration: "1h",
      type: ["playback", "thumbnail", "storyboard"],
    })

    return NextResponse.json({
      playbackId: lesson.muxPlaybackId,
      tokens,
    })
  } catch (error) {
    console.error("Error signing Mux playback:", error)
    return NextResponse.json({ error: "Failed to create playback session" }, { status: 500 })
  }
}

import { headers } from "next/headers"
import { NextResponse } from "next/server"

import { db } from "@/lib/firebase-admin"
import { assertMuxWebhookConfigured, mux, parseMuxPassthrough } from "@/lib/mux"
import type { Product, ProductLesson } from "@/services/productsService"

async function resolveProduct(productId?: string, productSlug?: string, userId?: string) {
  if (productId) {
    const snap = await db.collection("products").doc(productId).get()
    if (snap.exists) {
      return { id: snap.id, ...snap.data() } as Product
    }
  }

  if (!productSlug || !userId) return null

  const snapshot = await db
    .collection("products")
    .where("slug", "==", productSlug)
    .where("userId", "==", userId)
    .limit(1)
    .get()

  if (snapshot.empty) return null

  const doc = snapshot.docs[0]
  return { id: doc.id, ...doc.data() } as Product
}

function updateLesson(
  lessons: ProductLesson[],
  lessonId: string,
  updates: Partial<ProductLesson>,
) {
  return lessons.map((lesson) => {
    if (lesson.id !== lessonId) return lesson
    return {
      ...lesson,
      ...updates,
    }
  })
}

export async function POST(request: Request) {
  try {
    assertMuxWebhookConfigured()

    const body = await request.text()
    const headersList = await headers()
    const event = mux!.webhooks.unwrap(body, headersList)

    if (
      event.type !== "video.asset.ready" &&
      event.type !== "video.asset.errored" &&
      event.type !== "video.asset.created"
    ) {
      return NextResponse.json({ received: true })
    }

    const asset = event.data as any
    const passthrough = parseMuxPassthrough(asset.passthrough)

    if (!passthrough?.lessonId || !passthrough.userId) {
      return NextResponse.json({ received: true })
    }

    const product = await resolveProduct(passthrough.productId, passthrough.productSlug, passthrough.userId)
    if (!product?.id) {
      return NextResponse.json({ received: true })
    }

    const lessons = product.details?.lessons || []
    if (!lessons.some((lesson) => lesson.id === passthrough.lessonId)) {
      return NextResponse.json({ received: true })
    }

    const playbackId = asset.playback_ids?.[0]?.id
    const muxStatus =
      event.type === "video.asset.ready"
        ? "ready"
        : event.type === "video.asset.errored"
          ? "errored"
          : "asset_created"

    const updatedLessons = updateLesson(lessons, passthrough.lessonId, {
      muxAssetId: asset.id,
      muxPlaybackId: playbackId,
      muxStatus,
      muxError: asset.errors?.messages?.join(", ") || undefined,
      duration: asset.duration,
    })

    await db.collection("products").doc(product.id).update({
      details: {
        ...(product.details || {}),
        lessons: updatedLessons,
      },
    })

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Error processing Mux webhook:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 400 })
  }
}

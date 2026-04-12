"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import MuxPlayer from "@mux/mux-player-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2, Receipt } from "lucide-react"
import { db } from "@/lib/firebase"
import { doc, getDoc, Timestamp } from "firebase/firestore"
import { Transaction } from "@/types/transaction"
import { formatCurrency } from "@/utils/currency"
import { useAuth } from "@/hooks/useAuth"
import { getProduct, Product } from "@/services/productsService"
import { ExternalLink, FileText, Play, Video } from "lucide-react"

function formatDate(val: any) {
  if (!val) return "—"
  if (val instanceof Timestamp) return val.toDate().toLocaleString()
  if (val?.toDate) return val.toDate().toLocaleString()
  return String(val)
}

export default function PurchaseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { user } = useAuth()
  const [transaction, setTransaction] = useState<Transaction | null>(null)
  const [product, setProduct] = useState<Product | null>(null)
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null)
  const [muxPlayback, setMuxPlayback] = useState<any>(null)
  const [muxLoading, setMuxLoading] = useState(false)
  const [muxError, setMuxError] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!id || !user?.email) return
    const fetchTx = async () => {
      try {
        const docRef = doc(db, "transactions", id)
        const snap = await getDoc(docRef)
        if (!snap.exists()) {
          setError("Order not found.")
          return
        }

        const tx = { id: snap.id, ...snap.data() } as Transaction
        if (tx.customerEmail !== user.email) {
          setError("You don't have access to this order.")
          return
        }

        setTransaction(tx)

        // Fetch the product as well to show its digital assets
        if (tx.productId) {
          const p = await getProduct(tx.productId)
          setProduct(p)
          const firstMuxLesson = p?.details?.lessons?.find((lesson) => lesson.muxPlaybackId || lesson.muxUploadId)
          if (firstMuxLesson?.id) {
            setActiveLessonId(firstMuxLesson.id)
          }
        }
      } catch (e: any) {
        setError(e.message || "Failed to load order.")
      } finally {
        setLoading(false)
      }
    }
    void fetchTx()
  }, [id, user?.email])

  useEffect(() => {
    const loadMuxPlayback = async () => {
      if (!product?.id || !activeLessonId) {
        setMuxPlayback(null)
        setMuxError("")
        return
      }

      const lesson = product.details?.lessons?.find((item) => item.id === activeLessonId)
      if (!lesson?.muxPlaybackId) {
        setMuxPlayback(null)
        setMuxError("")
        return
      }

      setMuxLoading(true)
      setMuxError("")

      try {
        const response = await fetch("/api/mux/playback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: product.id,
            lessonId: activeLessonId,
          }),
        })

        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.error || "Failed to load video")
        }

        setMuxPlayback(data)
      } catch (playbackError: any) {
        setMuxPlayback(null)
        setMuxError(playbackError.message || "Failed to load video")
      } finally {
        setMuxLoading(false)
      }
    }

    void loadMuxPlayback()
  }, [activeLessonId, product?.id, product?.details?.lessons])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-start gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="min-w-0">
          <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
            <Receipt className="h-5 w-5 text-muted-foreground" />
            Order Details
          </h1>
          <p className="break-all font-mono text-xs text-muted-foreground">{id}</p>
        </div>
      </div>

      {error ? (
        <Card>
          <CardHeader>
            <CardTitle>Details unavailable</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">{error}</CardContent>
        </Card>
      ) : transaction ? (
        <>
          {/* Your Access Section (Digital Assets) */}
          {transaction.status === "success" && product && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2 text-primary">
                  <Play className="h-5 w-5 fill-primary" />
                  Your Access
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {product.details?.fileUrl && (
                  <div className="flex flex-col gap-2 p-4 rounded-xl border bg-background shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{product.details.fileName || "Digital Download"}</p>
                        <p className="text-xs text-muted-foreground">Ready to download</p>
                      </div>
                      <a href={product.details.fileUrl} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" className="gap-2">
                          <ExternalLink className="h-4 w-4" />
                          Download
                        </Button>
                      </a>
                    </div>
                  </div>
                )}

                {product.details?.videoLink && (
                  <div className="flex flex-col gap-3 p-4 rounded-xl border bg-background shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-50 rounded-lg">
                        <Video className="h-5 w-5 text-red-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">Access Link</p>
                        <p className="text-xs text-muted-foreground">Click to view/access your content</p>
                      </div>
                    </div>
                    <a href={product.details.videoLink} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" className="w-full gap-2 border-primary/20 hover:bg-primary/5">
                        <ExternalLink className="h-4 w-4" />
                        Go to Access Link
                      </Button>
                    </a>
                  </div>
                )}

                {product.details?.lessons && product.details.lessons.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-sm font-bold px-1">Course Content</p>
                    {activeLessonId && (
                      <div className="overflow-hidden rounded-xl border bg-background">
                        {muxLoading ? (
                          <div className="flex aspect-video items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                          </div>
                        ) : muxPlayback?.playbackId ? (
                          <MuxPlayer
                            className="aspect-video w-full"
                            playbackId={muxPlayback.playbackId}
                            tokens={muxPlayback.tokens}
                            metadata={{
                              video_title: product.name,
                              viewer_user_id: user?.uid || "guest",
                            }}
                          />
                        ) : activeLessonId ? (
                          <div className="flex aspect-video items-center justify-center px-4 text-sm text-muted-foreground">
                            {muxError || "This lesson video is still processing."}
                          </div>
                        ) : null}
                      </div>
                    )}
                    <div className="grid gap-2">
                      {product.details.lessons.map((lesson, idx) => (
                        <div key={lesson.id || idx} className="flex items-center gap-3 p-3 rounded-lg border bg-background text-sm">
                          <span className="text-xs font-mono text-muted-foreground">0{idx + 1}</span>
                          <span className="flex-1 font-medium">{lesson.title}</span>
                          {lesson.muxPlaybackId || lesson.muxUploadId ? (
                            <Button
                              size="sm"
                              variant={activeLessonId === lesson.id ? "default" : "ghost"}
                              className="h-8 gap-2"
                              onClick={() => setActiveLessonId(lesson.id || null)}
                              disabled={!lesson.id}
                            >
                              <Play className="h-3 w-3" />
                              {lesson.muxPlaybackId ? "Play" : "Processing"}
                            </Button>
                          ) : lesson.videoUrl ? (
                            <a href={lesson.videoUrl} target="_blank" rel="noopener noreferrer">
                              <Button size="sm" variant="ghost" className="h-8 gap-2">
                                <Play className="h-3 w-3" />
                                Watch
                              </Button>
                            </a>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!product.details?.fileUrl && !product.details?.videoLink && (!product.details?.lessons || product.details.lessons.length === 0) && (
                  <p className="text-sm text-muted-foreground py-2 italic text-center">
                    This order is verified. For physical goods or custom services, the seller will contact you.
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex flex-wrap items-center justify-between gap-2">
                <span>Order Summary</span>
                <Badge variant={
                  transaction.status === "success" ? "default" :
                  transaction.status === "pending" ? "outline" : "destructive"
                }>
                  {transaction.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
                <div className="min-w-0">
                  <p className="text-muted-foreground">Product</p>
                  <p className="break-words font-medium">{transaction.productName || "—"}</p>
                </div>
                <div className="min-w-0">
                  <p className="text-muted-foreground">Reference</p>
                  <p className="font-mono text-xs break-all">{transaction.reference || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Amount</p>
                  <p className="text-xl font-bold">{formatCurrency(transaction.amount, transaction.currency as any || "NGN")}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p className="font-medium">{formatDate(transaction.createdAt)}</p>
                </div>
                {transaction.variation && (
                  <div className="min-w-0">
                    <p className="text-muted-foreground">Variation</p>
                    <p className="break-words font-medium">{transaction.variation}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Purchase Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Item Price</span>
                <span>{formatCurrency(transaction.amount, transaction.currency as any || "NGN")}</span>
              </div>
              {transaction.couponDiscount > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Coupon Discount</span>
                  <span className="text-green-600">-{formatCurrency(transaction.couponDiscount, transaction.currency as any || "NGN")}</span>
                </div>
              )}
              {transaction.customCharge > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Additional Charge</span>
                  <span>{formatCurrency(transaction.customCharge, transaction.currency as any || "NGN")}</span>
                </div>
              )}
              <div className="flex justify-between border-t pt-2 font-semibold">
                <span>Total Paid</span>
                <span>{formatCurrency(transaction.amount, transaction.currency as any || "NGN")}</span>
              </div>
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  )
}

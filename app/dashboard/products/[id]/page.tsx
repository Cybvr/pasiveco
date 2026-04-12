"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Copy, Eye, Loader2, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import CreateTab from "../CreateTab"
import { useAuth } from "@/hooks/useAuth"
import { getProduct, getUserProducts, type Product } from "@/services/productsService"
import { getUser } from "@/services/userService"
import { getProductTypeLabel } from "@/lib/productTypes"
import { toast } from "sonner"

export default function DashboardProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [product, setProduct] = useState<Product | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [handle, setHandle] = useState("user")
  const [loading, setLoading] = useState(true)

  const publicProductUrl = useMemo(() => {
    if (!product || typeof window === "undefined") return ""
    const identifier = product.slug || product.id
    return identifier ? `${window.location.origin}/${handle}/product/${identifier}` : ""
  }, [handle, product])

  const loadProduct = async () => {
    if (!user?.uid || !id) return

    setLoading(true)
    try {
      const [fetchedProduct, allProducts, profile] = await Promise.all([
        getProduct(id),
        getUserProducts(user.uid),
        getUser(user.uid),
      ])

      if (!fetchedProduct || fetchedProduct.userId !== user.uid) {
        toast.error("Product not found")
        router.replace("/dashboard/products")
        return
      }

      const cleanHandle = (profile?.username || profile?.slug || (user as any)?.username || (user as any)?.slug || user.email?.split("@")[0])?.replace(/^@/, "") || "user"

      setProduct(fetchedProduct)
      setProducts(allProducts)
      setHandle(cleanHandle)
    } catch (error) {
      console.error("Error loading product:", error)
      toast.error("Failed to load product")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.replace("/auth/login")
      return
    }

    void loadProduct()
  }, [authLoading, id, user])

  const handleCopyLink = async () => {
    if (!publicProductUrl) return

    try {
      await navigator.clipboard.writeText(publicProductUrl)
      toast.success("Product link copied")
    } catch (error) {
      console.error("Failed to copy product link:", error)
      toast.error("Failed to copy link")
    }
  }

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!product) return null

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">{product.name}</h1>
              <Badge variant={product.status === "active" ? "default" : "secondary"}>
                {product.status}
              </Badge>
              <Badge variant="outline">{getProductTypeLabel(product.category)}</Badge>
            </div>

          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" className="gap-2" onClick={handleCopyLink}>
            <Copy className="h-4 w-4" />
            Copy link
          </Button>
          <Button asChild variant="outline" className="gap-2">
            <Link href={publicProductUrl || `/dashboard/products/${product.id}`} target="_blank">
              <Eye className="h-4 w-4" />
              Preview
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Package className="h-4 w-4" />
            Product details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CreateTab
            user={user}
            selectedCategory={null}
            existingProducts={products.filter((item) => item.id !== product.id)}
            mode="edit"
            productToEdit={product}
            onProductCreated={() => {
              void loadProduct()
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}

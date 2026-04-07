"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Loader2, PackagePlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import CreateTab from "../CreateTab"
import { useAuth } from "@/hooks/useAuth"
import { getUserProducts, type Product } from "@/services/productsService"
import { toast } from "sonner"

export default function NewProductPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.replace("/auth/login")
      return
    }

    const loadProducts = async () => {
      try {
        const allProducts = await getUserProducts(user.uid)
        setProducts(allProducts)
      } catch (error) {
        console.error("Error loading products:", error)
        toast.error("Failed to load products")
      } finally {
        setLoading(false)
      }
    }

    void loadProducts()
  }, [authLoading, router, user])

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="space-y-3">
        <Button variant="ghost" className="w-fit gap-2 px-0 hover:bg-transparent" onClick={() => router.push("/dashboard/products")}>
          <ArrowLeft className="h-4 w-4" />
          Back to products
        </Button>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">New product</h1>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <PackagePlus className="h-4 w-4" />
            Create product
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CreateTab
            user={user}
            selectedCategory={null}
            existingProducts={products}
            onProductCreated={() => {
              router.push("/dashboard/products")
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}

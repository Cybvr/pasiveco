"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { getAllUsers, type User } from "@/services/userService"
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  updateProduct,
  type Product,
  type ProductAvailabilitySlot,
  type ProductLesson,
} from "@/services/productsService"
import { PRODUCT_TYPE_OPTIONS, getProductTypeLabel, type ProductTypeId } from "@/lib/productTypes"
import { storage } from "@/lib/firebase"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { v4 as uuidv4 } from "uuid"
import { slugify } from "@/utils/slugify"
import { Loader2, Package, Plus, Search, Sparkles, Trash2, UploadCloud, Video, Image as ImageIcon, UserRound } from "lucide-react"
import { toast } from "sonner"

type LessonForm = ProductLesson
type AvailabilityForm = ProductAvailabilitySlot

type ProductFormState = {
  id?: string
  userId: string
  name: string
  slug: string
  description: string
  price: string
  currency: string
  category: ProductTypeId
  status: Product["status"]
  url: string
  thumbnail: string
  images: string[]
  affiliateEnabled: boolean
  affiliateCommission: string
  tags: string
  quantityAvailable: string
  eventDateTime: string
  eventLocation: string
  lessons: LessonForm[]
  dripSchedule: string
  enrollmentLimit: string
  fileName: string
  billingInterval: "monthly" | "yearly"
  perksText: string
  sessionLength: string
  availability: AvailabilityForm[]
  videoLink: string
  bundleProductIds: string[]
}

const EMPTY_FORM: ProductFormState = {
  userId: "",
  name: "",
  slug: "",
  description: "",
  price: "",
  currency: "NGN",
  category: "digital-download",
  status: "draft",
  url: "",
  thumbnail: "",
  images: [],
  affiliateEnabled: false,
  affiliateCommission: "20",
  tags: "",
  quantityAvailable: "",
  eventDateTime: "",
  eventLocation: "",
  lessons: [{ title: "", content: "", videoUrl: "" }],
  dripSchedule: "",
  enrollmentLimit: "",
  fileName: "",
  billingInterval: "monthly",
  perksText: "",
  sessionLength: "60",
  availability: [{ day: "monday", start: "", end: "" }],
  videoLink: "",
  bundleProductIds: [],
}

const DAYS: AvailabilityForm["day"][] = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]

const userLabel = (user: User) => {
  const primary = user.displayName?.trim() || user.username?.trim() || user.email
  const handle = user.username ? `@${user.username.replace(/^@/, "")}` : user.email
  return `${primary} (${handle})`
}

const mapProductToForm = (product: Product): ProductFormState => {
  const details = product.details || {}

  return {
    id: product.id,
    userId: product.userId || "",
    name: product.name || "",
    slug: product.slug || "",
    description: product.description || "",
    price: product.price?.toString?.() || "0",
    currency: product.currency || "NGN",
    category: (product.category as ProductTypeId) || "digital-download",
    status: product.status || "draft",
    url: product.url || "",
    thumbnail: product.thumbnail || "",
    images: Array.isArray(product.images) ? product.images : [],
    affiliateEnabled: Boolean(product.affiliateEnabled),
    affiliateCommission: String(product.affiliateCommission || 20),
    tags: Array.isArray(product.tags) ? product.tags.join(", ") : "",
    quantityAvailable: details.quantityAvailable ? String(details.quantityAvailable) : "",
    eventDateTime: details.eventDateTime || "",
    eventLocation: details.eventLocation || "",
    lessons: Array.isArray(details.lessons) && details.lessons.length > 0
      ? details.lessons.map((lesson) => ({
          title: lesson.title || "",
          content: lesson.content || "",
          videoUrl: lesson.videoUrl || "",
        }))
      : [{ title: "", content: "", videoUrl: "" }],
    dripSchedule: details.dripSchedule || "",
    enrollmentLimit: details.enrollmentLimit !== null && details.enrollmentLimit !== undefined ? String(details.enrollmentLimit) : "",
    fileName: details.fileName || "",
    billingInterval: details.billingInterval || "monthly",
    perksText: Array.isArray(details.perks) ? details.perks.join("\n") : "",
    sessionLength: details.sessionLength ? String(details.sessionLength) : "60",
    availability: Array.isArray(details.availability) && details.availability.length > 0
      ? details.availability.map((slot) => ({
          day: slot.day || "monday",
          start: slot.start || "",
          end: slot.end || "",
        }))
      : [{ day: "monday", start: "", end: "" }],
    videoLink: details.videoLink || "",
    bundleProductIds: Array.isArray(details.includedProducts)
      ? details.includedProducts.map((item) => item.id).filter(Boolean)
      : [],
  }
}

export default function ProductsTab() {
  const [products, setProducts] = useState<Product[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [generatingImage, setGeneratingImage] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentProduct, setCurrentProduct] = useState<ProductFormState | null>(null)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [downloadFile, setDownloadFile] = useState<File | null>(null)
  const [imageDragging, setImageDragging] = useState(false)
  const [fileDragging, setFileDragging] = useState(false)
  const imageInputRef = useRef<HTMLInputElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === currentProduct?.id) || null,
    [products, currentProduct?.id]
  )

  const filteredProducts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    if (!query) return products

    return products.filter((product) => {
      const owner = users.find((user) => user.id === product.userId)
      return [
        product.name,
        product.description,
        product.slug,
        product.category,
        owner?.displayName,
        owner?.username,
        owner?.email,
      ].some((value) => value?.toLowerCase().includes(query))
    })
  }, [products, searchTerm, users])

  const bundleCandidates = useMemo(
    () => products.filter((product) => product.id !== currentProduct?.id && product.category !== "bundle" && Boolean(product.id)),
    [products, currentProduct?.id]
  )

  const fetchData = async () => {
    try {
      setLoading(true)
      const [allProducts, allUsers] = await Promise.all([getAllProducts(), getAllUsers()])
      setProducts(allProducts)
      setUsers(allUsers)
    } catch (error) {
      console.error("Error fetching products:", error)
      toast.error("Failed to load products")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchData()
  }, [])

  const resetEditor = () => {
    setCurrentProduct({ ...EMPTY_FORM, userId: users[0]?.id || "" })
    setImageFile(null)
    setDownloadFile(null)
    if (imageInputRef.current) imageInputRef.current.value = ""
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const openNewProduct = () => {
    setCurrentProduct({ ...EMPTY_FORM, userId: users[0]?.id || "" })
    setImageFile(null)
    setDownloadFile(null)
  }

  const uploadFile = async (file: File, folder: string) => {
    const filename = `${uuidv4()}-${file.name}`
    const storageRef = ref(storage, `${folder}/${filename}`)
    await uploadBytes(storageRef, file, {
      contentType: file.type || "application/octet-stream",
    })
    return await getDownloadURL(storageRef)
  }

  const updateForm = <K extends keyof ProductFormState>(field: K, value: ProductFormState[K]) => {
    setCurrentProduct((prev) => (prev ? { ...prev, [field]: value } : prev))
  }

  const handleImageSelection = (file: File) => {
    setImageFile(file)
    const preview = URL.createObjectURL(file)
    setCurrentProduct((prev) => (prev ? { ...prev, thumbnail: preview } : prev))
  }

  const handleGenerateAIImage = async () => {
    if (!currentProduct?.name.trim()) {
      toast.error("Please enter a product title first")
      return
    }

    setGeneratingImage(true)
    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: currentProduct.name,
          productDescription: currentProduct.description || `A high quality product for ${currentProduct.name}`,
        }),
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok || !data.base64Image) {
        throw new Error(data.error || "Image generation failed")
      }

      const imageResponse = await fetch(`data:image/jpeg;base64,${data.base64Image}`)
      const blob = await imageResponse.blob()
      const file = new File([blob], `ai-gen-${uuidv4()}.jpg`, { type: "image/jpeg" })
      handleImageSelection(file)
      toast.success("AI image generated")
    } catch (error) {
      console.error("Error generating product image:", error)
      toast.error(error instanceof Error ? error.message : "Failed to generate image")
    } finally {
      setGeneratingImage(false)
    }
  }

  const addLesson = () => {
    setCurrentProduct((prev) => prev ? { ...prev, lessons: [...prev.lessons, { title: "", content: "", videoUrl: "" }] } : prev)
  }

  const updateLesson = (index: number, field: keyof LessonForm, value: string) => {
    setCurrentProduct((prev) => prev ? {
      ...prev,
      lessons: prev.lessons.map((lesson, lessonIndex) => lessonIndex === index ? { ...lesson, [field]: value } : lesson),
    } : prev)
  }

  const removeLesson = (index: number) => {
    setCurrentProduct((prev) => prev ? {
      ...prev,
      lessons: prev.lessons.filter((_, lessonIndex) => lessonIndex !== index),
    } : prev)
  }

  const addAvailabilitySlot = () => {
    setCurrentProduct((prev) => prev ? {
      ...prev,
      availability: [...prev.availability, { day: "monday", start: "", end: "" }],
    } : prev)
  }

  const updateAvailability = (index: number, field: keyof AvailabilityForm, value: string) => {
    setCurrentProduct((prev) => prev ? {
      ...prev,
      availability: prev.availability.map((slot, slotIndex) => slotIndex === index ? { ...slot, [field]: value } : slot),
    } : prev)
  }

  const removeAvailabilitySlot = (index: number) => {
    setCurrentProduct((prev) => prev ? {
      ...prev,
      availability: prev.availability.filter((_, slotIndex) => slotIndex !== index),
    } : prev)
  }

  const toggleBundleProduct = (productId: string) => {
    setCurrentProduct((prev) => prev ? {
      ...prev,
      bundleProductIds: prev.bundleProductIds.includes(productId)
        ? prev.bundleProductIds.filter((id) => id !== productId)
        : [...prev.bundleProductIds, productId],
    } : prev)
  }

  const validateProduct = (product: ProductFormState) => {
    if (!product.userId) {
      toast.error("Please select a product owner")
      return false
    }
    if (!product.name.trim()) {
      toast.error("Product title is required")
      return false
    }
    if (product.category === "tickets" && !product.eventDateTime) {
      toast.error("Event date is required for ticket products")
      return false
    }
    if (product.category === "courses" && !product.lessons.some((lesson) => lesson.title.trim())) {
      toast.error("Add at least one lesson title")
      return false
    }
    if (product.category === "booking" && !product.availability.some((slot) => slot.start && slot.end)) {
      toast.error("Add at least one availability slot")
      return false
    }
    if (product.category === "bundle" && product.bundleProductIds.length === 0) {
      toast.error("Select at least one product for the bundle")
      return false
    }
    return true
  }

  const buildProductDetails = (product: ProductFormState, existing: Product | null, uploadedFileUrl: string) => {
    switch (product.category) {
      case "tickets":
        return {
          eventDateTime: product.eventDateTime,
          eventLocation: product.eventLocation.trim(),
          quantityAvailable: product.quantityAvailable ? parseInt(product.quantityAvailable, 10) : undefined,
          deliveryMode: "silent_qr_email" as const,
        }
      case "courses":
        return {
          lessons: product.lessons
            .filter((lesson) => lesson.title.trim())
            .map((lesson) => ({
              title: lesson.title.trim(),
              content: lesson.content?.trim() || "",
              videoUrl: lesson.videoUrl?.trim() || "",
            })),
          dripSchedule: product.dripSchedule.trim(),
          enrollmentLimit: product.enrollmentLimit ? parseInt(product.enrollmentLimit, 10) : null,
        }
      case "digital-download":
        return {
          fileName: downloadFile?.name || product.fileName || existing?.details?.fileName || "",
          fileUrl: uploadedFileUrl || existing?.details?.fileUrl || "",
          deliveryMode: "silent_email" as const,
        }
      case "membership":
        return {
          billingInterval: product.billingInterval,
          perks: product.perksText.split("\n").map((perk) => perk.trim()).filter(Boolean),
        }
      case "booking":
        return {
          sessionLength: product.sessionLength ? parseInt(product.sessionLength, 10) : undefined,
          availability: product.availability.filter((slot) => slot.start && slot.end),
          videoLink: product.videoLink.trim(),
        }
      case "bundle":
        return {
          includedProducts: bundleCandidates
            .filter((item) => item.id && product.bundleProductIds.includes(item.id))
            .map((item) => ({ id: item.id!, name: item.name })),
        }
      default:
        return existing?.details
    }
  }

  const handleSave = async () => {
    if (!currentProduct) return
    if (!validateProduct(currentProduct)) return

    try {
      setSaving(true)

      let thumbnailUrl = currentProduct.thumbnail
      let images = [...currentProduct.images]
      let downloadUrl = ""

      if (imageFile) {
        thumbnailUrl = await uploadFile(imageFile, "product-images")
        images = thumbnailUrl ? [thumbnailUrl] : []
      }

      if (downloadFile && currentProduct.category === "digital-download") {
        downloadUrl = await uploadFile(downloadFile, "product-files")
      }

      const existingProduct = currentProduct.id ? selectedProduct : null
      const details = buildProductDetails(currentProduct, existingProduct, downloadUrl)
      const quantity = currentProduct.quantityAvailable ? parseInt(currentProduct.quantityAvailable, 10) : 0
      const normalizedSlug = currentProduct.slug.trim() || slugify(currentProduct.name)
      const normalizedTags = currentProduct.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)

      const payload: Omit<Product, "id" | "createdAt" | "updatedAt"> = {
        userId: currentProduct.userId,
        name: currentProduct.name.trim(),
        slug: normalizedSlug,
        description: currentProduct.description.trim(),
        price: parseFloat(currentProduct.price) || 0,
        currency: currentProduct.currency.trim().toUpperCase() || "NGN",
        category: currentProduct.category,
        url: currentProduct.url.trim(),
        images,
        thumbnail: thumbnailUrl || "",
        status: currentProduct.status,
        tags: normalizedTags,
        details,
        affiliateEnabled: currentProduct.affiliateEnabled,
        affiliateCommission: currentProduct.affiliateEnabled ? Math.min(80, Math.max(1, parseInt(currentProduct.affiliateCommission, 10) || 20)) : 20,
        inventory: {
          quantity: currentProduct.category === "tickets" ? quantity : existingProduct?.inventory?.quantity || 0,
          trackInventory: currentProduct.category === "tickets" ? quantity > 0 : existingProduct?.inventory?.trackInventory || false,
        },
        shipping: existingProduct?.shipping || {
          weight: 0,
          dimensions: { length: 0, width: 0, height: 0 },
          shippingRequired: false,
        },
        seo: {
          title: currentProduct.name.trim(),
          description: currentProduct.description.trim(),
          keywords: normalizedTags,
        },
        paymentIntegration: existingProduct?.paymentIntegration || {
          paystack: {
            enabled: true,
            publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "",
          },
        },
        rating: existingProduct?.rating || 0,
        reviewsCount: existingProduct?.reviewsCount || 0,
      }

      if (currentProduct.id) {
        await updateProduct(currentProduct.id, payload)
        toast.success("Product updated")
      } else {
        await createProduct(payload)
        toast.success("Product created")
      }

      await fetchData()
      resetEditor()
    } catch (error) {
      console.error("Error saving product:", error)
      toast.error("Failed to save product")
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    if (!productToDelete?.id) return

    try {
      await deleteProduct(productToDelete.id)
      toast.success("Product deleted")
      if (currentProduct?.id === productToDelete.id) {
        setCurrentProduct(null)
      }
      await fetchData()
    } catch (error) {
      console.error("Error deleting product:", error)
      toast.error("Failed to delete product")
    } finally {
      setProductToDelete(null)
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
      <div className="col-span-1 min-w-0 rounded-lg border p-4 md:col-span-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Products</h2>
            <p className="text-sm text-muted-foreground">{products.length} total products</p>
          </div>
          <Button onClick={openNewProduct} className="gap-2">
            <Plus className="h-4 w-4" />
            New
          </Button>
        </div>

        <div className="relative mb-4">
          <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search products or owners..."
            className="pl-9"
          />
        </div>

        <div className="space-y-2">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading products...</p>
          ) : filteredProducts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No products found.</p>
          ) : (
            filteredProducts.map((product) => {
              const owner = users.find((user) => user.id === product.userId)
              const isSelected = currentProduct?.id === product.id

              return (
                <Card
                  key={product.id}
                  className={`p-3 transition-colors ${isSelected ? "border-primary bg-primary/5" : "hover:bg-accent"}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <button
                      type="button"
                      className="min-w-0 flex-1 text-left"
                      onClick={() => {
                        setCurrentProduct(mapProductToForm(product))
                        setImageFile(null)
                        setDownloadFile(null)
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 overflow-hidden rounded-md bg-muted">
                          {product.thumbnail ? (
                            <img src={product.thumbnail} alt={product.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <Package className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium">{product.name}</p>
                          <p className="truncate text-xs text-muted-foreground">{owner ? userLabel(owner) : "Unknown owner"}</p>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <Badge variant="outline">{getProductTypeLabel(product.category)}</Badge>
                            <Badge variant={product.status === "active" ? "default" : "secondary"}>{product.status}</Badge>
                          </div>
                        </div>
                      </div>
                    </button>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setProductToDelete(product)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              )
            })
          )}
        </div>
      </div>

      <div className="col-span-1 min-w-0 rounded-lg border p-4 md:col-span-8">
        <h2 className="mb-4 text-lg font-semibold">{currentProduct?.id ? "Edit Product" : "Create Product"}</h2>
        {!currentProduct ? (
          <p className="text-sm text-muted-foreground">Select a product from the list or create a new one.</p>
        ) : (
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Owner</Label>
                <Select value={currentProduct.userId} onValueChange={(value) => updateForm("userId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select owner" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id!}>
                        {userLabel(user)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={currentProduct.status} onValueChange={(value: Product["status"]) => updateForm("status", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={currentProduct.name} onChange={(event) => updateForm("name", event.target.value)} placeholder="Product title" />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input value={currentProduct.slug} onChange={(event) => updateForm("slug", event.target.value)} placeholder={slugify(currentProduct.name) || "my-product"} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2 sm:col-span-1">
                <Label>Type</Label>
                <Select value={currentProduct.category} onValueChange={(value: ProductTypeId) => updateForm("category", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRODUCT_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.id} value={option.id}>{option.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Price</Label>
                <Input type="number" min="0" step="0.01" value={currentProduct.price} onChange={(event) => updateForm("price", event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <Input value={currentProduct.currency} onChange={(event) => updateForm("currency", event.target.value.toUpperCase())} placeholder="NGN" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={currentProduct.description} onChange={(event) => updateForm("description", event.target.value)} rows={4} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>External URL</Label>
                <Input value={currentProduct.url} onChange={(event) => updateForm("url", event.target.value)} placeholder="Optional product link" />
              </div>
              <div className="space-y-2">
                <Label>Tags</Label>
                <Input value={currentProduct.tags} onChange={(event) => updateForm("tags", event.target.value)} placeholder="ebook, growth, paid" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Cover Image</Label>
                <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={handleGenerateAIImage} disabled={generatingImage}>
                  {generatingImage ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                  {generatingImage ? "Generating..." : "AI Image"}
                </Button>
              </div>
              <div
                onClick={() => imageInputRef.current?.click()}
                onDragOver={(event) => {
                  event.preventDefault()
                  setImageDragging(true)
                }}
                onDragLeave={() => setImageDragging(false)}
                onDrop={(event) => {
                  event.preventDefault()
                  setImageDragging(false)
                  const file = event.dataTransfer.files?.[0]
                  if (file && file.type.startsWith("image/")) handleImageSelection(file)
                }}
                className={`flex min-h-[140px] cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-5 text-center transition-colors ${imageDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/40"}`}
              >
                {currentProduct.thumbnail ? (
                  <img src={currentProduct.thumbnail} alt="Product preview" className="max-h-32 w-auto rounded-md object-contain" />
                ) : (
                  <>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                      <ImageIcon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">Drop image here or click to browse</p>
                  </>
                )}
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0]
                    if (file) handleImageSelection(file)
                  }}
                />
              </div>
            </div>

            {currentProduct.category === "tickets" && (
              <div className="space-y-4 rounded-lg border p-4">
                <p className="text-sm font-medium">Ticket details</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Event Date + Time</Label>
                    <Input type="datetime-local" value={currentProduct.eventDateTime} onChange={(event) => updateForm("eventDateTime", event.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Quantity Available</Label>
                    <Input type="number" min="0" value={currentProduct.quantityAvailable} onChange={(event) => updateForm("quantityAvailable", event.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Event Location</Label>
                  <Input value={currentProduct.eventLocation} onChange={(event) => updateForm("eventLocation", event.target.value)} placeholder="Venue or livestream URL" />
                </div>
              </div>
            )}

            {currentProduct.category === "courses" && (
              <div className="space-y-4 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Course lessons</p>
                  <Button type="button" variant="outline" size="sm" onClick={addLesson} className="gap-1.5">
                    <Plus className="h-3.5 w-3.5" />
                    Add lesson
                  </Button>
                </div>

                <div className="space-y-4">
                  {currentProduct.lessons.map((lesson, index) => (
                    <div key={`lesson-${index}`} className="space-y-3 border-l-2 pl-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">Lesson {index + 1}</p>
                        {currentProduct.lessons.length > 1 && (
                          <Button type="button" variant="ghost" size="sm" onClick={() => removeLesson(index)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <Input value={lesson.title} onChange={(event) => updateLesson(index, "title", event.target.value)} placeholder="Lesson title" />
                      <Textarea value={lesson.content || ""} onChange={(event) => updateLesson(index, "content", event.target.value)} placeholder="Lesson content" />
                      <div className="relative">
                        <Video className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input value={lesson.videoUrl || ""} onChange={(event) => updateLesson(index, "videoUrl", event.target.value)} placeholder="Optional video URL" className="pl-9" />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Drip Schedule</Label>
                    <Input value={currentProduct.dripSchedule} onChange={(event) => updateForm("dripSchedule", event.target.value)} placeholder="Weekly unlock" />
                  </div>
                  <div className="space-y-2">
                    <Label>Enrollment Limit</Label>
                    <Input type="number" min="0" value={currentProduct.enrollmentLimit} onChange={(event) => updateForm("enrollmentLimit", event.target.value)} placeholder="Optional" />
                  </div>
                </div>
              </div>
            )}

            {currentProduct.category === "digital-download" && (
              <div className="space-y-3 rounded-lg border p-4">
                <p className="text-sm font-medium">Digital file</p>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(event) => {
                    event.preventDefault()
                    setFileDragging(true)
                  }}
                  onDragLeave={() => setFileDragging(false)}
                  onDrop={(event) => {
                    event.preventDefault()
                    setFileDragging(false)
                    const file = event.dataTransfer.files?.[0]
                    if (file) {
                      setDownloadFile(file)
                      updateForm("fileName", file.name)
                    }
                  }}
                  className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors ${fileDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/40"}`}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    <UploadCloud className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{currentProduct.fileName || "Drop file here or click to browse"}</p>
                    <p className="text-xs text-muted-foreground">PDFs, ZIPs, templates, presets, and more</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0]
                      if (file) {
                        setDownloadFile(file)
                        updateForm("fileName", file.name)
                      }
                    }}
                  />
                </div>
              </div>
            )}

            {currentProduct.category === "membership" && (
              <div className="space-y-4 rounded-lg border p-4">
                <div className="space-y-2">
                  <Label>Billing Interval</Label>
                  <Select value={currentProduct.billingInterval} onValueChange={(value: "monthly" | "yearly") => updateForm("billingInterval", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Perks</Label>
                  <Textarea value={currentProduct.perksText} onChange={(event) => updateForm("perksText", event.target.value)} placeholder={"One perk per line\nExclusive updates\nSpace access"} rows={5} />
                </div>
              </div>
            )}

            {currentProduct.category === "booking" && (
              <div className="space-y-4 rounded-lg border p-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Session Length</Label>
                    <Input type="number" min="1" value={currentProduct.sessionLength} onChange={(event) => updateForm("sessionLength", event.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Video Link</Label>
                    <Input value={currentProduct.videoLink} onChange={(event) => updateForm("videoLink", event.target.value)} placeholder="https://meet.google.com/..." />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Availability</p>
                    <Button type="button" variant="outline" size="sm" onClick={addAvailabilitySlot} className="gap-1.5">
                      <Plus className="h-3.5 w-3.5" />
                      Add slot
                    </Button>
                  </div>

                  {currentProduct.availability.map((slot, index) => (
                    <div key={`slot-${index}`} className="grid gap-3 border-l-2 pl-4 sm:grid-cols-[150px_1fr_1fr_auto] sm:items-end">
                      <div className="space-y-2">
                        <Label>Day</Label>
                        <Select value={slot.day} onValueChange={(value) => updateAvailability(index, "day", value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {DAYS.map((day) => (
                              <SelectItem key={day} value={day}>{day.charAt(0).toUpperCase() + day.slice(1)}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Start</Label>
                        <Input type="time" value={slot.start} onChange={(event) => updateAvailability(index, "start", event.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>End</Label>
                        <Input type="time" value={slot.end} onChange={(event) => updateAvailability(index, "end", event.target.value)} />
                      </div>
                      {currentProduct.availability.length > 1 && (
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeAvailabilitySlot(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentProduct.category === "bundle" && (
              <div className="space-y-3 rounded-lg border p-4">
                <p className="text-sm font-medium">Included products</p>
                {bundleCandidates.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No eligible products available for bundling yet.</p>
                ) : (
                  <div className="space-y-2">
                    {bundleCandidates.map((product) => {
                      const selected = currentProduct.bundleProductIds.includes(product.id!)
                      return (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => toggleBundleProduct(product.id!)}
                          className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-left transition-colors ${selected ? "border-primary bg-primary/5" : "border-border hover:bg-muted/40"}`}
                        >
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-xs text-muted-foreground">{getProductTypeLabel(product.category)}</p>
                          </div>
                          <div className={`h-4 w-4 rounded-full border-2 ${selected ? "border-primary bg-primary" : "border-muted-foreground/40"}`} />
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <UserRound className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Affiliate program</p>
                    <p className="text-xs text-muted-foreground">Allow other creators to promote this product.</p>
                  </div>
                </div>
                <Switch checked={currentProduct.affiliateEnabled} onCheckedChange={(checked) => updateForm("affiliateEnabled", checked)} />
              </div>

              {currentProduct.affiliateEnabled && (
                <div className="mt-4 space-y-2">
                  <Label>Commission (%)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="80"
                    value={currentProduct.affiliateCommission}
                    onChange={(event) => updateForm("affiliateCommission", event.target.value)}
                    className="max-w-[120px]"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saving} className="gap-2">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Package className="h-4 w-4" />}
                {saving ? "Saving..." : currentProduct.id ? "Save Changes" : "Create Product"}
              </Button>
              <Button variant="outline" onClick={resetEditor}>Reset</Button>
            </div>
          </div>
        )}
      </div>

      <AlertDialog open={!!productToDelete} onOpenChange={(open) => !open && setProductToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete product?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{productToDelete?.name}</strong>. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Product
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

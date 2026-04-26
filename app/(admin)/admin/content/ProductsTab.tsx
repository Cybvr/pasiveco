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
import { cn } from "@/lib/utils"
import { AdminSidebarList } from "../components/AdminSidebarList"

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
  lessons: [{ id: uuidv4(), title: "", content: "", videoUrl: "" }],
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
          id: lesson.id || uuidv4(),
          title: lesson.title || "",
          content: lesson.content || "",
          videoUrl: lesson.videoUrl || "",
          muxUploadId: lesson.muxUploadId,
          muxAssetId: lesson.muxAssetId,
          muxPlaybackId: lesson.muxPlaybackId,
          muxStatus: lesson.muxStatus,
          muxError: lesson.muxError,
          muxPassthroughSlug: lesson.muxPassthroughSlug,
          duration: lesson.duration,
        }))
      : [{ id: uuidv4(), title: "", content: "", videoUrl: "" }],
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
    setCurrentProduct((prev) => prev ? { ...prev, lessons: [...prev.lessons, { id: uuidv4(), title: "", content: "", videoUrl: "" }] } : prev)
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
              id: lesson.id,
              title: lesson.title.trim(),
              content: lesson.content?.trim() || "",
              videoUrl: lesson.videoUrl?.trim() || "",
              muxUploadId: lesson.muxUploadId,
              muxAssetId: lesson.muxAssetId,
              muxPlaybackId: lesson.muxPlaybackId,
              muxStatus: lesson.muxStatus,
              muxError: lesson.muxError,
              muxPassthroughSlug: lesson.muxPassthroughSlug,
              duration: lesson.duration,
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
    <div className="grid grid-cols-1 gap-4 md:grid-cols-12 h-full min-h-0 overflow-hidden">
      {/* Sidebar: Products List */}
      <div className="col-span-1 min-w-0 rounded-lg border p-4 md:col-span-4 md:mb-0 flex min-h-0 flex-col">
        <div className="flex items-center justify-between mb-4 px-1 shrink-0">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Products</h3>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => {
              setCurrentProduct({ ...emptyForm })
              setImageFile(null)
              setDownloadFile(null)
            }} 
            className="h-6 w-6 rounded-full hover:bg-primary/10 hover:text-primary"
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="relative mb-4 shrink-0">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search products..."
            className="pl-9 h-8 text-xs bg-muted/20 border-none shadow-none focus-visible:ring-1"
          />
        </div>

        <div className="flex-1 overflow-hidden">
          <AdminSidebarList
            items={filteredProducts}
            selectedId={currentProduct?.id}
            onSelect={(product) => {
              setCurrentProduct(mapProductToForm(product))
              setImageFile(null)
              setDownloadFile(null)
            }}
            onDelete={(product) => setProductToDelete(product)}
            getId={(product) => product.id!}
            getTitle={(product) => product.name}
            getSubtitle={(product) => (
              <div className="mt-1 flex flex-wrap gap-1">
                <Badge variant="outline" className="h-3.5 px-1 text-[7px] uppercase tracking-tighter border-muted-foreground/30">
                  {getProductTypeLabel(product.category)}
                </Badge>
                {product.status === 'draft' && (
                  <Badge variant="secondary" className="h-3.5 px-1 text-[7px] uppercase tracking-tighter">Draft</Badge>
                )}
                <div className="flex items-center gap-1 text-[8px] text-muted-foreground ml-1">
                  <UserRound className="h-2.5 w-2.5" />
                  {users.find(u => u.id === product.userId)?.username || 'User'}
                </div>
              </div>
            )}
            renderExtra={(product) => (
              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-muted border border-border/50">
                {product.thumbnail ? (
                  <img src={product.thumbnail} alt={product.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            )}
            loading={loading}
            loadingMessage="Loading products..."
          />
        </div>
      </div>

      {/* Main Content Area: Editor */}
      <div className="col-span-1 min-w-0 rounded-lg border md:col-span-8 bg-card flex min-h-0 flex-col overflow-hidden">
        {!currentProduct ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 opacity-50">
            <Package className="h-12 w-12 mb-4 text-muted-foreground/20" />
            <p className="text-[10px] font-black uppercase tracking-widest">Select a product to edit</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Product Configuration</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="product-status" className="text-[10px] font-bold uppercase tracking-widest">Status</Label>
                      <Select 
                        value={currentProduct.status} 
                        onValueChange={(value: Product["status"]) => updateForm("status", value)}
                      >
                        <SelectTrigger className="h-7 text-[10px] font-bold uppercase tracking-tight bg-muted/50 border-none rounded-full px-3">
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
                </div>

                <div className="space-y-1">
                  <Input
                    value={currentProduct.name}
                    onChange={(e) => {
                      const name = e.target.value
                      updateForm("name", name)
                      updateForm("slug", slugify(name))
                    }}
                    placeholder="Product name"
                    className="text-2xl font-bold border-none px-0 shadow-none focus-visible:ring-0"
                  />
                  <Textarea
                    value={currentProduct.description}
                    onChange={(e) => updateForm("description", e.target.value)}
                    placeholder="Tell your customers about this product..."
                    className="border-none px-0 shadow-none focus-visible:ring-0 text-sm text-muted-foreground min-h-[80px] resize-none"
                    rows={3}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground/50 tracking-widest">Owner</Label>
                    <Select value={currentProduct.userId} onValueChange={(value) => updateForm("userId", value)}>
                      <SelectTrigger className="h-9 bg-muted/30 border-none rounded-lg px-3 text-sm">
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
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground/50 tracking-widest">Slug</Label>
                    <Input 
                      value={currentProduct.slug} 
                      onChange={(event) => updateForm("slug", event.target.value)} 
                      placeholder={slugify(currentProduct.name) || "my-product"} 
                      className="h-9 bg-muted/30 border-none rounded-lg px-3 text-sm"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-1.5 sm:col-span-1">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground/50 tracking-widest">Type</Label>
                    <Select value={currentProduct.category} onValueChange={(value: ProductTypeId) => updateForm("category", value)}>
                      <SelectTrigger className="h-9 bg-muted/30 border-none rounded-lg px-3 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PRODUCT_TYPE_OPTIONS.map((option) => (
                          <SelectItem key={option.id} value={option.id}>{option.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground/50 tracking-widest">Price</Label>
                    <Input 
                      type="number" 
                      min="0" 
                      step="0.01" 
                      value={currentProduct.price} 
                      onChange={(event) => updateForm("price", event.target.value)} 
                      className="h-9 bg-muted/30 border-none rounded-lg px-3 text-sm font-bold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground/50 tracking-widest">Currency</Label>
                    <Input 
                      value={currentProduct.currency} 
                      onChange={(event) => updateForm("currency", event.target.value.toUpperCase())} 
                      placeholder="NGN" 
                      className="h-9 bg-muted/30 border-none rounded-lg px-3 text-sm font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground/50 tracking-widest">Cover Image</Label>
                    <Button type="button" variant="ghost" size="sm" className="h-6 text-[9px] gap-1 text-primary hover:bg-primary/5 rounded-full px-2" onClick={handleGenerateAIImage} disabled={generatingImage}>
                      {generatingImage ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
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
                    className={cn(
                      "flex min-h-[120px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-5 text-center transition-colors",
                      imageDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/40"
                    )}
                  >
                    {currentProduct.thumbnail ? (
                      <img src={currentProduct.thumbnail} alt="Product preview" className="max-h-24 w-auto rounded-md object-contain" />
                    ) : (
                      <>
                        <ImageIcon className="h-4 w-4 text-muted-foreground/40" />
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">Drop image here or click</p>
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
              </div>

              <div className="space-y-6">
                {currentProduct.category === "tickets" && (
                  <div className="space-y-4 rounded-xl border bg-muted/5 p-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Ticket Details</h4>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold">Event Date + Time</Label>
                        <Input type="datetime-local" value={currentProduct.eventDateTime} onChange={(event) => updateForm("eventDateTime", event.target.value)} className="h-8 text-xs" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold">Quantity Available</Label>
                        <Input type="number" min="0" value={currentProduct.quantityAvailable} onChange={(event) => updateForm("quantityAvailable", event.target.value)} className="h-8 text-xs" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold">Event Location</Label>
                      <Input value={currentProduct.eventLocation} onChange={(event) => updateForm("eventLocation", event.target.value)} placeholder="Venue or livestream URL" className="h-8 text-xs" />
                    </div>
                  </div>
                )}

                {currentProduct.category === "courses" && (
                  <div className="space-y-4 rounded-xl border bg-muted/5 p-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Course Lessons</h4>
                      <Button type="button" variant="outline" size="sm" onClick={addLesson} className="h-7 text-[10px] rounded-full gap-1">
                        <Plus className="h-3 w-3" /> Add Lesson
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {currentProduct.lessons.map((lesson, index) => (
                        <div key={`lesson-${index}`} className="space-y-3 border-l-2 border-primary/20 pl-4 py-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-muted-foreground">LESSON {index + 1}</span>
                            {currentProduct.lessons.length > 1 && (
                              <Button type="button" variant="ghost" size="icon" onClick={() => removeLesson(index)} className="h-6 w-6 text-muted-foreground hover:text-destructive">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                          <Input value={lesson.title} onChange={(event) => updateLesson(index, "title", event.target.value)} placeholder="Lesson title" className="h-8 text-sm" />
                          <Textarea value={lesson.content || ""} onChange={(event) => updateLesson(index, "content", event.target.value)} placeholder="Lesson content" rows={2} className="text-xs resize-none" />
                          <div className="relative">
                            <Video className="absolute left-2.5 top-2.5 h-3 w-3 text-muted-foreground" />
                            <Input value={lesson.videoUrl || ""} onChange={(event) => updateLesson(index, "videoUrl", event.target.value)} placeholder="Optional video URL" className="pl-8 h-8 text-[10px]" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {currentProduct.category === "digital-download" && (
                  <div className="space-y-3 rounded-xl border bg-muted/5 p-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Digital File</h4>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(event) => { event.preventDefault(); setFileDragging(true) }}
                      onDragLeave={() => setFileDragging(false)}
                      onDrop={(event) => {
                        event.preventDefault(); setFileDragging(false)
                        const file = event.dataTransfer.files?.[0]
                        if (file) { setDownloadFile(file); updateForm("fileName", file.name) }
                      }}
                      className={cn(
                        "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors",
                        fileDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/40"
                      )}
                    >
                      <UploadCloud className="h-5 w-5 text-muted-foreground/40" />
                      <div>
                        <p className="text-xs font-bold">{currentProduct.fileName || "Drop file here"}</p>
                        <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-tight">PDFs, ZIPs, Templates, and more</p>
                      </div>
                      <input ref={fileInputRef} type="file" className="hidden" onChange={(event) => {
                        const file = event.target.files?.[0]
                        if (file) { setDownloadFile(file); updateForm("fileName", file.name) }
                      }} />
                    </div>
                  </div>
                )}

                <div className="rounded-xl border bg-primary/5 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        <Sparkles className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-tight">Affiliate Program</p>
                        <p className="text-[10px] text-muted-foreground">Allow others to promote this product.</p>
                      </div>
                    </div>
                    <Switch checked={currentProduct.affiliateEnabled} onCheckedChange={(checked) => updateForm("affiliateEnabled", checked)} />
                  </div>

                  {currentProduct.affiliateEnabled && (
                    <div className="mt-4 space-y-2">
                      <Label className="text-[10px] font-bold">Commission (%)</Label>
                      <Input
                        type="number"
                        min="1"
                        max="80"
                        value={currentProduct.affiliateCommission}
                        onChange={(event) => updateForm("affiliateCommission", event.target.value)}
                        className="max-w-[100px] h-8 text-xs font-bold"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="p-3 border-t bg-background flex justify-start shrink-0 gap-2">
              <Button onClick={handleSave} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 font-bold text-xs uppercase tracking-widest px-8 rounded-full shadow-lg shadow-indigo-500/20 gap-2">
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Package className="h-3.5 w-3.5" />}
                {saving ? "Saving..." : currentProduct.id ? "Save Changes" : "Create Product"}
              </Button>
              <Button variant="ghost" onClick={resetEditor} className="h-9 px-4 text-xs font-bold uppercase tracking-tight rounded-full">Reset</Button>
            </div>
          </>
        )}
      </div>

      <AlertDialog open={!!productToDelete} onOpenChange={(open) => !open && setProductToDelete(null)}>
        <AlertDialogContent className="rounded-2xl border-none">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">Delete product?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              This will permanently delete <strong>{productToDelete?.name}</strong>. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full font-bold">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-full font-bold">
              Delete Product
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

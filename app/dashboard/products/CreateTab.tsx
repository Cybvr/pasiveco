import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Image as ImageIcon, Package, Plus, Trash2, UploadCloud, Video } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { createProduct, type Product } from '@/services/productsService'
import { getProductTypeLabel, PRODUCT_TYPE_OPTIONS, type ProductTypeId } from '@/lib/productTypes'
import { toast } from 'sonner'
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { v4 as uuidv4 } from 'uuid'
import { useCurrency } from '@/context/CurrencyContext'

type LessonForm = { title: string; content: string; videoUrl: string }
type AvailabilityForm = { day: string; start: string; end: string }
type CreateProductFormData = {
  name: string
  description: string
  price: string
  currency: string
  eventDateTime: string
  eventLocation: string
  quantityAvailable: string
  lessons: LessonForm[]
  dripSchedule: string
  enrollmentLimit: string
  billingInterval: 'monthly' | 'yearly'
  perksText: string
  sessionLength: string
  availability: AvailabilityForm[]
  videoLink: string
  bundleProductIds: string[]
}

interface CreateTabProps {
  user: { uid: string } | null
  selectedCategory: ProductTypeId | null
  onProductCreated: () => void
  existingProducts?: Product[]
  initialData?: Partial<CreateProductFormData> & { category?: ProductTypeId }
}

const DEFAULT_FORM_DATA: CreateProductFormData = {
  name: '',
  description: '',
  price: '',
  currency: 'NGN',
  eventDateTime: '',
  eventLocation: '',
  quantityAvailable: '',
  lessons: [{ title: '', content: '', videoUrl: '' }],
  dripSchedule: '',
  enrollmentLimit: '',
  billingInterval: 'monthly',
  perksText: '',
  sessionLength: '60',
  availability: [{ day: 'monday', start: '', end: '' }],
  videoLink: '',
  bundleProductIds: [],
}

const DAYS: AvailabilityForm['day'][] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

function CreateTab({ user, selectedCategory, onProductCreated, existingProducts = [], initialData }: CreateTabProps) {
  const { currency } = useCurrency()
  const [productType, setProductType] = useState<ProductTypeId>(initialData?.category || selectedCategory || 'digital-download')
  const [loading, setLoading] = useState(false)
  const [isPublished, setIsPublished] = useState(true)
  const [formData, setFormData] = useState<CreateProductFormData>({
    ...DEFAULT_FORM_DATA,
    ...initialData,
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')
  const [downloadFile, setDownloadFile] = useState<File | null>(null)
  const [imageDragging, setImageDragging] = useState(false)
  const [fileDragging, setFileDragging] = useState(false)
  const imageInputRef = useRef<HTMLInputElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (selectedCategory) {
      setProductType(selectedCategory)
    }
  }, [selectedCategory])

  const bundleCandidates = useMemo(
    () => existingProducts.filter((product): product is Product & { id: string } => Boolean(product?.id) && product.category !== 'bundle'),
    [existingProducts]
  )

  const resetForm = () => {
    setFormData(DEFAULT_FORM_DATA)
    setImageFile(null)
    setImagePreview('')
    setDownloadFile(null)
    setIsPublished(true)
    if (imageInputRef.current) imageInputRef.current.value = ''
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const uploadFileToStorage = async (file: File, folder: string) => {
    if (!file) return ''

    const storage = getStorage()
    const filename = `${uuidv4()}-${file.name}`
    const storageRef = ref(storage, `${folder}/${filename}`)

    try {
      await uploadBytes(storageRef, file)
      return await getDownloadURL(storageRef)
    } catch (error) {
      console.error(`Error uploading file to ${folder}:`, error)
      toast.error('Failed to upload file.')
      return ''
    }
  }

  const handleImageChange = (file: File) => {
    setImageFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result?.toString() || '')
    }
    reader.readAsDataURL(file)
  }

  const handleImageInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) handleImageChange(file)
  }

  const handleImageDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setImageDragging(false)
    const file = event.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) handleImageChange(file)
  }

  const handleFileDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setFileDragging(false)
    const file = event.dataTransfer.files?.[0]
    if (file) setDownloadFile(file)
  }

  const handleInputChange = (field: keyof CreateProductFormData, value: CreateProductFormData[keyof CreateProductFormData]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleLessonChange = (index: number, field: keyof LessonForm, value: string) => {
    setFormData((prev) => ({
      ...prev,
      lessons: prev.lessons.map((lesson, lessonIndex) => (
        lessonIndex === index ? { ...lesson, [field]: value } : lesson
      )),
    }))
  }

  const addLesson = () => {
    setFormData((prev) => ({
      ...prev,
      lessons: [...prev.lessons, { title: '', content: '', videoUrl: '' }],
    }))
  }

  const removeLesson = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      lessons: prev.lessons.filter((_, lessonIndex) => lessonIndex !== index),
    }))
  }

  const handleAvailabilityChange = (index: number, field: keyof AvailabilityForm, value: string) => {
    setFormData((prev) => ({
      ...prev,
      availability: prev.availability.map((slot, slotIndex) => (
        slotIndex === index ? { ...slot, [field]: value } : slot
      )),
    }))
  }

  const addAvailabilitySlot = () => {
    setFormData((prev) => ({
      ...prev,
      availability: [...prev.availability, { day: 'monday', start: '', end: '' }],
    }))
  }

  const removeAvailabilitySlot = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      availability: prev.availability.filter((_, slotIndex) => slotIndex !== index),
    }))
  }

  const toggleBundleProduct = (productId: string) => {
    setFormData((prev) => ({
      ...prev,
      bundleProductIds: prev.bundleProductIds.includes(productId)
        ? prev.bundleProductIds.filter((id) => id !== productId)
        : [...prev.bundleProductIds, productId],
    }))
  }

  const validateForm = () => {
    if (!user || !formData.name.trim()) {
      toast.error('Please fill in the product title')
      return false
    }

    if (productType === 'tickets' && !formData.eventDateTime) {
      toast.error('Please add the event date and time')
      return false
    }

    if (productType === 'courses' && !formData.lessons.some((lesson) => lesson.title.trim())) {
      toast.error('Please add at least one lesson title')
      return false
    }

    // if (productType === 'digital-download' && !downloadFile) {
    //   toast.error('Please upload the file for this digital download')
    //   return false
    // }

    if (productType === 'booking' && !formData.availability.some((slot) => slot.start && slot.end)) {
      toast.error('Please add at least one availability window')
      return false
    }

    if (productType === 'bundle' && formData.bundleProductIds.length === 0) {
      toast.error('Please select at least one product to include in the bundle')
      return false
    }

    return true
  }

  const buildProductDetails = (uploadedDownloadUrl: string): Product['details'] => {
    switch (productType) {
      case 'tickets':
        return {
          eventDateTime: formData.eventDateTime,
          eventLocation: formData.eventLocation.trim(),
          quantityAvailable: formData.quantityAvailable ? parseInt(formData.quantityAvailable, 10) : undefined,
          deliveryMode: 'silent_qr_email',
        }
      case 'courses':
        return {
          lessons: formData.lessons
            .filter((lesson) => lesson.title.trim())
            .map((lesson) => ({
              title: lesson.title.trim(),
              content: lesson.content.trim(),
              videoUrl: lesson.videoUrl.trim(),
            })),
          dripSchedule: formData.dripSchedule.trim(),
          enrollmentLimit: formData.enrollmentLimit ? parseInt(formData.enrollmentLimit, 10) : null,
        }
      case 'digital-download':
        return {
          fileName: downloadFile?.name || '',
          fileUrl: uploadedDownloadUrl,
          deliveryMode: 'silent_email',
        }
      case 'membership':
        return {
          billingInterval: formData.billingInterval,
          perks: formData.perksText
            .split('\n')
            .map((perk) => perk.trim())
            .filter(Boolean),
        }
      case 'booking':
        return {
          sessionLength: formData.sessionLength ? parseInt(formData.sessionLength, 10) : undefined,
          availability: formData.availability.filter((slot) => slot.start && slot.end),
          videoLink: formData.videoLink.trim(),
        }
      case 'bundle':
        return {
          includedProducts: bundleCandidates
            .filter((product) => formData.bundleProductIds.includes(product.id))
            .map((product) => ({ id: product.id, name: product.name })),
        }
      default:
        return undefined
    }
  }

  const handleCreateProduct = async () => {
    if (!validateForm()) return

    const currentUserId = user?.uid
    if (!currentUserId) return

    setLoading(true)
    try {
      const [imageUrl, downloadUrl] = await Promise.all([
        imageFile ? uploadFileToStorage(imageFile, 'product-images') : Promise.resolve(''),
        productType === 'digital-download' && downloadFile
          ? uploadFileToStorage(downloadFile, 'product-files')
          : Promise.resolve(''),
      ])

      if ((imageFile && !imageUrl) || (productType === 'digital-download' && downloadFile && !downloadUrl)) {
        setLoading(false)
        return
      }

      const quantityAvailable = formData.quantityAvailable ? parseInt(formData.quantityAvailable, 10) : 0
      const productStatus: Product['status'] = isPublished ? 'active' : 'draft'
      const productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> = {
        userId: currentUserId,
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price) || 0,
        currency: formData.currency,
        category: productType,
        url: '',
        images: imageUrl ? [imageUrl] : [],
        thumbnail: imageUrl || '',
        status: productStatus,
        tags: [getProductTypeLabel(productType)],
        details: buildProductDetails(downloadUrl),
        inventory: {
          quantity: productType === 'tickets' ? quantityAvailable : 0,
          trackInventory: productType === 'tickets' && quantityAvailable > 0,
        },
        shipping: {
          weight: 0,
          dimensions: { length: 0, width: 0, height: 0 },
          shippingRequired: false,
        },
        seo: {
          title: formData.name.trim(),
          description: formData.description.trim(),
          keywords: [getProductTypeLabel(productType)],
        },
        paymentIntegration: {
          paystack: {
            enabled: true,
            publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
          },
        },
      }

      await createProduct(productData)
      toast.success('Product created successfully!')
      resetForm()
      onProductCreated()
    } catch (error) {
      console.error('Error creating product:', error)
      toast.error('Failed to create product')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">

      {/* Core details */}
      <div className="space-y-4">
        <div>
          <Label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">Title *</Label>
          <Input
            type="text"
            placeholder="Enter product title"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">Product Type</Label>
            <Select value={productType} onValueChange={(value) => setProductType(value as ProductTypeId)}>
              <SelectTrigger>
                <SelectValue placeholder="Select product type" />
              </SelectTrigger>
              <SelectContent>
                {PRODUCT_TYPE_OPTIONS.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">Price ({currency})</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={formData.price}
              onChange={(e) => handleInputChange('price', e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">Description</Label>
          <Textarea
            placeholder="Describe what the customer gets..."
            rows={3}
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className="resize-none"
          />
        </div>
      </div>

      {/* Cover image drop zone */}
      <div>
        <Label className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted-foreground">Cover Image</Label>
        <div
          onClick={() => imageInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setImageDragging(true) }}
          onDragLeave={() => setImageDragging(false)}
          onDrop={handleImageDrop}
          className={`relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors
            ${imageDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/40'}`}
        >
          {imagePreview ? (
            <>
              <img src={imagePreview} alt="Cover preview" className="max-h-40 w-auto rounded-md object-contain" />
              <p className="text-xs text-muted-foreground">Click or drop to replace</p>
            </>
          ) : (
            <>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">Drop your image here</p>
                <p className="mt-0.5 text-xs text-muted-foreground">PNG or JPG — click to browse</p>
              </div>
            </>
          )}
          <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageInputChange} className="hidden" id="imageUpload" />
        </div>
      </div>

      {/* Type-specific sections */}

      {productType === 'tickets' && (
        <div className="space-y-4 rounded-lg border border-border/60 p-4">
          <div>
            <p className="text-sm font-medium">Ticket settings</p>
            <p className="mt-0.5 text-xs text-muted-foreground">QR code delivery and purchase email happen automatically after checkout.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">Event date + time</Label>
              <Input type="datetime-local" value={formData.eventDateTime} onChange={(e) => handleInputChange('eventDateTime', e.target.value)} />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">Quantity available</Label>
              <Input type="number" min="0" placeholder="100" value={formData.quantityAvailable} onChange={(e) => handleInputChange('quantityAvailable', e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <Label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">Event location</Label>
              <Input type="text" placeholder="Address or livestream link" value={formData.eventLocation} onChange={(e) => handleInputChange('eventLocation', e.target.value)} />
            </div>
          </div>
        </div>
      )}

      {productType === 'courses' && (
        <div className="space-y-4 rounded-lg border border-border/60 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium">Course lessons</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Build an ordered lesson list with content and optional video links.</p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addLesson} className="gap-1.5 shrink-0">
              <Plus className="h-3.5 w-3.5" />
              Add lesson
            </Button>
          </div>

          <div className="space-y-4">
            {formData.lessons.map((lesson, index) => (
              <div key={`lesson-${index}`} className="space-y-3 border-l-2 border-border/60 pl-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-muted-foreground">Lesson {index + 1}</p>
                  {formData.lessons.length > 1 && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeLesson(index)} className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
                <Input placeholder="Lesson title" value={lesson.title} onChange={(e) => handleLessonChange(index, 'title', e.target.value)} />
                <Textarea placeholder="Lesson content" value={lesson.content} onChange={(e) => handleLessonChange(index, 'content', e.target.value)} className="min-h-[80px] resize-none" />
                <div className="relative">
                  <Video className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Optional video URL" value={lesson.videoUrl} onChange={(e) => handleLessonChange(index, 'videoUrl', e.target.value)} className="pl-9" />
                </div>
              </div>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">Drip schedule</Label>
              <Input placeholder="e.g. Weekly unlock" value={formData.dripSchedule} onChange={(e) => handleInputChange('dripSchedule', e.target.value)} />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">Enrollment limit</Label>
              <Input type="number" min="0" placeholder="Optional" value={formData.enrollmentLimit} onChange={(e) => handleInputChange('enrollmentLimit', e.target.value)} />
            </div>
          </div>
        </div>
      )}

      {productType === 'digital-download' && (
        <div className="space-y-3 rounded-lg border border-border/60 p-4">
          <div>
            <p className="text-sm font-medium">Digital file delivery</p>
            <p className="mt-0.5 text-xs text-muted-foreground">The download link is sent silently by email after purchase.</p>
          </div>
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setFileDragging(true) }}
            onDragLeave={() => setFileDragging(false)}
            onDrop={handleFileDrop}
            className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-5 text-center transition-colors
              ${fileDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/40'}`}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
              <UploadCloud className="h-4 w-4 text-muted-foreground" />
            </div>
            {downloadFile ? (
              <div>
                <p className="text-sm font-medium">{downloadFile.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">Click or drop to replace</p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-medium">Drop your file here</p>
                <p className="mt-0.5 text-xs text-muted-foreground">PDFs, ZIPs, templates, presets, and more — click to browse</p>
              </div>
            )}
            <input ref={fileInputRef} type="file" onChange={(e) => setDownloadFile(e.target.files?.[0] || null)} className="hidden" id="productDownloadUpload" />
          </div>
        </div>
      )}

      {productType === 'membership' && (
        <div className="space-y-4 rounded-lg border border-border/60 p-4">
          <div>
            <p className="text-sm font-medium">Membership settings</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Define the recurring cadence and perks members receive.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">Billing interval</Label>
              <Select value={formData.billingInterval} onValueChange={(value) => handleInputChange('billingInterval', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select interval" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">Perks list</Label>
            <Textarea placeholder={'One perk per line\nExclusive posts\nCommunity access\nMonthly Q&A'} value={formData.perksText} onChange={(e) => handleInputChange('perksText', e.target.value)} className="min-h-[100px] resize-none" />
          </div>
        </div>
      )}

      {productType === 'booking' && (
        <div className="space-y-4 rounded-lg border border-border/60 p-4">
          <div>
            <p className="text-sm font-medium">1:1 booking settings</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Set session length, the times you&apos;re available, and where the call should happen.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">Session length (minutes)</Label>
              <Input type="number" min="1" value={formData.sessionLength} onChange={(e) => handleInputChange('sessionLength', e.target.value)} />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">Video link</Label>
              <Input type="url" placeholder="https://meet.google.com/..." value={formData.videoLink} onChange={(e) => handleInputChange('videoLink', e.target.value)} />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">Availability</p>
                <p className="text-xs text-muted-foreground">Add the days and hours customers can book.</p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addAvailabilitySlot} className="gap-1.5 shrink-0">
                <Plus className="h-3.5 w-3.5" />
                Add slot
              </Button>
            </div>

            {formData.availability.map((slot, index) => (
              <div key={`slot-${index}`} className="grid gap-3 border-l-2 border-border/60 pl-4 sm:grid-cols-[160px_1fr_1fr_auto] sm:items-end">
                <div>
                  <Label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">Day</Label>
                  <Select value={slot.day} onValueChange={(value) => handleAvailabilityChange(index, 'day', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Day" />
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS.map((day) => (
                        <SelectItem key={day} value={day}>{day.charAt(0).toUpperCase() + day.slice(1)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">Start</Label>
                  <Input type="time" value={slot.start} onChange={(e) => handleAvailabilityChange(index, 'start', e.target.value)} />
                </div>
                <div>
                  <Label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">End</Label>
                  <Input type="time" value={slot.end} onChange={(e) => handleAvailabilityChange(index, 'end', e.target.value)} />
                </div>
                {formData.availability.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeAvailabilitySlot(index)} className="h-10 w-10 text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {productType === 'bundle' && (
        <div className="space-y-3 rounded-lg border border-border/60 p-4">
          <div>
            <p className="text-sm font-medium">Bundle contents</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Select existing products to include in this offer.</p>
          </div>
          {bundleCandidates.length === 0 ? (
            <p className="text-sm text-muted-foreground">Add at least one other product first, then come back to create a bundle.</p>
          ) : (
            <div className="space-y-1">
              {bundleCandidates.map((product) => {
                const selected = formData.bundleProductIds.includes(product.id)
                return (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => toggleBundleProduct(product.id)}
                    className={`flex w-full items-center justify-between rounded-md border px-3 py-2.5 text-left transition-colors ${selected ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/40'}`}
                  >
                    <div>
                      <p className="text-sm font-medium">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{getProductTypeLabel(product.category)}</p>
                    </div>
                    <div className={`h-4 w-4 rounded-full border-2 transition-colors ${selected ? 'border-primary bg-primary' : 'border-muted-foreground/40'}`} />
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Publishing toggle */}
      <div className="flex items-center justify-between rounded-lg border border-border/60 px-4 py-3">
        <div>
          <p className="text-sm font-medium">Publishing</p>
          <p className="text-xs text-muted-foreground">Go live now or save as draft.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Draft</span>
          <Switch checked={isPublished} onCheckedChange={setIsPublished} aria-label="Publish product" />
          <span className="text-xs font-medium">Live</span>
        </div>
      </div>

      {/* Submit */}
      <Button className="w-full gap-2" onClick={handleCreateProduct} disabled={loading || !formData.name.trim()}>
        <Package className="h-4 w-4" />
        {loading ? 'Saving...' : 'Save product'}
      </Button>
    </div>
  )
}

export default CreateTab

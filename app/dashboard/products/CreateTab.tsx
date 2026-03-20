import React, { useEffect, useMemo, useRef, useState } from 'react'
import { CalendarClock, Image as ImageIcon, Layers3, Package, Plus, Trash2, Upload, Video } from 'lucide-react'
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

function CreateTab({ user, selectedCategory, onProductCreated, existingProducts = [] }: CreateTabProps) {
  const [productType, setProductType] = useState<ProductTypeId>(selectedCategory || 'digital-download')
  const [loading, setLoading] = useState(false)
  const [isPublished, setIsPublished] = useState(true)
  const [formData, setFormData] = useState<CreateProductFormData>(DEFAULT_FORM_DATA)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')
  const [downloadFile, setDownloadFile] = useState<File | null>(null)
  const imageInputRef = useRef<HTMLInputElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (selectedCategory) {
      setProductType(selectedCategory)
    }
  }, [selectedCategory])

  const currentType = PRODUCT_TYPE_OPTIONS.find((type) => type.id === productType) || PRODUCT_TYPE_OPTIONS[0]
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

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setImageFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result?.toString() || '')
    }
    reader.readAsDataURL(file)
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

    if (productType === 'digital-download' && !downloadFile) {
      toast.error('Please upload the file for this digital download')
      return false
    }

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
    <div className="space-y-4">
      <div className="flex items-start gap-3 border-b border-border/60 pb-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">
          <currentType.icon className="h-4 w-4 text-foreground" />
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-semibold tracking-tight">Product details</h2>
          <p className="text-sm text-muted-foreground">{currentType.description}. Configure the fields customers need before checkout.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_240px]">
        <div className="space-y-4">
          <section className="rounded-lg border border-border/60 bg-background">
            <div className="grid gap-4 p-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">Title *</Label>
                <Input
                  type="text"
                  placeholder="Enter product title"
                  value={formData.name}
                  onChange={(event) => handleInputChange('name', event.target.value)}
                  className="border border-input bg-background"
                />
              </div>

              <div>
                <Label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">Product Type</Label>
                <Select value={productType} onValueChange={(value) => setProductType(value as ProductTypeId)}>
                  <SelectTrigger className="h-10 border border-input bg-background">
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
                <Label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">Price</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(event) => handleInputChange('price', event.target.value)}
                  className="border border-input bg-background"
                />
              </div>

              <div className="sm:col-span-2">
                <Label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">Description</Label>
                <Textarea
                  placeholder="Describe what the customer gets..."
                  rows={4}
                  value={formData.description}
                  onChange={(event) => handleInputChange('description', event.target.value)}
                  className="min-h-[120px] resize-y"
                />
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-border/60 bg-background p-4">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium">Publishing</p>
                <p className="text-xs text-muted-foreground">Choose whether this product should go live now or stay in draft.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Draft</span>
                <Switch checked={isPublished} onCheckedChange={setIsPublished} aria-label="Publish product" />
                <span className="text-xs font-medium text-foreground">Publish</span>
              </div>
            </div>
          </section>

          {productType === 'tickets' && (
            <section className="rounded-lg border border-border/60 bg-background p-4 space-y-4">
              <div>
                <p className="text-sm font-medium">Ticket settings</p>
                <p className="text-xs text-muted-foreground">QR code delivery and purchase email happen automatically after checkout.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">Event date + time</Label>
                  <Input type="datetime-local" value={formData.eventDateTime} onChange={(event) => handleInputChange('eventDateTime', event.target.value)} className="border border-input bg-background" />
                </div>
                <div>
                  <Label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">Quantity available</Label>
                  <Input type="number" min="0" placeholder="100" value={formData.quantityAvailable} onChange={(event) => handleInputChange('quantityAvailable', event.target.value)} className="border border-input bg-background" />
                </div>
                <div className="sm:col-span-2">
                  <Label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">Event location</Label>
                  <Input type="text" placeholder="Address or livestream link" value={formData.eventLocation} onChange={(event) => handleInputChange('eventLocation', event.target.value)} className="border border-input bg-background" />
                </div>
              </div>
            </section>
          )}

          {productType === 'courses' && (
            <section className="rounded-lg border border-border/60 bg-background p-4 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">Course lessons</p>
                  <p className="text-xs text-muted-foreground">Build an ordered lesson list with content and optional video links.</p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addLesson} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add lesson
                </Button>
              </div>

              <div className="space-y-3">
                {formData.lessons.map((lesson, index) => (
                  <div key={`lesson-${index}`} className="rounded-lg border border-border/60 p-3 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium">Lesson {index + 1}</p>
                      {formData.lessons.length > 1 && (
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeLesson(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <Input placeholder="Lesson title" value={lesson.title} onChange={(event) => handleLessonChange(index, 'title', event.target.value)} className="border border-input bg-background" />
                    <Textarea placeholder="Lesson content" value={lesson.content} onChange={(event) => handleLessonChange(index, 'content', event.target.value)} className="min-h-[100px] resize-y" />
                    <div className="relative">
                      <Video className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Optional video URL" value={lesson.videoUrl} onChange={(event) => handleLessonChange(index, 'videoUrl', event.target.value)} className="border border-input bg-background pl-9" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">Drip schedule</Label>
                  <Input placeholder="e.g. Weekly unlock" value={formData.dripSchedule} onChange={(event) => handleInputChange('dripSchedule', event.target.value)} className="border border-input bg-background" />
                </div>
                <div>
                  <Label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">Enrollment limit</Label>
                  <Input type="number" min="0" placeholder="Optional" value={formData.enrollmentLimit} onChange={(event) => handleInputChange('enrollmentLimit', event.target.value)} className="border border-input bg-background" />
                </div>
              </div>
            </section>
          )}

          {productType === 'digital-download' && (
            <section className="rounded-lg border border-border/60 bg-background p-4 space-y-4">
              <div>
                <p className="text-sm font-medium">Digital file delivery</p>
                <p className="text-xs text-muted-foreground">The uploaded file is stored securely and the download link is sent silently by email after purchase.</p>
              </div>
              <div className="rounded-lg border border-dashed border-border/70 bg-muted/20 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Upload className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Upload file</p>
                    <p className="text-xs text-muted-foreground">PDFs, ZIPs, templates, presets, and other deliverables are supported.</p>
                  </div>
                </div>
                <input ref={fileInputRef} type="file" onChange={(event) => setDownloadFile(event.target.files?.[0] || null)} className="hidden" id="productDownloadUpload" />
                <div className="flex flex-wrap items-center gap-3">
                  <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                    Choose file
                  </Button>
                  <p className="text-xs text-muted-foreground">{downloadFile ? downloadFile.name : 'No file selected yet.'}</p>
                </div>
              </div>
            </section>
          )}

          {productType === 'membership' && (
            <section className="rounded-lg border border-border/60 bg-background p-4 space-y-4">
              <div>
                <p className="text-sm font-medium">Membership settings</p>
                <p className="text-xs text-muted-foreground">Define the recurring cadence and perks members receive.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">Billing interval</Label>
                  <Select value={formData.billingInterval} onValueChange={(value) => handleInputChange('billingInterval', value)}>
                    <SelectTrigger className="h-10 border border-input bg-background">
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
                <Textarea placeholder={'One perk per line\nExclusive posts\nCommunity access\nMonthly Q&A'} value={formData.perksText} onChange={(event) => handleInputChange('perksText', event.target.value)} className="min-h-[120px] resize-y" />
              </div>
            </section>
          )}

          {productType === 'booking' && (
            <section className="rounded-lg border border-border/60 bg-background p-4 space-y-4">
              <div>
                <p className="text-sm font-medium">1:1 booking settings</p>
                <p className="text-xs text-muted-foreground">Set session length, the times you&apos;re available, and where the call should happen.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">Session length (minutes)</Label>
                  <Input type="number" min="1" value={formData.sessionLength} onChange={(event) => handleInputChange('sessionLength', event.target.value)} className="border border-input bg-background" />
                </div>
                <div>
                  <Label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">Video link</Label>
                  <Input type="url" placeholder="https://meet.google.com/..." value={formData.videoLink} onChange={(event) => handleInputChange('videoLink', event.target.value)} className="border border-input bg-background" />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">Availability</p>
                    <p className="text-xs text-muted-foreground">Add the days and hours customers can book.</p>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={addAvailabilitySlot} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add slot
                  </Button>
                </div>

                {formData.availability.map((slot, index) => (
                  <div key={`slot-${index}`} className="grid gap-3 rounded-lg border border-border/60 p-3 sm:grid-cols-[160px_1fr_1fr_auto] sm:items-end">
                    <div>
                      <Label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">Day</Label>
                      <Select value={slot.day} onValueChange={(value) => handleAvailabilityChange(index, 'day', value)}>
                        <SelectTrigger className="h-10 border border-input bg-background">
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
                      <Input type="time" value={slot.start} onChange={(event) => handleAvailabilityChange(index, 'start', event.target.value)} className="border border-input bg-background" />
                    </div>
                    <div>
                      <Label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">End</Label>
                      <Input type="time" value={slot.end} onChange={(event) => handleAvailabilityChange(index, 'end', event.target.value)} className="border border-input bg-background" />
                    </div>
                    {formData.availability.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeAvailabilitySlot(index)} className="h-10 w-10">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {productType === 'bundle' && (
            <section className="rounded-lg border border-border/60 bg-background p-4 space-y-4">
              <div>
                <p className="text-sm font-medium">Bundle contents</p>
                <p className="text-xs text-muted-foreground">Select existing products to include in this offer.</p>
              </div>
              {bundleCandidates.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border/70 bg-muted/20 p-4 text-sm text-muted-foreground">
                  Add at least one other product first, then come back to create a bundle.
                </div>
              ) : (
                <div className="space-y-2">
                  {bundleCandidates.map((product) => {
                    const selected = formData.bundleProductIds.includes(product.id)
                    return (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => toggleBundleProduct(product.id)}
                        className={`flex w-full items-start justify-between rounded-lg border p-3 text-left transition ${selected ? 'border-primary bg-primary/5' : 'border-border/60 bg-background'}`}
                      >
                        <div>
                          <p className="text-sm font-medium">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{getProductTypeLabel(product.category)}</p>
                        </div>
                        <div className={`mt-0.5 h-5 w-5 rounded-full border ${selected ? 'border-primary bg-primary' : 'border-border bg-background'}`} />
                      </button>
                    )
                  })}
                </div>
              )}
            </section>
          )}

          <section className="rounded-lg border border-dashed border-border/70 bg-muted/20 p-4">
            <Label className="mb-3 block text-xs font-medium uppercase tracking-wide text-muted-foreground">Cover image</Label>
            <div className="flex flex-col items-center justify-center gap-3 rounded-md border border-dashed border-border/80 bg-background px-4 py-6 text-center">
              {imagePreview ? (
                <img src={imagePreview} alt="Product Preview" className="max-h-36 w-auto rounded-md object-contain" />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
              <div className="space-y-1">
                <p className="text-sm font-medium">{imageFile ? 'Change cover image' : 'Upload cover image'}</p>
                <p className="text-xs text-muted-foreground">PNG or JPG works best for product covers.</p>
              </div>
              <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" id="imageUpload" />
              <Button type="button" variant="outline" size="sm" className="h-8 px-3 text-xs" onClick={() => imageInputRef.current?.click()}>
                Choose image
              </Button>
            </div>
          </section>
        </div>

        <aside className="h-fit rounded-lg border border-border/60 bg-muted/20 p-4 space-y-4">
          <div className="space-y-1 border-b border-border/60 pb-3">
            <p className="text-sm font-medium">{currentType.name}</p>
            <p className="text-xs text-muted-foreground">{currentType.badge}</p>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Package className="h-4 w-4" />
              {isPublished ? 'Will publish immediately' : 'Saved as draft'}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <CalendarClock className="h-4 w-4" />
              Core fields wired for checkout and preview
            </div>
            {productType === 'bundle' && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Layers3 className="h-4 w-4" />
                {formData.bundleProductIds.length} product{formData.bundleProductIds.length === 1 ? '' : 's'} selected
              </div>
            )}
          </div>

          <Button className="w-full gap-2" onClick={handleCreateProduct} disabled={loading || !formData.name.trim()}>
            <Package className="h-4 w-4" />
            {loading ? 'Saving...' : 'Save product'}
          </Button>
        </aside>
      </div>
    </div>
  )
}

export default CreateTab

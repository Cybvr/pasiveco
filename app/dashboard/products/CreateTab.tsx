import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Image as TiptapImage } from '@tiptap/extension-image'
import Dropcursor from '@tiptap/extension-dropcursor'
import { Image as ImageIcon, Package, Plus, Trash2, UploadCloud, Video, Zap, Loader2, Sparkles, MapPin, Video as VideoIcon, Phone, Mail, AlignLeft, CheckSquare, Radio, Calendar as CalIcon, ChevronDown, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import EditorContent from '@/app/(admin)/admin/content/EditorContent'
import { createProduct, updateProduct, type Product } from '@/services/productsService'
import { requestFirstProductReward } from '@/services/firstProductRewardService'
import { getProductTypeLabel, PRODUCT_TYPE_OPTIONS, type ProductTypeId } from '@/lib/productTypes'
import type { IntakeFormField, IntakeFieldType, BookingLocationType } from '@/services/productsService'
import { toast } from 'sonner'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { v4 as uuidv4 } from 'uuid'
import { useCurrency } from '@/context/CurrencyContext'
import { slugify } from '@/utils/slugify'
import { storage } from '@/lib/firebase'

type LessonForm = {
  id: string
  title: string
  content: string
  videoUrl: string
  muxUploadId?: string
  muxAssetId?: string
  muxPlaybackId?: string
  muxStatus?: 'waiting' | 'asset_created' | 'ready' | 'errored'
  muxError?: string
  muxPassthroughSlug?: string
  duration?: number
}
type AvailabilityForm = { day: string; start: string; end: string }
type CreateProductFormData = {
  name: string
  slug: string
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
  // Physical
  weight: string
  sku: string
  // Ebook
  ebookFormat: string
  enableReader: boolean
  // Booking – location
  locationType: BookingLocationType
  locationDetail: string
  // Booking – intake form
  intakeForm: IntakeFormField[]
}

interface CreateTabProps {
  user: { uid: string } | null
  selectedCategory: ProductTypeId | null
  onProductCreated: () => void
  existingProducts?: Product[]
  initialData?: Partial<CreateProductFormData> & { category?: ProductTypeId }
  mode?: 'create' | 'edit'
  productToEdit?: Product | null
}

const DEFAULT_FORM_DATA: CreateProductFormData = {
  name: '',
  slug: '',
  description: '',
  price: '',
  currency: 'NGN',
  eventDateTime: '',
  eventLocation: '',
  quantityAvailable: '',
  lessons: [{ id: uuidv4(), title: '', content: '', videoUrl: '' }],
  dripSchedule: '',
  enrollmentLimit: '',
  billingInterval: 'monthly',
  perksText: '',
  sessionLength: '60',
  availability: [{ day: 'monday', start: '', end: '' }],
  videoLink: '',
  bundleProductIds: [],
  weight: '',
  sku: '',
  ebookFormat: 'PDF',
  enableReader: true,
  locationType: 'zoom',
  locationDetail: '',
  intakeForm: [],
}

const DAYS: AvailabilityForm['day'][] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

const mapProductToFormData = (product: Product): CreateProductFormData => {
  const details = product.details || {}

  return {
    name: product.name || '',
    slug: product.slug || '',
    description: product.description || '',
    price: product.price?.toString?.() || '',
    currency: product.currency || 'NGN',
    eventDateTime: details.eventDateTime || '',
    eventLocation: details.eventLocation || '',
    quantityAvailable: details.quantityAvailable?.toString?.() || '',
    lessons: details.lessons?.length
      ? details.lessons.map((lesson) => ({
          id: lesson.id || uuidv4(),
          title: lesson.title || '',
          content: lesson.content || '',
          videoUrl: lesson.videoUrl || '',
          muxUploadId: lesson.muxUploadId,
          muxAssetId: lesson.muxAssetId,
          muxPlaybackId: lesson.muxPlaybackId,
          muxStatus: lesson.muxStatus,
          muxError: lesson.muxError,
          muxPassthroughSlug: lesson.muxPassthroughSlug,
          duration: lesson.duration,
        }))
      : [{ id: uuidv4(), title: '', content: '', videoUrl: '' }],
    dripSchedule: details.dripSchedule || '',
    enrollmentLimit: details.enrollmentLimit?.toString?.() || '',
    billingInterval: details.billingInterval || 'monthly',
    perksText: details.perks?.join('\n') || '',
    sessionLength: details.sessionLength?.toString?.() || '60',
    availability: details.availability?.length
      ? details.availability.map((slot) => ({
          day: slot.day || 'monday',
          start: slot.start || '',
          end: slot.end || '',
        }))
      : [{ day: 'monday', start: '', end: '' }],
    videoLink: details.videoLink || '',
    bundleProductIds: details.includedProducts?.map((included) => included.id).filter(Boolean) || [],
    weight: details.weight?.toString() || '',
    sku: details.sku || '',
    ebookFormat: details.ebookFormat || 'PDF',
    enableReader: details.enableReader ?? true,
    locationType: (details.locationType as BookingLocationType) || 'zoom',
    locationDetail: details.locationDetail || '',
    intakeForm: details.intakeForm || [],
  }
}

function CreateTab({ user, selectedCategory, onProductCreated, existingProducts = [], initialData, mode = 'create', productToEdit = null }: CreateTabProps) {
  const { currency } = useCurrency()
  const [productType, setProductType] = useState<ProductTypeId>(productToEdit?.category as ProductTypeId || initialData?.category || selectedCategory || 'digital-download')
  const [loading, setLoading] = useState(false)
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const [isPublished, setIsPublished] = useState(productToEdit ? productToEdit.status === 'active' : true)
  const [formData, setFormData] = useState<CreateProductFormData>({
    ...DEFAULT_FORM_DATA,
    ...initialData,
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')
  const [downloadFile, setDownloadFile] = useState<File | null>(null)
  const [existingDownloadName, setExistingDownloadName] = useState('')
  const [existingDownloadUrl, setExistingDownloadUrl] = useState('')
  const [imageDragging, setImageDragging] = useState(false)
  const [fileDragging, setFileDragging] = useState(false)
  const imageInputRef = useRef<HTMLInputElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [affiliateEnabled, setAffiliateEnabled] = useState(Boolean(productToEdit?.affiliateEnabled))
  const [affiliateCommission, setAffiliateCommission] = useState(String(productToEdit?.affiliateCommission || 20))
  const [uploadingLessonId, setUploadingLessonId] = useState<string | null>(null)
  const descriptionEditor = useEditor({
    extensions: [StarterKit, TiptapImage, Dropcursor],
    content: formData.description,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const description = editor.isEmpty ? '' : editor.getHTML()
      setFormData((prev) => (prev.description === description ? prev : { ...prev, description }))
    },
  })

  useEffect(() => {
    if (selectedCategory) {
      setProductType(selectedCategory)
    }
  }, [selectedCategory])

  useEffect(() => {
    if (!productToEdit) return

    setFormData(mapProductToFormData(productToEdit))
    setProductType((productToEdit.category as ProductTypeId) || 'digital-download')
    setImagePreview(productToEdit.thumbnail || '')
    setExistingDownloadName(productToEdit.details?.fileName || '')
    setExistingDownloadUrl(productToEdit.details?.fileUrl || '')
    setAffiliateEnabled(Boolean(productToEdit.affiliateEnabled))
    setAffiliateCommission(String(productToEdit.affiliateCommission || 20))
    setIsPublished(productToEdit.status === 'active')
    setImageFile(null)
    setDownloadFile(null)
  }, [productToEdit])

  useEffect(() => {
    if (!descriptionEditor) return

    const currentContent = descriptionEditor.isEmpty ? '' : descriptionEditor.getHTML()
    if (currentContent !== formData.description) {
      descriptionEditor.commands.setContent(formData.description || '', false)
    }
  }, [descriptionEditor, formData.description])

  const bundleCandidates = useMemo(
    () => existingProducts.filter((product): product is Product & { id: string } => Boolean(product?.id) && product.category !== 'bundle'),
    [existingProducts]
  )

  const resetForm = () => {
    setFormData({
      ...DEFAULT_FORM_DATA,
      lessons: [{ id: uuidv4(), title: '', content: '', videoUrl: '' }],
    })
    setImageFile(null)
    setImagePreview('')
    setDownloadFile(null)
    setExistingDownloadName('')
    setExistingDownloadUrl('')
    setIsPublished(true)
    setAffiliateEnabled(false)
    setAffiliateCommission('20')
    if (imageInputRef.current) imageInputRef.current.value = ''
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const uploadFileToStorage = async (file: File, folder: string) => {
    if (!file) return ''

    const filename = `${uuidv4()}-${file.name}`
    const storageRef = ref(storage, `${folder}/${filename}`)

    try {
      await uploadBytes(storageRef, file, {
        contentType: file.type || 'application/octet-stream',
      })
      return await getDownloadURL(storageRef)
    } catch (error) {
      console.error(`Error uploading file to ${folder}:`, {
        name: file.name,
        type: file.type,
        size: file.size,
        error,
      })
      toast.error('Failed to upload file.')
      return ''
    }
  }

  const handleGenerateAIImage = async () => {
    if (!formData.name) {
      toast.error('Please enter a product title to generate an image')
      return
    }
    
    setIsGeneratingImage(true)
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          productName: formData.name, 
          productDescription: formData.description || `A high quality product for ${formData.name}` 
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Image generation failed')
      }

      const data = await response.json();
      if (data.base64Image) {
        const response = await fetch(`data:image/jpeg;base64,${data.base64Image}`);
        const blob = await response.blob();
        const file = new File([blob], `ai-gen-${uuidv4()}.jpg`, { type: 'image/jpeg' });
        
        handleImageChange(file);
        toast.success('Image generated successfully!');
      } else {
        throw new Error('No image returned')
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to generate image');
    } finally {
      setIsGeneratingImage(false);
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
      lessons: [...prev.lessons, { id: uuidv4(), title: '', content: '', videoUrl: '' }],
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

    if (productType === 'ebook' && !downloadFile && !existingDownloadUrl) {
      toast.error('Please upload your ebook file')
      return false
    }

    if (productType === 'physical' && !formData.quantityAvailable) {
      toast.error('Please specify the quantity for physical goods')
      return false
    }

    if (productType === 'bundle' && formData.bundleProductIds.length === 0) {
      toast.error('Please select at least one product to include in the bundle')
      return false
    }

    return true
  }

  const buildProductDetails = (uploadedDownloadUrl: string): Product['details'] => {
    const resolvedDownloadUrl = uploadedDownloadUrl || existingDownloadUrl
    const resolvedDownloadName = downloadFile?.name || existingDownloadName

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
              id: lesson.id,
              title: lesson.title.trim(),
              content: lesson.content.trim(),
              videoUrl: lesson.videoUrl.trim(),
              muxUploadId: lesson.muxUploadId,
              muxAssetId: lesson.muxAssetId,
              muxPlaybackId: lesson.muxPlaybackId,
              muxStatus: lesson.muxStatus,
              muxError: lesson.muxError,
              muxPassthroughSlug: lesson.muxPassthroughSlug,
              duration: lesson.duration,
            })),
          dripSchedule: formData.dripSchedule.trim(),
          enrollmentLimit: formData.enrollmentLimit ? parseInt(formData.enrollmentLimit, 10) : null,
        }
      case 'digital-download':
        return {
          fileName: resolvedDownloadName,
          fileUrl: resolvedDownloadUrl,
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
          locationType: formData.locationType,
          locationDetail: formData.locationDetail.trim(),
          intakeForm: formData.intakeForm,
        }
      case 'bundle':
        return {
          includedProducts: bundleCandidates
            .filter((product) => formData.bundleProductIds.includes(product.id))
            .map((product) => ({ id: product.id, name: product.name })),
        }
      case 'physical':
        return {
          weight: parseFloat(formData.weight) || 0,
          sku: formData.sku.trim(),
          quantityAvailable: parseInt(formData.quantityAvailable, 10) || 0,
        }
      case 'ebook':
        return {
          fileName: resolvedDownloadName,
          fileUrl: resolvedDownloadUrl,
          ebookFormat: formData.ebookFormat,
          enableReader: formData.enableReader,
        }
      default:
        return undefined
    }
  }

  const handleSaveProduct = async () => {
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
      const existingImages = productToEdit?.images || []
      const existingThumbnail = productToEdit?.thumbnail || ''
      const muxLessonSlug =
        formData.lessons.find((lesson) => lesson.muxUploadId && lesson.muxPassthroughSlug)?.muxPassthroughSlug || ''
      const resolvedSlug = muxLessonSlug || formData.slug.trim() || slugify(formData.name)
      const productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> = {
        userId: currentUserId,
        name: formData.name.trim(),
        slug: resolvedSlug,
        description: formData.description.trim(),
        price: parseFloat(formData.price) || 0,
        currency: formData.currency,
        category: productType,
        url: productToEdit?.url || '',
        images: imageUrl ? [imageUrl] : existingImages,
        thumbnail: imageUrl || existingThumbnail,
        status: productStatus,
        tags: productToEdit?.tags?.length ? productToEdit.tags : [getProductTypeLabel(productType)],
        details: buildProductDetails(downloadUrl),
        inventory: {
          quantity: productType === 'tickets' || productType === 'physical' ? quantityAvailable : 0,
          trackInventory: (productType === 'tickets' || productType === 'physical') && quantityAvailable > 0,
        },
        shipping: {
          weight: productType === 'physical' ? parseFloat(formData.weight) || 0 : 0,
          dimensions: { length: 0, width: 0, height: 0 },
          shippingRequired: productType === 'physical',
        },
        seo: {
          title: formData.name.trim(),
          description: formData.description.trim(),
          keywords: [getProductTypeLabel(productType)],
        },
        affiliateEnabled
      }

      const commission = affiliateEnabled ? (parseInt(affiliateCommission, 10) || 20) : null
      if (commission !== null) {
        (productData as any).affiliateCommission = commission
      }

      (productData as any).paymentIntegration = {
        ...(productToEdit?.paymentIntegration || {}),
        paystack: {
          enabled: productToEdit?.paymentIntegration?.paystack?.enabled ?? true,
          publicKey: productToEdit?.paymentIntegration?.paystack?.publicKey || process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
        },
      }

      if (mode === 'edit' && productToEdit?.id) {
        await updateProduct(productToEdit.id, productData)
        if (productData.status === 'active' && productToEdit.status !== 'active') {
          void requestFirstProductReward(productToEdit.id)
        }
        toast.success('Product updated successfully!')
      } else {
        const productId = await createProduct(productData)
        if (productData.status === 'active') {
          void requestFirstProductReward(productId)
        }
        toast.success('Product created successfully!')
        resetForm()
      }

      onProductCreated()
    } catch (error) {
      console.error(`Error ${mode === 'edit' ? 'updating' : 'creating'} product:`, error)
      toast.error(mode === 'edit' ? 'Failed to update product' : 'Failed to create product')
    } finally {
      setLoading(false)
    }
  }

  const handleLessonVideoUpload = async (lessonIndex: number, file: File) => {
    const lesson = formData.lessons[lessonIndex]
    const currentUserId = user?.uid
    if (!lesson || !currentUserId) return

    const resolvedSlug = formData.slug.trim() || slugify(formData.name) || `course-${uuidv4().slice(0, 8)}`

    setFormData((prev) => ({
      ...prev,
      slug: prev.slug || resolvedSlug,
      lessons: prev.lessons.map((currentLesson, index) =>
        index === lessonIndex
          ? {
              ...currentLesson,
              muxStatus: 'waiting',
              muxError: '',
              muxPassthroughSlug: resolvedSlug,
            }
          : currentLesson
      ),
    }))

    setUploadingLessonId(lesson.id)

    try {
      const uploadResponse = await fetch('/api/mux/uploads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId: lesson.id,
          productId: productToEdit?.id,
          productSlug: productToEdit?.id ? undefined : resolvedSlug,
        }),
      })

      const uploadData = await uploadResponse.json()
      if (!uploadResponse.ok) {
        throw new Error(uploadData.error || 'Failed to create upload')
      }

      const muxUploadResponse = await fetch(uploadData.uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type || 'application/octet-stream',
        },
        body: file,
      })

      if (!muxUploadResponse.ok) {
        throw new Error('Failed to upload video to Mux')
      }

      setFormData((prev) => ({
        ...prev,
        lessons: prev.lessons.map((currentLesson, index) =>
          index === lessonIndex
            ? {
                ...currentLesson,
                videoUrl: '',
                muxUploadId: uploadData.uploadId,
                muxStatus: 'waiting',
                muxError: '',
                muxPassthroughSlug: resolvedSlug,
              }
            : currentLesson
        ),
      }))

      toast.success('Video uploaded. Mux is processing it now.')
    } catch (error: any) {
      console.error('Error uploading lesson video:', error)
      setFormData((prev) => ({
        ...prev,
        lessons: prev.lessons.map((currentLesson, index) =>
          index === lessonIndex
            ? {
                ...currentLesson,
                muxStatus: 'errored',
                muxError: error.message || 'Upload failed',
              }
            : currentLesson
        ),
      }))
      toast.error(error.message || 'Failed to upload lesson video')
    } finally {
      setUploadingLessonId(null)
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px] lg:items-start">

      {/* ── LEFT COLUMN: content ── */}
      <div className="space-y-6">

        {/* Core details */}
        <div className="rounded-lg border border-border/60 p-4 space-y-4">
          <div>
            <Label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">Title *</Label>
            <Input
              type="text"
              placeholder="Enter product title"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
            />
          </div>

          <div>
            <Label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">Slug (URL)</Label>
            <Input
              type="text"
              placeholder={slugify(formData.name) || 'my-awesome-product'}
              value={formData.slug}
              onChange={(e) => handleInputChange('slug', e.target.value)}
            />
          </div>

          <div>
            <Label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">Description</Label>
            <div className="[&_\.tiptap]:min-h-[160px] [&_\.tiptap]:focus:outline-none">
              <EditorContent editor={descriptionEditor} />
            </div>
          </div>
        </div>

        {/* Cover image drop zone */}
        <div className="rounded-lg border border-border/60 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Cover Image</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-xs gap-1.5"
              onClick={handleGenerateAIImage}
              disabled={isGeneratingImage || !formData.name}
            >
              {isGeneratingImage ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
              {isGeneratingImage ? 'Generating...' : 'Generate with AI'}
            </Button>
          </div>
          <div
            onClick={() => imageInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setImageDragging(true) }}
            onDragLeave={() => setImageDragging(false)}
            onDrop={handleImageDrop}
            className={`relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-10 text-center transition-colors
              ${imageDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/40'}`}
          >
            {imagePreview ? (
              <>
                <img src={imagePreview} alt="Cover preview" className="max-h-64 w-auto rounded-md object-contain" />
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
                  <div className="rounded-lg border border-dashed border-border/60 p-3 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium">Lesson video</p>
                        <p className="text-xs text-muted-foreground">Upload to Mux for secure playback in the library.</p>
                      </div>
                      <Label
                        htmlFor={`lesson-video-${lesson.id}`}
                        className="inline-flex h-9 cursor-pointer items-center justify-center rounded-md border px-3 text-sm font-medium"
                      >
                        {uploadingLessonId === lesson.id ? 'Uploading...' : 'Upload video'}
                      </Label>
                    </div>
                    <input
                      id={`lesson-video-${lesson.id}`}
                      type="file"
                      accept="video/*"
                      className="hidden"
                      disabled={uploadingLessonId === lesson.id}
                      onChange={(event) => {
                        const file = event.target.files?.[0]
                        if (file) {
                          void handleLessonVideoUpload(index, file)
                        }
                        event.currentTarget.value = ''
                      }}
                    />
                    {(lesson.muxStatus || lesson.muxPlaybackId) && (
                      <div className="rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                        <p>Status: {lesson.muxStatus || 'ready'}</p>
                        {lesson.muxPlaybackId ? <p className="mt-1 break-all">Playback ID: {lesson.muxPlaybackId}</p> : null}
                        {lesson.muxError ? <p className="mt-1 text-destructive">{lesson.muxError}</p> : null}
                      </div>
                    )}
                  </div>
                  <div className="relative">
                    <Video className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Legacy external video URL" value={lesson.videoUrl} onChange={(e) => handleLessonChange(index, 'videoUrl', e.target.value)} className="pl-9" />
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
              ) : existingDownloadName ? (
                <div>
                  <p className="text-sm font-medium">{existingDownloadName}</p>
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
              <Textarea placeholder={'One perk per line\nExclusive posts\nSpace access\nMonthly Q&A'} value={formData.perksText} onChange={(e) => handleInputChange('perksText', e.target.value)} className="min-h-[100px] resize-none" />
            </div>
          </div>
        )}

        {productType === 'booking' && (
          <div className="space-y-6 rounded-lg border border-border/60 p-4">
            <div>
              <p className="text-sm font-medium">1:1 booking settings</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Set session length, availability, meeting location, and optional intake questions.</p>
            </div>

            {/* Session length */}
            <div>
              <Label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">Session length (minutes)</Label>
              <Input type="number" min="1" value={formData.sessionLength} onChange={(e) => handleInputChange('sessionLength', e.target.value)} className="max-w-[160px]" />
            </div>

            {/* Meeting location */}
            <div className="space-y-3">
              <p className="text-sm font-medium">Meeting location</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {(
                  [
                    { id: 'zoom', label: 'Zoom' },
                    { id: 'google_meet', label: 'Google Meet' },
                    { id: 'skype', label: 'Skype' },
                    { id: 'physical', label: 'In-Person' },
                    { id: 'other', label: 'Other' },
                  ] as { id: BookingLocationType; label: string }[]
                ).map((loc) => (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => handleInputChange('locationType', loc.id)}
                    className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                      formData.locationType === loc.id
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
                    }`}
                  >
                    {loc.id === 'physical' ? <MapPin className="h-3.5 w-3.5 shrink-0" /> : <VideoIcon className="h-3.5 w-3.5 shrink-0" />}
                    {loc.label}
                  </button>
                ))}
              </div>
              <div>
                <Label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {formData.locationType === 'physical' ? 'Physical address' : 'Meeting link'}
                </Label>
                <Input
                  type={formData.locationType === 'physical' ? 'text' : 'url'}
                  placeholder={
                    formData.locationType === 'physical'
                      ? '12, Baker Street, Lagos'
                      : formData.locationType === 'zoom'
                      ? 'https://zoom.us/j/...'
                      : formData.locationType === 'google_meet'
                      ? 'https://meet.google.com/...'
                      : formData.locationType === 'skype'
                      ? 'https://join.skype.com/...'
                      : 'https://...'
                  }
                  value={formData.locationDetail}
                  onChange={(e) => handleInputChange('locationDetail', e.target.value)}
                />
                <p className="mt-1 text-xs text-muted-foreground">Shared with the customer only after a confirmed booking.</p>
              </div>
            </div>

            {/* Availability */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">Weekly availability</p>
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

            {/* Intake form builder */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">Intake form</p>
                  <p className="text-xs text-muted-foreground">Collect information from customers before the session.</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5 shrink-0"
                  onClick={() => {
                    const newField: IntakeFormField = {
                      id: uuidv4(),
                      label: '',
                      type: 'text',
                      required: false,
                    }
                    handleInputChange('intakeForm', [...formData.intakeForm, newField])
                  }}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add question
                </Button>
              </div>

              {formData.intakeForm.length === 0 && (
                <div className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                  No intake questions yet. Add questions to collect info from your clients before the session.
                </div>
              )}

              {formData.intakeForm.map((field, idx) => (
                <div key={field.id} className="space-y-3 rounded-lg border border-border/50 bg-muted/20 p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-muted-foreground w-5">{idx + 1}.</span>
                    <div className="flex-1 grid gap-2 sm:grid-cols-[1fr_140px]">
                      <Input
                        placeholder="Question label (e.g. What is your goal?)"
                        value={field.label}
                        onChange={(e) => {
                          const updated = formData.intakeForm.map((f, i) =>
                            i === idx ? { ...f, label: e.target.value } : f
                          )
                          handleInputChange('intakeForm', updated)
                        }}
                      />
                      <Select
                        value={field.type}
                        onValueChange={(val) => {
                          const updated = formData.intakeForm.map((f, i) =>
                            i === idx ? { ...f, type: val as IntakeFieldType, options: ['checkbox','radio','select'].includes(val) ? (f.options?.length ? f.options : ['']) : undefined } : f
                          )
                          handleInputChange('intakeForm', updated)
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Short text</SelectItem>
                          <SelectItem value="textarea">Long text</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="phone">Phone</SelectItem>
                          <SelectItem value="date">Date</SelectItem>
                          <SelectItem value="radio">Single choice</SelectItem>
                          <SelectItem value="checkbox">Multi-select</SelectItem>
                          <SelectItem value="select">Dropdown</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2 ml-1">
                      <label className="flex items-center gap-1 text-xs text-muted-foreground cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={field.required}
                          className="h-3.5 w-3.5 accent-primary"
                          onChange={(e) => {
                            const updated = formData.intakeForm.map((f, i) =>
                              i === idx ? { ...f, required: e.target.checked } : f
                            )
                            handleInputChange('intakeForm', updated)
                          }}
                        />
                        Required
                      </label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => {
                          handleInputChange('intakeForm', formData.intakeForm.filter((_, i) => i !== idx))
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Options for radio/checkbox/select */}
                  {['radio', 'checkbox', 'select'].includes(field.type) && (
                    <div className="space-y-2 pl-5">
                      <p className="text-xs text-muted-foreground font-medium">Options</p>
                      {(field.options || ['']).map((opt, optIdx) => (
                        <div key={optIdx} className="flex items-center gap-2">
                          <Input
                            placeholder={`Option ${optIdx + 1}`}
                            value={opt}
                            className="h-8 text-xs"
                            onChange={(e) => {
                              const newOptions = (field.options || ['']).map((o, oi) => oi === optIdx ? e.target.value : o)
                              const updated = formData.intakeForm.map((f, i) => i === idx ? { ...f, options: newOptions } : f)
                              handleInputChange('intakeForm', updated)
                            }}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                            onClick={() => {
                              const newOptions = (field.options || []).filter((_, oi) => oi !== optIdx)
                              const updated = formData.intakeForm.map((f, i) => i === idx ? { ...f, options: newOptions.length ? newOptions : [''] } : f)
                              handleInputChange('intakeForm', updated)
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs gap-1 text-muted-foreground"
                        onClick={() => {
                          const newOptions = [...(field.options || ['']), '']
                          const updated = formData.intakeForm.map((f, i) => i === idx ? { ...f, options: newOptions } : f)
                          handleInputChange('intakeForm', updated)
                        }}
                      >
                        <Plus className="h-3 w-3" /> Add option
                      </Button>
                    </div>
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

        {productType === 'physical' && (
          <div className="space-y-4 rounded-lg border border-border/60 p-4">
            <div>
              <p className="text-sm font-medium">Physical goods settings</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Manage your stock and shipping requirements for physical items.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">Opening Stock (Quantity)</Label>
                <Input type="number" min="0" placeholder="100" value={formData.quantityAvailable} onChange={(e) => handleInputChange('quantityAvailable', e.target.value)} />
              </div>
              <div>
                <Label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">SKU (Stock Keeping Unit)</Label>
                <Input type="text" placeholder="e.g. T-SHIRT-BLK-L" value={formData.sku} onChange={(e) => handleInputChange('sku', e.target.value)} />
              </div>
              <div>
                <Label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">Weight (kg)</Label>
                <Input type="number" min="0" step="0.1" placeholder="0.5" value={formData.weight} onChange={(e) => handleInputChange('weight', e.target.value)} />
              </div>
              <div className="flex flex-col justify-end pb-1 text-[10px] text-muted-foreground italic">
                * Shipping address will be collected during checkout.
              </div>
            </div>
          </div>
        )}

        {productType === 'ebook' && (
          <div className="space-y-4 rounded-lg border border-border/60 p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium">Ebook settings</p>
                <p className="mt-0.5 text-xs text-muted-foreground">Upload your book and configure reading options.</p>
              </div>
            </div>

            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setFileDragging(true) }}
              onDragLeave={() => setFileDragging(false)}
              onDrop={handleFileDrop}
              className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors
                ${fileDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/40'}`}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </div>
              {downloadFile ? (
                <div>
                  <p className="text-sm font-medium">{downloadFile.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground text-primary font-bold">READY TO UPLOAD</p>
                </div>
              ) : existingDownloadName ? (
                <div>
                  <p className="text-sm font-medium">{existingDownloadName}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">Click to replace current file</p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-medium">Upload ebook file</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">PDF or EPUB (Max 50MB)</p>
                </div>
              )}
              <input ref={fileInputRef} type="file" accept=".pdf,.epub" onChange={(e) => setDownloadFile(e.target.files?.[0] || null)} className="hidden" id="ebookFileUpload" />
            </div>

            <div className="grid gap-6 pt-2">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Non-downloadable Read Mode</Label>
                  <p className="text-xs text-muted-foreground italic">Enable a built-in viewer to prevent direct file downloads.</p>
                </div>
                <Switch checked={formData.enableReader} onCheckedChange={(checked) => handleInputChange('enableReader', checked)} />
              </div>

              <div>
                <Label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">Format</Label>
                <Select value={formData.ebookFormat} onValueChange={(v) => handleInputChange('ebookFormat', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PDF">PDF</SelectItem>
                    <SelectItem value="EPUB">EPUB</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

      </div>{/* end LEFT COLUMN */}

      {/* ── RIGHT SIDEBAR ── */}
      <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">

        {/* Product type */}
        <div className="rounded-lg border border-border/60 p-4 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Product type</p>
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

        {/* Price */}
        <div className="rounded-lg border border-border/60 p-4 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Pricing</p>
          <div>
            <Label className="mb-1.5 block text-xs text-muted-foreground">Price ({currency})</Label>
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

        {/* Publishing */}
        <div className="rounded-lg border border-border/60 p-4 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Publishing</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{isPublished ? 'Live' : 'Draft'}</p>
              <p className="text-xs text-muted-foreground">{isPublished ? 'Visible to customers' : 'Not yet published'}</p>
            </div>
            <Switch checked={isPublished} onCheckedChange={setIsPublished} aria-label="Publish product" />
          </div>
        </div>

        {/* Affiliate */}
        <div className="rounded-lg border border-border/60 p-4 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Affiliate program</p>
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-2">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Zap className="h-3.5 w-3.5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Enable affiliates</p>
                <p className="text-xs text-muted-foreground">Earn via referrals</p>
              </div>
            </div>
            <Switch checked={affiliateEnabled} onCheckedChange={setAffiliateEnabled} aria-label="Enable affiliate program" />
          </div>
          {affiliateEnabled && (
            <div>
              <Label className="mb-1.5 block text-xs text-muted-foreground">Commission rate (%)</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="1"
                  max="80"
                  step="1"
                  value={affiliateCommission}
                  onChange={(e) => {
                    const v = Math.min(80, Math.max(1, parseInt(e.target.value) || 1))
                    setAffiliateCommission(String(v))
                  }}
                  className="w-20"
                />
                <span className="text-xs text-muted-foreground">% per sale</span>
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">
                Max <span className="font-semibold text-primary">80%</span>
              </p>
            </div>
          )}
        </div>

        {/* Save */}
        <Button className="w-full gap-2" onClick={handleSaveProduct} disabled={loading || !formData.name.trim()}>
          <Package className="h-4 w-4" />
          {loading ? 'Saving...' : mode === 'edit' ? 'Update product' : 'Save product'}
        </Button>

      </div>{/* end RIGHT SIDEBAR */}

    </div>
  )
}

export default CreateTab

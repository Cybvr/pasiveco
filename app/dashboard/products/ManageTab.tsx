import React, { useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Plus,
  Package,
  Copy,
  Settings,
  Trash2,
  MoreVertical,
  Sparkles,
  Eye,
  Image as ImageIcon,
  UploadCloud,
  Wand2,
  Loader2
} from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { v4 as uuidv4 } from 'uuid'
import { PRODUCT_TYPE_OPTIONS } from '@/lib/productTypes'
import { slugify } from '@/utils/slugify'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { deleteProduct, updateProduct } from '@/services/productsService'
import { toast } from 'sonner'
import NoProductsSection from '@/app/common/dashboard/NoProductsSection'
import { useCurrency } from '@/context/CurrencyContext'
import { formatCurrency, EXCHANGE_RATE } from '@/utils/currency'
import { getUser, type User as AppUser } from '@/services/userService'

function ManageTab({ products, isLoading = false, onProductsChanged, onCreateNew, onGenAINew, hasBankingDetails = false }) {
  const { user } = useAuth()
  const { currency } = useCurrency()
  const [profile, setProfile] = useState<AppUser | null>(null)
  
  React.useEffect(() => {
    const fetchProfile = async () => {
      if (user?.uid) {
        try {
          const fetchedProfile = await getUser(user.uid)
          setProfile(fetchedProfile)
        } catch (error) {
          console.error('Error fetching profile for ManageTab:', error)
        }
      }
    }
    fetchProfile()
  }, [user])

  const cleanHandle = (profile?.username || profile?.slug || (user as any)?.username || (user as any)?.slug || user?.email?.split('@')[0])?.replace(/^@/, '') || 'user'
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editForm, setEditForm] = useState<any>({
    name: '',
    description: '',
    price: 0,
    status: 'draft',
    slug: '',
    category: 'digital-download',
    thumbnail: '',
    images: [] as string[]
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')
  const [imageDragging, setImageDragging] = useState(false)
  const imageInputRef = React.useRef<HTMLInputElement | null>(null)
  const [loading, setLoading] = useState(false)

  const handleDeleteProduct = (productId: string, productName: string) => {
    toast(`Delete "${productName}"?`, {
      description: 'This cannot be undone.',
      action: {
        label: 'Delete',
        onClick: async () => {
          try {
            await deleteProduct(productId)
            toast.success('Product deleted.')
            onProductsChanged()
          } catch (error) {
            console.error('Error deleting product:', error)
            toast.error('Failed to delete product')
          }
        },
      },
      cancel: {
        label: 'Cancel',
        onClick: () => {},
      },
    })
  }

  const handleEditProduct = (product) => {
    setEditingProduct(product)
    setEditForm({
      name: product.name,
      description: product.description || '',
      price: product.price,
      status: product.status || 'draft',
      slug: product.slug || '',
      category: product.category || 'digital-download',
      thumbnail: product.thumbnail || '',
      images: product.images || []
    })
    setImagePreview(product.thumbnail || '')
    setShowEditModal(true)
  }

  const handleImageChange = (file: File) => {
    setImageFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result?.toString() || '')
    }
    reader.readAsDataURL(file)
  }

  const uploadFileToStorage = async (file: File, folder: string) => {
    const storage = getStorage()
    const filename = `${uuidv4()}-${file.name}`
    const storageRef = ref(storage, `${folder}/${filename}`)
    try {
      await uploadBytes(storageRef, file)
      return await getDownloadURL(storageRef)
    } catch (error) {
      console.error('Error uploading:', error)
      toast.error('Failed to upload image')
      return ''
    }
  }

  const handleUpdateProduct = async () => {
    if (!editingProduct || !editForm.name.trim()) {
      toast.error('Please fill in the product name')
      return
    }

    setLoading(true)
    try {
      let finalThumbnail = editForm.thumbnail;
      let finalImages = [...editForm.images];

      if (imageFile) {
        const uploadedUrl = await uploadFileToStorage(imageFile, 'product-images');
        if (uploadedUrl) {
          finalThumbnail = uploadedUrl;
          finalImages = [uploadedUrl]; // For now we replace the single image
        }
      }

      const finalSlug = editForm.slug?.trim() || editingProduct.slug || slugify(editForm.name);

      await updateProduct(editingProduct.id, {
        name: editForm.name,
        description: editForm.description,
        price: Number(editForm.price) || 0,
        status: editForm.status,
        slug: finalSlug,
        category: editForm.category,
        thumbnail: finalThumbnail,
        images: finalImages
      })
      toast.success('Product updated successfully!')
      closeEditModal()
      onProductsChanged()
    } catch (error) {
      console.error('Error updating product:', error)
      toast.error('Failed to update product')
    } finally {
      setLoading(false)
    }
  }

  const copyProductLink = async (product) => {
    const productIdentifier = product.slug;
    const productUrl = `${window.location.origin}/${cleanHandle}/product/${productIdentifier}`;
    try {
      await navigator.clipboard.writeText(productUrl);
      toast.success('Product link copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy link:', error)
      toast.error('Failed to copy link')
    }
  }

  const closeEditModal = () => {
    setShowEditModal(false)
    setEditingProduct(null)
    setEditForm({
      name: '',
      description: '',
      price: 0,
      status: 'draft',
      slug: '',
      category: 'digital-download',
      thumbnail: '',
      images: []
    })
    setImageFile(null)
    setImagePreview('')
  }

  return (
    <>
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold">My Products ({products.length})</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onGenAINew} className="h-8 text-xs gap-1.5 border-primary/20 hover:bg-primary/5 text-primary">
            <Sparkles className="w-3.5 h-3.5" />
            Gen AI
          </Button>
          <Button onClick={onCreateNew} className="h-8 text-xs gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            New
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <div key={`product-skeleton-${index}`} className="p-3 space-y-3">
              <Skeleton className="w-full aspect-square rounded-md" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            </div>
          ))
        ) : (
          products.map((product: any) => (
            <div key={product.id} className="cursor-pointer p-3 space-y-3 group relative" onClick={() => handleEditProduct(product)} role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); handleEditProduct(product) } }}>
              <div className="w-full aspect-square rounded-md overflow-hidden bg-muted relative">
                {product.thumbnail ? (
                  <img
                    src={product.thumbnail}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                    <Package className="h-8 w-8 text-primary" />
                  </div>
                )}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 duration-200">
                  <a href={`/${cleanHandle}/product/${product.slug}`} target="_blank" rel="noopener noreferrer" className="flex h-8 w-8 items-center justify-center rounded-full bg-background/80 backdrop-blur text-foreground hover:bg-background shadow-sm" onClick={(e) => e.stopPropagation()}>
                    <Eye className="h-4 w-4" />
                  </a>
                </div>
              </div>

              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate">{product.name}</h3>
                  <p className="text-sm font-semibold text-green-600">
                    {formatCurrency(
                      (product.currency || 'USD') === 'USD' && currency === 'NGN'
                        ? product.price * EXCHANGE_RATE
                        : (product.currency || 'USD') === 'NGN' && currency === 'USD'
                          ? product.price / EXCHANGE_RATE
                          : product.price,
                      currency
                    )}
                  </p>
                </div>

                <div className="shrink-0 -mr-1 -mt-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 data-[state=open]:opacity-100 transition-opacity duration-200">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-7 w-7 rounded-full"
                        aria-label="Product actions"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenuItem onSelect={(event) => { 
                        event.preventDefault(); 
                        handleEditProduct(product);
                      }}>
                        <Settings className="mr-2 h-3.5 w-3.5" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={(event) => { 
                        event.preventDefault(); 
                        copyProductLink(product);
                      }}>
                        <Copy className="mr-2 h-3.5 w-3.5" />
                        Copy
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={(event) => { 
                        event.preventDefault(); 
                        handleDeleteProduct(product.id, product.name);
                      }}
                        className="text-destructive focus:text-destructive">
                        <Trash2 className="mr-2 h-3.5 w-3.5" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {!isLoading && products.length === 0 && (
        <NoProductsSection
          showBankingDetailsAction={!hasBankingDetails}
          onAddProduct={onCreateNew}
          className="border-dashed shadow-none"
        />
      )}

      <Dialog open={showEditModal} onOpenChange={(open) => { if (!open) closeEditModal() }}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto p-0 gap-0 border-border/60 shadow-2xl">
          <DialogHeader className="px-6 py-4 border-b border-border/60">
            <DialogTitle className="text-lg font-bold">Edit Product</DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-6">
            
            {/* Cover Image */}
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Cover Image</Label>
              <div
                onClick={() => imageInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setImageDragging(true) }}
                onDragLeave={() => setImageDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setImageDragging(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file && file.type.startsWith('image/')) handleImageChange(file);
                }}
                className={`relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-all duration-200
                  ${imageDragging ? 'border-primary bg-primary/[0.03] scale-[0.99]' : 'border-border/60 hover:border-primary/40 hover:bg-muted/30'}`}
              >
                {imagePreview ? (
                  <div className="relative group/img">
                    <img src={imagePreview} alt="Cover preview" className="max-h-48 w-auto rounded-lg object-contain shadow-sm" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                      <p className="text-white text-[10px] font-bold uppercase tracking-wider">Replace Image</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted shadow-inner">
                      <ImageIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold">Click or drop to upload</p>
                      <p className="mt-1 text-[10px] text-muted-foreground">PNG or JPG — 2MB max</p>
                    </div>
                  </>
                )}
                <input 
                  ref={imageInputRef} 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageChange(file);
                  }} 
                  className="hidden" 
                />
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Product Title</Label>
                <Input
                  type="text"
                  placeholder="The Ultimate Guide..."
                  value={editForm.name}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Short Link (Slug)</Label>
                <Input
                  type="text"
                  value={editForm.slug}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, slug: e.target.value }))}
                  className="h-11 rounded-xl"
                />
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 text-right">
              <div className="space-y-2 text-left">
                <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Category</Label>
                <Select
                  value={editForm.category}
                  onValueChange={(val) => setEditForm(prev => ({ ...prev, category: val }))}
                >
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue placeholder="Select type" />
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
              <div className="space-y-2 text-left">
                <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Price ({currency})</Label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-muted-foreground text-xs">{currency === 'NGN' ? '₦' : '$'}</span>
                  <Input
                    type="number"
                    value={editForm.price}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, price: e.target.value }))}
                    className="h-11 pl-8 rounded-xl"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Description</Label>
              <Textarea
                rows={3}
                value={editForm.description}
                onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                className="rounded-xl resize-none"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/20 rounded-2xl border border-border/40">
              <div className="space-y-0.5">
                <p className="text-sm font-bold">Product is {editForm.status === 'active' ? 'Live' : 'Hidden'}</p>
                <p className="text-[10px] text-muted-foreground">Toggle visibility on your storefront</p>
              </div>
              <Switch
                checked={editForm.status === 'active'}
                onCheckedChange={(checked) => setEditForm(prev => ({ ...prev, status: checked ? 'active' : 'draft' }))}
              />
            </div>

          </div>
          <DialogFooter className="px-6 py-4 border-t border-border/60 bg-muted/10 gap-2">
            <Button variant="outline" onClick={closeEditModal} className="h-11 px-6 rounded-xl">Cancel</Button>
            <Button onClick={handleUpdateProduct} disabled={loading} className="h-11 px-8 rounded-xl shadow-lg shadow-primary/20">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : 'Update Product'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </>
  )
}

export default ManageTab

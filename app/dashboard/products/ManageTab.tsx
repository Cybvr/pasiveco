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
} from 'lucide-react'
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
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
    slug: ''
  })
  const [loading, setLoading] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)

  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteProduct(productId)
      toast.success('Product deleted successfully!')
      onProductsChanged()
    } catch (error) {
      console.error('Error deleting product:', error)
      toast.error('Failed to delete product')
    } finally {
      setDeleteTargetId(null)
    }
  }

  const handleEditProduct = (product) => {
    setEditingProduct(product)
    setEditForm({
      name: product.name,
      description: product.description || '',
      price: product.price,
      status: product.status,
      slug: product.slug || '',
    })
    setShowEditModal(true)
  }

  const handleUpdateProduct = async () => {
    if (!editingProduct || !editForm.name.trim()) {
      toast.error('Please fill in the product name')
      return
    }

    setLoading(true)
    try {
      const generatedSlug = editForm.name ? editForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Math.random().toString(36).substring(2, 7) : '';
      const finalSlug = editForm.slug?.trim() || editingProduct.slug || generatedSlug;

      await updateProduct(editingProduct.id, {
        name: editForm.name,
        description: editForm.description,
        price: editForm.price,
        status: editForm.status,
        slug: finalSlug,
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
    setEditForm({})
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
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-7 w-7 rounded-full"
                        aria-label="Product actions"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={(event) => { event.preventDefault(); handleEditProduct(product) }}>
                        <Settings className="mr-2 h-3.5 w-3.5" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={(event) => { event.preventDefault(); copyProductLink(product) }}>
                        <Copy className="mr-2 h-3.5 w-3.5" />
                        Copy
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={(event) => { event.preventDefault(); setDeleteTargetId(product.id) }}
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
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="block text-xs font-semibold mb-1.5">Product Name</label>
              <input
                type="text"
                placeholder="Enter product name"
                value={editForm.name}
                onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full p-2.5 border rounded text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5">Slug (URL)</label>
              <input
                type="text"
                placeholder={editForm.name ? editForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : "my-awesome-product"}
                value={editForm.slug}
                onChange={(e) => setEditForm((prev) => ({ ...prev, slug: e.target.value }))}
                className="w-full p-2.5 border rounded text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5">Description</label>
              <textarea
                placeholder="Describe your product..."
                rows={3}
                value={editForm.description}
                onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                className="w-full p-2.5 border rounded text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5">Price</label>
              <div className="relative">
                <div className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground font-bold text-[10px] flex items-center justify-center">
                  {currency === 'NGN' ? '₦' : '$'}
                </div>
                <input
                  type="number"
                  placeholder="0.00"
                  value={editForm.price}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  className="w-full pl-8 p-2.5 border rounded text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5">Status</label>
              <select
                value={editForm.status}
                onChange={(e) => setEditForm((prev) => ({ ...prev, status: e.target.value }))}
                className="w-full p-2.5 border rounded text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={closeEditModal}>Cancel</Button>
            <Button onClick={handleUpdateProduct} disabled={loading}>
              {loading ? 'Updating...' : 'Update Product'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>

    <AlertDialog open={!!deleteTargetId} onOpenChange={(open) => { if (!open) setDeleteTargetId(null) }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete product?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This product will be permanently deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={() => deleteTargetId && handleDeleteProduct(deleteTargetId)}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  )
}

export default ManageTab

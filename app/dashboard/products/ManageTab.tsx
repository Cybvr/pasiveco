import React, { useState } from 'react'
import {
  Plus,
  Package,
  Copy,
  Settings,
  Trash2,
  DollarSign,
  MoreVertical,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { deleteProduct, updateProduct } from '@/services/productsService'
import { toast } from 'sonner'

function ManageTab({ products, onProductsChanged, onCreateNew }) {
  const [editingProduct, setEditingProduct] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [loading, setLoading] = useState(false)

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return

    try {
      await deleteProduct(productId)
      toast.success('Product deleted successfully!')
      onProductsChanged()
    } catch (error) {
      console.error('Error deleting product:', error)
      toast.error('Failed to delete product')
    }
  }

  const handleEditProduct = (product) => {
    setEditingProduct(product)
    setEditForm({
      name: product.name,
      description: product.description || '',
      price: product.price,
      status: product.status,
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
      await updateProduct(editingProduct.id, {
        name: editForm.name,
        description: editForm.description,
        price: editForm.price,
        status: editForm.status,
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

  const copyProductLink = async (productId) => {
    const productUrl = `${window.location.origin}/product/${productId}`
    try {
      await navigator.clipboard.writeText(productUrl)
      toast.success('Product link copied to clipboard!')
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
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">My Products ({products.length})</h2>
        <Button onClick={onCreateNew} className="h-8 text-xs gap-1.5 self-end sm:self-auto">
          <Plus className="w-3.5 h-3.5" />
          New Product
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {products.map((product) => (
          <Card key={product.id}>
            <CardContent className="p-3 space-y-3">
              <div className="relative">
                <div className="w-full aspect-square rounded-md overflow-hidden bg-muted">
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
                </div>

                <div className="absolute right-2 top-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-7 w-7 rounded-full"
                        aria-label="Product actions"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => copyProductLink(product.id)}>
                        <Copy className="mr-2 h-3.5 w-3.5" />
                        Copy
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditProduct(product)}>
                        <Settings className="mr-2 h-3.5 w-3.5" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteProduct(product.id)}>
                        <Trash2 className="mr-2 h-3.5 w-3.5" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="space-y-1">
                {product.url && product.url !== '' ? (
                  <a
                    href={product.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-sm line-clamp-2 hover:text-primary hover:underline"
                  >
                    {product.name}
                  </a>
                ) : (
                  <h3 className="font-semibold text-sm line-clamp-2">{product.name}</h3>
                )}
                <p className="text-sm font-semibold text-green-600">${product.price.toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-10">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No products yet</h3>
          <p className="text-muted-foreground mb-4">Create your first product to get started</p>
          <Button onClick={onCreateNew}>
            <Plus className="w-4 h-4 mr-2" />
            New
          </Button>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Edit Product</h3>
                <Button variant="ghost" size="sm" onClick={closeEditModal}>
                  ×
                </Button>
              </div>
            </div>
            <div className="p-4 space-y-4">
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
                <label className="block text-xs font-semibold mb-1.5">Description</label>
                <textarea
                  placeholder="Describe your product..."
                  rows={3}
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  className="w-full p-2.5 border rounded text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5">Price</label>
                <div className="relative">
                  <DollarSign className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="number"
                    placeholder="0.00"
                    value={editForm.price}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        price: parseFloat(e.target.value) || 0,
                      }))
                    }
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
              <div className="flex gap-2 pt-4">
                <Button className="flex-1 h-8 text-xs" onClick={handleUpdateProduct} disabled={loading}>
                  {loading ? 'Updating...' : 'Update Product'}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 h-8 text-xs"
                  onClick={closeEditModal}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ManageTab

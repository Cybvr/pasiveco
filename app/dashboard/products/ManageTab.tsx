                                                            import React, { useState } from 'react'
                                                            import { Plus, Package, Copy, Settings, Trash2, DollarSign } from 'lucide-react'
                                                            import { Card, CardContent } from '@/components/ui/card'
                                                            import { Button } from '@/components/ui/button'
                                                            import { Badge } from '@/components/ui/badge'
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

                                                              const handleUpdateProductStatus = async (productId, status) => {
                                                                try {
                                                                  await updateProduct(productId, { status })
                                                                  toast.success('Product status updated!')
                                                                  onProductsChanged()
                                                                } catch (error) {
                                                                  console.error('Error updating product:', error)
                                                                  toast.error('Failed to update product')
                                                                }
                                                              }

                                                              const handleEditProduct = (product) => {
                                                                setEditingProduct(product)
                                                                setEditForm({
                                                                  name: product.name,
                                                                  description: product.description || '',
                                                                  price: product.price,
                                                                  status: product.status
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
                                                                    status: editForm.status
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

                                                              const closeEditModal = () => {
                                                                setShowEditModal(false)
                                                                setEditingProduct(null)
                                                                setEditForm({})
                                                              }

                                                              const copyProductLink = (productId) => {
                                                                const productUrl = `${window.location.origin}/product/${productId}`
                                                                navigator.clipboard.writeText(productUrl)
                                                                toast.success('Product link copied to clipboard!')
                                                              }

                                                              return (
                                                                <div className="space-y-4">
                                                                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                                                    <h2 className="text-sm font-semibold">My Products ({products.length})</h2>
                                                                    <Button onClick={onCreateNew} className="h-8 text-xs gap-1.5 self-end sm:self-auto">
                                                                      <Plus className="w-3.5 h-3.5" />
                                                                      New Product
                                                                    </Button>
                                                                  </div>

                                                                  <div className="grid gap-3">
                                                                    {products.map((product) => (
                                                                      <Card key={product.id}>
                                                                        <CardContent className="p-4">
                                                                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                                                                              <div className="h-10 w-10 flex-shrink-0 bg-gradient-to-br from-primary/20 to-primary/10 rounded flex items-center justify-center">
                                                                                <Package className="h-5 w-5 text-primary" />
                                                                              </div>
                                                                              <div className="flex-1 min-w-0">
                                                                                {product.url && product.url !== '' ? (
                                  <a 
                                    href={product.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="font-semibold text-sm truncate hover:text-primary hover:underline cursor-pointer"
                                  >
                                    {product.name}
                                  </a>
                                ) : (
                                  <h3 className="font-semibold text-sm truncate">{product.name}</h3>
                                )}
                                                                                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                                                                  <Badge variant="secondary" className="text-xs h-5 px-1.5">
                                                                                    {product.category || 'General'}
                                                                                  </Badge>
                                                                                  <Badge 
                                                                                    variant={product.status === 'active' ? "default" : "secondary"} 
                                                                                    className="text-xs h-5 px-1.5"
                                                                                  >
                                                                                    {product.status === 'active' ? "Active" : product.status === 'draft' ? "Draft" : "Inactive"}
                                                                                  </Badge>
                                                                                </div>
                                                                                <p className="text-xs text-muted-foreground mt-1">
                                                                                  Created {product.createdAt ? new Date(product.createdAt.toDate()).toLocaleDateString() : 'N/A'}
                                                                                </p>
                                                                              </div>
                                                                            </div>
                                                                            <div className="flex flex-col items-start sm:items-end gap-2">
                                                                              <p className="text-lg font-semibold text-green-600">${product.price.toFixed(2)}</p>
                                                                              <div className="flex flex-wrap justify-start sm:justify-end gap-1.5">
                                                                                <Button
                                                                                  size="sm"
                                                                                  className="h-7 px-2.5 text-xs"
                                                                                  variant={product.status === 'active' ? 'default' : 'outline'}
                                                                                  onClick={() => handleUpdateProductStatus(product.id, product.status === 'active' ? 'draft' : 'active')}
                                                                                >
                                                                                  {product.status === 'active' ? 'Deactivate' : 'Activate'}
                                                                                </Button>
                                                                                <Button
                                                                                  size="sm"
                                                                                  variant="outline"
                                                                                  className="h-7 px-2.5 text-xs gap-1"
                                                                                  onClick={() => copyProductLink(product.id)}
                                                                                >
                                                                                  <Copy className="w-3 h-3" />
                                                                                  Copy
                                                                                </Button>
                                                                                <Button
                                                                                  size="sm"
                                                                                  variant="ghost"
                                                                                  className="h-7 px-2.5 text-xs gap-1"
                                                                                  onClick={() => handleEditProduct(product)}
                                                                                >
                                                                                  <Settings className="w-3 h-3" />
                                                                                  Edit
                                                                                </Button>
                                                                                <Button
                                                                                  size="sm"
                                                                                  variant="ghost"
                                                                                  className="h-7 px-2.5 text-xs gap-1"
                                                                                  onClick={() => handleDeleteProduct(product.id)}
                                                                                >
                                                                                  <Trash2 className="w-3 h-3" />
                                                                                  Delete
                                                                                </Button>
                                                                              </div>
                                                                            </div>
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

                                                                  {/* Edit Product Modal */}
                                                                  {showEditModal && (
                                                                    <div className="fixed inset-0  flex items-center justify-center p-4 z-50">
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
                                                                              onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                                                                              className="w-full p-2.5 border rounded text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                                            />
                                                                          </div>
                                                                          <div>
                                                                            <label className="block text-xs font-semibold mb-1.5">Description</label>
                                                                            <textarea
                                                                              placeholder="Describe your product..."
                                                                              rows={3}
                                                                              value={editForm.description}
                                                                              onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
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
                                                                                onChange={(e) => setEditForm(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                                                                                className="w-full pl-8 p-2.5 border rounded text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                                              />
                                                                            </div>
                                                                          </div>
                                                                          <div>
                                                                            <label className="block text-xs font-semibold mb-1.5">Status</label>
                                                                            <select
                                                                              value={editForm.status}
                                                                              onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                                                                              className="w-full p-2.5 border rounded text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                                            >
                                                                              <option value="draft">Draft</option>
                                                                              <option value="active">Active</option>
                                                                              <option value="inactive">Inactive</option>
                                                                            </select>
                                                                          </div>
                                                                          <div className="flex gap-2 pt-4">
                                                                            <Button 
                                                                              className="flex-1 h-8 text-xs" 
                                                                              onClick={handleUpdateProduct}
                                                                              disabled={loading}
                                                                            >
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
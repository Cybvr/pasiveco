
import React, { useState, useEffect } from 'react'
import { Search, ArrowLeft, Store } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { createProduct } from '@/services/productsService'
import { toast } from 'sonner'

function ExploreTab({ user, onProductsAdded }) {
  // Debug user authentication
  console.log('ExploreTab user:', user ? { uid: user.uid, email: user.email } : 'No user')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStore, setSelectedStore] = useState(null)
  const [storeProducts, setStoreProducts] = useState([])
  const [availableStores, setAvailableStores] = useState([])
  const [selectedProducts, setSelectedProducts] = useState(new Set())
  const [loading, setLoading] = useState(false)
  const [storesLoading, setStoresLoading] = useState(false)
  const [popularProducts, setPopularProducts] = useState([])
  const [popularProductsLoading, setPopularProductsLoading] = useState(false)

  // Load available stores and popular products when component mounts
  useEffect(() => {
    loadAvailableStores()
    loadPopularProducts()
  }, [])

  const loadAvailableStores = async () => {
    setStoresLoading(true)
    try {
      // Use hardcoded popular stores that actually work
      const popularStores = [
        { name: 'Amazon', domain: 'amazon.com' },
        { name: 'eBay', domain: 'ebay.com' },
        { name: 'Walmart', domain: 'walmart.com' },
        { name: 'Target', domain: 'target.com' },
        { name: 'Best Buy', domain: 'bestbuy.com' },
        { name: 'Home Depot', domain: 'homedepot.com' },
        { name: 'Etsy', domain: 'etsy.com' },
        { name: 'Costco', domain: 'costco.com' }
      ]
      
      setAvailableStores(popularStores)
    } catch (error) {
      console.error('Error loading stores:', error)
      toast.error('Failed to load stores')
    } finally {
      setStoresLoading(false)
    }
  }

  const loadPopularProducts = async () => {
    setPopularProductsLoading(true)
    try {
      const response = await fetch('/api/search-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: 'trending products',
          searchType: 'popular'
        })
      })
      const data = await response.json()
      setPopularProducts(data.results?.slice(0, 8) || [])
    } catch (error) {
      console.error('Error loading popular products:', error)
      toast.error('Failed to load popular products')
    } finally {
      setPopularProductsLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setLoading(true)
    try {
      const response = await fetch('/api/search-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: searchQuery,
          store: selectedStore,
          searchType: selectedStore ? 'store_search' : 'general'
        })
      })
      const data = await response.json()
      setStoreProducts(data.results || [])
      if (!selectedStore) {
        setSelectedStore(`Search: ${searchQuery}`)
      }
    } catch (error) {
      console.error('Error searching products:', error)
      toast.error('Failed to search products')
    } finally {
      setLoading(false)
    }
  }

  const handleStoreClick = async (storeName) => {
    setSelectedStore(storeName)
    setSearchQuery('')
    setStoreProducts([])
    setSelectedProducts(new Set())

    setLoading(true)
    try {
      const response = await fetch('/api/search-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          store: storeName,
          searchType: 'store'
        })
      })
      const data = await response.json()
      setStoreProducts(data.results || [])
    } catch (error) {
      console.error('Error fetching store products:', error)
      toast.error(`Failed to fetch ${storeName} products`)
      setStoreProducts([])
    } finally {
      setLoading(false)
    }
  }

  const toggleProductSelection = (productKey) => {
    const newSelected = new Set(selectedProducts)
    if (newSelected.has(productKey)) {
      newSelected.delete(productKey)
    } else {
      newSelected.add(productKey)
    }
    setSelectedProducts(newSelected)
  }

  const addSelectedProducts = async () => {
    if (!user || selectedProducts.size === 0) return

    setLoading(true)
    try {
      const productsToAdd = storeProducts.filter((_, index) => {
        const uniqueKey = `product-${index}`
        return selectedProducts.has(uniqueKey)
      })

      console.log('Adding products to Firebase:', productsToAdd.length)

      for (const product of productsToAdd) {
        const productPrice = product.price?.extracted_value || product.price?.value || product.price || 0
        const parsedPrice = parseFloat(productPrice?.toString().replace(/[^0-9.]/g, '') || '0') || 0

        const productData = {
          userId: user.uid,
          name: (product.title || 'Store Product').substring(0, 255), // Limit length
          description: (product.snippet || product.title || '').substring(0, 500), // Limit length
          price: parsedPrice,
          currency: product.price?.currency || 'USD',
          category: (product.source || selectedStore || 'Store Product').substring(0, 100),
          url: product.link || product.product_link || product.url || '',
          images: product.thumbnail ? [product.thumbnail] : [],
          thumbnail: product.thumbnail || '',
          status: 'active' as const,
          tags: ['store-product', (selectedStore?.toLowerCase() || 'general').replace(/[^a-z0-9-]/g, '')],
          inventory: { 
            quantity: 1, 
            trackInventory: false 
          },
          shipping: {
            weight: 0,
            dimensions: { length: 0, width: 0, height: 0 },
            shippingRequired: true
          },
          seo: {
            title: (product.title || '').substring(0, 255),
            description: (product.snippet || '').substring(0, 500),
            keywords: [(selectedStore || 'product').toLowerCase().replace(/[^a-z0-9]/g, '')]
          }
        }

        console.log('Creating product:', productData.name)
        const productId = await createProduct(productData)
        console.log('Product created with ID:', productId)
      }

      toast.success(`Successfully added ${productsToAdd.length} products!`)
      setSelectedProducts(new Set())
      onProductsAdded()
    } catch (error) {
      console.error('Error adding products:', error)
      toast.error(`Failed to add products: ${error.message || 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const resetView = () => {
    setSelectedStore(null)
    setStoreProducts([])
    setSelectedProducts(new Set())
  }

  if (selectedStore) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={resetView} className="h-8 px-2 text-xs">
            <ArrowLeft className="w-3 h-3 mr-1" />
            Back
          </Button>
          <h2 className="text-lg font-semibold capitalize">{selectedStore}</h2>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder={`Search ${selectedStore} products`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10 h-12 text-base"
          />
        </div>

        {selectedProducts.size > 0 && (
          <div className="flex justify-between items-center bg-muted/50 p-3 rounded-lg">
            <span className="text-sm">{selectedProducts.size} products selected</span>
            <Button onClick={addSelectedProducts} disabled={loading} size="sm">
              {loading ? 'Adding...' : 'Add to My Products'}
            </Button>
          </div>
        )}

        {loading && (
          <div className="text-center py-10">
            <p className="text-muted-foreground">Loading {selectedStore} products...</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {storeProducts.map((product, index) => {
            const uniqueKey = `product-${index}`
            const productPrice = product.price?.extracted_value || product.price?.value || product.price || 'Price not available'
            const currency = product.price?.currency || '$'

            return (
              <Card key={uniqueKey} className="relative overflow-hidden">
                <div className="absolute top-3 right-3 z-10">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded cursor-pointer"
                    checked={selectedProducts.has(uniqueKey)}
                    onChange={() => toggleProductSelection(uniqueKey)}
                  />
                </div>
                <CardContent className="p-0">
                  {product.thumbnail && (
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={product.thumbnail}
                        alt={product.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className="p-3">
                    <p className="text-xs text-muted-foreground mb-1 capitalize">{product.source}</p>
                    {product.link ? (
                      <a 
                        href={product.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="font-semibold text-sm line-clamp-2 mb-2 hover:text-primary hover:underline cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {product.title}
                      </a>
                    ) : (
                      <h3 className="font-semibold text-sm line-clamp-2 mb-2">{product.title}</h3>
                    )}
                    <p className="text-lg font-bold text-green-600">
                      {productPrice !== 'Price not available' ? `${currency}${productPrice}` : productPrice}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {storeProducts.length === 0 && !loading && (
          <div className="text-center py-10">
            <p className="text-muted-foreground">No products found for this store.</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search products or paste a link"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          className="pl-10 h-12 text-base"
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Available Stores</h3>
          <Button variant="ghost" size="sm" className="text-sm" onClick={loadAvailableStores}>
            Refresh
          </Button>
        </div>
        
        {storesLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <Card key={item} className="overflow-hidden bg-gray-100 animate-pulse">
                <div className="aspect-square bg-gray-200"></div>
                <CardContent className="p-3">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : availableStores.length > 0 ? (
          <div className="flex items-center gap-4 overflow-x-auto pb-2">
            {availableStores.map((store, index) => (
              <div 
                key={index} 
                className="flex flex-col items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity min-w-[80px]" 
                onClick={() => handleStoreClick(store.name)}
              >
                <div className="w-16 h-16 bg-white rounded-full border border-gray-200 flex items-center justify-center overflow-hidden shadow-sm">
                  <Store className="w-8 h-8 text-gray-600" />
                </div>
                <span className="text-sm font-medium text-center">{store.name}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-muted-foreground">No stores available. Try refreshing.</p>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Popular Products</h3>
          <Button variant="ghost" size="sm" className="text-sm" onClick={loadPopularProducts}>
            Refresh
          </Button>
        </div>
        
        {popularProductsLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <Card key={item} className="overflow-hidden bg-gray-100 animate-pulse">
                <div className="aspect-square bg-gray-200"></div>
                <CardContent className="p-3">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : popularProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {popularProducts.map((product, index) => {
              const productPrice = product.price?.extracted_value || product.price?.value || product.price || 'Price not available'
              const currency = product.price?.currency || '$'
              
              return (
                <Card key={index} className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow" onClick={() => {
                  // Add product to selection for quick add
                  const productWithKey = { ...product, uniqueKey: `popular-${index}` }
                  setStoreProducts(prev => [...prev, productWithKey])
                  setSelectedStore('Popular Products')
                }}>
                  <CardContent className="p-0">
                    {product.thumbnail && (
                      <div className="aspect-square overflow-hidden">
                        <img
                          src={product.thumbnail}
                          alt={product.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    )}
                    <div className="p-3">
                      <p className="text-xs text-muted-foreground mb-1 capitalize">{product.source}</p>
                      <h3 className="font-semibold text-sm line-clamp-2 mb-2">{product.title}</h3>
                      <p className="text-lg font-bold text-green-600">
                        {productPrice !== 'Price not available' ? `${currency}${productPrice}` : productPrice}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-muted-foreground">No popular products available. Try refreshing.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ExploreTab

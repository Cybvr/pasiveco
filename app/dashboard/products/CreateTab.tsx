import React, { useState, useEffect } from 'react'
import { Video, Headphones, Image, Calendar, Package, Eye, DollarSign, Upload, Download, BookOpen, GraduationCap } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createProduct } from '@/services/productsService'
import { toast } from 'sonner'
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from 'uuid';


function CreateTab({ user, selectedCategory, onProductCreated }) {
  const [productType, setProductType] = useState(selectedCategory || "digital-products")
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    currency: 'NGN', // Default to Nigerian Naira for Paystack
    url: '',
    tags: []
  })
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  // Function to handle image upload to Firebase Storage
  const uploadImage = async () => {
    if (!imageFile) return '';

    const storage = getStorage();
    const filename = `${uuidv4()}-${imageFile.name}`;
    const storageRef = ref(storage, `product-images/${filename}`);

    try {
      await uploadBytes(storageRef, imageFile);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image.");
      return '';
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (selectedCategory) {
      setProductType(selectedCategory)
    }
  }, [selectedCategory])

  const productTypes = [
    { 
      id: "digital-products", 
      name: "Digital Products", 
      icon: Download, 
      description: "Content packs, designs, bundles",
      badge: "Instant Delivery"
    },
    { 
      id: "ebooks", 
      name: "Ebooks", 
      icon: BookOpen, 
      description: "Digital books in any format",
      badge: "DRM Protected"
    },
    { 
      id: "courses", 
      name: "Courses", 
      icon: GraduationCap, 
      description: "Online training & education",
      badge: "Unlimited Students"
    },
    { 
      id: "events", 
      name: "Event Tickets", 
      icon: Calendar, 
      description: "Events, workshops, webinars",
      badge: "QR Codes"
    },
    { 
      id: "services", 
      name: "Services", 
      icon: Headphones, 
      description: "Coaching, consulting, design",
      badge: "Booking System"
    },
    { 
      id: "video", 
      name: "Video Content", 
      icon: Video, 
      description: "Tutorials, courses, content",
      badge: "Streaming"
    },
    { 
      id: "audio", 
      name: "Audio Content", 
      icon: Headphones, 
      description: "Podcasts, music, audio",
      badge: "High Quality"
    },
    { 
      id: "physical", 
      name: "Physical Products", 
      icon: Package, 
      description: "Tangible goods with shipping",
      badge: "Inventory Tracking"
    },
  ]

  const currencies = [
    { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
  ]

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleCreateProduct = async () => {
    if (!user || !formData.name.trim()) {
      toast.error('Please fill in the product name')
      return
    }

    if (formData.price <= 0) {
      toast.error('Please set a valid price')
      return
    }

    setLoading(true)
    try {
      // Upload image first if provided
      let imageUrl = ''
      if (imageFile) {
        imageUrl = await uploadImage()
        if (!imageUrl) {
          setLoading(false)
          return
        }
      }

      const productData = {
        userId: user.uid,
        name: formData.name,
        description: formData.description,
        price: formData.price,
        currency: formData.currency,
        category: productType,
        url: formData.url,
        images: imageUrl ? [imageUrl] : [],
        thumbnail: imageUrl || '',
        status: 'active',
        tags: formData.tags,
        inventory: {
          quantity: 100,
          trackInventory: false
        },
        shipping: {
          weight: 0,
          dimensions: { length: 0, width: 0, height: 0 },
          shippingRequired: false
        },
        seo: {
          title: formData.name,
          description: formData.description,
          keywords: formData.tags
        },
        paymentIntegration: {
          paystack: {
            enabled: true,
            publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
          }
        }
      }

      await createProduct(productData)
      toast.success('Product created successfully!')

      // Reset form
      setFormData({
        name: '',
        description: '',
        price: 0,
        currency: 'NGN',
        url: '',
        tags: []
      })
      setImageFile(null)
      setImagePreview('')

      onProductCreated()
    } catch (error) {
      console.error('Error creating product:', error)
      toast.error('Failed to create product')
    } finally {
      setLoading(false)
    }
  }

  const getProductTypeInfo = (typeId) => {
    return productTypes.find(type => type.id === typeId)
  }

  const currentType = getProductTypeInfo(productType) || productTypes[0]
  const selectedCurrency = currencies.find(c => c.code === formData.currency)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 bg-primary/10 rounded flex items-center justify-center">
          <currentType.icon className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Create Product</h2>
          <Badge variant="outline" className="text-xs">{currentType.badge}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="px-4 py-3 border-b">
              <CardTitle className="text-sm font-semibold">Product Details</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5">Product Name *</label>
                <input
                  type="text"
                  placeholder="Enter product name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full p-2.5 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5">Product Type</label>
                <select
                  value={productType}
                  onChange={(e) => setProductType(e.target.value)}
                  className="w-full p-2.5 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {productTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground mt-1">The form updates automatically based on this selection.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5">Description</label>
                <textarea
                  placeholder="Describe your product..."
                  rows={4}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full p-2.5 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5">Price *</label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-2.5 text-sm text-muted-foreground">
                      {selectedCurrency?.symbol}
                    </span>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                      className="w-full pl-8 p-2.5 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5">Currency</label>
                  <select 
                    value={formData.currency}
                    onChange={(e) => handleInputChange('currency', e.target.value)}
                    className="w-full p-2.5 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {currencies.map(currency => (
                      <option key={currency.code} value={currency.code}>
                        {currency.symbol} {currency.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {productType === "link" && (
                <div>
                  <label className="block text-xs font-semibold mb-1.5">External URL</label>
                  <input
                    type="url"
                    placeholder="https://example.com"
                    value={formData.url}
                    onChange={(e) => handleInputChange('url', e.target.value)}
                    className="w-full p-2.5 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              )}

              {productType !== "link" && productType !== "services" && (
                <div>
                  <label className="block text-xs font-semibold mb-1.5">Upload Files</label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">Drag & drop your files here</p>
                    <Button variant="outline" size="sm">
                      Choose Files
                    </Button>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold mb-1.5">Product Image</label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Product Preview" className="max-h-40 w-auto mx-auto mb-2 rounded" />
                  ) : (
                    <Image className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                  )}
                  <p className="text-xs text-muted-foreground mb-2">{imageFile ? 'Change Image' : 'Upload product image'}</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="imageUpload"
                  />
                  <Button variant="outline" size="sm" className="h-8 px-3 text-xs" onClick={() => document.getElementById('imageUpload').click()}>
                    Choose Image
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Payment Integration Info */}
          <Card>
            <CardHeader className="px-4 py-3 border-b">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                Payment Integration
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Paystack</span>
                <Badge variant="default" className="text-xs">Enabled</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Accept payments securely with Paystack. Supports cards, bank transfers, and mobile money.
              </p>
              <div className="text-xs text-muted-foreground">
                <strong>Supported:</strong> Visa, Mastercard, Verve, Bank Transfer, USSD
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="space-y-3">
            <Button 
              className="w-full gap-2" 
              onClick={handleCreateProduct}
              disabled={loading || !formData.name.trim() || formData.price <= 0}
            >
              <Package className="w-4 h-4" />
              {loading ? 'Creating...' : 'Create Product'}
            </Button>
            <Button variant="outline" className="w-full gap-2">
              <Eye className="w-4 h-4" />
              Preview
            </Button>
          </div>

          {/* Pricing Tip */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <h4 className="font-semibold text-sm text-blue-900 mb-2">💡 Pricing Tip</h4>
              <p className="text-xs text-blue-800">
                Research similar products in your niche. Start with competitive pricing and adjust based on customer feedback.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default CreateTab
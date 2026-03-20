import React, { useState, useEffect } from 'react'
import { Video, Image as ImageIcon, Calendar, Package, Upload, Download, GraduationCap, BadgeDollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
      id: "video", 
      name: "Video Content", 
      icon: Video, 
      description: "Tutorials, courses, content",
      badge: "Streaming"
    },
  ]

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleCreateProduct = async () => {
    if (!user || !formData.name.trim()) {
      toast.error('Please fill in the product name')
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

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 border-b border-border/60 pb-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">
          <currentType.icon className="h-4 w-4 text-foreground" />
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-semibold tracking-tight">Product details</h2>
          <p className="text-sm text-muted-foreground">Create a clean, compact product listing with the essentials.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
        <div className="space-y-4">
          <section className="rounded-lg border border-border/60 bg-background">
            <div className="grid gap-4 p-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">Product Name *</label>
                <input
                  type="text"
                  placeholder="Enter product name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">Product Type</label>
                <Select value={productType} onValueChange={setProductType}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select product type" />
                  </SelectTrigger>
                  <SelectContent>
                    {productTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">Price</label>
                <div className="relative">
                  <BadgeDollarSign className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.price === 0 ? '' : formData.price}
                    onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                    className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">Description</label>
                <textarea
                  placeholder="Describe your product..."
                  rows={4}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>

              {productType === "link" && (
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">External URL</label>
                  <input
                    type="url"
                    placeholder="https://example.com"
                    value={formData.url}
                    onChange={(e) => handleInputChange('url', e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                </div>
              )}
            </div>
          </section>

          {productType !== "link" && productType !== "services" && (
            <section className="rounded-lg border border-dashed border-border/70 bg-muted/20 p-4">
              <div className="mb-3 flex items-center gap-2">
                <Upload className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Upload Files</p>
                  <p className="text-xs text-muted-foreground">Drag and drop your files here, or choose them manually.</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Choose Files
              </Button>
            </section>
          )}

          <section className="rounded-lg border border-dashed border-border/70 bg-muted/20 p-4">
            <label className="mb-3 block text-xs font-medium uppercase tracking-wide text-muted-foreground">Product Image</label>
            <div className="flex flex-col items-center justify-center gap-3 rounded-md border border-dashed border-border/80 bg-background px-4 py-6 text-center">
              {imagePreview ? (
                <img src={imagePreview} alt="Product Preview" className="max-h-36 w-auto rounded-md object-contain" />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
              <div className="space-y-1">
                <p className="text-sm font-medium">{imageFile ? 'Change Image' : 'Upload product image'}</p>
                <p className="text-xs text-muted-foreground">PNG or JPG works best for product covers.</p>
              </div>
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
          </section>
        </div>

        <aside className="h-fit rounded-lg border border-border/60 bg-muted/20 p-3">
          <div className="space-y-1 border-b border-border/60 pb-3">
            <p className="text-sm font-medium">Ready to publish?</p>
            <p className="text-xs text-muted-foreground">Save your product once the title and price are set.</p>
          </div>
          <div className="pt-3">
            <Button
              className="w-full gap-2"
              onClick={handleCreateProduct}
              disabled={loading || !formData.name.trim()}
            >
              <Package className="h-4 w-4" />
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default CreateTab


"use client"

import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getUserProducts, type Product } from '@/services/productsService'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'
import { getBankingDetails } from '@/services/bankingDetailsService'
import { Plus, Sparkles, Wand2, Loader2, Search, X, Check, CheckCircle2 } from 'lucide-react'
import { getUser } from '@/services/userService'
import { createProduct } from '@/services/productsService'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useCurrency } from '@/context/CurrencyContext'
import { formatCurrency } from '@/utils/currency'
import { slugify } from '@/utils/slugify'

import CreateTab from './CreateTab'  
import ManageTab from './ManageTab'



function ProductCreator() {
  const { currency } = useCurrency()
  const [activeTab, setActiveTab] = useState("manage")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [hasBankingDetails, setHasBankingDetails] = useState(false)
  const [selectedCategory] = useState(null)
  const [myProducts, setMyProducts] = useState<Product[]>([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)
  const [isAIModalOpen, setIsAIModalOpen] = useState(false)
  const [aiDescription, setAiDescription] = useState("")
  const [isAIGenerating, setIsAIGenerating] = useState(false)
  const [aiResult, setAiResult] = useState<null | {
    products: Array<{
      name: string;
      description: string;
      price: number;
      productType: any;
      reasoning: string;
      imageUrl?: string;
    }>
  }>(null)
  const [initialProductData, setInitialProductData] = useState<any>(null)
  const [brandStyle, setBrandStyle] = useState<string>("")
  const [processingIdx, setProcessingIdx] = useState<number | null>(null)
  const [acceptedIndices, setAcceptedIndices] = useState<Set<number>>(new Set())
  const { user, loading: authLoading } = useAuth()
  const searchParams = useSearchParams()

  const loadMyProducts = async () => {
    // If auth is still loading, stay in loading state
    if (authLoading) return

    if (!user) {
      setMyProducts([])
      setHasBankingDetails(false)
      setIsLoadingProducts(false)
      return
    }

    setIsLoadingProducts(true)
    try {
      const [products, bankingDetails] = await Promise.all([
        getUserProducts(user.uid),
        getBankingDetails(user.uid),
      ])
      setMyProducts(products)
      setHasBankingDetails(Boolean(bankingDetails))
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Failed to fetch products')
    } finally {
      setIsLoadingProducts(false)
    }
  }

  useEffect(() => {
    loadMyProducts()
  }, [user, authLoading])

  useEffect(() => {
    const fetchBrand = async () => {
      if (user?.uid && isAIModalOpen) {
        const profile = await getUser(user.uid)
        const prefs = profile?.brandPreferences || ""
        setBrandStyle(prefs)
        // Only pre-fill if the user hasn't typed their own idea yet
        if (!aiDescription) {
          setAiDescription(prefs)
        }
      }
    }
    fetchBrand()
  }, [user, isAIModalOpen])

  const handleGenAIGenerate = async () => {
    if (!aiDescription.trim()) {
      toast.error("Please describe your product idea")
      return
    }

    if (!user) return
    setAcceptedIndices(new Set())

    setIsAIGenerating(true)
    try {
      const res = await fetch('/api/generate-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: aiDescription,
          brandPreferences: brandStyle,
          creatorName: user?.displayName || "Creator",
        }),
      })

      if (!res.ok) throw new Error("Failed to generate")
      const data = await res.json()
      
      // Pre-generating images for each product
      const productsWithImages = await Promise.all(
        data.products.map(async (p: any) => {
          const img = await generateAIImage(p.name, p.description)
          return { ...p, imageUrl: img }
        })
      )
      
      setAiResult({ ...data, products: productsWithImages })
    } catch (error) {
      console.error(error)
      toast.error("AI generation failed. Please try again.")
    } finally {
      setIsAIGenerating(false)
    }
  }

  const generateAIImage = async (productName: string, productDescription: string) => {
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productName, productDescription }),
      });

      if (!response.ok) return null;
      const data = await response.json();
      return data.imageUrl || null;
    } catch (err) {
      console.error("Image generation proxy error:", err);
      return null;
    }
  }

  const handleApplyAI = async (selectedProduct: any, index: number) => {
    if (!user) return
    if (acceptedIndices.has(index)) {
      toast.info("This product has already been created")
      return
    }

    setProcessingIdx(index)
    try {
      const generatedImageUrl = selectedProduct.imageUrl
      
      await createProduct({
        userId: user.uid,
        name: selectedProduct.name,
        slug: slugify(selectedProduct.name),
        description: selectedProduct.description,
        price: selectedProduct.price,
        currency: currency,
        category: selectedProduct.productType,
        images: generatedImageUrl ? [generatedImageUrl] : [],
        thumbnail: generatedImageUrl || "",
        status: 'active',
        tags: [],
        inventory: {
          quantity: 999,
          trackInventory: false
        },
        shipping: {
          weight: 0,
          dimensions: { length: 0, width: 0, height: 0 },
          shippingRequired: false
        },
        seo: {
          title: selectedProduct.name,
          description: selectedProduct.description,
          keywords: []
        }
      })
      
      setAcceptedIndices(prev => new Set(prev).add(index))
      toast.success(`"${selectedProduct.name}" created successfully!`)
      loadMyProducts() // Refresh the background list
    } catch (error) {
      console.error(error)
      toast.error("Failed to create product")
    } finally {
      setProcessingIdx(null)
    }
  }

  const handleDeclineAI = (index: number) => {
    if (!aiResult) return
    const newProducts = [...aiResult.products]
    newProducts.splice(index, 1)
    setAiResult({ ...aiResult, products: newProducts })
  }

  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setIsCreateModalOpen(true)
      setActiveTab('manage')
    }
  }, [searchParams])

  return (
    <div className="space-y-6">
      <div className="pt-2">
        <ManageTab 
          products={myProducts}
          isLoading={isLoadingProducts}
          onProductsChanged={loadMyProducts}
          onCreateNew={() => {
            setInitialProductData(null)
            setIsCreateModalOpen(true)
          }}
          onGenAINew={() => setIsAIModalOpen(true)}
          hasBankingDetails={hasBankingDetails}
        />
      </div>

      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-3xl gap-0 overflow-hidden border-border/60 p-0 shadow-2xl">
          <DialogHeader className="border-b border-border/60 px-4 py-3">
            <DialogTitle className="flex items-center gap-2 text-base">
              <Plus className="h-4 w-4" />
              New Product
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[80vh] overflow-y-auto px-4 py-3 sm:px-5 sm:py-4">
          <CreateTab
            user={user}
            selectedCategory={selectedCategory}
            existingProducts={myProducts}
            initialData={initialProductData}
            onProductCreated={() => {
              setIsCreateModalOpen(false)
              setInitialProductData(null)
              setActiveTab('manage')
              loadMyProducts()
            }}
          />
        </div>
        </DialogContent>
      </Dialog>

      {/* AI Modal */}
      <Dialog open={isAIModalOpen} onOpenChange={setIsAIModalOpen}>
        <DialogContent className="max-w-2xl gap-0 overflow-hidden border-border/60 p-0 shadow-2xl">
          <DialogHeader className="border-b border-border/60 px-4 py-3">
            <DialogTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-primary" />
              Gen AI Wizard
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[80vh] overflow-y-auto p-6 space-y-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium">What are you planning to create?</Label>
              <Textarea 
                placeholder="E.g., A 4-week fitness guide for beginners, or a set of 10 photography presets for Lightroom..."
                value={aiDescription}
                onChange={(e) => setAiDescription(e.target.value)}
                className="min-h-[100px] text-sm"
              />
              <div className="flex flex-wrap gap-2 items-center">
                <p className="text-[10px] text-muted-foreground flex items-center gap-1.5 ">
                  <Sparkles className="h-3 w-3" />
                  AI will suggest products based on yours persona.
                </p>
              </div>
            </div>

            {aiResult && aiResult.products && (
              <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Suggested for you:</p>
                <div className="grid gap-3">
                  {aiResult.products.map((product, idx) => (
                    <div 
                      key={idx} 
                      className="group relative p-4 rounded-lg bg-card border border-border hover:border-primary/50 hover:bg-primary/[0.02] transition-all flex gap-4"
                    >
                      {product.imageUrl && (
                        <div className="w-20 h-20 shrink-0 rounded-md overflow-hidden bg-muted border border-border">
                          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-2 gap-4">
                            <div className="space-y-1 min-w-0">
                              <h4 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">{product.name}</h4>
                              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-muted text-muted-foreground mr-2">
                                {product.productType.replace('-', ' ')}
                              </span>
                              <span className="text-sm font-bold text-primary">{formatCurrency(product.price, currency)}</span>
                            </div>
                            <div className="flex gap-1.5 shrink-0">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleDeclineAI(idx)}
                                className="h-7 w-7 rounded-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                title="Decline"
                              >
                                <X className="h-3.5 w-3.5" />
                              </Button>
                              <Button 
                                variant="secondary" 
                                size="sm" 
                                onClick={() => handleApplyAI(product, idx)}
                                disabled={processingIdx === idx || acceptedIndices.has(idx)}
                                className={`h-7 px-2.5 gap-1.5 text-xs font-medium ${acceptedIndices.has(idx) ? 'bg-green-50 text-green-700 border-green-200' : ''}`}
                                title="Accept"
                              >
                                {processingIdx === idx ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : acceptedIndices.has(idx) ? (
                                  <CheckCircle2 className="h-3 w-3" />
                                ) : (
                                  <Check className="h-3 w-3" />
                                )}
                                {acceptedIndices.has(idx) ? 'Added' : 'Accept'}
                              </Button>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-2 italic">"{product.description}"</p>
                          <div className="flex items-center gap-1.5 text-[10px] text-green-600 font-medium bg-green-50 w-fit px-2 py-0.5 rounded">
                            <Sparkles className="h-2.5 w-2.5" />
                            {product.reasoning}
                          </div>
                        </div>
                      </div>
                  ))}
                </div>
              </div>
            )}


            <div className="pt-2">
              <Button 
                onClick={handleGenAIGenerate} 
                disabled={isAIGenerating || !aiDescription.trim()}
                variant={aiResult ? "outline" : "default"}
                className="w-full gap-2 transition-all"
              >
                {isAIGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating Products & Images...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4" />
                    {aiResult ? "Try different ideas" : "Generate Product Ideas"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ProductCreator

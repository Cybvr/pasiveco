'use client'

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Loader2, Sparkles, Plus, Trash2, Check, AlertCircle, ImagePlus, RefreshCw } from 'lucide-react'
import { storage } from '@/lib/firebase'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { v4 as uuidv4 } from 'uuid'
import { toast } from 'sonner'
import { createProduct } from '@/services/productsService'
import { useAuth } from '@/hooks/useAuth'
import { useCurrency } from '@/context/CurrencyContext'
import { formatCurrency } from '@/utils/currency'

interface InstantCatalogModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onProductsCreated: () => void
  creatorName?: string
}

interface GeneratedProduct {
  name: string
  description: string
  price: number
  category: string
  imageUrl?: string | null
  selected?: boolean
}

const INPUT_PRESETS = [
  {
    label: 'Coaching',
    value:
      'I offer a 60-minute 1-on-1 coaching session for career clarity at 45,000 NGN, a 4-week job search bootcamp at 120,000 NGN, and a CV review service at 15,000 NGN.',
  },
  {
    label: 'Beauty',
    value:
      'I run a beauty business with bridal glam packages starting at 150,000 NGN, soft glam appointments at 35,000 NGN, gele styling at 20,000 NGN, and a makeup class for beginners at 85,000 NGN.',
  },
  {
    label: 'Digital',
    value:
      'I sell a social media content calendar template for 12,000 NGN, a Canva brand kit for 18,000 NGN, and a short course on creating better Instagram posts for 55,000 NGN.',
  },
  {
    label: 'Fitness',
    value:
      'I offer online personal training at 30,000 NGN per month, a 6-week weight loss program at 75,000 NGN, and a meal planning guide at 10,000 NGN.',
  },
] as const

const InstantCatalogModal: React.FC<InstantCatalogModalProps> = ({
  open,
  onOpenChange,
  onProductsCreated,
  creatorName
}) => {
  const { user } = useAuth()
  const { currency } = useCurrency()
  const [userInput, setUserInput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [generatedProducts, setGeneratedProducts] = useState<GeneratedProduct[]>([])
  const [step, setStep] = useState<'input' | 'preview'>('input')
  const [isGeneratingImages, setIsGeneratingImages] = useState(false)
  const [regeneratingIdx, setRegeneratingIdx] = useState<number | null>(null)

  const base64ToBlob = (base64: string, mimeType: string) => {
    const byteCharacters = atob(base64)
    const byteNumbers = new Array(byteCharacters.length)
    for (let i = 0; i < byteCharacters.length; i += 1) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    return new Blob([new Uint8Array(byteNumbers)], { type: mimeType })
  }

  const generateAIImage = async (productName: string, productDescription: string) => {
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productName, productDescription }),
      });

      if (!response.ok) {
        return { error: "Generation failed" };
      }
      const data = await response.json();
      
      if (data.base64Image) {
        const filename = `ai-gen-${uuidv4()}.jpg`;
        const storageRef = ref(storage, `product-images/${filename}`);
        const blob = base64ToBlob(data.base64Image, 'image/jpeg')

        await uploadBytes(storageRef, blob, {
          contentType: 'image/jpeg',
          cacheControl: 'public,max-age=3600',
        })

        const imageUrl = await getDownloadURL(storageRef);
        return { imageUrl };
      }

      return { imageUrl: data.imageUrl || null };
    } catch (err) {
      console.error("Image generation proxy error:", err);
      return { error: err instanceof Error ? err.message : "Network error" };
    }
  }

  const handleGenerate = async () => {
    if (!userInput.trim()) {
      toast.error('Please enter some information about your products')
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch('/api/bulk-generate-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userInput,
          creatorName
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate products')
      }

      const data = await response.json()
      if (data.products && Array.isArray(data.products)) {
        setGeneratedProducts(data.products.map((p: any) => ({ ...p, selected: true, imageUrl: null })))
        setStep('preview')
        toast.success(`Generated ${data.products.length} product ideas!`)
        
        // Start background image generation
        void handleGenerateAllImages(data.products)
      } else {
        throw new Error('No products found in AI response')
      }
    } catch (error: any) {
      console.error('Instant catalog generation error:', error)
      toast.error(error.message || 'Failed to generate products')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGenerateAllImages = async (products: GeneratedProduct[]) => {
    setIsGeneratingImages(true)
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const res = await generateAIImage(product.name, product.description);
      if (res.imageUrl) {
        setGeneratedProducts(prev => {
          const next = [...prev];
          if (next[i]) next[i].imageUrl = res.imageUrl;
          return next;
        });
      }
    }
    setIsGeneratingImages(false)
  }

  const handleManualGenerateImage = async (index: number, name: string, desc: string) => {
    if (regeneratingIdx !== null) return
    setRegeneratingIdx(index)
    try {
      const res = await generateAIImage(name, desc)
      if (res.imageUrl) {
        setGeneratedProducts(prev => {
          const next = [...prev];
          next[index] = { ...next[index], imageUrl: res.imageUrl };
          return next;
        });
      } else {
        toast.error("Image generation failed")
      }
    } finally {
      setRegeneratingIdx(null)
    }
  }

  const handleCreateAll = async () => {
    const selectedProducts = generatedProducts.filter(p => p.selected)
    if (selectedProducts.length === 0) {
      toast.error('Please select at least one product to create')
      return
    }

    if (!user?.uid) {
      toast.error('You must be logged in to create products')
      return
    }

    setIsCreating(true)
    let createdCount = 0
    try {
      for (const product of selectedProducts) {
        await createProduct({
          userId: user.uid,
          name: product.name,
          description: product.description,
          price: product.price,
          currency: currency,
          category: product.category,
          images: product.imageUrl ? [product.imageUrl] : [],
          thumbnail: product.imageUrl || '',
          status: 'draft',
          tags: [],
          inventory: {
            quantity: 0,
            trackInventory: false
          },
          shipping: {
            weight: 0,
            dimensions: { length: 0, width: 0, height: 0 },
            shippingRequired: false
          },
          seo: {
            title: product.name,
            description: product.description,
            keywords: []
          },
          slug: '' // service handles slug generation
        })
        createdCount++
      }

      toast.success(`Successfully created ${createdCount} products!`)
      onProductsCreated()
      handleClose()
    } catch (error: any) {
      console.error('Instant catalog creation error:', error)
      toast.error(`Created ${createdCount} products, but encountered an error with the rest.`)
    } finally {
      setIsCreating(false)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    // Reset state after a delay to allow animation to finish
    setTimeout(() => {
      setStep('input')
      setUserInput('')
      setGeneratedProducts([])
    }, 300)
  }

  const toggleProductSelection = (index: number) => {
    const newProducts = [...generatedProducts]
    newProducts[index].selected = !newProducts[index].selected
    setGeneratedProducts(newProducts)
  }

  const removeProduct = (index: number) => {
    setGeneratedProducts(generatedProducts.filter((_, i) => i !== index))
  }

  const applyPreset = (value: string) => {
    setUserInput(value)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-hidden border-border/60 bg-background p-0 shadow-2xl flex flex-col">
        <DialogHeader className="px-6 py-4 border-b border-border/60 bg-muted/5">
          <DialogTitle className="flex items-center gap-2 text-lg font-bold sm:text-xl">
            <Sparkles className="w-5 h-5 text-primary animate-pulse" />
            Instant Catalog
          </DialogTitle>
          <DialogDescription>
            {step === 'input' 
              ? "Paste what you sell in plain language and turn it into product drafts."
              : "Review the drafts and keep only the ones you want to create."}
          </DialogDescription>
          {step === 'preview' && isGeneratingImages && (
            <div className="flex items-center gap-2 mt-2 text-[10px] font-bold text-primary uppercase tracking-widest animate-pulse">
              <Loader2 className="w-3 h-3 animate-spin" />
              Generating Images...
            </div>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6">
          {step === 'input' ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="space-y-2">
                  <Label htmlFor="userInput" className="text-sm font-semibold">What do you sell?</Label>
                  <div className="flex flex-wrap gap-2">
                    {INPUT_PRESETS.map((preset) => (
                      <Button
                        key={preset.label}
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 rounded-full px-3 text-[11px]"
                        onClick={() => applyPreset(preset.value)}
                      >
                        {preset.label}
                      </Button>
                    ))}
                  </div>
                </div>
                <Textarea
                  id="userInput"
                  placeholder="Example: I offer CV reviews for 15,000 NGN, 1-on-1 interview prep for 45,000 NGN, and a 4-week job search bootcamp for 120,000 NGN."
                  className="min-h-[250px] rounded-xl resize-none text-sm p-4 border-border/60 focus:ring-primary/20"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                />
                <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                  <AlertCircle className="w-3 h-3" />
                  Names and prices help it produce cleaner drafts.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-3">
                {generatedProducts.map((product, index) => (
                  <div 
                    key={index} 
                    className={`group relative flex flex-col gap-4 rounded-xl border p-4 transition-all duration-200 sm:flex-row sm:items-start ${
                      product.selected 
                        ? 'bg-primary/[0.02] border-primary/20 shadow-sm' 
                        : 'bg-muted/30 border-transparent opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 sm:block">
                      <button
                        type="button"
                        aria-label={product.selected ? `Deselect ${product.name}` : `Select ${product.name}`}
                        onClick={() => toggleProductSelection(index)}
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors sm:mt-1 ${
                          product.selected 
                            ? 'bg-primary border-primary text-primary-foreground' 
                            : 'border-muted-foreground/30 hover:border-primary/50'
                        }`}
                      >
                        {product.selected && <Check className="h-3.5 w-3.5" />}
                      </button>

                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Remove ${product.name}`}
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 sm:hidden"
                        onClick={() => removeProduct(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="relative flex h-32 w-full shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/60 bg-muted sm:h-20 sm:w-20 group/img">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center gap-1 p-2 text-center">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleManualGenerateImage(index, product.name, product.description)}
                            disabled={regeneratingIdx === index}
                            aria-label={`Generate image for ${product.name}`}
                            className="h-full w-full absolute inset-0 flex flex-col items-center justify-center gap-1 hover:bg-primary/5 transition-colors"
                          >
                            {regeneratingIdx === index ? (
                              <Loader2 className="h-3 w-3 animate-spin text-primary" />
                            ) : (
                              <>
                                <ImagePlus className="h-4 w-4 text-muted-foreground" />
                                <span className="text-[9px] uppercase font-bold tracking-tight text-muted-foreground sm:text-[8px]">Generate</span>
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                      {product.imageUrl && (
                        <Button 
                          variant="secondary"
                          size="icon"
                          onClick={() => handleManualGenerateImage(index, product.name, product.description)}
                          disabled={regeneratingIdx === index}
                          aria-label={`Regenerate image for ${product.name}`}
                          className="absolute bottom-1 right-1 h-6 w-6 rounded-full bg-black/50 text-white border-none shadow-lg transition-opacity hover:bg-black/70 opacity-100 sm:h-5 sm:w-5 sm:opacity-0 sm:group-hover/img:opacity-100"
                        >
                          <RefreshCw className={`h-2.5 w-2.5 ${regeneratingIdx === index ? 'animate-spin' : ''}`} />
                        </Button>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm truncate">{product.name}</h4>
                        <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                          {formatCurrency(product.price, currency)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{product.description}</p>
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 bg-muted rounded-md text-muted-foreground">
                          {product.category.replace('-', ' ')}
                        </span>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Remove ${product.name}`}
                      className="hidden h-8 w-8 text-destructive transition-opacity hover:bg-destructive/10 hover:text-destructive sm:inline-flex sm:opacity-0 sm:group-hover:opacity-100"
                      onClick={() => removeProduct(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              
              {generatedProducts.length === 0 && (
                <div className="py-12 text-center space-y-3">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <AlertCircle className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">No products left</p>
                    <p className="text-xs text-muted-foreground">Go back and try different input.</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setStep('input')}>
                    Go Back
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row px-6 py-4 border-t border-border/60 bg-muted/5 gap-2">
          {step === 'input' ? (
            <>
              <Button variant="outline" onClick={handleClose} className="w-full sm:w-auto h-11 px-6 rounded-xl order-2 sm:order-1">Cancel</Button>
              <Button 
                onClick={handleGenerate} 
                disabled={isGenerating || !userInput.trim()} 
                className="w-full sm:flex-1 h-11 px-8 rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:to-primary shadow-lg shadow-primary/20 order-1 sm:order-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Products
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setStep('input')} className="w-full sm:w-auto h-11 px-6 rounded-xl order-2 sm:order-1">Back</Button>
              <Button 
                onClick={handleCreateAll} 
                disabled={isCreating || generatedProducts.filter(p => p.selected).length === 0} 
                className="w-full sm:flex-1 h-11 px-8 rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:to-primary shadow-lg shadow-primary/20 order-1 sm:order-2"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating {generatedProducts.filter(p => p.selected).length} products...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Create {generatedProducts.filter(p => p.selected).length} Products
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default InstantCatalogModal

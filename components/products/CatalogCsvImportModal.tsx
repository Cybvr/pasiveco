'use client'

import React, { useRef, useState } from 'react'
import {
  AlertCircle,
  Check,
  FileUp,
  Loader2,
  Package,
  Trash2,
  Upload,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { createProduct } from '@/services/productsService'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'

interface CatalogCsvImportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onProductsCreated: () => void
}

interface ImportedProduct {
  sourceId: string
  name: string
  description: string
  price: number
  currency: string
  url: string
  imageUrl: string
  brand: string
  quantity: number
  availability: string
  tags: string[]
  selected: boolean
}

const REQUIRED_FIELDS = ['title', 'description', 'price'] as const

const parseCsv = (text: string) => {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let inQuotes = false

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]
    const nextChar = text[index + 1]

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        cell += '"'
        index += 1
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (char === ',' && !inQuotes) {
      row.push(cell)
      cell = ''
      continue
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') index += 1
      row.push(cell)
      if (row.some((value) => value.trim())) rows.push(row)
      row = []
      cell = ''
      continue
    }

    cell += char
  }

  row.push(cell)
  if (row.some((value) => value.trim())) rows.push(row)

  return rows
}

const normalizeHeader = (header: string) => header.trim().toLowerCase()

const parsePrice = (value: string) => {
  const trimmed = value.trim()
  const amountMatch = trimmed.match(/-?\d+(?:[.,]\d+)?/)
  const currencyMatch = trimmed.match(/\b[A-Z]{3}\b/)
  const amount = amountMatch ? Number(amountMatch[0].replace(',', '.')) : 0

  return {
    amount: Number.isFinite(amount) ? amount : 0,
    currency: currencyMatch?.[0] || 'NGN',
  }
}

const parseQuantity = (value: string, availability: string) => {
  const quantity = Number.parseInt(value || '', 10)
  if (Number.isFinite(quantity) && quantity >= 0) return quantity
  return availability.toLowerCase() === 'out of stock' ? 0 : 999
}

const getValue = (row: Record<string, string>, key: string) => row[key]?.trim() || ''

const extractRows = (csvText: string) => {
  const parsedRows = parseCsv(csvText)
  if (parsedRows.length < 2) return []

  const firstRow = parsedRows[0].map(normalizeHeader)
  const headerRowIndex = firstRow.some((cell) => cell.startsWith('# required') || cell.startsWith('# optional'))
    ? 1
    : 0
  const headers = parsedRows[headerRowIndex].map(normalizeHeader)

  return parsedRows.slice(headerRowIndex + 1).map((row) =>
    headers.reduce<Record<string, string>>((record, header, index) => {
      if (header) record[header] = row[index] || ''
      return record
    }, {})
  )
}

const mapFacebookCatalogRows = (csvText: string) => {
  return extractRows(csvText)
    .map((row) => {
      const price = parsePrice(getValue(row, 'price'))
      const salePrice = parsePrice(getValue(row, 'sale_price'))
      const availability = getValue(row, 'availability') || 'in stock'
      const quantity = parseQuantity(getValue(row, 'quantity_to_sell_on_facebook'), availability)
      const tagValues = [
        getValue(row, 'brand'),
        getValue(row, 'google_product_category'),
        getValue(row, 'fb_product_category'),
        getValue(row, 'color'),
        getValue(row, 'size'),
        getValue(row, 'material'),
        getValue(row, 'pattern'),
        getValue(row, 'style[0]'),
        getValue(row, 'product_tags[0]'),
        getValue(row, 'product_tags[1]'),
      ]

      return {
        sourceId: getValue(row, 'id'),
        name: getValue(row, 'title'),
        description: getValue(row, 'description'),
        price: salePrice.amount > 0 && salePrice.amount < price.amount ? salePrice.amount : price.amount,
        currency: price.currency,
        url: getValue(row, 'link'),
        imageUrl: getValue(row, 'image_link'),
        brand: getValue(row, 'brand'),
        quantity,
        availability,
        tags: Array.from(new Set(tagValues.filter(Boolean))),
        selected: true,
      }
    })
    .filter((product) => product.name && product.description && product.price >= 0)
}

const CatalogCsvImportModal: React.FC<CatalogCsvImportModalProps> = ({
  open,
  onOpenChange,
  onProductsCreated,
}) => {
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [fileName, setFileName] = useState('')
  const [products, setProducts] = useState<ImportedProduct[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const [isCreating, setIsCreating] = useState(false)

  const reset = () => {
    setFileName('')
    setProducts([])
    setErrors([])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleClose = (nextOpen: boolean) => {
    onOpenChange(nextOpen)
    if (!nextOpen) setTimeout(reset, 250)
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setErrors([])

    try {
      const text = await file.text()
      const parsedProducts = mapFacebookCatalogRows(text)
      const rows = extractRows(text)
      const missingFields = REQUIRED_FIELDS.filter((field) => !rows.some((row) => getValue(row, field)))

      if (missingFields.length > 0) {
        setErrors([`Missing required Facebook catalog columns: ${missingFields.join(', ')}`])
        setProducts([])
        return
      }

      if (parsedProducts.length === 0) {
        setErrors(['No valid products found in this CSV.'])
        setProducts([])
        return
      }

      setProducts(parsedProducts)
      toast.success(`Found ${parsedProducts.length} products`)
    } catch (error) {
      console.error('CSV import error:', error)
      setErrors(['Could not read this CSV file.'])
      setProducts([])
    }
  }

  const toggleProductSelection = (index: number) => {
    setProducts((current) =>
      current.map((product, productIndex) =>
        productIndex === index ? { ...product, selected: !product.selected } : product
      )
    )
  }

  const removeProduct = (index: number) => {
    setProducts((current) => current.filter((_, productIndex) => productIndex !== index))
  }

  const handleCreateProducts = async () => {
    const selectedProducts = products.filter((product) => product.selected)
    if (!user?.uid) {
      toast.error('You must be logged in to import products')
      return
    }
    if (selectedProducts.length === 0) {
      toast.error('Select at least one product')
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
          currency: product.currency,
          category: 'physical',
          url: product.url,
          images: product.imageUrl ? [product.imageUrl] : [],
          thumbnail: product.imageUrl,
          status: 'draft',
          tags: product.tags,
          details: {
            sku: product.sourceId,
          },
          inventory: {
            quantity: product.quantity,
            trackInventory: true,
          },
          shipping: {
            weight: 0,
            dimensions: { length: 0, width: 0, height: 0 },
            shippingRequired: true,
          },
          seo: {
            title: product.name,
            description: product.description,
            keywords: product.tags,
          },
          slug: '',
        })
        createdCount += 1
      }

      toast.success(`Imported ${createdCount} products as drafts`)
      onProductsCreated()
      handleClose(false)
    } catch (error) {
      console.error('Product import error:', error)
      toast.error(`Imported ${createdCount} products, then hit an error.`)
    } finally {
      setIsCreating(false)
    }
  }

  const selectedCount = products.filter((product) => product.selected).length

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col overflow-hidden border-border/60 p-0 shadow-2xl">
        <DialogHeader className="border-b border-border/60 px-6 py-4">
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <FileUp className="h-5 w-5 text-primary" />
            Import CSV
          </DialogTitle>
          <DialogDescription>
            Upload a Facebook catalog CSV and review product drafts before creating them.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={handleFileChange}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex min-h-36 w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-muted/20 p-6 text-center transition-colors hover:bg-muted/40"
          >
            <Upload className="h-8 w-8 text-muted-foreground" />
            <div className="space-y-1">
              <p className="text-sm font-semibold">{fileName || 'Choose a Facebook catalog CSV'}</p>
              <p className="text-xs text-muted-foreground">
                Supports columns like id, title, description, price, link, image_link, brand, and quantity.
              </p>
            </div>
          </button>

          {errors.length > 0 && (
            <div className="space-y-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3">
              {errors.map((error) => (
                <p key={error} className="flex items-start gap-2 text-xs text-destructive">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  {error}
                </p>
              ))}
            </div>
          )}

          {products.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Preview ({products.length})
              </p>
              <div className="grid gap-3">
                {products.map((product, index) => (
                  <div
                    key={`${product.sourceId || product.name}-${index}`}
                    className={`group flex gap-3 rounded-xl border p-3 transition-colors ${
                      product.selected ? 'border-primary/20 bg-primary/[0.02]' : 'border-border bg-muted/20 opacity-60'
                    }`}
                  >
                    <button
                      type="button"
                      aria-label={product.selected ? `Deselect ${product.name}` : `Select ${product.name}`}
                      onClick={() => toggleProductSelection(index)}
                      className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                        product.selected ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/30'
                      }`}
                    >
                      {product.selected && <Check className="h-3.5 w-3.5" />}
                    </button>

                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                      ) : (
                        <Package className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h4 className="truncate text-sm font-semibold">{product.name}</h4>
                          <p className="text-xs font-semibold text-green-600">
                            {product.currency} {product.price.toLocaleString()}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`Remove ${product.name}`}
                          className="h-7 w-7 shrink-0 text-destructive opacity-100 hover:bg-destructive/10 hover:text-destructive sm:opacity-0 sm:group-hover:opacity-100"
                          onClick={() => removeProduct(index)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <p className="line-clamp-2 text-xs text-muted-foreground">{product.description}</p>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {product.sourceId && (
                          <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                            {product.sourceId}
                          </span>
                        )}
                        <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                          {product.quantity} in stock
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col gap-2 border-t border-border/60 bg-muted/5 px-6 py-4 sm:flex-row">
          <Button variant="outline" onClick={() => handleClose(false)} className="h-11 w-full rounded-xl px-6 sm:w-auto">
            Cancel
          </Button>
          <Button
            onClick={handleCreateProducts}
            disabled={isCreating || selectedCount === 0}
            className="h-11 w-full rounded-xl px-8 sm:flex-1"
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importing {selectedCount} products...
              </>
            ) : (
              <>
                <FileUp className="mr-2 h-4 w-4" />
                Import {selectedCount} Drafts
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default CatalogCsvImportModal

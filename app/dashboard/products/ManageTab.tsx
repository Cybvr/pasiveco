import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Plus,
  Package,
  Copy,
  Trash2,
  MoreVertical,
  Sparkles,
  Eye,
  Layers,
  LayoutGrid,
  List,
  Zap,
} from 'lucide-react'
import StarRating from '@/components/products/StarRating'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { createProduct, deleteProduct } from '@/services/productsService'
import { toast } from 'sonner'
import NoProductsSection from '@/app/common/dashboard/NoProductsSection'
import { useCurrency } from '@/context/CurrencyContext'
import { formatCurrency, EXCHANGE_RATE } from '@/utils/currency'
import { getUser, type User as AppUser } from '@/services/userService'
import DashboardPagination from '@/components/dashboard/DashboardPagination'

function ManageTab({ products, isLoading = false, onProductsChanged, onCreateNew, onGenAINew, onBulkAINew, hasBankingDetails = false }) {
  const ITEMS_PER_PAGE = 12
  const router = useRouter()
  const { user } = useAuth()
  const { currency } = useCurrency()
  const [profile, setProfile] = useState<AppUser | null>(null)
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card')
  const [currentPage, setCurrentPage] = useState(1)

  React.useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.uid) return
      try {
        const fetchedProfile = await getUser(user.uid)
        setProfile(fetchedProfile)
      } catch (error) {
        console.error('Error fetching profile for ManageTab:', error)
      }
    }

    void fetchProfile()
  }, [user])

  const cleanHandle = (profile?.username || profile?.slug || (user as any)?.username || (user as any)?.slug || user?.email?.split('@')[0])?.replace(/^@/, '') || 'user'

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

  const openProductEditor = (product) => {
    router.push(`/dashboard/products/${product.id}`)
  }

  const duplicateProduct = async (product) => {
    try {
      await createProduct({
        userId: product.userId,
        name: `${product.name} Copy`,
        description: product.description || '',
        price: product.price || 0,
        currency: product.currency || 'NGN',
        category: product.category || 'digital-download',
        url: product.url || '',
        images: Array.isArray(product.images) ? product.images : [],
        thumbnail: product.thumbnail || '',
        status: 'draft',
        tags: Array.isArray(product.tags) ? product.tags : [],
        details: product.details,
        affiliateEnabled: Boolean(product.affiliateEnabled),
        affiliateCommission: product.affiliateEnabled ? (product.affiliateCommission || 20) : undefined,
        inventory: product.inventory || {
          quantity: 0,
          trackInventory: false,
        },
        shipping: product.shipping || {
          weight: 0,
          dimensions: { length: 0, width: 0, height: 0 },
          shippingRequired: false,
        },
        seo: product.seo || {
          title: `${product.name} Copy`,
          description: product.description || '',
          keywords: [],
        },
        paymentIntegration: product.paymentIntegration,
        rating: 0,
        reviewsCount: 0,
        slug: product.slug || product.id,
      })
      toast.success('Product duplicated')
      onProductsChanged()
    } catch (error) {
      console.error('Error duplicating product:', error)
      toast.error('Failed to duplicate product')
    }
  }

  React.useEffect(() => {
    setCurrentPage(1)
  }, [products.length, viewMode])

  const totalPages = Math.max(1, Math.ceil(products.length / ITEMS_PER_PAGE))
  const paginatedProducts = products.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold whitespace-nowrap">My Products ({products.length})</h2>
          <div className="flex items-center rounded-lg bg-muted p-0.5 lg:hidden">
            <Button
              variant={viewMode === 'card' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-7 w-7 rounded-md"
              onClick={() => setViewMode('card')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-7 w-7 rounded-md"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="mr-2 hidden items-center rounded-lg bg-muted p-0.5 lg:flex">
            <Button
              variant={viewMode === 'card' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-7 w-7 rounded-md"
              onClick={() => setViewMode('card')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-7 w-7 rounded-md"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid w-full grid-cols-3 gap-2 sm:flex sm:w-auto">
            <Button variant="outline" onClick={onGenAINew} title="Quick Add" className="h-8 shrink-0 gap-1 overflow-hidden rounded-lg border-primary/20 px-2 text-[10px] text-primary hover:bg-primary/5 sm:gap-1.5 sm:px-3 sm:text-xs">
              <Sparkles className="h-3.5 w-3.5" />
              <span className="hidden truncate sm:inline">Quick Add</span>
            </Button>
            <Button variant="outline" onClick={onBulkAINew} title="Instant Catalog" className="h-8 shrink-0 gap-1 overflow-hidden rounded-lg border-primary/20 px-2 text-[10px] text-primary hover:bg-primary/5 sm:gap-1.5 sm:px-3 sm:text-xs">
              <Layers className="h-3.5 w-3.5" />
              <span className="hidden truncate sm:inline">Instant Catalog</span>
            </Button>
            <Button onClick={onCreateNew} title="New Product" className="h-8 shrink-0 gap-1 overflow-hidden rounded-lg px-2 text-[10px] sm:gap-1.5 sm:px-4 sm:text-xs">
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">New</span>
            </Button>
          </div>
        </div>
      </div>

      {viewMode === 'card' ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:gap-5 xl:grid-cols-4">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <div key={`product-skeleton-${index}`} className="space-y-2 p-2">
                <Skeleton className="aspect-square w-full rounded-md" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              </div>
            ))
          ) : (
            paginatedProducts.map((product: any) => (
              <div
                key={product.id}
                className="group relative cursor-pointer space-y-2"
                onClick={() => openProductEditor(product)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    openProductEditor(product)
                  }
                }}
              >
                <div className="relative aspect-square w-full overflow-hidden rounded-md bg-muted">
                  {product.thumbnail ? (
                    <img
                      src={product.thumbnail}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/10">
                      <Package className="h-8 w-8 text-primary" />
                    </div>
                  )}

                  {product.affiliateEnabled && (
                    <div className="absolute left-2 top-2 z-10">
                      <div className="flex items-center gap-1 rounded-md bg-zinc-950/80 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-md">
                        <Zap className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {product.affiliateCommission || 20}%
                      </div>
                    </div>
                  )}

                  <div className="absolute right-2 top-2 z-10 transition-opacity duration-200 sm:opacity-0 sm:group-hover:opacity-100">
                    <a
                      href={`/${cleanHandle}/product/${product.slug || product.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-background/90 text-muted-foreground shadow-sm backdrop-blur hover:bg-background"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <Eye className="h-4 w-4" />
                    </a>
                  </div>
                </div>

                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 space-y-1">
                    <h3 className="truncate text-sm font-semibold">{product.name}</h3>
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
                    <div className="flex items-center gap-1">
                      <StarRating rating={product.rating || 0} count={product.reviewsCount || 0} />
                    </div>
                  </div>

                  <div className="shrink-0 -mr-1 -mt-1 transition-opacity duration-200 sm:opacity-0 sm:group-hover:opacity-100 focus-within:opacity-100 data-[state=open]:opacity-100">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(event) => event.stopPropagation()}>
                        <Button
                          size="icon"
                          variant="secondary"
                          className="h-7 w-7 rounded-full bg-background/90 text-muted-foreground shadow-sm backdrop-blur"
                          aria-label="Product actions"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" onClick={(event) => event.stopPropagation()}>
                        <DropdownMenuItem
                          onSelect={(event) => {
                            event.preventDefault()
                            openProductEditor(product)
                          }}
                        >
                          <Eye className="mr-2 h-3.5 w-3.5" />
                          Open
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={(event) => {
                            event.preventDefault()
                            duplicateProduct(product)
                          }}
                        >
                          <Copy className="mr-2 h-3.5 w-3.5" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={(event) => {
                            event.preventDefault()
                            handleDeleteProduct(product.id, product.name)
                          }}
                          className="text-destructive focus:text-destructive"
                        >
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
      ) : (
        <div className="flex flex-col gap-2 pt-4">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <div key={`product-list-skeleton-${index}`} className="flex items-center gap-3 rounded-xl border border-transparent p-2 sm:gap-4 sm:p-3">
                <Skeleton className="h-14 w-14 shrink-0 rounded-lg sm:h-16 sm:w-16" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            ))
          ) : (
            paginatedProducts.map((product: any) => (
              <div
                key={product.id}
                className="group relative flex cursor-pointer items-center gap-3 rounded-xl border border-border/40 p-2 transition-all hover:bg-muted/30 sm:gap-4 sm:p-3"
                onClick={() => openProductEditor(product)}
              >
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border bg-muted sm:h-16 sm:w-16">
                  {product.thumbnail ? (
                    <img
                      src={product.thumbnail}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-primary/10">
                      <Package className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1 pr-8 sm:pr-0">
                  <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-2">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-sm font-semibold">{product.name}</h3>
                      {product.status === 'draft' && (
                        <span className="rounded-sm bg-yellow-100/50 px-1.5 py-0.5 text-[8px] font-bold uppercase text-yellow-700">Draft</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 overflow-hidden">
                      <span className="whitespace-nowrap rounded bg-muted px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-muted-foreground sm:px-2 sm:text-[10px]">
                        {product.category?.replace('-', ' ')}
                      </span>
                      {product.affiliateEnabled && (
                        <span className="flex whitespace-nowrap items-center gap-1 rounded bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold text-primary sm:px-2 sm:text-[10px]">
                          <Zap className="h-2 w-2 fill-primary sm:h-2.5 sm:w-2.5" />
                          {product.affiliateCommission || 20}%
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="mt-0.5 hidden line-clamp-1 text-xs text-muted-foreground sm:block">{product.description}</p>
                  <div className="mt-1 flex items-center gap-2 sm:mt-1.5 sm:gap-3">
                    <div className="origin-left scale-90 sm:scale-100">
                      <StarRating rating={product.rating || 0} count={product.reviewsCount || 0} />
                    </div>
                    <div className="hidden h-1 w-1 rounded-full bg-border sm:block" />
                    <p className="text-xs font-bold text-green-600 sm:text-sm">
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
                </div>

                <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1 sm:static sm:translate-y-0">
                  <a
                    href={`/${cleanHandle}/product/${product.slug || product.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <Eye className="h-4 w-4" />
                  </a>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(event) => event.stopPropagation()}>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 rounded-full text-muted-foreground"
                        aria-label="Product actions"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" onClick={(event) => event.stopPropagation()}>
                      <DropdownMenuItem
                        onSelect={(event) => {
                          event.preventDefault()
                          openProductEditor(product)
                        }}
                      >
                        <Eye className="mr-2 h-3.5 w-3.5" />
                        Open
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={(event) => {
                          event.preventDefault()
                          duplicateProduct(product)
                        }}
                      >
                        <Copy className="mr-2 h-3.5 w-3.5" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={(event) => {
                          event.preventDefault()
                          handleDeleteProduct(product.id, product.name)
                        }}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-3.5 w-3.5" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {!isLoading && products.length === 0 && (
        <NoProductsSection
          showBankingDetailsAction={!hasBankingDetails}
          onAddProduct={onCreateNew}
          className="border-dashed shadow-none"
        />
      )}

      {!isLoading && products.length > 0 && (
        <DashboardPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  )
}

export default ManageTab

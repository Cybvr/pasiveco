import Link from 'next/link'
import { PackagePlus, Landmark } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface NoProductsSectionProps {
  showBankingDetailsAction?: boolean
  addProductHref?: string
  addBankingDetailsHref?: string
  onAddProduct?: () => void
  onAddBankingDetails?: () => void
  className?: string
}

export default function NoProductsSection({
  showBankingDetailsAction = false,
  addProductHref = '/dashboard/products?new=1',
  addBankingDetailsHref = '/dashboard/settings/banking-details',
  onAddProduct,
  onAddBankingDetails,
  className = '',
}: NoProductsSectionProps) {
  return (
    <section className={`rounded-3xl border bg-card p-6 shadow-sm ${className}`.trim()}>
      <div className="max-w-2xl space-y-4">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <PackagePlus className="h-6 w-6" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">You don’t have any product yet</h2>
          <p className="text-sm leading-6 text-muted-foreground sm:text-base">
            Welcome to{' '}
            <a href="http://Pasive.co" target="_blank" rel="noreferrer" className="font-medium text-foreground underline underline-offset-4">
              Pasive.co
            </a>
            , your simple e-commerce tool to sell your content, products and services.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          {showBankingDetailsAction && (
            onAddBankingDetails ? (
              <Button type="button" variant="outline" className="gap-2" onClick={onAddBankingDetails}>
                <Landmark className="h-4 w-4" />
                Add Banking Details
              </Button>
            ) : (
              <Button asChild variant="outline" className="gap-2">
                <Link href={addBankingDetailsHref}>
                  <Landmark className="h-4 w-4" />
                  Add Banking Details
                </Link>
              </Button>
            )
          )}

          {onAddProduct ? (
            <Button type="button" className="gap-2" onClick={onAddProduct}>
              <PackagePlus className="h-4 w-4" />
              Add Product
            </Button>
          ) : (
            <Button asChild className="gap-2">
              <Link href={addProductHref}>
                <PackagePlus className="h-4 w-4" />
                Add Product
              </Link>
            </Button>
          )}
        </div>
      </div>
    </section>
  )
}

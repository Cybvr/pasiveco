import React from 'react'
import { Badge } from '@/components/ui/badge'
import { getProductTypeLabel } from '@/lib/productTypes'
import { Product } from '@/services/productsService'
import StarRating from '@/components/products/StarRating'

const formatDateTime = (value?: string) => {
  if (!value) return null

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(parsed)
}

const formatDay = (value?: string) => {
  if (!value) return value
  return value.charAt(0).toUpperCase() + value.slice(1)
}

const summaryItemsForProduct = (product: Product) => {
  const details = product.details || {}

  switch (product.category) {
    case 'tickets':
      return [
        { label: 'Event date', value: formatDateTime(details.eventDateTime) },
        { label: 'Location', value: details.eventLocation },
        { label: 'Quantity available', value: details.quantityAvailable ? String(details.quantityAvailable) : null },
        { label: 'Delivery', value: 'QR code and email sent automatically after purchase' },
      ]
    case 'courses':
      return [
        { label: 'Lessons', value: details.lessons?.length ? `${details.lessons.length} lessons included` : null },
        { label: 'Drip schedule', value: details.dripSchedule || 'No drip schedule' },
        { label: 'Enrollment limit', value: details.enrollmentLimit ? `${details.enrollmentLimit} students` : 'Unlimited' },
      ]
    case 'digital-download':
      return [
        { label: 'File', value: details.fileName || 'Uploaded file' },
        { label: 'Delivery', value: 'Download link sent automatically by email after purchase' },
      ]
    case 'membership':
      return [
        { label: 'Billing interval', value: details.billingInterval ? formatDay(details.billingInterval) : null },
        { label: 'Perks', value: details.perks?.length ? `${details.perks.length} member perks included` : null },
      ]
    case 'booking':
      return [
        { label: 'Session length', value: details.sessionLength ? `${details.sessionLength} minutes` : null },
        {
          label: 'Availability',
          value: details.availability?.length
            ? details.availability
                .map((slot: { day: string; start: string; end: string }) => `${formatDay(slot.day)} ${slot.start}-${slot.end}`)
                .join(', ')
            : null,
        },
        { label: 'Video link', value: details.videoLink || null },
      ]
    case 'bundle':
      return [
        { label: 'Included products', value: details.includedProducts?.length ? `${details.includedProducts.length} products included` : null },
      ]
    default:
      return []
  }
}

export default function ProductDetailsSummary({ product }: { product: Product }) {
  const summaryItems = summaryItemsForProduct(product).filter((item) => Boolean(item.value))
  const details = product.details || {}
  const lessons = Array.isArray(details.lessons) ? details.lessons : []
  const perks = Array.isArray(details.perks) ? details.perks : []
  const includedProducts = Array.isArray(details.includedProducts) ? details.includedProducts : []

  if (summaryItems.length === 0 && lessons.length === 0 && perks.length === 0 && includedProducts.length === 0) {
    return null
  }

  return (
    <section className="space-y-4 border-b pb-6">
      <div className="space-y-1">
        <p className="text-sm font-medium">What&apos;s included</p>
        <p className="text-sm text-muted-foreground">
          {getProductTypeLabel(product.category)} setup and fulfillment details.
        </p>
      </div>

      {summaryItems.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {summaryItems.map((item) => (
            <div key={item.label} className="rounded-xl border bg-muted/20 p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{item.label}</p>
              <p className="mt-1 text-sm text-foreground break-words">{item.value}</p>
            </div>
          ))}
        </div>
      )}

      {lessons.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Course lessons</p>
          <div className="space-y-2">
            {lessons.map((lesson: { title: string; content?: string; videoUrl?: string }, index: number) => (
              <div key={`${lesson.title}-${index}`} className="rounded-xl border bg-background p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium">{index + 1}. {lesson.title}</p>
                  {lesson.videoUrl ? <Badge variant="outline">Video</Badge> : null}
                </div>
                {lesson.content ? <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">{lesson.content}</p> : null}
              </div>
            ))}
          </div>
        </div>
      )}

      {perks.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Membership perks</p>
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            {perks.map((perk: string, index: number) => (
              <li key={`${perk}-${index}`}>{perk}</li>
            ))}
          </ul>
        </div>
      )}

      {includedProducts.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Included products</p>
          <div className="flex flex-wrap gap-2">
            {includedProducts.map((item: { id: string; name: string }, index: number) => (
              <Badge key={`${item.id}-${index}`} variant="outline">{item.name}</Badge>
            ))}
          </div>
        </div>
      )}

      {(product.rating || 0) > 0 && (
        <div className="space-y-1.5 pt-2">
          <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Storefront Rating</p>
          <div className="flex items-center gap-2">
            <StarRating rating={product.rating} count={product.reviewsCount} />
            <span className="text-xs font-semibold">{product.rating} average based on {product.reviewsCount} reviews</span>
          </div>
        </div>
      )}
    </section>
  )
}

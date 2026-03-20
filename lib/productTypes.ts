import { Calendar, Download, GraduationCap, Layers3, LucideIcon, Package, Ticket, UserRound } from 'lucide-react'

export const PRODUCT_TYPE_OPTIONS: Array<{
  id: ProductTypeId
  name: string
  icon: LucideIcon
  description: string
  badge: string
}> = [
  {
    id: 'tickets',
    name: 'Tickets',
    icon: Ticket,
    description: 'Events, workshops, and live experiences',
    badge: 'Date + location',
  },
  {
    id: 'courses',
    name: 'Courses',
    icon: GraduationCap,
    description: 'Structured learning with lessons and drip access',
    badge: 'Lesson builder',
  },
  {
    id: 'digital-download',
    name: 'Digital Download',
    icon: Download,
    description: 'Upload a file for automatic delivery after purchase',
    badge: 'Email delivery',
  },
  {
    id: 'membership',
    name: 'Membership',
    icon: Calendar,
    description: 'Recurring access with monthly or yearly billing',
    badge: 'Recurring access',
  },
  {
    id: 'booking',
    name: '1:1 Booking',
    icon: UserRound,
    description: 'Private sessions with scheduling availability',
    badge: 'Calendar ready',
  },
  {
    id: 'bundle',
    name: 'Bundle',
    icon: Layers3,
    description: 'Package existing products together into one offer',
    badge: 'Cross-sell',
  },
]

export type ProductTypeId = 'tickets' | 'courses' | 'digital-download' | 'membership' | 'booking' | 'bundle'

export const getProductTypeLabel = (type?: string) => {
  const match = PRODUCT_TYPE_OPTIONS.find((option) => option.id === type)
  return match?.name || type || 'Product'
}

export const getProductTypeIcon = (type?: string) => {
  const match = PRODUCT_TYPE_OPTIONS.find((option) => option.id === type)
  return match?.icon || Package
}

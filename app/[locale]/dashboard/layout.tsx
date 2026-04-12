// @/app/dashboard/layout.tsx

import { Metadata } from 'next'
import DashboardClientLayout from './dashclient'

export const metadata: Metadata = {
  title: 'Dashboard | Pasive',
  description: 'Manage your profile, feed, products, and analytics in the Pasive dashboard.',
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardClientLayout>{children}</DashboardClientLayout>
}

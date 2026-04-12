// @/app/dashboard/settings/plan-billing/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Plan & Billing — Dashboard',
  description: 'Manage your subscription, billing cycle, and view past invoices.',
  openGraph: {
    title: 'Plan & Billing — Dashboard',
    description: 'Manage your subscription, billing cycle, and view past invoices.',
    type: 'website',
    url: 'https://pasive.co/dashboard/settings/plan-billing',
    siteName: 'Pasive',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Plan & Billing — Dashboard',
    description: 'Manage your subscription, billing cycle, and view past invoices.',
  },
};

export default function PlanBillingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

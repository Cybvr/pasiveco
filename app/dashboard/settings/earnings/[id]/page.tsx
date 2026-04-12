import { redirect } from 'next/navigation'

export default async function LegacyEarningDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  redirect(`/dashboard/earnings/${id}`)
}

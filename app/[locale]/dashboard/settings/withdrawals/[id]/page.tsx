import { redirect } from 'next/navigation'

export default async function SettingsWithdrawalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  redirect(`/dashboard/payouts/${id}`)
}

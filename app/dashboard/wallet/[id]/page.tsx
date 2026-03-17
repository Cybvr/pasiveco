import { redirect } from 'next/navigation'

export default async function WalletTransactionRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  redirect(`/dashboard/settings/earnings/${id}`)
}

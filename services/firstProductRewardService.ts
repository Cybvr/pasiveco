export interface FirstProductRewardResponse {
  success: boolean
  status?: 'paid' | 'failed' | 'skipped' | 'already_paid'
  message?: string
}

export const requestFirstProductReward = async (productId: string): Promise<FirstProductRewardResponse | null> => {
  if (!productId) return null

  try {
    const response = await fetch('/api/rewards/first-product', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId }),
    })

    const contentType = response.headers.get('content-type') || ''
    const data = contentType.includes('application/json') ? await response.json() : null

    if (!response.ok) {
      console.warn('First product reward request failed:', data?.message || response.statusText)
      return data || { success: false, message: response.statusText }
    }

    return data
  } catch (error) {
    console.warn('Unable to request first product reward:', error)
    return null
  }
}

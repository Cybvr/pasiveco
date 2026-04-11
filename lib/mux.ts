import "server-only"

import Mux from "@mux/mux-node"

const tokenId = process.env.MUX_TOKEN_ID
const tokenSecret = process.env.MUX_TOKEN_SECRET
const signingKey = process.env.MUX_SIGNING_KEY_ID || process.env.MUX_SIGNING_KEY
const privateKey = process.env.MUX_PRIVATE_KEY?.replace(/\\n/g, "\n")
const webhookSecret = process.env.MUX_WEBHOOK_SECRET

export const isMuxConfigured = Boolean(tokenId && tokenSecret)
export const isMuxSigningConfigured = Boolean(signingKey && privateKey)
export const isMuxWebhookConfigured = Boolean(webhookSecret)

export const mux = isMuxConfigured
  ? new Mux({
      tokenId,
      tokenSecret,
      webhookSecret,
      jwtSigningKey: signingKey,
      jwtPrivateKey: privateKey,
    })
  : null

export function assertMuxConfigured() {
  if (!mux) {
    throw new Error("Mux API credentials are missing")
  }
}

export function assertMuxSigningConfigured() {
  assertMuxConfigured()
  if (!isMuxSigningConfigured) {
    throw new Error("Mux signing credentials are missing")
  }
}

export function assertMuxWebhookConfigured() {
  assertMuxConfigured()
  if (!isMuxWebhookConfigured) {
    throw new Error("Mux webhook secret is missing")
  }
}

export interface MuxPassthroughPayload {
  userId: string
  lessonId: string
  productId?: string
  productSlug?: string
}

export function createMuxPassthrough(payload: MuxPassthroughPayload) {
  return JSON.stringify(payload)
}

export function parseMuxPassthrough(value?: string | null): MuxPassthroughPayload | null {
  if (!value) return null

  try {
    return JSON.parse(value) as MuxPassthroughPayload
  } catch (error) {
    console.error("Failed to parse Mux passthrough payload:", error)
    return null
  }
}

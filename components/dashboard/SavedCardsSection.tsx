"use client"

import { useEffect, useState } from "react"
import { CreditCard, Loader2, MoreVertical, Plus } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/hooks/useAuth"

interface SavedCard {
  id: string
  brand: string
  last4: string
  expMonth: number
  expYear: number
  funding: string | null
  isDefault: boolean
}

const formatCardBrand = (value: string) =>
  value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")

const formatCardExpiry = (month: number, year: number) =>
  `${String(month).padStart(2, "0")}/${String(year).slice(-2)}`

export default function SavedCardsSection() {
  const { user } = useAuth()
  const [savedCards, setSavedCards] = useState<SavedCard[]>([])
  const [cardsLoading, setCardsLoading] = useState(true)
  const [startingCardSetup, setStartingCardSetup] = useState(false)
  const [cardBusyId, setCardBusyId] = useState<string | null>(null)

  const loadSavedCards = async () => {
    if (!user?.uid || !user.email) {
      setSavedCards([])
      setCardsLoading(false)
      return
    }

    try {
      setCardsLoading(true)
      const res = await fetch(
        `/api/stripe/payment-methods?userId=${encodeURIComponent(user.uid)}&email=${encodeURIComponent(user.email)}`
      )
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.message || "Unable to load saved cards")
      setSavedCards(Array.isArray(json.data) ? json.data : [])
    } catch (error: any) {
      toast.error(error.message || "Failed to load saved cards")
      setSavedCards([])
    } finally {
      setCardsLoading(false)
    }
  }

  useEffect(() => {
    void loadSavedCards()
  }, [user?.uid, user?.email])

  const handleAddCard = async () => {
    if (!user?.uid || !user.email) return

    setStartingCardSetup(true)
    try {
      const res = await fetch("/api/stripe/payment-methods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.uid, email: user.email }),
      })
      const json = await res.json()
      if (!res.ok || !json.success || !json.url) throw new Error(json.message || "Unable to start card setup")
      window.location.href = json.url
    } catch (error: any) {
      toast.error(error.message || "Unable to start card setup")
      setStartingCardSetup(false)
    }
  }

  const handleSetDefaultCard = async (paymentMethodId: string) => {
    if (!user?.uid || !user.email) return

    setCardBusyId(paymentMethodId)
    try {
      const res = await fetch("/api/stripe/payment-methods", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.uid, email: user.email, paymentMethodId }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.message || "Unable to update default card")
      setSavedCards(Array.isArray(json.data) ? json.data : [])
      toast.success("Default card updated")
    } catch (error: any) {
      toast.error(error.message || "Unable to update default card")
    } finally {
      setCardBusyId(null)
    }
  }

  const handleRemoveCard = async (paymentMethodId: string) => {
    if (!user?.uid || !user.email) return

    setCardBusyId(paymentMethodId)
    try {
      const res = await fetch("/api/stripe/payment-methods", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.uid, email: user.email, paymentMethodId }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.message || "Unable to remove card")
      setSavedCards(Array.isArray(json.data) ? json.data : [])
      toast.success("Card removed")
    } catch (error: any) {
      toast.error(error.message || "Unable to remove card")
    } finally {
      setCardBusyId(null)
    }
  }

  if (cardsLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-base font-semibold">Saved cards</h2>
          <p className="text-sm text-muted-foreground">
            Save a card once and reuse it whenever Stripe powers your checkout.
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={handleAddCard} disabled={startingCardSetup}>
          {startingCardSetup ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
          Add Card
        </Button>
      </div>

      {savedCards.length === 0 ? (
        <div className="rounded-lg border bg-muted/5 p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded bg-muted text-muted-foreground">
              <CreditCard className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold">No saved cards yet</p>
              <p className="text-sm text-muted-foreground">
                Add a card here and Stripe can offer it again during future purchases.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {savedCards.map((card) => (
            <div
              key={card.id}
              className={`flex items-center justify-between rounded-lg border bg-background p-4 ${
                card.isDefault ? "border-primary/30 ring-1 ring-primary/5" : ""
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded ${
                    card.isDefault ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                  }`}
                >
                  <CreditCard className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">
                      {formatCardBrand(card.brand)} ending in {card.last4}
                    </span>
                    {card.isDefault && (
                      <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Expires {formatCardExpiry(card.expMonth, card.expYear)}
                    {card.funding ? ` - ${formatCardBrand(card.funding)}` : ""}
                  </p>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" disabled={cardBusyId === card.id}>
                    {cardBusyId === card.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreVertical className="h-4 w-4" />}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44 p-1 text-xs">
                  {!card.isDefault && (
                    <DropdownMenuItem onClick={() => handleSetDefaultCard(card.id)}>Set as Default</DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => handleRemoveCard(card.id)} className="text-destructive">
                    Remove Card
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

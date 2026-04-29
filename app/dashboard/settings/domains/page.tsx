"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"
import { AlertCircle, CheckCircle2, Copy, Globe2, Loader2, RefreshCw, Trash2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/hooks/use-toast"

type DomainStatus = "pending" | "active" | "error"

interface DomainVerificationRecord {
  type: string
  domain: string
  value: string
  reason?: string
}

interface DomainRecord {
  id: string
  domain: string
  username: string
  status: DomainStatus
  verified: boolean
  verification?: DomainVerificationRecord[]
  error?: string | null
}

const statusStyles: Record<DomainStatus, string> = {
  active: "border-emerald-200 bg-emerald-50 text-emerald-800",
  pending: "border-amber-200 bg-amber-50 text-amber-800",
  error: "border-red-200 bg-red-50 text-red-800",
}

function getRecordName(record: DomainVerificationRecord) {
  if (record.type.toUpperCase() === "TXT") return record.domain
  return record.domain === "@" ? record.domain : record.domain.replace(/\.$/, "")
}

export default function DomainsSettings() {
  const [domains, setDomains] = useState<DomainRecord[]>([])
  const [domainInput, setDomainInput] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [busyDomain, setBusyDomain] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const hasDomains = domains.length > 0
  const pendingDomains = useMemo(() => domains.filter((domain) => domain.status !== "active"), [domains])

  const loadDomains = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/domains", { cache: "no-store" })
      const data = await response.json()
      if (!response.ok) throw new Error(data?.error || "Failed to load domains.")
      setDomains(data.domains || [])
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to load domains.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadDomains()
  }, [])

  const connectDomain = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const response = await fetch("/api/domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: domainInput }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data?.error || "Failed to connect domain.")

      setDomainInput("")
      await loadDomains()
      toast({ title: "Domain added", description: "Add the DNS records shown below, then verify it." })
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to connect domain.")
    } finally {
      setSaving(false)
    }
  }

  const verifyDomain = async (domain: string) => {
    setBusyDomain(domain)
    setError(null)

    try {
      const response = await fetch(`/api/domains/${encodeURIComponent(domain)}/verify`, { method: "POST" })
      const data = await response.json()
      if (!response.ok) throw new Error(data?.error || "Failed to verify domain.")

      await loadDomains()
      toast({
        title: data.domain?.verified ? "Domain is live" : "DNS not ready yet",
        description: data.domain?.verified ? "This domain now points to your Pasive page." : "Wait a few minutes after changing DNS, then try again.",
      })
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to verify domain.")
    } finally {
      setBusyDomain(null)
    }
  }

  const removeDomain = async (domain: string) => {
    setBusyDomain(domain)
    setError(null)

    try {
      const response = await fetch(`/api/domains/${encodeURIComponent(domain)}`, { method: "DELETE" })
      const data = await response.json()
      if (!response.ok) throw new Error(data?.error || "Failed to remove domain.")

      setDomains((current) => current.filter((item) => item.domain !== domain))
      toast({ title: "Domain removed", description: "The domain was disconnected from your Pasive page." })
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to remove domain.")
    } finally {
      setBusyDomain(null)
    }
  }

  const copyValue = async (value: string) => {
    await navigator.clipboard.writeText(value)
    toast({ title: "Copied", description: "DNS value copied to clipboard." })
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="border border-border bg-card p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Globe2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Connect your own domain</h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Add a domain you already own. Pasive will create the Vercel connection and show you the DNS records to paste into your domain provider.
              </p>
            </div>
          </div>

          <form onSubmit={connectDomain} className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Input
              value={domainInput}
              onChange={(event) => setDomainInput(event.target.value)}
              placeholder="yourbrand.com"
              className="h-11 border border-border bg-background"
              disabled={saving}
            />
            <Button type="submit" className="h-11 shrink-0" disabled={saving || !domainInput.trim()}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Connect domain
            </Button>
          </form>
        </section>

        <section className="border border-border bg-background p-5">
          <h3 className="text-sm font-semibold">What the creator does</h3>
          <ol className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-3"><span className="font-semibold text-foreground">1.</span><span>Buy a domain anywhere.</span></li>
            <li className="flex gap-3"><span className="font-semibold text-foreground">2.</span><span>Paste it here in Pasive.</span></li>
            <li className="flex gap-3"><span className="font-semibold text-foreground">3.</span><span>Add the DNS records Pasive shows.</span></li>
            <li className="flex gap-3"><span className="font-semibold text-foreground">4.</span><span>Click verify and the domain goes live.</span></li>
          </ol>
        </section>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Domain setup failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {pendingDomains.length > 0 ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>DNS can take a little time</AlertTitle>
          <AlertDescription>
            After adding records at the domain provider, wait a few minutes and click verify. Some providers take longer.
          </AlertDescription>
        </Alert>
      ) : null}

      <section className="border border-border">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h3 className="font-semibold">Connected domains</h3>
          <Button variant="outline" size="sm" onClick={loadDomains} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-14 text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading domains
          </div>
        ) : !hasDomains ? (
          <div className="py-14 text-center">
            <Globe2 className="mx-auto h-10 w-10 text-muted-foreground" />
            <h3 className="mt-4 text-sm font-semibold">No custom domains yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">Connect a domain to start using your own branded profile URL.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {domains.map((domain) => (
              <article key={domain.id || domain.domain} className="space-y-4 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-semibold">{domain.domain}</h4>
                      <Badge variant="outline" className={statusStyles[domain.status] || statusStyles.pending}>
                        {domain.status === "active" ? "Live" : domain.status}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">Routes to /{domain.username}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => verifyDomain(domain.domain)}
                      disabled={busyDomain === domain.domain}
                    >
                      {busyDomain === domain.domain ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                      Verify
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeDomain(domain.domain)}
                      disabled={busyDomain === domain.domain}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remove
                    </Button>
                  </div>
                </div>

                {domain.verification?.length ? (
                  <div className="overflow-hidden border border-border">
                    <div className="grid grid-cols-[0.6fr_1fr_1.4fr_40px] gap-3 border-b border-border bg-muted px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      <span>Type</span>
                      <span>Name</span>
                      <span>Value</span>
                      <span />
                    </div>
                    {domain.verification.map((record, index) => (
                      <div key={`${record.type}-${record.domain}-${index}`} className="grid grid-cols-[0.6fr_1fr_1.4fr_40px] items-center gap-3 px-3 py-3 text-sm">
                        <span className="font-semibold">{record.type}</span>
                        <span className="break-words font-mono text-xs">{getRecordName(record)}</span>
                        <span className="break-words font-mono text-xs">{record.value}</span>
                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyValue(record.value)} aria-label="Copy DNS value">
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : domain.status === "active" ? (
                  <p className="text-sm text-emerald-700">This domain is verified and live.</p>
                ) : (
                  <p className="text-sm text-muted-foreground">Vercel did not return DNS records for this domain yet. Click verify or refresh.</p>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

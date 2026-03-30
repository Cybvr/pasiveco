"use client"

import { useState } from "react"
import { Mail, ArrowRight, CheckCircle2, Loader2 } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { addDoc, collection, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"

const SATISFACTION_OPTIONS = [
  "I did not get started",
  "I am still figuring it out",
  "It is useful, but not essential yet",
  "It is already helping my business",
]

export default function FeedbackSurveyPage() {
  const searchParams = useSearchParams()
  const [firstName, setFirstName] = useState(searchParams.get("firstName") || "")
  const [email, setEmail] = useState(searchParams.get("email") || "")
  const [satisfaction, setSatisfaction] = useState("")
  const [goal, setGoal] = useState("")
  const [blocker, setBlocker] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async () => {
    setLoading(true)
    setError("")

    try {
      await addDoc(collection(db, "feedbackResponses"), {
        firstName: firstName.trim(),
        email: email.trim().toLowerCase(),
        satisfaction,
        goal: goal.trim(),
        blocker: blocker.trim(),
        source: "marketing-survey-page",
        page: "/survey/feedback",
        createdAt: serverTimestamp(),
      })

      setSubmitted(true)
      setFirstName("")
      setEmail("")
      setSatisfaction("")
      setGoal("")
      setBlocker("")
    } catch (submissionError) {
      console.error("Error saving feedback response:", submissionError)
      setError("We could not save your feedback right now. Please try again or email admin@pasive.co.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/30 to-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <section className="space-y-4 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">Feedback</p>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Help us make Pasive more useful
          </h1>
          <p className="mx-auto max-w-2xl text-lg leading-8 text-muted-foreground">
            This takes about 30 seconds. We want the honest version, especially if something felt confusing,
            unfinished, or not valuable enough yet.
          </p>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="border-border/60 bg-card/90 shadow-sm">
            <CardHeader>
              <CardTitle>Quick survey</CardTitle>
              <CardDescription>
                Tell us what you wanted to do with Pasive and what got in the way.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="first-name">First name</Label>
                <Input
                  id="first-name"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  placeholder="Your first name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                />
              </div>

              <div className="space-y-3">
                <Label>Which best describes your experience so far?</Label>
                <div className="grid gap-2">
                  {SATISFACTION_OPTIONS.map((option) => {
                    const selected = satisfaction === option
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setSatisfaction(option)}
                        className={`rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
                          selected
                            ? "border-primary bg-primary/10 text-foreground"
                            : "border-border bg-background hover:border-primary/40 hover:bg-muted/40"
                        }`}
                      >
                        {option}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="goal">What did you come to Pasive to do?</Label>
                <Textarea
                  id="goal"
                  value={goal}
                  onChange={(event) => setGoal(event.target.value)}
                  placeholder="For example: sell digital products, build a community, grow affiliate income, or manage everything from one place."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="blocker">What stopped you, felt unclear, or made you lose interest?</Label>
                <Textarea
                  id="blocker"
                  value={blocker}
                  onChange={(event) => setBlocker(event.target.value)}
                  placeholder="A sentence or two is perfect."
                />
              </div>

              <Button size="lg" className="w-full" onClick={handleSubmit} disabled={loading || (!goal.trim() && !blocker.trim() && !satisfaction)}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {loading ? "Saving feedback" : "Send feedback"}
                {!loading ? <ArrowRight className="h-4 w-4" /> : null}
              </Button>

              {submitted ? (
                <div className="flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-foreground">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" />
                  <p>Thanks. Your feedback has been saved and will help us improve Pasive.</p>
                </div>
              ) : null}

              {error ? (
                <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-foreground">
                  {error}
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-zinc-950 text-zinc-50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-zinc-50">Why we ask</CardTitle>
              <CardDescription className="text-zinc-400">
                Pasive is built for creators who want more control over their business.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-400">What Pasive helps with</p>
                <ul className="mt-3 space-y-3 text-sm leading-6 text-zinc-200">
                  <li>Sell digital products from your own storefront</li>
                  <li>Build a dedicated community around your audience</li>
                  <li>Earn through the affiliate network from one dashboard</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-400">Good feedback for us</p>
                <ul className="mt-3 space-y-3 text-sm leading-6 text-zinc-200">
                  <li>What you expected to happen when you signed up</li>
                  <li>Where the product felt confusing or incomplete</li>
                  <li>What would make Pasive worth returning to</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5">
                <div className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-4 w-4 text-primary" />
                  <p className="text-sm leading-6 text-zinc-200">
                    Prefer to write directly instead? Email <a className="text-primary underline underline-offset-4" href="mailto:admin@pasive.co">admin@pasive.co</a>.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

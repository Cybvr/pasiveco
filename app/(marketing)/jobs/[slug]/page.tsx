
import { notFound } from "next/navigation"
import { Briefcase, MapPin, Clock, ArrowLeft, MessageCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { jobsService } from "@/services/jobsService"

interface PageProps {
  params: {
    slug: string
  }
}

export const dynamic = 'force-dynamic';

const WHATSAPP_JOB_APPLY_LINK = "https://wa.me/message/6HGKZ2CLWKABA1";

export default async function JobDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const job = await jobsService.getJobBySlug(slug);

  if (!job) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="border-b bg-muted/30">
        <div className="container px-4 py-8 md:px-6">
          <Link 
            href="/jobs" 
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to All Jobs
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                {job.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Briefcase className="h-4 w-4" />
                  {job.category}
                </span>
                {job.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    {job.location}
                  </span>
                )}
                {job.type && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    {job.type}
                  </span>
                )}
              </div>
            </div>
            <Button size="lg" className="md:w-auto" asChild>
              <a href={WHATSAPP_JOB_APPLY_LINK} target="_blank" rel="noreferrer">Apply on WhatsApp</a>
            </Button>
          </div>
        </div>
      </div>

      <div className="container px-4 py-12 md:px-6">
        <div className="grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <div className="whitespace-pre-wrap text-lg leading-relaxed text-foreground/90">
                {job.description}
              </div>
            </div>

            <div id="apply" className="pt-8 border-t">
              <div className="bg-muted/30 rounded-2xl p-6 md:p-10 border">
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold">Apply for this position</h2>
                  <p className="text-muted-foreground mt-1">
                    Start your application on WhatsApp. Our bot will collect your details and screening answers in chat.
                  </p>
                  <Button size="lg" asChild>
                    <a href={WHATSAPP_JOB_APPLY_LINK} target="_blank" rel="noreferrer">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Apply on WhatsApp
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border p-6 bg-background shadow-sm">
              <h3 className="font-bold mb-4">Role Overview</h3>
              <dl className="space-y-4 text-sm">
                <div>
                  <dt className="text-muted-foreground mb-1">Category</dt>
                  <dd className="font-medium">{job.category}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground mb-1">Location</dt>
                  <dd className="font-medium">{job.location || 'Remote'}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground mb-1">Type</dt>
                  <dd className="font-medium">{job.type || 'Full-time'}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground mb-1">Posted</dt>
                  <dd className="font-medium">
                    {job.createdAt && new Date(job.createdAt.toMillis()).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="rounded-xl border p-6 bg-primary/5 border-primary/10">
              <h3 className="font-bold mb-2">Need Help?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                If you have any questions regarding this position, feel free to reach out to our team.
              </p>
              <Button variant="outline" className="w-full bg-background" asChild>
                <a href="mailto:hello@pasive.co">Contact Support</a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

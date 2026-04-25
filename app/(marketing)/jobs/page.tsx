
import Link from "next/link"
import { ArrowRight, Briefcase, MapPin, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { jobsService } from "@/services/jobsService"

export const dynamic = 'force-dynamic';

export default async function JobsPage() {
  const jobs = await jobsService.getAllJobs(true);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-background border-b">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                Join the Pasive Team
              </h1>
              <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed mx-auto">
                Help us build the future of the African creative economy. We're looking for passionate individuals to join our mission.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Jobs List Section */}
      <section className="w-full py-12 md:py-24 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-4xl space-y-8">
            <div className="flex flex-col space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">Open Roles</h2>
              <p className="text-muted-foreground">
                Explore our current openings in marketing, engineering, and design.
              </p>
            </div>

            {jobs.length === 0 ? (
              <div className="text-center py-12 bg-background rounded-xl border border-dashed">
                <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                <h3 className="text-lg font-medium">No open positions right now</h3>
                <p className="text-muted-foreground mt-1">Check back later or follow us for updates.</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {jobs.map((job) => (
                  <Link key={job.id} href={`/jobs/${job.slug}`}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className="space-y-1">
                          <CardTitle className="text-xl group-hover:text-primary transition-colors">
                            {job.title}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1">
                              <Briefcase className="h-3.5 w-3.5" />
                              {job.category}
                            </span>
                            {job.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5" />
                                {job.location}
                              </span>
                            )}
                            {job.type && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                {job.type}
                              </span>
                            )}
                          </CardDescription>
                        </div>
                        <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {job.description}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Culture Section */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 items-center">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tight">Our Culture</h2>
              <p className="text-muted-foreground text-lg">
                At Pasive, we celebrate the African creative life. We're a remote-first team of makers, designers, and thinkers dedicated to empowering creators.
              </p>
              <ul className="space-y-3">
                {[
                  "Remote-first work environment",
                  "Inclusive and collaborative culture",
                  "Fast-paced, high-impact projects",
                  "Passionate about the African creative scene"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative aspect-video overflow-hidden rounded-2xl shadow-xl">
               <img
                  src="/images/website/potter.jpg"
                  alt="Culture"
                  className="object-cover w-full h-full"
                />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}


"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { jobsService, type Job, type JobApplication } from "@/services/jobsService"
import { Briefcase, User, Mail, Calendar, ExternalLink, Trash2, MapPin, Clock, Plus, Save, Loader2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { AdminSidebarList } from "../components/AdminSidebarList"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const JobsTab = () => {
  const [jobs, setJobs] = useState<Job[]>([])
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null)
  const [selectedJob, setSelectedJob] = useState<Partial<Job> | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [activeSubTab, setActiveSubTab] = useState("applications")

  const fetchData = async () => {
    setLoading(true)
    try {
      const [jobsData, appsData] = await Promise.all([
        jobsService.getAllJobs(false),
        jobsService.getApplications()
      ])
      setJobs(jobsData)
      setApplications(appsData)
    } catch (error) {
      console.error("Error fetching jobs/applications:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load jobs data.",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleDeleteJob = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete the job "${title}"?`)) {
      try {
        await jobsService.deleteJob(id)
        setJobs(jobs.filter(j => j.id !== id))
        if (selectedJob?.id === id) setSelectedJob(null)
        toast({ title: "Deleted", description: "Job deleted successfully." })
      } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Failed to delete job." })
      }
    }
  }

  const handleSaveJob = async () => {
    if (!selectedJob?.title || !selectedJob?.slug || !selectedJob?.description) {
      toast({ variant: "destructive", title: "Missing Fields", description: "Title, Slug, and Description are required." })
      return
    }

    setIsSaving(true)
    try {
      const jobData = {
        title: selectedJob.title!,
        slug: selectedJob.slug!,
        category: selectedJob.category || "Marketing",
        location: selectedJob.location || "Remote",
        type: selectedJob.type || "Full-time",
        description: selectedJob.description!,
        active: selectedJob.active ?? true,
      }

      if (selectedJob.id) {
        await jobsService.updateJob(selectedJob.id, jobData)
        toast({ title: "Updated", description: "Job updated successfully." })
      } else {
        await jobsService.createJob(jobData)
        toast({ title: "Created", description: "Job created successfully." })
      }
      await fetchData()
      // Find the newly created/updated job to keep it selected
      const updatedJob = jobs.find(j => j.slug === jobData.slug)
      if (updatedJob) setSelectedJob(updatedJob)
    } catch (error) {
      console.error("Error saving job:", error)
      toast({ variant: "destructive", title: "Error", description: "Failed to save job." })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSelectApplication = (app: JobApplication) => {
    setSelectedApplication(app)
    setSelectedJob(null)
  }

  const handleSelectJob = (job: Job) => {
    setSelectedJob(job)
    setSelectedApplication(null)
  }

  const handleCreateNewJob = () => {
    setSelectedJob({
      title: "",
      slug: "",
      category: "Marketing",
      location: "Remote",
      type: "Full-time",
      description: "",
      active: true,
    })
    setSelectedApplication(null)
    setActiveSubTab("listings")
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-12 h-[calc(100vh-140px)]">
      <div className="col-span-1 min-w-0 rounded-lg border p-4 md:col-span-4 md:mb-0 flex flex-col">
        <div className="flex items-center justify-between mb-4 px-1 shrink-0">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Jobs & Applications</h3>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleCreateNewJob}
            className="h-6 w-6 rounded-full hover:bg-primary/10 hover:text-primary"
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>

        <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="applications" className="text-[10px] uppercase font-bold">Applications</TabsTrigger>
            <TabsTrigger value="listings" className="text-[10px] uppercase font-bold">Listings</TabsTrigger>
          </TabsList>

          <TabsContent value="applications" className="flex-1 overflow-hidden mt-0">
            <AdminSidebarList
              items={applications}
              selectedId={selectedApplication?.id}
              onSelect={handleSelectApplication}
              onDelete={() => {}} 
              getId={(app) => app.id!}
              getTitle={(app) => app.fullName}
              getSubtitle={(app) => (
                <div className="flex flex-col gap-0.5">
                  <p className="text-[10px] text-muted-foreground font-medium truncate">
                    {app.jobTitle}
                  </p>
                  <p className="text-[9px] text-muted-foreground/60">
                    {new Date(app.createdAt.toMillis()).toLocaleDateString()}
                  </p>
                </div>
              )}
              loading={loading}
              loadingMessage="Loading applications..."
              emptyMessage="No applications yet"
            />
          </TabsContent>

          <TabsContent value="listings" className="flex-1 overflow-hidden mt-0">
            <AdminSidebarList
              items={jobs}
              selectedId={selectedJob?.id}
              onSelect={handleSelectJob}
              onDelete={(job) => handleDeleteJob(job.id, job.title)}
              getId={(job) => job.id}
              getTitle={(job) => job.title}
              getSubtitle={(job) => (
                <p className="text-[10px] text-muted-foreground font-medium truncate">
                  {job.slug} • {job.active ? "Active" : "Inactive"}
                </p>
              )}
              loading={loading}
              loadingMessage="Loading jobs..."
              emptyMessage="No jobs listed"
            />
          </TabsContent>
        </Tabs>
      </div>

      <div className="col-span-1 min-w-0 rounded-lg border md:col-span-8 bg-card flex flex-col overflow-hidden">
        {selectedApplication ? (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold">{selectedApplication.fullName}</h2>
                <p className="text-muted-foreground">Applied for <span className="font-semibold text-foreground">{selectedApplication.jobTitle}</span></p>
              </div>
              <div className="text-right text-xs text-muted-foreground">
                <p>{new Date(selectedApplication.createdAt.toMillis()).toLocaleString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-muted/30 border-none shadow-none">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Mail className="h-3 w-3" /> Contact Info
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-medium">{selectedApplication.email}</p>
                </CardContent>
              </Card>

              <Card className="bg-muted/30 border-none shadow-none">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <ExternalLink className="h-3 w-3" /> Portfolio
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedApplication.portfolioUrl ? (
                    <a 
                      href={selectedApplication.portfolioUrl} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
                    >
                      View Portfolio <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No link provided</p>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <User className="h-3 w-3" /> Application Message
              </h3>
              <div className="bg-background border rounded-xl p-4 text-sm leading-relaxed whitespace-pre-wrap">
                {selectedApplication.message}
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <Button asChild>
                <a href={`mailto:${selectedApplication.email}?subject=Regarding your application for ${selectedApplication.jobTitle}`}>
                  Reply via Email
                </a>
              </Button>
            </div>
          </div>
        ) : selectedJob ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">{selectedJob.id ? "Edit Job Listing" : "New Job Listing"}</h2>
                {selectedJob.id && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={`/jobs/${selectedJob.slug}`} target="_blank" rel="noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" /> View Public Page
                    </a>
                  </Button>
                )}
              </div>

              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="title">Job Title</Label>
                  <Input 
                    id="title" 
                    value={selectedJob.title} 
                    onChange={(e) => {
                      const title = e.target.value;
                      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                      setSelectedJob({ ...selectedJob, title, slug: selectedJob.id ? selectedJob.slug : slug });
                    }}
                    placeholder="e.g. Social Media Manager"
                  />
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="slug">URL Slug</Label>
                  <Input 
                    id="slug" 
                    value={selectedJob.slug} 
                    onChange={(e) => setSelectedJob({ ...selectedJob, slug: e.target.value })}
                    placeholder="e.g. social-media-manager"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="grid gap-3">
                    <Label htmlFor="category">Category</Label>
                    <Input 
                      id="category" 
                      value={selectedJob.category} 
                      onChange={(e) => setSelectedJob({ ...selectedJob, category: e.target.value })}
                      placeholder="e.g. Marketing"
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="location">Location</Label>
                    <Input 
                      id="location" 
                      value={selectedJob.location} 
                      onChange={(e) => setSelectedJob({ ...selectedJob, location: e.target.value })}
                      placeholder="e.g. Remote"
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="type">Employment Type</Label>
                    <Input 
                      id="type" 
                      value={selectedJob.type} 
                      onChange={(e) => setSelectedJob({ ...selectedJob, type: e.target.value })}
                      placeholder="e.g. Full-time"
                    />
                  </div>
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="description">Job Description</Label>
                  <Textarea 
                    id="description" 
                    value={selectedJob.description} 
                    onChange={(e) => setSelectedJob({ ...selectedJob, description: e.target.value })}
                    placeholder="Describe the role, requirements, etc..."
                    className="min-h-[300px]"
                  />
                </div>

                <div className="flex items-center space-x-2 bg-muted/30 p-4 rounded-xl border">
                  <Switch 
                    id="active" 
                    checked={selectedJob.active} 
                    onCheckedChange={(checked) => setSelectedJob({ ...selectedJob, active: checked })}
                  />
                  <Label htmlFor="active" className="cursor-pointer">Publicly Active</Label>
                </div>
              </div>
            </div>

            <div className="p-4 border-t bg-background flex justify-between shrink-0">
              <Button 
                onClick={handleSaveJob} 
                disabled={isSaving}
                className="bg-indigo-600 hover:bg-indigo-700 font-bold px-8"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                {selectedJob.id ? "Update Job" : "Create Job"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 space-y-4">
            <Briefcase className="h-12 w-12 opacity-10" />
            <p className="text-sm font-medium">Select an application or listing to view details</p>
            <Button variant="outline" size="sm" onClick={handleCreateNewJob}>
              <Plus className="h-4 w-4 mr-2" /> Create New Listing
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default JobsTab

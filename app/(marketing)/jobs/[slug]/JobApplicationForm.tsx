
"use client"

import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { jobsService } from "@/services/jobsService"

const formSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  portfolioUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  message: z.string().optional().or(z.literal("")),
  acceptedTerms: z.boolean().refine((value) => value, {
    message: "Please accept the Privacy Policy and Terms of Service.",
  }),
})

interface JobApplicationFormProps {
  jobId: string
  jobTitle: string
}

export function JobApplicationForm({ jobId, jobTitle }: JobApplicationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      portfolioUrl: "",
      message: "",
      acceptedTerms: false,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    try {
      const applicationValues = {
        fullName: values.fullName,
        email: values.email,
        portfolioUrl: values.portfolioUrl,
        message: values.message,
      }

      await jobsService.submitApplication({
        jobId,
        jobTitle,
        ...applicationValues,
      })
      setIsSuccess(true)
      toast({
        title: "Application Submitted!",
        description: "We've received your application and will be in touch soon.",
      })
    } catch (error) {
      console.error("Error submitting application:", error)
      toast({
        variant: "destructive",
        title: "Something went wrong",
        description: "Please try again later or contact hello@pasive.co directly.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
        <div className="h-16 w-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold">Application Sent Successfully!</h3>
        <p className="text-muted-foreground max-w-sm">
          Thank you for applying for the {jobTitle} position. Our team will review your application and get back to you soon.
        </p>
        <Button variant="outline" className="mt-4" onClick={() => setIsSuccess(false)}>
          Submit another application
        </Button>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input placeholder="john@example.com" type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="portfolioUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Portfolio/LinkedIn URL (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="https://..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Why are you a good fit? (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Share any relevant experience, links, or context..." 
                  className="min-h-[150px] resize-none"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="acceptedTerms"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-start gap-3">
                <FormControl>
                  <Checkbox
                    id="acceptedTerms"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="mt-0.5"
                  />
                </FormControl>
                <FormLabel htmlFor="acceptedTerms" className="text-xs font-normal leading-5 text-muted-foreground">
                  I agree to Pasive's{" "}
                  <Link href="/legal/privacy" className="underline underline-offset-2 hover:text-foreground">
                    Privacy Policy
                  </Link>{" "}
                  and{" "}
                  <Link href="/legal/terms" className="underline underline-offset-2 hover:text-foreground">
                    Terms of Service
                  </Link>
                  .
                </FormLabel>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full h-12 text-base" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Application"
          )}
        </Button>
      </form>
    </Form>
  )
}

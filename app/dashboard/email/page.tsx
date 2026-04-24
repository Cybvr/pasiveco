'use client'

import type React from 'react'
import { useEffect, useMemo, useRef, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useCurrency } from '@/context/CurrencyContext'
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Image as TiptapImage } from '@tiptap/extension-image';
import {
  CheckCircle2,
  Mail,
  ArrowRight,
  Lock,
  Plus,
  Sparkles,
  Clock,
  Target,
  Loader2,
  Send,
  Eye,
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Minus,
  Undo,
  Redo,
  Layout,
  PenLine,
  Save,
  Trash2,
  RefreshCw,
  Users,
  FlaskConical,
  ImagePlus
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  emailPlans,
  getEmailPlanPrice,
  getEmailPlanPriceInNgn,
  type EmailBillingPeriod,
  type EmailPlanId,
} from '@/lib/email-plans'
import { formatCurrency } from '@/utils/currency'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { cn } from '@/lib/utils';
import { storage } from '@/lib/firebase';
import { emailDraftsService, type EmailDraft } from '@/services/emailDraftsService';

// Helper components and constants from Admin Email
function ToolbarButton({
  onClick, active, children, title,
}: {
  onClick: () => void; active?: boolean; children: React.ReactNode; title?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={cn(
        'p-1.5 rounded text-sm transition-colors',
        active
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:bg-accent hover:text-foreground',
      )}
    >
      {children}
    </button>
  );
}

const MERCHANT_AUDIENCE_OPTIONS = [
  { value: 'all_customers', label: 'All Customers', description: 'Everyone who has bought from you' },
  { value: 'repeat_buyers', label: 'Repeat Buyers', description: 'Customers with more than 1 order' },
  { value: 'new_customers', label: 'New Customers', description: 'First order in the last 30 days' },
];

const EmailImage = TiptapImage.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: '100%',
        parseHTML: element => element.getAttribute('width') || element.style.width || '100%',
        renderHTML: attributes => ({
          width: attributes.width,
          style: `width: ${attributes.width}; max-width: 100%; height: auto;`,
        }),
      },
    };
  },
});

const IMAGE_WIDTH_OPTIONS = ['33%', '50%', '75%', '100%'] as const;

type SelectedEmailOption =
  | { planId: 'free'; billingPeriod: 'monthly' }
  | { planId: 'reach'; billingPeriod: EmailBillingPeriod }



function EmailPageContent() {
  const { user } = useAuth()
  const { currency } = useCurrency()
  const router = useRouter()
  const searchParams = useSearchParams()
  const pricingRef = useRef<HTMLElement | null>(null)
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  // Feature States
  const [subject, setSubject] = useState('');
  const [templateId, setTemplateId] = useState('blast');
  const [audience, setAudience] = useState('all_customers');
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<EmailDraft[]>([]);
  const [draftsError, setDraftsError] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [activeTab, setActiveTab] = useState('compose');
  const [testEmail, setTestEmail] = useState('');
  const [testSent, setTestSent] = useState(false);
  const [showSendConfirm, setShowSendConfirm] = useState(false);

  // Sales Page States
  const [selectedOption, setSelectedOption] = useState<SelectedEmailOption>({
    planId: 'free',
    billingPeriod: 'monthly',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const emailPlan = (user?.emailPlan || '').toLowerCase() as EmailPlanId | ''
  const emailStatus = (user?.emailSubscriptionStatus || '').toLowerCase()
  const hasEmailAccess = Boolean(emailPlan) && (emailPlan === 'free' || emailStatus === 'active')

  const editor = useEditor({
    extensions: [StarterKit, EmailImage],
    content: '<p>Write your email here...</p>',
    editorProps: {
      attributes: {
        class: 'min-h-[500px] p-6 prose prose-sm max-w-none focus:outline-none',
      },
    },
  });

  const selectedAudience = MERCHANT_AUDIENCE_OPTIONS.find(a => a.value === audience);

  useEffect(() => {
    const status = searchParams.get('status')
    if (status === 'success') {
      toast.success('Email plan updated')
      router.replace('/dashboard/email')
    }
  }, [router, searchParams])

  const monthlyPrice = getEmailPlanPrice('reach', 'monthly', currency)
  const annualPrice = getEmailPlanPrice('reach', 'annual', currency)
  const monthlyPriceNgn = getEmailPlanPriceInNgn('reach', 'monthly')
  const annualPriceNgn = getEmailPlanPriceInNgn('reach', 'annual')
  const annualMonthlyEquivalent = Math.round(annualPrice / 12)

  const activeEmailPlan = useMemo(() => {
    if (!hasEmailAccess) return null
    return emailPlans[emailPlan || 'free']
  }, [emailPlan, hasEmailAccess])

  // Feature Functions
  const fetchDrafts = async () => {
    if (!hasEmailAccess || !user?.uid) return;
    try {
      const data = await emailDraftsService.getDraftsByUser(user.uid);
      setDrafts(data);
      setDraftsError('');
    } catch (err) {
      console.error('Failed to fetch drafts', err);
      setDraftsError('Failed to fetch drafts');
      setDrafts([]);
      toast.error('Failed to fetch drafts');
    }
  };

  useEffect(() => {
    if (hasEmailAccess) fetchDrafts();
  }, [hasEmailAccess]);

  const fetchPreview = async () => {
    if (!editor || !hasEmailAccess) return;
    setIsPreviewLoading(true);
    try {
      const response = await fetch('/api/admin/preview-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          html: editor.getHTML(),
          subject,
          templateId
        }),
      });
      const html = await response.text();
      setPreviewHtml(html);
    } catch {
      toast.error('Failed to load preview');
    } finally {
      setIsPreviewLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'preview' && hasEmailAccess) {
      fetchPreview();
    }
  }, [activeTab, templateId, subject, hasEmailAccess]);

  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !editor) return;
    setIsUploadingImage(true);
    try {
      const storageRef = ref(storage, `product-images/merchant-email/${user?.uid}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file, { contentType: file.type || 'image/jpeg' });
      const url = await getDownloadURL(storageRef);
      editor.chain().focus().setImage({ src: url, alt: file.name }).updateAttributes('image', { width: '100%' }).run();
      toast.success('Image added');
    } catch {
      toast.error('Failed to upload image');
    } finally {
      event.target.value = '';
      setIsUploadingImage(false);
    }
  };

  const setSelectedImageWidth = (width: (typeof IMAGE_WIDTH_OPTIONS)[number]) => {
    if (!editor?.isActive('image')) return;
    editor.chain().focus().updateAttributes('image', { width }).run();
  };

  const saveDraft = async () => {
    if (!editor) return;
    setIsSaving(true);
    try {
      const draftId = await emailDraftsService.saveDraft({
        id: currentDraftId || undefined,
        subject,
        templateId,
        html: editor.getHTML(),
        userId: user?.uid,
      });
      setCurrentDraftId(draftId);
      toast.success('Draft saved');
      fetchDrafts();
    } catch {
      toast.error('Failed to save draft');
    } finally {
      setIsSaving(false);
    }
  };

  const loadDraft = (draft: EmailDraft) => {
    setSubject(draft.subject);
    setTemplateId(draft.templateId);
    setCurrentDraftId(draft.id || null);
    editor?.commands.setContent(draft.html || '<p>Write your email here...</p>');
    setActiveTab('compose');
    setTestSent(false);
  };

  const resetForm = () => {
    setSubject('');
    setTemplateId('blast');
    setAudience('all_customers');
    setCurrentDraftId(null);
    setTestSent(false);
    editor?.commands.setContent('<p>Write your email here...</p>');
    setActiveTab('compose');
    toast.success('Started new campaign');
  };

  const deleteDraft = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await emailDraftsService.deleteDraft(id);
      if (currentDraftId === id) setCurrentDraftId(null);
      fetchDrafts();
      toast.success('Draft deleted');
    } catch {
      toast.error('Failed to delete draft');
    }
  };

  const handleSendTest = async () => {
    if (!subject) { toast.error('Please enter a subject line'); return; }
    if (!editor?.getText()) { toast.error('Email body is empty'); return; }
    if (!testEmail) { toast.error('Please enter a test email address'); return; }
    setIsSending(true);
    try {
      const response = await fetch('/api/admin/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          html: editor.getHTML(),
          subject,
          templateId,
          testEmail,
        }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success(`Test sent to ${testEmail}`);
        setTestSent(true);
      } else {
        toast.error(data.error || 'Failed to send test');
      }
    } catch {
      toast.error('An error occurred');
    } finally {
      setIsSending(false);
    }
  };

  const handleSendToAudience = async () => {
    if (!subject) { toast.error('Please enter a subject line'); return; }
    if (!editor?.getText()) { toast.error('Email body is empty'); return; }
    setIsSending(true);
    setShowSendConfirm(false);
    try {
      const response = await fetch('/api/admin/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          html: editor.getHTML(),
          subject,
          templateId,
          audience,
        }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success(data.message || `Sent to ${selectedAudience?.label}`);
        setTestSent(false);
      } else {
        toast.error(data.error || 'Failed to send');
      }
    } catch {
      toast.error('An error occurred while sending');
    } finally {
      setIsSending(false);
    }
  };

  const scrollToPlans = () => {
    pricingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleSelectPlan = async () => {
    if (!user?.uid) {
      toast.error('Session loading... please try again in a moment');
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/create-email-paystack-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: selectedOption.planId,
          billingPeriod: selectedOption.billingPeriod,
          userId: user?.uid,
          email: user?.email,
          name: user?.displayName || 'User',
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create email checkout session');
      if (data.redirect) { window.location.href = data.redirect; return; }
      if (data.link) { window.location.href = data.link; return; }
      router.refresh();
      toast.success('Email plan updated');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to process email plan');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 1. Paid View (The Feature)
  if (hasEmailAccess) {
    return (
      <>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-120px)]">
          {/* Left Sidebar: Drafts List */}
          <div className="lg:col-span-3 flex flex-col gap-4 min-h-0">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Drafts</h3>
              <Button variant="ghost" size="icon" onClick={resetForm} className="h-6 w-6 rounded-full hover:bg-primary/10 hover:text-primary">
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>

            <Card className="flex-1 overflow-hidden flex flex-col border-none shadow-sm bg-background/50">
              <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                {draftsError ? (
                  <div className="flex flex-col items-center justify-center h-40 text-center p-4">
                    <Mail className="h-8 w-8 text-destructive/30 mb-2" />
                    <p className="text-[10px] text-destructive uppercase font-bold tracking-tight">Failed to load drafts</p>
                    <p className="text-xs text-muted-foreground mt-1 break-words">{draftsError}</p>
                  </div>
                ) : drafts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 text-center p-4">
                    <Mail className="h-8 w-8 text-muted-foreground/20 mb-2" />
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">No drafts yet</p>
                  </div>
                ) : (
                  drafts.map((draft) => (
                    <div
                      key={draft.id}
                      onClick={() => loadDraft(draft)}
                      className={cn(
                        "group p-3 rounded-xl cursor-pointer transition-all duration-200 border relative overflow-hidden",
                        currentDraftId === draft.id
                          ? "border-primary/50 bg-primary/5 shadow-sm"
                          : "border-transparent hover:border-border hover:bg-accent/50 bg-card/30"
                      )}
                    >
                      <div className="flex items-start justify-between gap-3 relative z-10">
                        <div className="min-w-0 flex-1">
                          <p className={cn(
                            "text-sm font-bold truncate tracking-tight",
                            currentDraftId === draft.id ? "text-primary" : "text-foreground"
                          )}>
                            {draft.subject || '(Untitled Campaign)'}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[8px] font-black uppercase tracking-widest bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                              {draft.templateId}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
                          onClick={(e) => deleteDraft(e, draft.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      {currentDraftId === draft.id && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                      )}
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Right Column: Composer */}
          <div className="lg:col-span-9 flex flex-col gap-4 min-h-0">
            <Card className="border-none shadow-sm overflow-hidden bg-background shrink-0">
              <CardContent className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1.6fr)_minmax(240px,1fr)] divide-y md:divide-y-0 md:divide-x">
                  <div className="p-4 space-y-2">
                    <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/50">Subject Line</label>
                    <Input
                      placeholder="Your best subject line..."
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="border-none shadow-none focus-visible:ring-0 px-0 h-8 text-[14px] font-bold placeholder:text-muted-foreground/20"
                    />
                  </div>
                  <div className="p-4 space-y-2 bg-muted/5">
                    <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/50 flex items-center gap-1.5">
                      <Layout className="h-3 w-3" />
                      Email Template
                    </label>
                    <Select value={templateId} onValueChange={setTemplateId}>
                      <SelectTrigger className="inline-flex w-auto min-w-0 border-none bg-transparent p-0 h-8 text-[14px] font-bold shadow-none focus:ring-0">
                        <SelectValue placeholder="Choose a template" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Raw HTML (Plain)</SelectItem>
                        <SelectItem value="blast">Campaign Blast (Clean)</SelectItem>
                        <SelectItem value="newsletter">Weekly Newsletter</SelectItem>
                        <SelectItem value="announcement">Announcement</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-2 shrink-0">
                <TabsList className="bg-muted/50 p-1 h-9">
                  <TabsTrigger value="compose" className="gap-2 h-7 text-[11px] font-bold uppercase tracking-tight px-4">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-foreground/10 text-[9px]">1</span>
                    Compose
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="gap-2 h-7 text-[11px] font-bold uppercase tracking-tight px-4">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-foreground/10 text-[9px]">2</span>
                    Preview
                  </TabsTrigger>
                  <TabsTrigger value="send" className="gap-2 h-7 text-[11px] font-bold uppercase tracking-tight px-4">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-foreground/10 text-[9px]">3</span>
                    Send
                  </TabsTrigger>
                </TabsList>
                {activeTab === 'preview' && (
                  <Button variant="ghost" size="icon" onClick={fetchPreview} disabled={isPreviewLoading} className="h-8 w-8 hover:bg-primary/10 hover:text-primary">
                    <RefreshCw className={cn("h-4 w-4", isPreviewLoading && "animate-spin")} />
                  </Button>
                )}
              </div>

              <TabsContent value="compose" className="mt-0 focus-visible:ring-0 flex-1 min-h-0">
                <div className="h-full border rounded-xl overflow-hidden bg-background shadow-sm flex flex-col">
                  <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
                  <div className="flex flex-wrap items-center gap-1 px-3 py-2 border-b bg-muted/20">
                    <ToolbarButton title="Bold" onClick={() => editor?.chain().focus().toggleBold().run()} active={editor?.isActive('bold')}><Bold className="h-4 w-4" /></ToolbarButton>
                    <ToolbarButton title="Italic" onClick={() => editor?.chain().focus().toggleItalic().run()} active={editor?.isActive('italic')}><Italic className="h-4 w-4" /></ToolbarButton>
                    <div className="w-px h-5 bg-border mx-1" />
                    <ToolbarButton title="Heading 1" onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} active={editor?.isActive('heading', { level: 1 })}><Heading1 className="h-4 w-4" /></ToolbarButton>
                    <ToolbarButton title="Heading 2" onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} active={editor?.isActive('heading', { level: 2 })}><Heading2 className="h-4 w-4" /></ToolbarButton>
                    <div className="w-px h-5 bg-border mx-1" />
                    <ToolbarButton title="Bullet List" onClick={() => editor?.chain().focus().toggleBulletList().run()} active={editor?.isActive('bulletList')}><List className="h-4 w-4" /></ToolbarButton>
                    <ToolbarButton title="Numbered List" onClick={() => editor?.chain().focus().toggleOrderedList().run()} active={editor?.isActive('orderedList')}><ListOrdered className="h-4 w-4" /></ToolbarButton>
                    <ToolbarButton title="Divider" onClick={() => editor?.chain().focus().setHorizontalRule().run()}><Minus className="h-4 w-4" /></ToolbarButton>
                    <div className="w-px h-5 bg-border mx-1" />
                    <ToolbarButton title="Insert Image" onClick={() => imageInputRef.current?.click()} active={editor?.isActive('image') || isUploadingImage}>
                      {isUploadingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                    </ToolbarButton>
                    <div className="ml-auto pl-2">
                      <Button variant="ghost" size="icon" onClick={saveDraft} disabled={isSaving} className="h-7 w-7 rounded">
                        {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                      </Button>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto bg-white"><EditorContent editor={editor} /></div>
                </div>
              </TabsContent>

              <TabsContent value="preview" className="mt-0 focus-visible:ring-0 flex-1 min-h-0">
                <div className="h-full border rounded-xl overflow-hidden bg-muted/30 shadow-inner flex flex-col">
                  {isPreviewLoading ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-3">
                      <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Rendering...</p>
                    </div>
                  ) : (
                    <iframe srcDoc={previewHtml} className="flex-1 w-full border-none bg-white" title="Email Preview" />
                  )}
                </div>
              </TabsContent>

              <TabsContent value="send" className="mt-0 focus-visible:ring-0 flex-1 min-h-0 custom-scrollbar overflow-y-auto">
                <div className="max-w-3xl mx-auto py-6 px-6 space-y-6">
                  <section className="space-y-4">
                    <div className="border-b border-border/40 pb-1">
                      <h4 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/50">Verification</h4>
                    </div>
                    <div className="flex items-center gap-3">
                      <Input placeholder="test@email.com" value={testEmail} onChange={(e) => setTestEmail(e.target.value)} className="h-10 md:w-80 text-[14px]" />
                      <Button variant="outline" onClick={handleSendTest} disabled={isSending} className="h-10 px-6 text-[11px] font-bold uppercase tracking-widest">Send Test</Button>
                      {testSent && <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-600 tracking-wider"><CheckCircle2 className="h-4 w-4" /> SENT</div>}
                    </div>
                  </section>
                  <section className="space-y-4">
                    <div className="border-b border-border/40 pb-1">
                      <h4 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/50">Finalize</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="space-y-2">
                         <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/30">Target Audience</label>
                         <Select value={audience} onValueChange={setAudience}>
                           <SelectTrigger className="h-10 w-full bg-muted/20 text-[14px] font-medium">
                             <SelectValue />
                           </SelectTrigger>
                           <SelectContent>
                             {MERCHANT_AUDIENCE_OPTIONS.map(opt => (
                               <SelectItem key={opt.value} value={opt.value} className="text-[14px]">
                                 <span className="font-bold">{opt.label}</span>
                               </SelectItem>
                             ))}
                           </SelectContent>
                         </Select>
                       </div>
                       <div className="flex items-end">
                         <Button onClick={() => setShowSendConfirm(true)} disabled={isSending || !subject} className="h-10 w-full font-bold uppercase tracking-widest text-[11px]">Launch Campaign</Button>
                       </div>
                    </div>
                  </section>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <AlertDialog open={showSendConfirm} onOpenChange={setShowSendConfirm}>
          <AlertDialogContent className="rounded-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-bold">Confirm Campaign Launch</AlertDialogTitle>
              <AlertDialogDescription className="text-sm space-y-4">
                <div className="p-4 rounded-xl bg-destructive/5 text-destructive border border-destructive/10 flex gap-3">
                  <Trash2 className="h-5 w-5 shrink-0" />
                  <p className="font-bold leading-tight">This action cannot be undone. All recipients will receive this email immediately.</p>
                </div>
                <div className="space-y-1 text-foreground">
                  <p className="text-xs text-muted-foreground uppercase font-black tracking-widest opacity-50">Campaign Details</p>
                  <p className="font-bold">Subject: {subject || '(No subject)'}</p>
                  <p className="font-bold">Audience: {selectedAudience?.label}</p>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-full font-bold">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleSendToAudience} className="bg-indigo-600 hover:bg-indigo-700 rounded-full font-bold">Yes, Send Now</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    )
  }

  // 2. Sales View (The Landing Page)
  return (
    <div className="max-w-6xl mx-auto space-y-2 pb-2 px-4">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-card border border-border/50 p-6 md:p-10 flex flex-col md:flex-row items-center gap-8">
        <div className="flex-1 space-y-2 ">
          <div className="space-y-3">
            <Badge variant="secondary" className="px-3 py-1 font-bold uppercase tracking-widest text-[10px] bg-primary/10 text-primary border-none">
              Pasive Email
            </Badge>
            <h1 className="text-2xl font-bold tracking-tighter leading-tight">
              Launch AI email marketing campaigns in minutes
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
              Email marketing tool for building, customizing, sending, and tracking professional email campaigns to your customers.
            </p>
          </div>
          <div className="flex flex-col sm:flex-col gap-4 pt-2">
            <Button className="w-fit font-bold uppercase tracking-widest text-xs" onClick={scrollToPlans}>
              Explore Plans
            </Button>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>30-day money-back guarantee</span>
            </div>
          </div>
        </div>
        <div className="flex-1 w-full max-w-md aspect-[3/2] rounded-2xl border border-primary/10 shadow-2xl overflow-hidden bg-background">
          <img
            src="/images/emails/emailhero.png"
            alt="Email campaign dashboard preview"
            className="h-full w-full object-cover"
          />
        </div>
      </section>

      {/* 2. Features Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-card rounded-3xl ">
        {[
          {
            title: "Automate without work",
            desc: "Welcome new subscribers, run drip campaigns, send abandoned cart emails and more.",
            image: "/images/emails/automation.png",
            alt: "Email automation workflow",
            icon: Clock
          },
          {
            title: "Weekly campaign ideas",
            desc: "AI studies your business to suggest ready-to-go campaign ideas every week.",
            image: "/images/emails/campaigns.png",
            alt: "Email campaign ideas",
            icon: Sparkles
          },
          {
            title: "Subject lines written for you",
            desc: "Proven subject lines matched to your content. Just pick your favorite.",
            image: "/images/emails/subjects.png",
            alt: "AI subject line suggestions",
            icon: Target
          }
        ].map((feature, i) => (
          <div key={i} className="space-y-3 p-3">
            <div className="h-40 w-full bg-muted/20 rounded-2xl border border-border/50 overflow-hidden relative">
              <img src={feature.image} alt={feature.alt} className="h-full w-full object-cover opacity-50" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              <div className="absolute inset-0 flex items-center justify-center">
                 <feature.icon className="h-10 w-10 text-muted-foreground/30" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold tracking-tight">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.desc}
              </p>
            </div>
          </div>
        ))}
      </section>

      {/* 3. Pricing & Checklist */}
      <section ref={pricingRef} className="space-y-5 bg-card rounded-3xl p-6 ">
        <div className="space-y-1.5">
          <h2 className="text-3xl font-bold tracking-tight">Simple and effective AI-powered email marketing</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setSelectedOption({ planId: 'free', billingPeriod: 'monthly' })}
              className={`w-full text-left flex items-center justify-between p-4 border rounded-2xl transition-colors ${selectedOption.planId === 'free' ? 'border-primary bg-primary/5' : 'bg-muted/10'
                }`}
            >
              <div className="flex items-center gap-3">
                <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${selectedOption.planId === 'free' ? 'border-primary bg-primary' : 'border-border'}`}>
                  {selectedOption.planId === 'free' ? <div className="h-2 w-2 rounded-full bg-white" /> : null}
                </div>
                <div>
                  <p className="font-bold">Free</p>
                  <p className="text-xs text-muted-foreground">{emailPlans.free.recipientsLabel}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold">₦0/mo</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedOption({ planId: 'reach', billingPeriod: 'monthly' })}
              className={`w-full text-left flex items-center justify-between p-4 border rounded-2xl transition-colors ${selectedOption.planId === 'reach' && selectedOption.billingPeriod === 'monthly'
                ? 'border-primary bg-primary/5'
                : 'bg-muted/10'
                }`}
            >
              <div className="flex items-center gap-3">
                <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${selectedOption.planId === 'reach' && selectedOption.billingPeriod === 'monthly'
                  ? 'border-primary bg-primary'
                  : 'border-border'
                  }`}>
                  {selectedOption.planId === 'reach' && selectedOption.billingPeriod === 'monthly' ? <div className="h-2 w-2 rounded-full bg-white" /> : null}
                </div>
                <div>
                  <p className="font-bold">Monthly</p>
                  <p className="text-xs text-muted-foreground">{emailPlans.reach.recipientsLabel}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold">{formatCurrency(monthlyPrice, currency)}/mo</p>
                {currency !== 'NGN' ? (
                  <p className="text-[11px] text-muted-foreground">Billed as {formatCurrency(monthlyPriceNgn, 'NGN')}</p>
                ) : null}
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedOption({ planId: 'reach', billingPeriod: 'annual' })}
              className={`w-full text-left flex items-center justify-between p-5 border-2 rounded-2xl relative transition-colors ${selectedOption.planId === 'reach' && selectedOption.billingPeriod === 'annual'
                ? 'border-primary bg-primary/5'
                : 'border-border bg-muted/10'
                }`}
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                Most Popular
              </div>
              <div className="flex items-center gap-3">
                <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${selectedOption.planId === 'reach' && selectedOption.billingPeriod === 'annual'
                  ? 'border-primary bg-primary'
                  : 'border-border'
                  }`}>
                  {selectedOption.planId === 'reach' && selectedOption.billingPeriod === 'annual' ? <div className="h-2 w-2 rounded-full bg-white" /> : null}
                </div>
                <div>
                  <p className="font-bold">Yearly</p>
                  <p className="text-xs text-muted-foreground">{emailPlans.reach.recipientsLabel}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground line-through">{formatCurrency(monthlyPrice, currency)}</p>
                <p className="text-2xl font-bold">{formatCurrency(annualMonthlyEquivalent, currency)}/mo</p>
                {currency !== 'NGN' ? (
                  <p className="text-[11px] text-muted-foreground">Billed as {formatCurrency(annualPriceNgn, 'NGN')}/yr</p>
                ) : (
                  <p className="text-[11px] text-muted-foreground">Total {formatCurrency(annualPrice, currency)}/yr</p>
                )}
              </div>
            </button>

            <Button
              className="bg-foreground w-full h-14 font-bold uppercase tracking-widest text-xs"
              onClick={handleSelectPlan}
              disabled={isSubmitting}
            >
              {isSubmitting
                ? 'Processing...'
                : selectedOption.planId === 'free'
                  ? 'Start Free 0-500 Tier'
                  : `Choose ${emailPlans.reach.name} ${selectedOption.billingPeriod === 'annual' ? 'Yearly' : 'Monthly'}`}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <Card className="rounded-3xl border-border/50 bg-muted/10 overflow-hidden">
            <CardContent className="p-6 space-y-6">
              <div className="space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Send Newsletters</p>
                <div className="space-y-2.5">
                  {[
                    "Schedule campaigns — track every open and click per send",
                    "AI email templates — describe your goal to create a professional email, then customize",
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-sm font-medium">{item}</span>
                    </div>
                  ))}
                  {[
                    "Optimize opens — AI subject line writer and spam checker",
                    "Weekly campaign ideas — AI suggests what to send",
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3 opacity-60">
                      <Lock className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-border/50">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Automation & AI</p>
                <div className="space-y-2.5">
                  {[
                    "Welcome & sequence emails — greet new subscribers",
                    "Abandoned cart & post-purchase — recover lost sales",
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3 opacity-60">
                      <Lock className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 4. FAQ Section */}
      <section className="max-w-3xl mx-auto space-y-5 bg-card rounded-3xl p-6 ">
        <h2 className="text-3xl font-bold tracking-tight text-center">Frequently asked questions</h2>
        <Accordion type="single" collapsible className="w-full">
          {[
            { q: "What is email marketing?", a: "Email marketing is a powerful marketing channel..." },
            { q: "What is the Pasive Email service?", a: "It's an AI-driven tool integrated into your dashboard..." },
            { q: "How is Reach different?", a: "Unlike third-party tools, Reach is built directly into your store..." },
            { q: "How to send a campaign?", a: "Simply pick a goal, let the AI generate content, and hit send." }
          ].map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border-b-border/50">
              <AccordionTrigger className="text-left font-bold hover:no-underline">{faq.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">{faq.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </div>
  )
}

export default function MerchantEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
      </div>
    }>
      <EmailPageContent />
    </Suspense>
  )
}

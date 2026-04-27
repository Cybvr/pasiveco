'use client'

import type React from 'react'
import { useEffect, useRef, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Image as TiptapImage } from '@tiptap/extension-image';
import {
  CheckCircle2,
  Mail,
  Plus,
  Loader2,
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Minus,
  Layout,
  Save,
  Trash2,
  RefreshCw,
  ImagePlus
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
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
import type { EmailPlanId } from '@/lib/email-plans'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { cn } from '@/lib/utils';
import { storage } from '@/lib/firebase';
import { emailDraftsService, type EmailDraft } from '@/services/emailDraftsService';
import EmailSalesView from './_components/EmailSalesView';

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

function EmailPageContent() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
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
            {/* Subject & Template */}
            <Card className="border-none shadow-sm overflow-hidden bg-background shrink-0">
              <CardContent className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1.6fr)_minmax(240px,1fr)] divide-y md:divide-y-0 md:divide-x">
                  <div className="flex items-center px-4 h-12 gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground/50 shrink-0" />
                    <Input
                      placeholder="Subject Line..."
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="border-none shadow-none focus-visible:ring-0 px-0 h-full text-base font-bold placeholder:text-muted-foreground/40"
                    />
                  </div>
                  <div className="flex items-center px-4 h-12 gap-3 bg-muted/5">
                    <Layout className="h-4 w-4 text-muted-foreground/50 shrink-0" />
                    <Select value={templateId} onValueChange={setTemplateId}>
                      <SelectTrigger className="flex-1 border-none bg-transparent p-0 h-full text-sm font-bold shadow-none focus:ring-0">
                        <SelectValue placeholder="Email Template" />
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
                <TabsList className="bg-muted/50 p-1 h-11 w-full lg:w-auto">
                  <TabsTrigger value="compose" className="flex-1 lg:flex-none gap-2 h-9 text-[11px] font-bold uppercase tracking-tight px-4">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-foreground/10 text-[10px]">1</span>
                    Compose
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="flex-1 lg:flex-none gap-2 h-9 text-[11px] font-bold uppercase tracking-tight px-4">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-foreground/10 text-[10px]">2</span>
                    Preview
                  </TabsTrigger>
                  <TabsTrigger value="send" className="flex-1 lg:flex-none gap-2 h-9 text-[11px] font-bold uppercase tracking-tight px-4">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-foreground/10 text-[10px]">3</span>
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

  return <EmailSalesView />

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

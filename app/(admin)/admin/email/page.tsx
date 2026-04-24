'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Image as TiptapImage } from '@tiptap/extension-image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
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
import { toast } from 'sonner';
import {
  Loader2, Send, Eye, Bold, Italic, List, ListOrdered,
  Heading1, Heading2, Minus, Undo, Redo, Layout, PenLine,
  Save, Trash2, Plus, RefreshCw, Mail, Users, FlaskConical,
  ImagePlus,
  CheckCircle2
} from 'lucide-react';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { cn } from '@/lib/utils';
import { storage } from '@/lib/firebase';

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

const AUDIENCE_OPTIONS = [
  { value: 'all', label: 'All Users', description: 'Everyone on the platform' },
  { value: 'paid', label: 'Paid Users', description: 'Active subscribers only' },
  { value: 'free', label: 'Free Users', description: 'Free tier users' },
  { value: 'new', label: 'New Users', description: 'Joined in the last 30 days' },
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

export default function AdminEmailPage() {
  const [subject, setSubject] = useState('');
  const [templateId, setTemplateId] = useState('blast');
  const [audience, setAudience] = useState('all');
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<any[]>([]);
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
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  const editor = useEditor({
    extensions: [StarterKit, EmailImage],
    content: '<p>Write your email here...</p>',
    editorProps: {
      attributes: {
        class: 'min-h-[500px] p-6 prose prose-sm max-w-none focus:outline-none',
      },
    },
  });

  const selectedAudience = AUDIENCE_OPTIONS.find(a => a.value === audience);

  const fetchDrafts = async () => {
    try {
      const response = await fetch('/api/admin/email-drafts');
      const data = await response.json();

      if (!response.ok || !data.success) {
        const message = data?.error || 'Failed to fetch drafts';
        setDraftsError(message);
        setDrafts([]);
        toast.error(message);
        return;
      }

      setDrafts(data.drafts);
      setDraftsError('');
    } catch (err) {
      console.error('Failed to fetch drafts', err);
      setDraftsError('Failed to fetch drafts');
      setDrafts([]);
      toast.error('Failed to fetch drafts');
    }
  };

  useEffect(() => {
    fetchDrafts();
  }, []);

  const fetchPreview = async () => {
    if (!editor) return;
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
    if (activeTab === 'preview') {
      fetchPreview();
    }
  }, [activeTab, templateId, subject]);

  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file || !editor) return;

    setIsUploadingImage(true);

    try {
      const storageRef = ref(storage, `product-images/admin-email/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file, {
        contentType: file.type || 'image/jpeg',
      });
      const url = await getDownloadURL(storageRef);
      editor.chain().focus().setImage({ src: url, alt: file.name, width: '100%' }).run();
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
      const response = await fetch('/api/admin/email-drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: currentDraftId,
          subject,
          templateId,
          html: editor.getHTML(),
        }),
      });
      const data = await response.json();
      if (data.success) {
        setCurrentDraftId(data.id);
        toast.success('Draft saved');
        fetchDrafts();
      }
    } catch {
      toast.error('Failed to save draft');
    } finally {
      setIsSaving(false);
    }
  };

  const loadDraft = (draft: any) => {
    setSubject(draft.subject);
    setTemplateId(draft.templateId);
    setCurrentDraftId(draft.id);
    editor?.commands.setContent(draft.html);
    setActiveTab('compose');
    setTestSent(false);
  };

  const resetForm = () => {
    setSubject('');
    setTemplateId('blast');
    setAudience('all');
    setCurrentDraftId(null);
    setTestSent(false);
    editor?.commands.setContent('<p>Write your email here...</p>');
    setActiveTab('compose');
    toast.success('Started new campaign');
  };

  const deleteDraft = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      const response = await fetch(`/api/admin/email-drafts/${id}`, { method: 'DELETE' });
      if (response.ok) {
        if (currentDraftId === id) setCurrentDraftId(null);
        fetchDrafts();
        toast.success('Draft deleted');
      }
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

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-120px)]">
        {/* Left Sidebar: Drafts List */}
        <div className="lg:col-span-4 flex flex-col gap-4 min-h-0">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Drafts</h3>
            <Button variant="ghost" size="icon" onClick={resetForm} className="h-6 w-6 rounded-full hover:bg-primary/10 hover:text-primary">
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>

          <Card className="flex-1 overflow-hidden flex flex-col border-none shadow-sm bg-background/50">
            <div className="flex-1 overflow-y-auto p-2 space-y-1.5 custom-scrollbar">
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
                      "group p-2.5 rounded-lg cursor-pointer transition-all duration-200 border relative overflow-hidden",
                      currentDraftId === draft.id
                        ? "border-primary/50 bg-primary/5 shadow-sm"
                        : "border-transparent hover:border-border hover:bg-accent/50 bg-card/30"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2 relative z-10">
                      <div className="min-w-0 flex-1">
                        <p className={cn(
                          "text-[13px] font-bold truncate tracking-tight leading-tight",
                          currentDraftId === draft.id ? "text-primary" : "text-foreground"
                        )}>
                          {draft.subject || '(Untitled Campaign)'}
                        </p>
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
        <div className="lg:col-span-8 flex flex-col gap-4 min-h-0">
          {/* Subject & Template */}
          <Card className="border-none shadow-sm overflow-hidden bg-background shrink-0">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1.6fr)_minmax(240px,1fr)] divide-y md:divide-y-0 md:divide-x">
                <div className="p-4 space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Subject Line</label>
                  <Input
                    placeholder="Your best subject line..."
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="border-none shadow-none focus-visible:ring-0 px-0 h-8 text-base font-bold placeholder:text-muted-foreground/20"
                  />
                </div>
                <div className="p-4 space-y-1.5 bg-muted/5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 flex items-center gap-1.5">
                    <Layout className="h-3 w-3" />
                    Email Template
                  </label>
                  <Select value={templateId} onValueChange={setTemplateId}>
                    <SelectTrigger className="inline-flex w-auto min-w-0 border-none bg-transparent p-0 h-8 text-sm font-bold shadow-none focus:ring-0">
                      <SelectValue placeholder="Choose a template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Raw HTML (Plain)</SelectItem>
                      <SelectItem value="blast">Admin Blast (Clean)</SelectItem>
                      <SelectItem value="newsletter">Weekly Newsletter</SelectItem>
                      <SelectItem value="announcement">Official Announcement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 3-Step Process Tabs */}
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
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageSelect}
                />

                {/* Formatting Toolbar */}
                <div className="flex flex-wrap items-center gap-1 px-3 py-2 border-b bg-muted/20">
                  <ToolbarButton title="Bold" onClick={() => editor?.chain().focus().toggleBold().run()} active={editor?.isActive('bold')}>
                    <Bold className="h-4 w-4" />
                  </ToolbarButton>
                  <ToolbarButton title="Italic" onClick={() => editor?.chain().focus().toggleItalic().run()} active={editor?.isActive('italic')}>
                    <Italic className="h-4 w-4" />
                  </ToolbarButton>
                  <div className="w-px h-5 bg-border mx-1" />
                  <ToolbarButton title="Heading 1" onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} active={editor?.isActive('heading', { level: 1 })}>
                    <Heading1 className="h-4 w-4" />
                  </ToolbarButton>
                  <ToolbarButton title="Heading 2" onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} active={editor?.isActive('heading', { level: 2 })}>
                    <Heading2 className="h-4 w-4" />
                  </ToolbarButton>
                  <div className="w-px h-5 bg-border mx-1" />
                  <ToolbarButton title="Bullet List" onClick={() => editor?.chain().focus().toggleBulletList().run()} active={editor?.isActive('bulletList')}>
                    <List className="h-4 w-4" />
                  </ToolbarButton>
                  <ToolbarButton title="Numbered List" onClick={() => editor?.chain().focus().toggleOrderedList().run()} active={editor?.isActive('orderedList')}>
                    <ListOrdered className="h-4 w-4" />
                  </ToolbarButton>
                  <ToolbarButton title="Divider" onClick={() => editor?.chain().focus().setHorizontalRule().run()}>
                    <Minus className="h-4 w-4" />
                  </ToolbarButton>
                  <div className="w-px h-5 bg-border mx-1" />
                  <ToolbarButton
                    title="Insert Image"
                    onClick={() => imageInputRef.current?.click()}
                    active={editor?.isActive('image') || isUploadingImage}
                  >
                    {isUploadingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                  </ToolbarButton>
                  {editor?.isActive('image') && (
                    <>
                      <div className="w-px h-5 bg-border mx-1" />
                      {IMAGE_WIDTH_OPTIONS.map((width) => (
                        <Button
                          key={width}
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedImageWidth(width)}
                          className={cn(
                            'h-7 px-2 text-[10px] font-bold uppercase tracking-wider',
                            editor.getAttributes('image').width === width
                              ? 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground'
                              : 'text-muted-foreground'
                          )}
                        >
                          {width}
                        </Button>
                      ))}
                    </>
                  )}
                  <div className="w-px h-5 bg-border mx-1" />
                  <ToolbarButton title="Undo" onClick={() => editor?.chain().focus().undo().run()}>
                    <Undo className="h-4 w-4" />
                  </ToolbarButton>
                  <ToolbarButton title="Redo" onClick={() => editor?.chain().focus().redo().run()}>
                    <Redo className="h-4 w-4" />
                  </ToolbarButton>
                  <div className="ml-auto pl-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={saveDraft}
                      disabled={isSaving}
                      title="Save Draft"
                      className={cn(
                        'h-7 w-7 rounded',
                        'disabled:opacity-100',
                        isSaving && 'text-foreground',
                      )}
                    >
                      {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                    </Button>
                  </div>
                </div>

                {/* Editor */}
                <div className="flex-1 overflow-y-auto bg-white">
                  <EditorContent editor={editor} />
                </div>
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
                  <iframe
                    srcDoc={previewHtml}
                    className="flex-1 w-full border-none bg-white"
                    title="Email Preview"
                  />
                )}
              </div>
            </TabsContent>

            <TabsContent value="send" className="mt-0 focus-visible:ring-0 flex-1 min-h-0 custom-scrollbar overflow-y-auto">
              <div className="max-w-3xl mx-auto py-6 px-6 space-y-8">
                {/* Verification Section */}
                <section className="space-y-2">
                  <div className="border-b border-border/40">
                    <h4 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/50">Verification</h4>
                  </div>

                  <div className="flex items-center gap-3">
                    <Input
                      placeholder="test@example.com"
                      value={testEmail}
                      onChange={(e) => { setTestEmail(e.target.value); setTestSent(false); }}
                      className="h-10 md:w-80 text-sm border-border/40 bg-muted/5"
                    />
                    <Button
                      variant="outline"
                      onClick={handleSendTest}
                      disabled={isSending || !testEmail}
                      className="h-10 px-6 text-xs font-bold uppercase tracking-widest border-border/40"
                    >
                      {isSending ? 'Sending...' : 'Send Test'}
                    </Button>
                    {testSent && (
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 tracking-wider">
                        <CheckCircle2 className="h-4 w-4" />
                        SENT
                      </div>
                    )}
                  </div>
                </section>

                {/* Launch Section */}
                <section className="space-y-2">
                  <div className=" border-b border-border/40">
                    <h4 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/50">Finalize</h4>
                  </div>

                  <div className="flex items-center gap-4">
                    <Button
                      onClick={() => setShowSendConfirm(true)}
                      disabled={isSending || !subject}
                      className="h-12 px-10 font-bold uppercase tracking-widest text-xs shadow-sm"
                    >
                      {isSending ? 'Launching...' : 'Launch Campaign'}
                    </Button>
                  </div>
                </section>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Send Confirmation Dialog */}
      <AlertDialog open={showSendConfirm} onOpenChange={setShowSendConfirm}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">Confirm Mass Send</AlertDialogTitle>
            <AlertDialogDescription className="text-sm space-y-4">
              <div className="p-4 rounded-xl bg-destructive/5 text-destructive border border-destructive/10 flex gap-3">
                <Trash2 className="h-5 w-5 shrink-0" />
                <p className="font-bold leading-tight">This action cannot be undone. All recipients will receive this email immediately.</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase font-black tracking-widest opacity-50">Campaign Details</p>
                <p className="font-bold text-foreground leading-tight">Subject: {subject || '(No subject)'}</p>
                <p className="font-bold text-foreground">Audience: {selectedAudience?.label}</p>
              </div>
              {!testSent && (
                <p className="text-amber-500 font-bold text-[11px] uppercase tracking-wide bg-amber-500/5 p-2 rounded-lg border border-amber-500/10 text-center">
                  ⚠ WARNING: No test email has been sent yet.
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full font-bold">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSendToAudience}
              className="bg-indigo-600 hover:bg-indigo-700 rounded-full font-bold gap-2"
            >
              <Send className="h-4 w-4" />
              Yes, Send Now
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

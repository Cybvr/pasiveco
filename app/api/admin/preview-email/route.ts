import { NextRequest, NextResponse } from 'next/server';
import { render } from '@react-email/render';
import AdminBlastEmail from '@/emails/admin-blast';
import NewsletterEmail from '@/emails/newsletter';
import AnnouncementEmail from '@/emails/announcement';

export async function POST(req: NextRequest) {
  try {
    const { html: editorHtml, subject, templateId } = await req.json();

    let finalHtml = editorHtml;

    if (templateId === 'blast') {
      finalHtml = await render(AdminBlastEmail({ heading: subject || 'Preview Subject', message: editorHtml }));
    } else if (templateId === 'newsletter') {
      finalHtml = await render(NewsletterEmail({ subject: subject || 'Preview Subject', content: editorHtml }));
    } else if (templateId === 'announcement') {
      finalHtml = await render(AnnouncementEmail({ title: subject || 'Preview Subject', message: editorHtml }));
    }

    return new NextResponse(finalHtml, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

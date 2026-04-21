import { NextRequest, NextResponse } from 'next/server';
import { render } from '@react-email/render';
import { chunkEmails, getResendConfig, sendResendBatchEmails, sendResendEmail } from '@/lib/resend';
import { db } from '@/lib/firebase-admin';
import AdminBlastEmail from '@/emails/admin-blast';
import NewsletterEmail from '@/emails/newsletter';
import AnnouncementEmail from '@/emails/announcement';

export async function POST(req: NextRequest) {
  try {
    const { html: editorHtml, subject, testEmail, templateId } = await req.json();

    if (!editorHtml || !subject) {
      return NextResponse.json({ error: 'Missing html or subject' }, { status: 400 });
    }

    // Wrap in template if selected
    let finalHtml = editorHtml;
    try {
      if (templateId === 'blast') {
        finalHtml = await render(AdminBlastEmail({ heading: subject, message: editorHtml }));
      } else if (templateId === 'newsletter') {
        finalHtml = await render(NewsletterEmail({ subject, content: editorHtml }));
      } else if (templateId === 'announcement') {
        finalHtml = await render(AnnouncementEmail({ title: subject, message: editorHtml }));
      }
    } catch (renderError) {
      console.error('Template rendering error:', renderError);
      // Fallback to raw editor HTML if rendering fails
    }

    const { apiKey, from } = getResendConfig();

    if (!apiKey) {
      return NextResponse.json({ error: 'Resend API not configured' }, { status: 500 });
    }

    if (!from) {
      return NextResponse.json({ error: 'Resend sender email not configured' }, { status: 500 });
    }

    if (testEmail) {
      await sendResendEmail({
        from,
        to: testEmail,
        subject,
        html: finalHtml,
      });

      return NextResponse.json({ success: true, message: 'Test email sent' });
    }

    const usersSnapshot = await db.collection('users').get();
    const emails = [...new Set(usersSnapshot.docs
      .map(doc => doc.data().email)
      .filter((email): email is string => Boolean(email && typeof email === 'string')))];

    if (emails.length === 0) {
      return NextResponse.json({ success: true, message: 'No user emails found', successCount: 0, failureCount: 0 });
    }

    const emailChunks = chunkEmails(emails);
    let successCount = 0;
    let failureCount = 0;

    for (const chunk of emailChunks) {
      try {
        const result = await sendResendBatchEmails(
          chunk.map(email => ({
            from,
            to: [email],
            subject,
            html: finalHtml,
          }))
        );

        successCount += result.data?.length ?? chunk.length;
        failureCount += Math.max(0, chunk.length - (result.data?.length ?? 0));
      } catch (error) {
        console.error('Batch email sending error:', error);
        failureCount += chunk.length;
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Sent to ${successCount} users. ${failureCount} failed.`,
      successCount,
      failureCount
    });

  } catch (error: any) {
    console.error('Email sending error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

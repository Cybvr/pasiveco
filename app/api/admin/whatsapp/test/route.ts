import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "@/lib/firebase-admin";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const env = {
      hasPhoneNumberId: Boolean(process.env.WHATSAPP_PHONE_NUMBER_ID),
      hasAccessToken: Boolean(process.env.WHATSAPP_ACCESS_TOKEN),
      hasVerifyToken: Boolean(process.env.WHATSAPP_VERIFY_TOKEN),
      hasAppSecret: Boolean(process.env.WHATSAPP_APP_SECRET || process.env.META_APP_SECRET),
      hasFirebaseProjectId: Boolean(process.env.FIREBASE_PROJECT_ID),
      hasFirebaseClientEmail: Boolean(process.env.FIREBASE_CLIENT_EMAIL),
      hasFirebasePrivateKey: Boolean(process.env.FIREBASE_PRIVATE_KEY),
      hasFirebaseStorageBucket: Boolean(process.env.FIREBASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET),
    };

    const ref = await db.collection("whatsappDiagnostics").add({
      type: "firebase_write_test",
      env,
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ ok: true, diagnosticId: ref.id, env });
  } catch (error: any) {
    console.error("WhatsApp diagnostics GET error:", error);
    return NextResponse.json(
      { ok: false, error: error?.message || "Diagnostics failed" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const to = typeof body?.to === "string" ? body.to.trim() : "";
    const text = typeof body?.text === "string" && body.text.trim()
      ? body.text.trim()
      : "Pasive WhatsApp test message.";

    if (!to) {
      return NextResponse.json({ ok: false, error: "to is required" }, { status: 400 });
    }

    const result = await sendWhatsAppMessage(to, text);

    const ref = await db.collection("whatsappDiagnostics").add({
      type: "send_message_test",
      to,
      text,
      result,
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ ok: result.success, diagnosticId: ref.id, result });
  } catch (error: any) {
    console.error("WhatsApp diagnostics POST error:", error);
    return NextResponse.json(
      { ok: false, error: error?.message || "Send test failed" },
      { status: 500 }
    );
  }
}

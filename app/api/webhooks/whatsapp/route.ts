import { NextRequest, NextResponse } from "next/server";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getHelpDocs } from "@/lib/help-docs";

export const runtime = "nodejs";

// --- GET: Webhook Verification ---
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

  if (mode === "subscribe" && token === verifyToken) {
    return new Response(challenge, { status: 200 });
  }

  return new Response("Forbidden", { status: 403 });
}

// --- POST: Handle Incoming Messages ---
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Check if it's a WhatsApp message event
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const message = value?.messages?.[0];

    if (!message) {
      return NextResponse.json({ status: "ignored" });
    }

    const from = message.from; // User's WhatsApp ID/Phone Number
    const textBody = message.text?.body?.trim();

    if (!textBody) {
      return NextResponse.json({ status: "no_text" });
    }

    let reply = "";

    // 1. Handle Ice Breakers
    if (textBody === "Start selling on Pasive") {
      reply = "Awesome! 🚀 We'd love to have you. Pasive is the best place to monetize your audience. You can get started right here: https://pasive.co/signup";
    } else if (textBody === "I need help with my account") {
      reply = await getAIReply(textBody, from);
    } else if (textBody === "Browse creator content") {
      reply = "Check out what our amazing creators are doing on Pasive! Visit our explore page: https://pasive.co/explore";
    } else {
      // 2. Default to AI for other messages
      reply = await getAIReply(textBody, from);
    }

    // 3. Send the reply back via WhatsApp
    await sendWhatsAppMessage(from, reply);

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("WhatsApp Webhook Error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// --- AI Reply Helper (Reusing support-chat logic) ---
async function getAIReply(userMessage: string, waId: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return "Sorry, I'm having trouble connecting to my brain right now.";

  const docs = getHelpDocs();
  const docsContext = docs
    .map((doc) => {
      const highlights = doc.sections
        .flatMap((s) => [...(s.paragraphs ?? []), ...(s.bullets ?? [])])
        .filter(Boolean)
        .slice(0, 2);
      return `Title: ${doc.title}\nSummary: ${doc.summary}\n${highlights.length ? "Highlights: " + highlights.join(" ") : ""}`;
    })
    .join("\n\n");

  const systemPrompt = `You are Pasive WhatsApp support. Be extremely concise (max 80 words), friendly, and practical. Use the Help Docs provided. If you can't help, tell the user to email support@pasive.co. Return ONLY the text response.`;

  const prompt = `
${systemPrompt}

Help Docs:
${docsContext}

User (WhatsApp ID: ${waId}): ${userMessage}
Assistant:`;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    return result.response.text().trim() || "I'm here to help! What can I do for you today?";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I'm having a bit of trouble answering that right now. Could you try again later or email us at support@pasive.co?";
  }
}

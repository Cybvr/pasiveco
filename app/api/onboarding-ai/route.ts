import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const { userInput } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: { responseMimeType: "application/json" },
    });

    const prompt = `You are an expert onboarding assistant for Pasive.
    A user has introduced themselves in this format: "My email is [EMAIL], and I [WHAT THEY DO]".
    Input: "${userInput}"
    
    Task:
    1. Extract their Email address from the text.
    2. Suggest a creative Name for their brand/creator profile based on what they do.
    3. Suggest a Bio (under 160 chars).
    4. Choose a main Category.
    5. Define Brand Voice & Style.
    6. Generate 3-5 Product Ideas.

    Return JSON:
    {
      "profile": {
        "email": "...",
        "name": "...",
        "bio": "...",
        "category": "...",
        "brandVoice": "..."
      },
      "products": [...]
    }`;

    const result = await model.generateContent(prompt);

    if (
      !result.response ||
      !result.response.candidates ||
      result.response.candidates.length === 0
    ) {
      return NextResponse.json(
        { error: "AI could not generate content" },
        { status: 500 }
      );
    }

    const responseText = result.response.text();
    if (!responseText) {
      return NextResponse.json({ error: "AI returned empty text" }, { status: 500 });
    }

    try {
      const data = JSON.parse(responseText);
      return NextResponse.json(data);
    } catch {
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Error in AI Onboarding API:", error);
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
  }
}

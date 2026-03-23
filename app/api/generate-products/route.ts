import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const { description, brandPreferences, productType, creatorName } = await req.json();

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

    const prompt = `You are a creative product strategist for creators. 

    Creator Name: ${creatorName || 'Unknown'}
    Description of Interest: ${description}
    Creator's Brand Preferences: ${brandPreferences || 'None set'}

    Task:
    Generate a LIST of 3-5 distinct product ideas that this creator could launch. 
    The ideas should range across different formats (e.g., a digital tool, a course, a booking service).

    Return a JSON object with a "products" key containing an array of objects. Each object must have:
    - "name": a short listing title
    - "description": 1-2 sentences of punchy copy
    - "price": suggest a price in USD (number)
    - "productType": one of ["digital-download", "courses", "tickets", "membership", "booking", "bundle"]
    - "reasoning": a brief note on why this fits their brand

    TONE: Professional, visionary, and perfectly aligned with the creator's brand voice.
    IMPORTANT: Ensure the response is valid JSON.`;

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
    console.error("Error generating product:", error);
    const errorMsg = error?.message || "Failed to generate AI content";
    const status = errorMsg.includes("API_KEY_INVALID") ? 401 : 500;
    return NextResponse.json({ error: errorMsg }, { status });
  }
}

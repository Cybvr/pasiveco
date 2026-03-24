import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const { userInput, creatorName } = await req.json();

    if (!userInput) {
      return NextResponse.json(
        { error: "User input is required" },
        { status: 400 }
      );
    }

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

    const prompt = `You are an expert product strategist. A creator named "${creatorName || 'Unknown'}" wants to bulk create products based on the following input:

    --- USER INPUT ---
    ${userInput}
    --- END USER INPUT ---

    Task:
    1. Carefully analyze the input. It might contain a list of services, notes, a transcript, or just random ideas.
    2. Extract and refine as many distinct and viable product ideas as possible (up to 10).
    3. For each product, define:
       - "name": a catchy, professional title.
       - "description": a punchy 1-2 sentence sales copy.
       - "price": suggest a realistic price in USD (number).
       - "category": choose the most appropriate from: ["digital-download", "courses", "tickets", "membership", "booking", "bundle"].
    
    Return a JSON object with a "products" key containing an array of these product objects.
    
    TONE: Professional, entrepreneurial, and helpful.
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
    console.error("Error bulk generating products:", error);
    const errorMsg = error?.message || "Failed to generate AI content";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

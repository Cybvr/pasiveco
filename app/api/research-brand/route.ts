import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const { creatorName, username, bio, category } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY is not configured" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `You are a brand strategist for creators. 
    Your task is to research and define the brand voice and style for a creator.

    Creator Context:
    Name: ${creatorName || 'Unknown'}
    Username: ${username || 'Unknown'}
    Self-described Bio: ${bio || 'None'}
    Selected Category: ${category || 'None'}

    Task:
    1. Conduct a brief mental research analysis for "${creatorName}" (@${username}) to understand their content, niche, and typical audience.
    2. Write a concise "Brand Voice & Style" description (under 250 characters).
    3. Focus on their tone (e.g., informative, witty, aesthetic, professional), their core niche, and what makes them unique.

    The tone of your answer should be descriptive and helpful. 
    Return ONLY the text for the brand preferences. No JSON, no labels.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();
    
    return NextResponse.json({ brandPreferences: responseText });
  } catch (error: any) {
    console.error("Error researching brand:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

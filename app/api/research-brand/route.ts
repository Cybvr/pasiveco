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
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      tools: [
        {
          //@ts-ignore - googleSearch is supported in gemini-2.0-flash
          googleSearch: {},
        },
      ],
    });

    const prompt = `You are a brand strategist for creators. 
    Your task is to research and define the brand voice and style for "${creatorName || username}".

    Creator Context:
    Name: ${creatorName || 'Unknown'}
    Username: ${username || 'Unknown'}
    Self-described Bio: ${bio || 'None'}
    Selected Category: ${category || 'None'}

    Task:
    1. PROACTIVELY use your Google Search Tool to browse the web for "${creatorName || username}" to see who they are, what they build, and how they talk on social media (X/Twitter, LinkedIn, personal site).
    2. Write a concise "Brand Voice & Style" description (under 250 characters).
    3. Focus on their tone (e.g., informative, witty, aesthetic, professional) and specific niche.

    The tone of your answer should be descriptive and helpful. 
    Return ONLY the text for the brand preferences. No JSON, no labels.`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });
    const responseText = result.response.text().trim();
    
    return NextResponse.json({ brandPreferences: responseText });
  } catch (error: any) {
    console.error("Error researching brand:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

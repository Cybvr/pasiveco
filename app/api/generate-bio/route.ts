import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const { name, category, currentBio, categories, autoChooseCategory } = await req.json();

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
      generationConfig: { responseMimeType: "application/json" }
    });

    let prompt = "";
    if (autoChooseCategory && categories && Array.isArray(categories)) {
      prompt = `For this creator profile:
Name: ${name || 'N/A'}
Current Bio/Context: ${currentBio || 'N/A'}
Creator's Current Category: ${category || 'None'}

Please perform two tasks:
1. Generate an engaging, catchy, and punchy creator bio (under 160 characters) that fits a platform like Patreon. Avoid being too formal or LinkedIn-style; make it vibe with their content.
2. Select the most appropriate category for this creator from this predefined list ONLY: ${categories.join(", ")}.

Return the result as a JSON object with "bio" and "category" keys. If no category fits well, choose the most relevant one from the list.`;
    } else {
      prompt = `Generate a short, engaging, and creative bio for a creator.
Name: ${name || 'N/A'}
Category: ${category || 'N/A'}
Additional info: ${currentBio || ''}

The bio should be punchy (under 160 characters), catchy, and full of personality. It's for a creator platform like Patreon, so don't make it too formal or "LinkedIn-style". 
Keep it inviting and emphasize their unique niche in ${category || 'their field'}. Return the result as a JSON object with a single "bio" key. Do not include quotes in the content.`;
    }

    const result = await model.generateContent(prompt);
    
    if (!result.response || !result.response.candidates || result.response.candidates.length === 0) {
      console.error("Gemini API: No candidates returned. Possible safety filter block.");
      return NextResponse.json(
        { error: "AI could not generate content (blocked or empty response)" },
        { status: 500 }
      );
    }

    const responseText = result.response.text();
    
    if (!responseText) {
      return NextResponse.json(
        { error: "AI returned empty text" },
        { status: 500 }
      );
    }
    
    try {
      const data = JSON.parse(responseText);
      return NextResponse.json(data);
    } catch (e) {
      // Fallback for non-JSON responses if any
      const cleanedBio = responseText.replace(/^["'](.*)["']$/, '$1').trim();
      return NextResponse.json({ bio: cleanedBio });
    }
  } catch (error: any) {
    console.error("Error generating bio:", error);
    
    // Check for specific Gemini errors
    const errorMsg = error?.message || "Failed to generate AI content";
    const status = errorMsg.includes("API_KEY_INVALID") ? 401 : 500;

    return NextResponse.json(
      { error: errorMsg },
      { status }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const { title, description } = await req.json();

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

    const prompt = `Write a high-quality, engaging, and professional blog post based on the following:

    Title: ${title}
    Description: ${description}

    Task:
    - Write a full-length blog post (approx. 500-800 words).
    - Use HTML tags correctly (e.g., <h2> for subheadings, <p> for paragraphs, <ul>/<li> for lists, <strong> for emphasis).
    - Ensure the tone is consistent with a platform that empowers creators and entrepreneurs.
    - Start directly with the content (do not include the title in the HTML; it's handled separately).
    - Include a compelling introduction, well-structured body with subheadings, and a clear conclusion or call to action.

    Return the result as a JSON object with a "content" key containing the HTML string. Ensure the HTML is valid and doesn't contain extra markdown formatting (like \`\`\`html).`;

    const result = await model.generateContent(prompt);
    
    if (!result.response || !result.response.candidates || result.response.candidates.length === 0) {
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
    } catch (e) {
      // Fallback: If it's not JSON, assume raw HTML
      return NextResponse.json({ content: responseText });
    }
  } catch (error: any) {
    console.error("Error generating blog content:", error);
    const errorMsg = error?.message || "Failed to generate AI content";
    const status = errorMsg.includes("API_KEY_INVALID") ? 401 : 500;

    return NextResponse.json({ error: errorMsg }, { status });
  }
}

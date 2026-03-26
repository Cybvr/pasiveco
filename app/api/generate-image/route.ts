import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productName, productDescription } = body;
    console.log("Image generation request body:", body);
    const hfKey = (process.env.HUGGINGFACE_API_KEY || process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY || "").trim();
    console.log("Using HF Key:", hfKey ? "SET (check your terminal for key length if it fails)" : "MISSING");

    if (!hfKey || hfKey === 'hf_your_key_here') {
      return NextResponse.json({ error: "Hugging Face key not configured" }, { status: 500 });
    }

    const prompt = `Eye-catching digital product thumbnail inspired by "${productName}". ${productDescription}. Vivid colors, creative graphic design, visually striking composition, professional digital art, no text, no words, no letters`;

    console.log("Generating image for:", productName);

    const response = await fetch(
      "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${hfKey}`,
          "Content-Type": "application/json",
          "x-use-cache": "false"
        },
        body: JSON.stringify({ inputs: prompt }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("HF Inference Error Details:", JSON.stringify(errorData, null, 2));
      console.error("HF Status:", response.status);
      console.error("HF Status Text:", response.statusText);
      return NextResponse.json({
        error: "Hugging Face Inference Error",
        details: errorData,
        status: response.status
      }, { status: 400 });
    }

    console.log("Image blob received, converting to base64...");
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString('base64');

    return NextResponse.json({ base64Image });
  } catch (error: any) {
    console.error("Image generation API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
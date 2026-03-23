import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { productName, productDescription } = await req.json();
    const hfKey = process.env.HUGGINGFACE_API_KEY || process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY;
    console.log("Using HF Key:", hfKey ? "SET (check your terminal for key length if it fails)" : "MISSING");

    if (!hfKey || hfKey === 'hf_your_key_here') {
      return NextResponse.json({ error: "Hugging Face key not configured" }, { status: 500 });
    }

    const prompt = `professional product cover for ${productName}, ${productDescription.slice(0, 100)}, bold, modern retail design, high quality, studio lighting`;
    
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
        body: JSON.stringify({ 
          inputs: prompt,
          options: { wait_for_model: true } 
        }),
      }
    );

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("HF Inference Error Details:", errorData);
        return NextResponse.json({ 
          error: "Hugging Face Inference Error", 
          details: errorData,
          status: response.status 
        }, { status: 400 }); // Return 400 so we can see the body in browser
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

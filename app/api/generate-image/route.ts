import { NextRequest, NextResponse } from "next/server";
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { storage } from "@/lib/firebase"; 

export async function POST(req: NextRequest) {
  try {
    const { productName, productDescription } = await req.json();
    const hfKey = process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY;

    if (!hfKey || hfKey === 'hf_your_key_here') {
      return NextResponse.json({ error: "Hugging Face key not configured" }, { status: 500 });
    }

    const prompt = `professional product cover for ${productName}, ${productDescription.slice(0, 100)}, bold, modern retail design, high quality, studio lighting`;
    
    const response = await fetch(
      "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${hfKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: prompt }),
      }
    );

    if (!response.ok) {
        const errorText = await response.text();
        console.error("HF Error:", errorText);
        return NextResponse.json({ error: "Failed to generate image from HF" }, { status: response.status });
    }

    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();

    const filename = `ai-gen-${uuidv4()}.jpg`;
    const storageRef = ref(storage, `product-images/${filename}`);
    
    // Convert to Uint8Array for upload
    await uploadBytes(storageRef, new Uint8Array(arrayBuffer));
    const imageUrl = await getDownloadURL(storageRef);

    return NextResponse.json({ imageUrl });
  } catch (error: any) {
    console.error("Image generation API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

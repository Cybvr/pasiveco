import { NextRequest, NextResponse } from "next/server";

const PRODUCT_CATEGORIES = [
  "digital-download",
  "courses",
  "tickets",
  "membership",
  "booking",
  "bundle",
] as const;

type BulkProductsResponse = {
  products: Array<{
    name: string;
    description: string;
    price: number;
    category: (typeof PRODUCT_CATEGORIES)[number];
  }>;
};

const responseSchema = {
  name: "bulk_generated_products",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      products: {
        type: "array",
        maxItems: 10,
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            name: { type: "string" },
            description: { type: "string" },
            price: { type: "number" },
            category: {
              type: "string",
              enum: PRODUCT_CATEGORIES,
            },
          },
          required: ["name", "description", "price", "category"],
        },
      },
    },
    required: ["products"],
  },
} as const;

const systemPrompt = `You turn messy creator notes into clean product drafts.

Return up to 10 viable products based on the user's input.
Each product must have:
- name: short and clear
- description: punchy 1-2 sentence sales copy
- price: a realistic numeric price
- category: one of digital-download, courses, tickets, membership, booking, bundle

Rules:
- Extract directly from the user's input when possible.
- If the input is rough or incomplete, infer sensible product drafts without sounding robotic.
- Prefer practical, sellable offers over abstract ideas.
- Keep names plain and marketable.
- Do not include explanations outside the JSON response.`;

export async function POST(req: NextRequest) {
  try {
    const { userInput, creatorName } = await req.json();

    if (!userInput) {
      return NextResponse.json(
        { error: "User input is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const prompt = `Creator name: ${creatorName || "Unknown"}

User input:
${userInput}`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.7,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        response_format: {
          type: "json_schema",
          json_schema: responseSchema,
        },
      }),
    });

    const payload = await response.json();

    if (!response.ok) {
      const errorMessage =
        payload?.error?.message || "Failed to generate products";
      return NextResponse.json({ error: errorMessage }, { status: response.status });
    }

    const content = payload?.choices?.[0]?.message?.content;
    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "AI returned an empty response" },
        { status: 500 }
      );
    }

    const data = JSON.parse(content) as BulkProductsResponse;

    if (!Array.isArray(data.products)) {
      return NextResponse.json(
        { error: "AI response did not include products" },
        { status: 500 }
      );
    }

    const normalizedProducts = data.products
      .map((product) => ({
        name: String(product.name || "").trim(),
        description: String(product.description || "").trim(),
        price: Number(product.price || 0),
        category: PRODUCT_CATEGORIES.includes(product.category)
          ? product.category
          : "digital-download",
      }))
      .filter(
        (product) =>
          product.name &&
          product.description &&
          Number.isFinite(product.price) &&
          product.price >= 0
      );

    return NextResponse.json({ products: normalizedProducts });
  } catch (error: any) {
    console.error("Error bulk generating products:", error);
    const errorMsg = error?.message || "Failed to generate AI content";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

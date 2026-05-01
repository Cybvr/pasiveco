import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { auth, db } from "@/lib/firebase-admin";
import { generateUsername } from "@/lib/username";
import { slugify } from "@/utils/slugify";

export const runtime = "nodejs";

type SendPulseCreateProductBody = {
  name?: string;
  email?: string;
  phone?: string;
  phoneNumber?: string;
  productName?: string;
  productDescription?: string;
  productPrice?: string | number;
  productType?: string;
};

const stripUndefined = <T extends Record<string, unknown>>(value: T) =>
  Object.fromEntries(Object.entries(value).filter(([, entryValue]) => entryValue !== undefined));

const normalizeEmail = (value?: string) => (value || "").trim().toLowerCase();

const normalizePhone = (value?: string) => {
  const phone = (value || "").trim();
  if (!phone) return "";
  return phone.startsWith("+") ? phone : `+${phone.replace(/\D/g, "")}`;
};

function isAuthorized(req: NextRequest) {
  const secret = process.env.SENDPULSE_API_SECRET?.trim();

  if (!secret) {
    return process.env.NODE_ENV !== "production";
  }

  const authorization = req.headers.get("authorization") || "";
  const customSecret = req.headers.get("x-sendpulse-secret") || "";
  const token = (authorization.replace(/^Bearer\s+/i, "") || customSecret).trim();

  return token === secret;
}

async function findExistingAuthUser(email: string, phoneNumber: string) {
  if (email) {
    try {
      return await auth.getUserByEmail(email);
    } catch (error: any) {
      if (error?.code !== "auth/user-not-found") throw error;
    }
  }

  if (phoneNumber) {
    try {
      return await auth.getUserByPhoneNumber(phoneNumber);
    } catch (error: any) {
      if (error?.code !== "auth/user-not-found") throw error;
    }
  }

  return null;
}

function getCategory(productType?: string) {
  const normalized = (productType || "").trim().toLowerCase();

  if (normalized.includes("ebook") || normalized.includes("pdf")) return "ebook";
  if (normalized.includes("course") || normalized.includes("video")) return "courses";
  return "digital-download";
}

export async function POST(req: NextRequest) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as SendPulseCreateProductBody;
    const displayName = (body.name || "").trim() || "New Creator";
    const email = normalizeEmail(body.email);
    const phoneNumber = normalizePhone(body.phoneNumber || body.phone);
    const productName = (body.productName || "").trim();
    const productDescription = (body.productDescription || "").trim();
    const productPrice = Number(body.productPrice);
    const productType = (body.productType || "Digital product").trim();

    if (!email && !phoneNumber) {
      return NextResponse.json(
        { error: "Send an email or phone number." },
        { status: 400 }
      );
    }

    if (!productName) {
      return NextResponse.json({ error: "Send a product name." }, { status: 400 });
    }

    if (!Number.isFinite(productPrice) || productPrice < 0) {
      return NextResponse.json({ error: "Send a valid product price." }, { status: 400 });
    }

    const existingUser = await findExistingAuthUser(email, phoneNumber);
    const userRecord = existingUser
      ? await auth.updateUser(existingUser.uid, stripUndefined({
          displayName,
          email: email || undefined,
          phoneNumber: phoneNumber || undefined,
          disabled: false,
        }))
      : await auth.createUser(stripUndefined({
          displayName,
          email: email || undefined,
          phoneNumber: phoneNumber || undefined,
          emailVerified: false,
          disabled: false,
        }));

    const now = FieldValue.serverTimestamp();
    const userRef = db.collection("users").doc(userRecord.uid);
    const userSnap = await userRef.get();
    const existingData = userSnap.exists ? userSnap.data() || {} : {};
    const username = existingData.username || generateUsername(displayName, email || phoneNumber);

    await userRef.set(
      stripUndefined({
        email: email || existingData.email || "",
        displayName: existingData.displayName || displayName,
        phoneNumber: phoneNumber || existingData.phoneNumber || undefined,
        emailVerified: userRecord.emailVerified || false,
        isActive: true,
        isAdmin: existingData.isAdmin ?? false,
        role: existingData.role || "user",
        username,
        profilePicture: existingData.profilePicture || "",
        bio: existingData.bio || "",
        brandPreferences: existingData.brandPreferences || "",
        links: Array.isArray(existingData.links) ? existingData.links : [],
        socialLinks: Array.isArray(existingData.socialLinks) ? existingData.socialLinks : [],
        source: existingData.source || "sendpulse",
        metadata: {
          ...(typeof existingData.metadata === "object" && existingData.metadata ? existingData.metadata : {}),
          signUpMethod: "sendpulse",
        },
        canLogin: true,
        createdAt: existingData.createdAt || now,
        updatedAt: now,
      }),
      { merge: true }
    );

    const productSlug = `${slugify(productName)}-${Math.random().toString(36).slice(2, 7)}`;
    const category = getCategory(productType);
    const productRef = db.collection("products").doc();

    await productRef.set({
      userId: userRecord.uid,
      name: productName,
      description: productDescription || `${productType} created from SendPulse.`,
      price: productPrice,
      currency: "NGN",
      category,
      images: [],
      thumbnail: "",
      status: "active",
      tags: ["SendPulse", productType],
      details: {
        deliveryMode: "silent_email",
      },
      inventory: {
        quantity: 0,
        trackInventory: false,
      },
      shipping: {
        weight: 0,
        dimensions: {
          length: 0,
          width: 0,
          height: 0,
        },
        shippingRequired: false,
      },
      seo: {
        title: productName,
        description: productDescription || `${productType} by ${username}`,
        keywords: ["SendPulse", productType, category],
      },
      slug: productSlug,
      createdAt: now,
      updatedAt: now,
    });

    const productUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://pasive.co"}/${username}/product/${productRef.id}`;
    const loginLink = email
      ? await auth.generatePasswordResetLink(email, {
          url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://pasive.co"}/auth/login`,
        })
      : null;

    return NextResponse.json({
      ok: true,
      accountCreated: !existingUser,
      userId: userRecord.uid,
      productId: productRef.id,
      productUrl,
      loginLink,
      message: "Product created.",
    });
  } catch (error: any) {
    console.error("SendPulse create product error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create product." },
      { status: 500 }
    );
  }
}

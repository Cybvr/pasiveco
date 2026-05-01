import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { auth, db } from "@/lib/firebase-admin";
import { generateUsername } from "@/lib/username";

export const runtime = "nodejs";

type SendPulseCreateAccountBody = {
  name?: string;
  email?: string;
  phone?: string;
  phoneNumber?: string;
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
  const secret = process.env.SENDPULSE_API_SECRET;

  if (!secret) {
    return process.env.NODE_ENV !== "production";
  }

  const authorization = req.headers.get("authorization") || "";
  return authorization.replace(/^Bearer\s+/i, "").trim() === secret;
}

async function findExistingUser(email: string, phoneNumber: string) {
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

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "SendPulse create-account API is live. Use POST to create accounts.",
  });
}

export async function POST(req: NextRequest) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as SendPulseCreateAccountBody;
    const displayName = (body.name || "").trim() || "New Creator";
    const email = normalizeEmail(body.email);
    const phoneNumber = normalizePhone(body.phoneNumber || body.phone);

    if (!email && !phoneNumber) {
      return NextResponse.json(
        { error: "Send an email or phone number." },
        { status: 400 }
      );
    }

    const existingUser = await findExistingUser(email, phoneNumber);
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

    await userRef.set(
      stripUndefined({
        email: email || existingData.email || "",
        displayName: existingData.displayName || displayName,
        phoneNumber: phoneNumber || existingData.phoneNumber || undefined,
        emailVerified: userRecord.emailVerified || false,
        isActive: true,
        isAdmin: existingData.isAdmin ?? false,
        role: existingData.role || "user",
        username: existingData.username || generateUsername(displayName, email || phoneNumber),
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

    const loginLink = email
      ? await auth.generatePasswordResetLink(email, {
          url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://pasive.co"}/auth/login`,
        })
      : null;

    return NextResponse.json({
      ok: true,
      created: !existingUser,
      userId: userRecord.uid,
      message: existingUser ? "Account already exists." : "Account created.",
      loginLink,
    });
  } catch (error: any) {
    console.error("SendPulse create account error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create account." },
      { status: 500 }
    );
  }
}

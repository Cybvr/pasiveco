import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { auth, db } from "@/lib/firebase-admin";
import { generateUsername } from "@/lib/username";

export const runtime = "nodejs";

type SendPulseAddPayoutBody = {
  name?: string;
  email?: string;
  phone?: string;
  phoneNumber?: string;
  bankName?: string;
  bankCode?: string;
  accountName?: string;
  accountNumber?: string;
  country?: string;
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

export async function POST(req: NextRequest) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as SendPulseAddPayoutBody;
    const displayName = (body.name || "").trim() || "New Creator";
    const email = normalizeEmail(body.email);
    const phoneNumber = normalizePhone(body.phoneNumber || body.phone);
    const bankName = (body.bankName || "").trim();
    const bankCode = (body.bankCode || "").trim();
    const accountName = (body.accountName || "").trim();
    const accountNumber = (body.accountNumber || "").replace(/\D/g, "");
    const country = (body.country || "NG").trim().toUpperCase();

    if (!email && !phoneNumber) {
      return NextResponse.json(
        { error: "Send an email or phone number." },
        { status: 400 }
      );
    }

    if (!bankName || !accountName || !accountNumber) {
      return NextResponse.json(
        { error: "Send bankName, accountName, and accountNumber." },
        { status: 400 }
      );
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
    const existingAccounts = Array.isArray(existingData.payoutAccounts) ? existingData.payoutAccounts : [];
    const payoutAccountId = existingAccounts[0]?.id || Math.random().toString(36).slice(2, 10);
    const payoutAccount = stripUndefined({
      id: payoutAccountId,
      bankName,
      bankCode: bankCode || null,
      accountName,
      accountNumber,
      recipientCode: existingAccounts[0]?.recipientCode || null,
      country,
      payoutGateway: "paystack",
      isDefault: true,
      updatedAt: new Date().toISOString(),
    });

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
        links: Array.isArray(existingData.links) ? existingData.links : [],
        socialLinks: Array.isArray(existingData.socialLinks) ? existingData.socialLinks : [],
        source: existingData.source || "sendpulse",
        canLogin: true,
        payoutAccounts: [
          payoutAccount,
          ...existingAccounts.filter((account: any) => account?.id !== payoutAccountId).map((account: any) => ({
            ...account,
            isDefault: false,
          })),
        ],
        bankingDetails: payoutAccount,
        bankName,
        accountName,
        accountNumber,
        createdAt: existingData.createdAt || now,
        updatedAt: now,
      }),
      { merge: true }
    );

    return NextResponse.json({
      ok: true,
      accountCreated: !existingUser,
      userId: userRecord.uid,
      message: "Payout details saved.",
      bankName,
      accountName,
      accountLast4: accountNumber.slice(-4),
    });
  } catch (error: any) {
    console.error("SendPulse add payout error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to save payout details." },
      { status: 500 }
    );
  }
}

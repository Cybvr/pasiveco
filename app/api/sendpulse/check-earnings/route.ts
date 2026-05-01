import { NextRequest, NextResponse } from "next/server";
import { auth, db } from "@/lib/firebase-admin";

export const runtime = "nodejs";

type SendPulseCheckEarningsBody = {
  email?: string;
  phone?: string;
  phoneNumber?: string;
};

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

const isPaidTransaction = (data: Record<string, any>) =>
  data.status === "success" || data.status === "completed";

const getEarningValue = (data: Record<string, any>) =>
  Number(data.yourProfit ?? data.amount ?? 0) || 0;

export async function POST(req: NextRequest) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as SendPulseCheckEarningsBody;
    const email = normalizeEmail(body.email);
    const phoneNumber = normalizePhone(body.phoneNumber || body.phone);

    if (!email && !phoneNumber) {
      return NextResponse.json(
        { error: "Send an email or phone number." },
        { status: 400 }
      );
    }

    const userRecord = await findExistingAuthUser(email, phoneNumber);

    if (!userRecord) {
      return NextResponse.json({
        ok: true,
        accountFound: false,
        totalEarnings: 0,
        pendingPayout: 0,
        paidOut: 0,
        salesCount: 0,
        currency: "NGN",
        hasPayoutDetails: false,
        message: "No account found yet.",
      });
    }

    const [sellerTransactionsSnap, affiliateTransactionsSnap, giftsSnap, userSnap] = await Promise.all([
      db.collection("transactions").where("sellerId", "==", userRecord.uid).get(),
      db.collection("transactions").where("affiliate", "==", userRecord.uid).get(),
      db.collection("gifts").where("creatorId", "==", userRecord.uid).get(),
      db.collection("users").doc(userRecord.uid).get(),
    ]);

    const transactionDocs = [...sellerTransactionsSnap.docs, ...affiliateTransactionsSnap.docs];
    const successfulTransactions = transactionDocs
      .map((doc) => doc.data())
      .filter(isPaidTransaction);
    const successfulGifts = giftsSnap.docs
      .map((doc) => doc.data())
      .filter(isPaidTransaction);

    const transactionEarnings = successfulTransactions.reduce(
      (sum, data) => sum + getEarningValue(data),
      0
    );
    const giftEarnings = successfulGifts.reduce(
      (sum, data) => sum + Number(data.amount || 0),
      0
    );
    const pendingPayout = successfulTransactions
      .filter((data) => !data.payoutDate)
      .reduce((sum, data) => sum + getEarningValue(data), 0) + giftEarnings;
    const paidOut = successfulTransactions
      .filter((data) => Boolean(data.payoutDate))
      .reduce((sum, data) => sum + getEarningValue(data), 0);
    const userData = userSnap.exists ? userSnap.data() || {} : {};
    const payoutAccounts = Array.isArray(userData.payoutAccounts) ? userData.payoutAccounts : [];
    const hasPayoutDetails = payoutAccounts.length > 0 || Boolean(userData.bankingDetails);
    const totalEarnings = transactionEarnings + giftEarnings;

    return NextResponse.json({
      ok: true,
      accountFound: true,
      userId: userRecord.uid,
      totalEarnings,
      pendingPayout,
      paidOut,
      salesCount: successfulTransactions.length,
      giftCount: successfulGifts.length,
      currency: "NGN",
      hasPayoutDetails,
      message: `You have earned NGN ${totalEarnings.toLocaleString("en-NG")}. Pending payout: NGN ${pendingPayout.toLocaleString("en-NG")}.`,
    });
  } catch (error: any) {
    console.error("SendPulse check earnings error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to check earnings." },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import type { WriteBatch } from "firebase-admin/firestore";
import { auth, db } from "@/lib/firebase-admin";
import { getAuthenticatedUser } from "@/lib/server-auth";

export const runtime = "nodejs";

const normalizePhone = (value?: string | null) => (value || "").replace(/\D/g, "");

const whatsappUserIdFromPhone = (phoneNumber: string) => `whatsapp_${normalizePhone(phoneNumber)}`;

const stripUndefined = <T extends Record<string, any>>(value: T) =>
  Object.fromEntries(Object.entries(value).filter(([, entryValue]) => entryValue !== undefined));

async function commitBatches(writes: Array<(batch: WriteBatch) => void>) {
  for (let index = 0; index < writes.length; index += 450) {
    const batch = db.batch();
    writes.slice(index, index + 450).forEach((write) => write(batch));
    await batch.commit();
  }
}

export async function POST() {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decodedUser = await auth.getUser(user.uid);
    const phoneNumber = decodedUser.phoneNumber;

    if (!phoneNumber) {
      return NextResponse.json({ error: "Phone verification required" }, { status: 400 });
    }

    const normalizedPhone = normalizePhone(phoneNumber);
    const whatsappUserId = whatsappUserIdFromPhone(phoneNumber);

    if (whatsappUserId === user.uid) {
      return NextResponse.json({ claimed: false, reason: "already_whatsapp_uid" });
    }

    const whatsappUserRef = db.collection("users").doc(whatsappUserId);
    const authUserRef = db.collection("users").doc(user.uid);
    const [whatsappUserSnap, authUserSnap] = await Promise.all([
      whatsappUserRef.get(),
      authUserRef.get(),
    ]);

    if (!whatsappUserSnap.exists) {
      if (authUserSnap.exists) {
        await authUserRef.set(
          {
            phoneNumber,
            phoneVerified: true,
            authProvider: "phone",
            accountStatus: "claimed",
            canLogin: true,
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
      }

      return NextResponse.json({ claimed: false, reason: "no_whatsapp_user" });
    }

    const whatsappUser = whatsappUserSnap.data() || {};
    const existingAuthUser = authUserSnap.exists ? authUserSnap.data() || {} : {};
    const storedWhatsappPhone = normalizePhone(whatsappUser.phoneNumber || whatsappUser.whatsappId || whatsappUserSnap.id);

    if (storedWhatsappPhone && storedWhatsappPhone !== normalizedPhone) {
      return NextResponse.json({ error: "Phone number does not match WhatsApp account" }, { status: 403 });
    }

    const [productsSnap, transactionsSnap] = await Promise.all([
      db.collection("products").where("userId", "==", whatsappUserId).get(),
      db.collection("transactions").where("sellerId", "==", whatsappUserId).get(),
    ]);
    const now = FieldValue.serverTimestamp();
    const writes: Array<(batch: WriteBatch) => void> = [
      (batch) => batch.set(
        authUserRef,
        stripUndefined({
          ...whatsappUser,
          ...existingAuthUser,
          email: existingAuthUser.email || whatsappUser.email || "",
          displayName: existingAuthUser.displayName || whatsappUser.displayName || whatsappUser.whatsappProfileName || "",
          phoneNumber,
          phoneVerified: true,
          whatsappUserId,
          whatsappId: whatsappUser.whatsappId || normalizedPhone,
          whatsappProfileName: whatsappUser.whatsappProfileName || whatsappUser.displayName || null,
          source: existingAuthUser.source || whatsappUser.source || "whatsapp",
          accountStatus: "claimed",
          authProvider: "phone",
          canLogin: true,
          claimedAt: now,
          claimedFrom: whatsappUserId,
          createdAt: existingAuthUser.createdAt || whatsappUser.createdAt || now,
          updatedAt: now,
        }),
        { merge: true }
      ),
      (batch) => batch.set(
        whatsappUserRef,
        {
          accountStatus: "claimed",
          claimedBy: user.uid,
          claimedAt: now,
          canonicalUserId: user.uid,
          previousUsername: whatsappUser.username || null,
          previousSlug: whatsappUser.slug || null,
          username: FieldValue.delete(),
          slug: FieldValue.delete(),
          canLogin: false,
          updatedAt: now,
        },
        { merge: true }
      ),
      ...productsSnap.docs.map((productDoc) => (batch: WriteBatch) => {
        batch.update(productDoc.ref, {
          userId: user.uid,
          originalWhatsappUserId: whatsappUserId,
          updatedAt: now,
        });
      }),
      ...transactionsSnap.docs.map((transactionDoc) => (batch: WriteBatch) => {
        batch.update(transactionDoc.ref, {
          sellerId: user.uid,
          originalWhatsappSellerId: whatsappUserId,
          updatedAt: now,
        });
      }),
    ];

    await commitBatches(writes);

    return NextResponse.json({
      claimed: true,
      userId: user.uid,
      whatsappUserId,
      productsClaimed: productsSnap.size,
      transactionsClaimed: transactionsSnap.size,
    });
  } catch (error: any) {
    console.error("WhatsApp account claim error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to claim WhatsApp account" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";

export const runtime = "nodejs";

type CatalogProductRef = {
  id: string;
  quantity: number;
};

const parseProducts = (value: string | null): CatalogProductRef[] => {
  if (!value) return [];

  return value
    .split(",")
    .map((entry) => {
      const [rawId, rawQuantity] = entry.split(":");
      const id = decodeURIComponent(rawId || "").trim();
      const quantity = Number.parseInt(rawQuantity || "1", 10);

      return {
        id,
        quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 1,
      };
    })
    .filter((entry) => entry.id);
};

async function findProduct(productId: string) {
  const directDoc = await db.collection("products").doc(productId).get();
  if (directDoc.exists) {
    return { id: directDoc.id, ...directDoc.data() };
  }

  const slugSnap = await db
    .collection("products")
    .where("slug", "==", productId)
    .limit(1)
    .get();

  if (!slugSnap.empty) {
    const doc = slugSnap.docs[0];
    return { id: doc.id, ...doc.data() };
  }

  const skuSnap = await db
    .collection("products")
    .where("details.sku", "==", productId)
    .limit(1)
    .get();

  if (!skuSnap.empty) {
    const doc = skuSnap.docs[0];
    return { id: doc.id, ...doc.data() };
  }

  return null;
}

async function getSellerHandle(userId: string) {
  const sellerDoc = await db.collection("users").doc(userId).get();
  const seller = sellerDoc.data();
  return String(seller?.username || seller?.slug || "").replace(/^@/, "").trim();
}

export async function GET(req: NextRequest) {
  const productRefs = parseProducts(req.nextUrl.searchParams.get("products"));
  const coupon = req.nextUrl.searchParams.get("coupon");
  const firstProductRef = productRefs[0];

  if (!firstProductRef) {
    return NextResponse.redirect(new URL("/?checkout_error=missing_products", req.url));
  }

  const product = await findProduct(firstProductRef.id);
  const productUserId = typeof product?.userId === "string" ? product.userId : "";

  if (!product || !productUserId) {
    return NextResponse.redirect(new URL("/?checkout_error=product_not_found", req.url));
  }

  const sellerHandle = await getSellerHandle(productUserId);
  if (!sellerHandle) {
    return NextResponse.redirect(new URL("/?checkout_error=seller_not_found", req.url));
  }

  const productSlug = String(product.slug || product.id);
  const checkoutUrl = new URL(`/${sellerHandle}/product/${productSlug}/checkout`, req.url);

  if (coupon) checkoutUrl.searchParams.set("coupon", coupon);
  if (firstProductRef.quantity > 1) checkoutUrl.searchParams.set("quantity", String(firstProductRef.quantity));

  return NextResponse.redirect(checkoutUrl);
}

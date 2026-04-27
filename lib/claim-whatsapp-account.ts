import type { User } from "firebase/auth";

export async function claimWhatsAppAccount(user: User) {
  if (!user.phoneNumber) return null;

  const idToken = await user.getIdToken();
  const response = await fetch("/api/auth/claim-whatsapp", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body?.error || "Failed to claim WhatsApp account");
  }

  return response.json();
}

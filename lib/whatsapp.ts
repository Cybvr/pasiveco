/**
 * Minimal WhatsApp Cloud API client for sending messages.
 */
export async function sendWhatsAppMessage(to: string, text: string) {
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneId || !accessToken) {
    console.error("WhatsApp credentials missing in environment variables.");
    return { success: false, error: "Credentials missing" };
  }

  const url = `https://graph.facebook.com/v22.0/${phoneId}/messages`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: to,
        type: "text",
        text: { body: text },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("WhatsApp API Error:", data);
      return { success: false, error: data };
    }

    return { success: true, data };
  } catch (error) {
    console.error("WhatsApp Send Error:", error);
    return { success: false, error };
  }
}

export type WhatsAppMediaType = "image" | "video" | "audio" | "document";

export function getWhatsAppMediaType(contentType: string): WhatsAppMediaType {
  if (contentType.startsWith("image/")) return "image";
  if (contentType.startsWith("video/")) return "video";
  if (contentType.startsWith("audio/")) return "audio";
  return "document";
}

export async function sendWhatsAppMediaMessage({
  to,
  file,
  caption,
}: {
  to: string;
  file: File;
  caption?: string;
}) {
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneId || !accessToken) {
    console.error("WhatsApp credentials missing in environment variables.");
    return { success: false, error: "Credentials missing" };
  }

  const mediaType = getWhatsAppMediaType(file.type || "application/octet-stream");
  const uploadForm = new FormData();
  uploadForm.append("messaging_product", "whatsapp");
  uploadForm.append("type", file.type || "application/octet-stream");
  uploadForm.append("file", file, file.name || "attachment");

  try {
    const uploadResponse = await fetch(`https://graph.facebook.com/v22.0/${phoneId}/media`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: uploadForm,
    });
    const uploadData = await uploadResponse.json();

    if (!uploadResponse.ok || !uploadData.id) {
      console.error("WhatsApp Media Upload Error:", uploadData);
      return { success: false, error: uploadData };
    }

    const trimmedCaption = caption?.trim();
    const mediaPayload: Record<string, unknown> = { id: uploadData.id };
    if (mediaType === "document") mediaPayload.filename = file.name || "attachment";
    if (trimmedCaption && mediaType !== "audio") mediaPayload.caption = trimmedCaption;

    const sendResponse = await fetch(`https://graph.facebook.com/v22.0/${phoneId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        type: mediaType,
        [mediaType]: mediaPayload,
      }),
    });
    const sendData = await sendResponse.json();

    if (!sendResponse.ok) {
      console.error("WhatsApp Media Send Error:", sendData);
      return { success: false, error: sendData, mediaId: uploadData.id, mediaType };
    }

    return { success: true, data: sendData, mediaId: uploadData.id, mediaType };
  } catch (error) {
    console.error("WhatsApp Media Send Error:", error);
    return { success: false, error };
  }
}

export async function downloadWhatsAppMedia(mediaId: string) {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!accessToken) {
    throw new Error("WhatsApp access token missing in environment variables.");
  }

  const metadataResponse = await fetch(`https://graph.facebook.com/v22.0/${mediaId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const metadata = await metadataResponse.json();

  if (!metadataResponse.ok || !metadata.url) {
    throw new Error(`Failed to fetch WhatsApp media metadata: ${JSON.stringify(metadata)}`);
  }

  const mediaResponse = await fetch(metadata.url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!mediaResponse.ok) {
    const errorText = await mediaResponse.text();
    throw new Error(`Failed to download WhatsApp media: ${errorText}`);
  }

  const arrayBuffer = await mediaResponse.arrayBuffer();

  return {
    buffer: Buffer.from(arrayBuffer),
    contentType: mediaResponse.headers.get("content-type") || metadata.mime_type || "application/octet-stream",
  };
}

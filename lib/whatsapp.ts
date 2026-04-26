/**
 * Minimal WhatsApp Cloud API client for sending text messages.
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

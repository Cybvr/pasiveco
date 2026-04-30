/**
 * Minimal Messenger Platform API client for sending messages.
 */
export async function sendMessengerMessage(to: string, text: string) {
  const accessToken = process.env.MESSENGER_PAGE_ACCESS_TOKEN || process.env.META_ACCESS_TOKEN;

  if (!accessToken) {
    console.error("Messenger access token missing in environment variables.");
    return { success: false, error: "Credentials missing" };
  }

  // Strip prefix if present
  const psid = to.startsWith("msgr_") ? to.substring(5) : to;
  const url = `https://graph.facebook.com/v22.0/me/messages?access_token=${accessToken}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        recipient: { id: psid },
        message: { text },
        messaging_type: "RESPONSE",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Messenger API Error:", data);
      return { success: false, error: data };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Messenger Send Error:", error);
    return { success: false, error };
  }
}

/**
 * Note: Messenger media sending requires a slightly different payload 
 * than WhatsApp. For now, we'll implement simple text replies.
 */
export async function sendMessengerMediaMessage({
  to,
  file,
  caption,
}: {
  to: string;
  file: File;
  caption?: string;
}) {
  // TODO: Implement Messenger media upload if needed
  // For now, fall back to text
  return sendMessengerMessage(to, caption || `Sent an attachment: ${file.name}`);
}

/**
 * Fetches user profile details from Facebook.
 * Requires the 'profile' permission or the user to have interacted recently.
 */
export async function getMessengerProfile(psid: string) {
  const accessToken = process.env.MESSENGER_PAGE_ACCESS_TOKEN || process.env.META_ACCESS_TOKEN;
  if (!accessToken) return null;

  const url = `https://graph.facebook.com/${psid}?fields=first_name,last_name,profile_pic&access_token=${accessToken}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    if (!response.ok) return null;
    return {
      name: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
      profilePic: data.profile_pic || null,
    };
  } catch (error) {
    console.error("Error fetching Messenger profile:", error);
    return null;
  }
}


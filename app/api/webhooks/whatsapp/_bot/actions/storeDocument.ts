import { downloadWhatsAppMedia } from "@/lib/whatsapp";
import { storageBucket } from "@/lib/firebase-admin";

export async function storeWhatsAppDocument({
  creatorId,
  mediaId,
  fileName,
}: {
  creatorId: string;
  mediaId: string;
  fileName: string;
}) {
  const media = await downloadWhatsAppMedia(mediaId);
  const safeFileName = fileName.replace(/[^\w.\-]+/g, "-") || "product-file";
  const storagePath = `whatsapp-products/${creatorId}/${Date.now()}-${safeFileName}`;
  const file = storageBucket.file(storagePath);

  await file.save(media.buffer, {
    contentType: media.contentType,
    resumable: false,
    metadata: {
      cacheControl: "private, max-age=0",
      metadata: { whatsappMediaId: mediaId },
    },
  });

  const [signedUrl] = await file.getSignedUrl({
    action: "read",
    expires: "01-01-2100",
  });

  return { fileName: safeFileName, fileUrl: signedUrl };
}

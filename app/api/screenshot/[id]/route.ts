// This file has been deprecated and removed.
// We now use the featured image directly instead of attempting screenshots.
export async function GET() {
  return new Response(null, {
    status: 307,
    headers: {
      'Location': '/images/qr-preview-placeholder.png'
    }
  });
}
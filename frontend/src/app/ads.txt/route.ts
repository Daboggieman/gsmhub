// ads.txt (IAB Tech Lab standard) authorizes ad sellers for this domain.
// Google AdSense requires it with our publisher ID once the AdSense
// account is approved — set NEXT_PUBLIC_ADSENSE_PUBLISHER_ID (e.g.
// "pub-1234567890123456") and this route serves the record Google's
// crawler expects. Until then it serves a comment-only file, which is
// valid and harmless.
export const dynamic = 'force-static';

export function GET() {
  const publisherId = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID;

  const body = publisherId
    ? `google.com, ${publisherId}, DIRECT, f08c47fec0942fa0\n`
    : '# ads.txt will list authorized sellers once the AdSense publisher\n'
      + '# ID is configured (NEXT_PUBLIC_ADSENSE_PUBLISHER_ID).\n';

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}

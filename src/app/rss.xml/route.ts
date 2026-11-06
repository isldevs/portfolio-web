import { ContentItem, Page, Profile, publicApi } from '@/lib/api';
import { xml, siteUrl } from '@/lib/seo';
export const dynamic = 'force-dynamic';
export async function GET() {
  try {
    const [articles, profile] = await Promise.all([
      publicApi<Page<ContentItem>>('/articles', { size: 50 }),
      publicApi<Profile>('/profile'),
    ]);
    const rss = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>${xml(profile.full_name)} / Engineering field notes</title><link>${xml(siteUrl('/blog'))}</link><description>${xml(profile.short_bio)}</description><language>en</language><atom:link href="${xml(siteUrl('/rss.xml'))}" rel="self" type="application/rss+xml"/>${articles.content.map((item) => `<item><title>${xml(item.title)}</title><link>${xml(siteUrl(`/blog/${item.slug}`))}</link><guid isPermaLink="true">${xml(siteUrl(`/blog/${item.slug}`))}</guid><description>${xml(item.summary)}</description>${item.published_at ? `<pubDate>${new Date(item.published_at).toUTCString()}</pubDate>` : ''}</item>`).join('')}</channel></rss>`;
    return new Response(rss, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    });
  } catch {
    return new Response('Content service unavailable', { status: 503 });
  }
}

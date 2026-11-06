import type { MetadataRoute } from 'next';
import { ContentItem, Page, publicApi } from '@/lib/api';
import { siteUrl } from '@/lib/seo';
export const dynamic = 'force-dynamic';
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    '',
    '/about',
    '/experience',
    '/skills',
    '/projects',
    '/case-studies',
    '/blog',
    '/contact',
    '/resume',
  ].map((path) => ({ url: siteUrl(path), changeFrequency: 'weekly' }));
  for (const resource of ['projects', 'case-studies', 'articles']) {
    try {
      let page = 0,
        total = 1;
      do {
        const result = await publicApi<Page<ContentItem>>(`/${resource}`, { page, size: 100 });
        total = result.total_pages;
        entries.push(
          ...result.content.map((item) => ({
            url: siteUrl(`/${resource === 'articles' ? 'blog' : resource}/${item.slug}`),
            lastModified: new Date(item.updated_at),
          })),
        );
        page++;
      } while (page < total);
    } catch {}
  }
  return entries;
}

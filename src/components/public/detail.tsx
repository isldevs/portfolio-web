import Image from 'next/image';
import { cache } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, ChevronRight } from 'lucide-react';
import {
  ContentItem,
  Page,
  Profile,
  ApiError,
  publicApi,
  dateLabel,
  listField,
  textField,
  safeUrl,
  readingTime,
} from '@/lib/api';
import { metadata as pageMetadata, jsonLd, siteUrl } from '@/lib/seo';
import { ServiceUnavailable, Tags, ProjectPreview, External, ArticleCard } from './ui';
import { RichContent, headings } from './rich-content';
import { ReadingProgress } from './reader-tools';
export const getItem = cache(async (resource: string, slug: string) =>
  publicApi<ContentItem>(`/${resource}/${encodeURIComponent(slug)}`),
);
export async function detailMetadata(resource: string, slug: string) {
  const route = resource === 'articles' ? 'blog' : resource;
  try {
    const item = await getItem(resource, slug);
    const image = safeUrl(item.data.coverImage || item.data.coverImageUrl);
    return {
      ...pageMetadata(
        textField(item.data, 'seoTitle') || item.title,
        textField(item.data, 'seoDescription') || item.summary,
        `/${route}/${item.slug}`,
      ),
      alternates: {
        canonical: safeUrl(item.data.canonicalUrl) || siteUrl(`/${route}/${item.slug}`),
      },
      openGraph: {
        title: item.title,
        description: item.summary,
        url: siteUrl(`/${route}/${item.slug}`),
        type: resource === 'articles' ? ('article' as const) : ('website' as const),
        images: image ? [{ url: siteUrl(image) }] : undefined,
      },
    };
  } catch {
    return pageMetadata('Content', 'Portfolio and engineering notes.', `/${route}/${slug}`);
  }
}
export async function Detail({
  resource,
  slug,
}: {
  resource: 'projects' | 'articles' | 'case-studies';
  slug: string;
}) {
  let item: ContentItem;
  try {
    item = await getItem(resource, slug);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    return <ServiceUnavailable />;
  }
  const isBlog = resource === 'articles',
    route = isBlog ? 'blog' : resource,
    label = isBlog ? 'Field notes' : resource === 'projects' ? 'Projects' : 'Case studies';
  const toc = headings(item.body),
    cover = safeUrl(item.data.coverImage || item.data.coverImageUrl);
  let related: ContentItem[] = [],
    previous: ContentItem | undefined,
    next: ContentItem | undefined,
    profile: Profile | undefined;
  if (isBlog) {
    try {
      const [all, p] = await Promise.all([
        publicApi<Page<ContentItem>>('/articles', { size: 100 }),
        publicApi<Profile>('/profile'),
      ]);
      profile = p;
      const index = all.content.findIndex((v) => v.id === item.id);
      previous = index > 0 ? all.content[index - 1] : undefined;
      next = index >= 0 ? all.content[index + 1] : undefined;
      related = all.content.filter((v) => v.id !== item.id).slice(0, 2);
    } catch {}
  }
  const fields = [
    ['Problem statement', 'problemStatement'],
    ['Problem', 'problem'],
    ['Technical context', 'technicalContext'],
    ['Solution', 'solution'],
    ['Architecture', 'architecture'],
    ['API design', 'apiDesign'],
    ['Database design', 'databaseDesign'],
    ['Security considerations', 'securityConsiderations'],
    ['Engineering decisions', 'engineeringDecisions'],
    ['Challenges', 'challenges'],
    ['Trade-offs', 'tradeOffs'],
    ['Outcomes', 'outcomes'],
    ['Lessons learned', 'lessonsLearned'],
  ].filter(([, key]) => textField(item.data, key));
  const author = textField(item.data, 'author') || profile?.fullName || '';
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl('/') },
      { '@type': 'ListItem', position: 2, name: label, item: siteUrl(`/${route}`) },
      {
        '@type': 'ListItem',
        position: 3,
        name: item.title,
        item: siteUrl(`/${route}/${item.slug}`),
      },
    ],
  };
  return (
    <div className="page-content">
      {isBlog && <ReadingProgress />}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumb) }} />
      {isBlog && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLd({
              '@context': 'https://schema.org',
              '@type': 'BlogPosting',
              headline: item.title,
              description: item.summary,
              datePublished: item.publishedAt,
              dateModified: item.updatedAt,
              author: { '@type': 'Person', name: author },
              mainEntityOfPage: siteUrl(`/blog/${item.slug}`),
              ...(cover ? { image: siteUrl(cover) } : {}),
            }),
          }}
        />
      )}
      <header className="detail-header">
        <nav className="breadcrumbs" aria-label="Breadcrumbs">
          <Link href="/">Home</Link>
          <ChevronRight size={11} />
          <Link href={`/${route}`}>{label}</Link>
          <ChevronRight size={11} />
          <span>Entry</span>
        </nav>
        <span className="eyebrow">
          {textField(item.data, 'category') || 'ENGINEERING'} /{' '}
          {isBlog ? 'FIELD_NOTE' : 'SYSTEM_DESIGN'}
        </span>
        <h1>{item.title}</h1>
        <p className="lede">{item.summary}</p>
        <div className="detail-meta">
          {item.data.demonstration === true && (
            <span className="badge">
              {isBlog ? 'UNREVIEWED DEMONSTRATION ARTICLE' : 'DEMONSTRATION PROJECT'}
            </span>
          )}
          {isBlog && author && <span>By {author}</span>}
          <span>{dateLabel(item.publishedAt)}</span>
          {isBlog && <span>{readingTime(item.body)} min read</span>}
          {isBlog && item.updatedAt && <span>Updated {dateLabel(item.updatedAt)}</span>}
        </div>
      </header>
      <div className={isBlog ? 'article-layout' : ''}>
        <article className="detail-body">
          <Tags values={listField(item.data, isBlog ? 'tags' : 'technologies')} />
          {cover ? (
            <Image
              unoptimized
              width={1200}
              height={800}
              src={cover}
              alt={item.title}
              style={{
                width: '100%',
                maxHeight: 420,
                marginBottom: 30,
                border: '1px solid var(--border)',
              }}
            />
          ) : !isBlog ? (
            <ProjectPreview />
          ) : null}
          {!isBlog && (
            <div className="detail-links">
              <External href={textField(item.data, 'githubUrl')}>View source</External>
              <External href={textField(item.data, 'demoUrl')}>Live demo</External>
            </div>
          )}
          <RichContent body={item.body} />
          {fields.length > 0 && (
            <div className="detail-fields">
              {fields.map(([title, key]) => (
                <section className="detail-field" key={key}>
                  <h2>{title}</h2>
                  <p>{textField(item.data, key)}</p>
                </section>
              ))}
            </div>
          )}
          {listField(item.data, 'features').length > 0 && (
            <section className="detail-field">
              <h2>Features</h2>
              <ul className="prose">
                {listField(item.data, 'features').map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </section>
          )}
          {isBlog && (previous || next) && (
            <nav className="article-nav" aria-label="Adjacent articles">
              {previous ? (
                <Link href={`/blog/${previous.slug}`}>
                  <ArrowLeft size={13} /> {previous.title}
                </Link>
              ) : (
                <span />
              )}
              {next && (
                <Link href={`/blog/${next.slug}`}>
                  {next.title} <ArrowRight size={13} />
                </Link>
              )}
            </nav>
          )}
          {related.length > 0 && (
            <section className="related-content">
              <h2>Continue reading</h2>
              {related.map((other, i) => (
                <ArticleCard key={other.id} item={other} index={i} />
              ))}
            </section>
          )}
        </article>
        {isBlog && toc.length > 0 && (
          <aside className="article-toc">
            <h2>ON THIS PAGE</h2>
            {toc.map((heading) => (
              <a
                key={heading.id}
                href={`#${heading.id}`}
                style={{ paddingLeft: heading.level > 2 ? 24 : 14 }}
              >
                {heading.text}
              </a>
            ))}
          </aside>
        )}
      </div>
    </div>
  );
}

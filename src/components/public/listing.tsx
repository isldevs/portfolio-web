import Link from 'next/link';
import { ArrowLeft, ArrowRight, Search } from 'lucide-react';
import { ContentItem, Page, publicApi, listField, textField } from '@/lib/api';
import {
  PageIntro,
  ProjectCard,
  ArticleCard,
  CaseCard,
  EmptyState,
  ServiceUnavailable,
} from './ui';
export type SearchParams = Record<string, string | string[] | undefined>;
export function param(search: SearchParams, key: string) {
  const value = search[key];
  return typeof value === 'string' ? value : '';
}
export async function Listing({
  resource,
  search,
}: {
  resource: 'projects' | 'articles' | 'case-studies';
  search: SearchParams;
}) {
  const isBlog = resource === 'articles';
  const path = isBlog ? '/blog' : `/${resource}`;
  const config = {
    projects: {
      number: '03',
      title: 'Selected projects',
      description:
        'Exploring reliable systems, explicit trade-offs, and maintainable architecture.',
    },
    articles: {
      number: '04',
      title: 'Engineering field notes',
      description:
        'Practical notes on Java, Spring Boot, databases, and the decisions behind reliable software.',
    },
    'case-studies': {
      number: '06',
      title: 'Behind the architecture',
      description: 'A closer look at problems, design decisions, and lessons learned.',
    },
  }[resource];
  const q = param(search, 'q'),
    category = param(search, 'category'),
    tag = param(search, 'tag'),
    technology = param(search, 'technology'),
    requestedPage = Number(param(search, 'page') || 0),
    page = Number.isFinite(requestedPage) ? Math.max(0, Math.floor(requestedPage)) : 0;
  let result: Page<ContentItem>, options: Page<ContentItem>;
  try {
    [result, options] = await Promise.all([
      publicApi<Page<ContentItem>>(`/${resource}`, { q, category, tag, technology, page, size: 9 }),
      publicApi<Page<ContentItem>>(`/${resource}`, { size: 100 }),
    ]);
  } catch {
    return <ServiceUnavailable />;
  }
  const categories = [
    ...new Set(options.content.map((item) => textField(item.data, 'category')).filter(Boolean)),
  ].sort();
  const tech = [
    ...new Set(
      options.content.flatMap((item) => listField(item.data, isBlog ? 'tags' : 'technologies')),
    ),
  ].sort();
  const pageHref = (index: number) => {
    const query = new URLSearchParams();
    Object.entries({ q, category, tag, technology, page: String(index) }).forEach(
      ([key, value]) => {
        if (value) query.set(key, value);
      },
    );
    return `${path}?${query}`;
  };
  const featured =
    isBlog && !q && !category && !tag && page === 0
      ? result.content.find((item) => item.featured)
      : undefined;
  return (
    <div className="page-content">
      <PageIntro {...config} />
      <form className="filters" action={path}>
        <label className="sr-only" htmlFor="content-search">
          Search {isBlog ? 'articles' : 'projects'}
        </label>
        <input
          id="content-search"
          name="q"
          defaultValue={q}
          placeholder={isBlog ? 'Search articles...' : 'Search projects...'}
          className="field"
        />
        <label className="sr-only" htmlFor="category-filter">
          Category
        </label>
        <select id="category-filter" name="category" defaultValue={category} className="field">
          <option value="">All categories</option>
          {categories.map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
        <label className="sr-only" htmlFor="technology-filter">
          {isBlog ? 'Tag' : 'Technology'}
        </label>
        <select
          id="technology-filter"
          name={isBlog ? 'tag' : 'technology'}
          defaultValue={isBlog ? tag : technology}
          className="field"
        >
          <option value="">{isBlog ? 'All tags' : 'All technologies'}</option>
          {tech.map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
        <button className="button" type="submit">
          <Search size={14} /> Search
        </button>
        {(q || category || tag || technology) && (
          <Link className="button-secondary" href={path}>
            Clear
          </Link>
        )}
      </form>
      <div className="filter-count">
        <span>
          {String(result.totalElements).padStart(2, '0')} PUBLISHED{' '}
          {isBlog ? 'ENTRIES' : resource === 'projects' ? 'PROJECTS' : 'CASE STUDIES'}
        </span>
        <span>READ. QUESTION. BUILD.</span>
      </div>
      {featured && (
        <Link
          className="featured-entry"
          href={`/blog/${featured.slug}`}
          style={{ display: 'block' }}
        >
          <span>FEATURED / ENGINEERING FIELD NOTE</span>
          <h2>{featured.title}</h2>
          {featured.data.demonstration === true && (
            <span className="demo-label">UNREVIEWED DEMONSTRATION ARTICLE</span>
          )}
          <p>{featured.summary}</p>
          <span className="text-link">
            Read the article <ArrowRight size={14} />
          </span>
        </Link>
      )}
      {result.content.length ? (
        <div
          className={
            resource === 'projects' ? 'project-grid' : isBlog ? 'wide-articles' : 'case-list'
          }
        >
          {result.content
            .filter((item) => item.id !== featured?.id)
            .map((item, i) =>
              resource === 'projects' ? (
                <ProjectCard key={item.id} item={item} index={page * 9 + i} />
              ) : isBlog ? (
                <ArticleCard key={item.id} item={item} index={page * 9 + i} />
              ) : (
                <CaseCard key={item.id} item={item} />
              ),
            )}
        </div>
      ) : (
        <EmptyState
          label={
            q || category || tag || technology
              ? 'No results match these filters.'
              : 'No content has been published yet.'
          }
        />
      )}
      {result.totalPages > 1 && (
        <nav className="pagination" aria-label="Pagination">
          {page > 0 && (
            <Link className="button-secondary" href={pageHref(page - 1)}>
              <ArrowLeft size={13} /> Previous
            </Link>
          )}
          <span>
            Page {page + 1} of {result.totalPages}
          </span>
          {page + 1 < result.totalPages && (
            <Link className="button-secondary" href={pageHref(page + 1)}>
              Next <ArrowRight size={13} />
            </Link>
          )}
        </nav>
      )}
      <p className="content-note">
        Demonstration content is labeled. Personal employment history and unverified performance
        claims are not presented as facts.
      </p>
    </div>
  );
}

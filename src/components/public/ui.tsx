import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowUpRight,
  ArrowRight,
  Terminal,
  GitBranch,
  Server,
  Database,
  ShieldCheck,
  Braces,
  Layers,
  ExternalLink,
} from 'lucide-react';
import {
  ContentItem,
  Profile,
  dateLabel,
  listField,
  textField,
  safeUrl,
  readingTime,
} from '@/lib/api';
export const resourceRoutes: Record<string, string> = {
  projects: '/projects',
  articles: '/blog',
  'case-studies': '/case-studies',
};
export function SectionLabel({
  number,
  label,
  aside,
}: {
  number: string;
  label: string;
  aside?: React.ReactNode;
}) {
  return (
    <div className="section-label">
      <h2>
        <span>{number}</span> / {label}
      </h2>
      {aside}
    </div>
  );
}
export function Tags({ values }: { values: string[] }) {
  return (
    <div className="tags">
      {values.map((v) => (
        <span key={v}>{v}</span>
      ))}
    </div>
  );
}
export function EmptyState({ label = 'No published content yet.' }: { label?: string }) {
  return (
    <div className="empty-state">
      <Terminal size={22} />
      <p>{label}</p>
      <span>Check back for the next update.</span>
    </div>
  );
}
export function ServiceUnavailable() {
  return (
    <div className="service-state panel">
      <span className="eyebrow">CONTENT_SERVICE / UNAVAILABLE</span>
      <h1>Reconnecting to the backend.</h1>
      <p>The content API could not be reached. Please try again shortly.</p>
      <a className="button" href="">
        Try again <ArrowRight size={15} />
      </a>
    </div>
  );
}
export function PageIntro({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <header className="page-intro">
      <span className="eyebrow">{number} / YI_SIVLAY</span>
      <h1>
        {title}
        <span className="accent">.</span>
      </h1>
      <p>{description}</p>
    </header>
  );
}
export function ProjectPreview({ index = 0 }: { index?: number }) {
  return (
    <div className={`project-preview preview-${index % 3}`} aria-hidden="true">
      <div className="diagram-node">
        <Server size={17} />
        <span>API</span>
      </div>
      <div className="diagram-line">
        <span />
      </div>
      <div className="diagram-node">
        <Layers size={17} />
        <span>SERVICE</span>
      </div>
      <div className="diagram-line">
        <span />
      </div>
      <div className="diagram-node">
        <Database size={17} />
        <span>DATA</span>
      </div>
      <span className="diagram-label">ARCHITECTURE / CONCEPT</span>
    </div>
  );
}
export function ProjectCard({
  item,
  index = 0,
  compact = false,
}: {
  item: ContentItem;
  index?: number;
  compact?: boolean;
}) {
  const image = safeUrl(item.data.coverImage || item.data.coverImageUrl);
  return (
    <Link href={`/projects/${item.slug}`} className={`project-card ${compact ? 'compact' : ''}`}>
      <div className="card-meta">
        <span>PROJECT_{String(index + 1).padStart(2, '0')}</span>
        <span>
          {textField(item.data, 'category') || 'ENGINEERING'} <ArrowUpRight size={13} />
        </span>
      </div>
      {!compact &&
        (image ? (
          <div className="project-preview">
            <Image unoptimized width={1200} height={800} src={image} alt="" loading="lazy" />
          </div>
        ) : (
          <ProjectPreview index={index} />
        ))}
      <div className="card-copy">
        <span className="demo-label">
          {item.data.demonstration === true ? 'DEMONSTRATION PROJECT' : 'PROJECT'}
        </span>
        <h3>
          {item.title}
          <ArrowUpRight size={19} />
        </h3>
        <p>{item.summary}</p>
        <Tags values={listField(item.data, 'technologies')} />
      </div>
    </Link>
  );
}
export function ArticleCard({ item, index = 0 }: { item: ContentItem; index?: number }) {
  return (
    <Link href={`/blog/${item.slug}`} className="article-card">
      <div className="article-index">{String(index + 1).padStart(2, '0')}</div>
      <div>
        <div className="card-meta">
          <span>{textField(item.data, 'category') || 'ENGINEERING'}</span>
          <span>{readingTime(item.body)} MIN READ</span>
        </div>
        <h3>{item.title}</h3>
        {item.data.demonstration === true && (
          <span className="demo-label">UNREVIEWED DEMONSTRATION ARTICLE</span>
        )}
        <p>{item.summary}</p>
        <div className="article-bottom">
          <span>{dateLabel(item.publishedAt)}</span>
          <span>
            Read entry <ArrowUpRight size={14} />
          </span>
        </div>
      </div>
    </Link>
  );
}
export function CaseCard({ item }: { item: ContentItem }) {
  return (
    <Link className="case-card" href={`/case-studies/${item.slug}`}>
      <div className="case-icon">
        <GitBranch size={18} />
      </div>
      <div>
        <span className="demo-label">
          {item.data.demonstration === true ? 'DEMONSTRATION / CASE STUDY' : 'CASE STUDY'}
        </span>
        <h3>{item.title}</h3>
        <p>{item.summary}</p>
        <Tags values={listField(item.data, 'technologies')} />
        <span className="text-link">
          Explore decisions <ArrowRight size={14} />
        </span>
      </div>
      <ArrowUpRight className="case-arrow" size={17} />
    </Link>
  );
}
export function ProfilePortrait({ profile }: { profile: Profile }) {
  const image = safeUrl(profile.portraitUrl);
  return (
    <div className="portrait-frame">
      <span className="corner tl" />
      <span className="corner tr" />
      <span className="corner bl" />
      <span className="corner br" />
      {image ? (
        <Image unoptimized width={1200} height={800} src={image} alt={profile.fullName} />
      ) : (
        <div className="portrait-placeholder">
          <div className="portrait-grid" />
          <Braces size={55} strokeWidth={0.8} />
          <strong>
            {profile.fullName
              .split(' ')
              .map((v) => v[0])
              .join('')}
          </strong>
          <span>PORTRAIT PENDING</span>
        </div>
      )}
      <div className="portrait-caption">
        <span className="status-dot" /> ENGINEERING_PROFILE
      </div>
    </div>
  );
}
export const skillIcons = [Server, Layers, Database, ShieldCheck, GitBranch, Braces];
export function External({ href, children }: { href: string; children: React.ReactNode }) {
  const url = safeUrl(href);
  return url ? (
    <a href={url} target="_blank" rel="noopener noreferrer">
      {children}
      <ExternalLink size={13} />
    </a>
  ) : null;
}

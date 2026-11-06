import Link from 'next/link';
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  Code2,
  Terminal,
} from 'lucide-react';
import { publicApi, Profile, Page, ContentItem, textField, listField } from '@/lib/api';
import { metadata as pageMetadata, jsonLd, siteUrl } from '@/lib/seo';
import {
  SectionLabel,
  ProjectCard,
  CaseCard,
  ArticleCard,
  ProfilePortrait,
  EmptyState,
  ServiceUnavailable,
  skillIcons,
} from '@/components/public/ui';
export async function generateMetadata() {
  try {
    const profile = await publicApi<Profile>('/profile');
    const title = profile.seo_title || `${profile.full_name} / ${profile.professional_title}`;
    return {
      ...pageMetadata(title, profile.seo_description || profile.short_bio, '/'),
      title: { absolute: title },
    };
  } catch {
    return pageMetadata(
      'Senior Backend Developer',
      'Building reliable backend systems with Java, Spring Boot, and thoughtful engineering.',
      '/',
    );
  }
}
export default async function Home() {
  let profile: Profile,
    projects: Page<ContentItem>,
    cases: Page<ContentItem>,
    articles: Page<ContentItem>,
    skills: Page<ContentItem>,
    settings: Page<ContentItem>;
  try {
    [profile, projects, cases, articles, skills, settings] = await Promise.all([
      publicApi<Profile>('/profile'),
      publicApi<Page<ContentItem>>('/projects', { size: 3, featured: 'true' }),
      publicApi<Page<ContentItem>>('/case-studies', { size: 2 }),
      publicApi<Page<ContentItem>>('/articles', { size: 3 }),
      publicApi<Page<ContentItem>>('/skills', { size: 6 }),
      publicApi<Page<ContentItem>>('/settings', { size: 100 }),
    ]);
  } catch {
    return <ServiceUnavailable />;
  }
  const words = profile.headline?.replace(/\.$/, '').split(' ') || [];
  const last = words.pop();
  const site = settings.content.find((item) => item.slug === 'site');
  const services = site ? listField(site.data, 'services') : [];
  const tools = site ? listField(site.data, 'tools') : [];
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd({
            '@context': 'https://schema.org',
            '@type': 'Person',
            name: profile.full_name,
            jobTitle: profile.professional_title,
            url: siteUrl(),
            sameAs: [profile.github_url, profile.linkedin_url].filter(Boolean),
            address: { '@type': 'PostalAddress', addressLocality: profile.location },
          }),
        }}
      />
      <div className="system-bar">
        <span>
          <i className="status-dot" /> PORTFOLIO.SYSTEM / ONLINE
        </span>
        <span>
          {profile.location.toUpperCase()} <span className="accent">UTC+07:00</span>
        </span>
      </div>
      <div className="home-grid">
        <div className="home-main">
          <section className="hero">
            <div className="eyebrow">
              <span className="accent">&gt;</span> INITIALIZING_PORTFOLIO.EXE{' '}
              <span className="cursor">_</span>
            </div>
            <p className="hero-kicker">{profile.professional_title}</p>
            <h1>
              {words.join(' ')} <span>{last}.</span>
            </h1>
            <p className="hero-description">{profile.short_bio}</p>
            <div className="hero-actions">
              <Link className="button" href="/projects">
                View projects <ArrowUpRight size={16} />
              </Link>
              <Link className="button-secondary" href="/blog">
                Read the blog <ArrowRight size={16} />
              </Link>
            </div>
            <div className="hero-footnote">
              <span className="hero-line" /> JAVA · SPRING BOOT · ENTERPRISE SYSTEMS
            </div>
          </section>
          <section className="profile-section">
            <ProfilePortrait profile={profile} />
            <div className="profile-data">
              <div className="eyebrow">{"// WHO'S BEHIND THE SYSTEM"}</div>
              <h2>
                {profile.full_name}
                <span className="accent">_</span>
              </h2>
              <dl>
                <div>
                  <dt>ROLE</dt>
                  <dd>{profile.professional_title}</dd>
                </div>
                <div>
                  <dt>BASED IN</dt>
                  <dd>{profile.location}</dd>
                </div>
                <div>
                  <dt>FOCUS</dt>
                  <dd>{profile.specialization}</dd>
                </div>
                <div>
                  <dt>STATUS</dt>
                  <dd>{profile.availability || 'Availability not specified'}</dd>
                </div>
              </dl>
              <Link className="text-link" href="/about">
                A little more about me <ArrowUpRight size={14} />
              </Link>
            </div>
          </section>
          <section className="section-block">
            <SectionLabel
              number="01"
              label="SELECTED PROJECTS"
              aside={
                <Link href="/projects">
                  VIEW ALL <ArrowUpRight size={13} />
                </Link>
              }
            />
            <p className="section-description">
              Systems designed around real engineering questions.
            </p>
            <div className="project-stack">
              {projects.content.length ? (
                projects.content.map((item, i) => (
                  <ProjectCard key={item.id} item={item} index={i} />
                ))
              ) : (
                <EmptyState />
              )}
            </div>
            <p className="content-note">
              Sample projects are labeled demonstrations, not verified employment work.
            </p>
          </section>
          <section className="section-block">
            <SectionLabel
              number="02"
              label="FIELD NOTES"
              aside={
                <Link href="/blog">
                  ALL ENTRIES <ArrowUpRight size={13} />
                </Link>
              }
            />
            <div className="article-stack">
              {articles.content.length ? (
                articles.content.map((item, i) => (
                  <ArticleCard key={item.id} item={item} index={i} />
                ))
              ) : (
                <EmptyState label="No articles published yet." />
              )}
            </div>
          </section>
          <section className="terminal-panel">
            <div className="terminal-top">
              <div className="terminal-dots">
                <i />
                <i />
                <i />
              </div>
              <span>system.log</span>
              <Terminal size={13} />
            </div>
            <div className="terminal-body">
              <span className="eyebrow">&gt; SYSTEM_LOG</span>
              {[
                'Portfolio initialized',
                `${projects.total_elements} published projects loaded`,
                `${articles.total_elements} published articles loaded`,
                'System ready.',
              ].map((line, i) => (
                <p key={line} className="log-line" style={{ animationDelay: `${i * 0.15}s` }}>
                  <span>[0{i + 1}]</span>
                  <span>{line}</span>
                  <Check size={12} />
                </p>
              ))}
              <p className="terminal-prompt">
                <span>sivlay.yi@portfolio</span>:~$ <span className="cursor">▍</span>
              </p>
            </div>
          </section>
          <div className="stack-strip">
            <Code2 size={18} />
            <span>BUILT WITH PURPOSE</span>
            <span>JAVA</span>
            <span>SPRING BOOT</span>
            <span>POSTGRESQL</span>
            <span>NEXT.JS</span>
          </div>
        </div>
        <aside className="home-aside">
          <section className="aside-section">
            <SectionLabel number="03" label="CASE STUDIES" />
            <p className="section-description">The reasoning behind the implementation.</p>
            <div>
              {cases.content.length ? (
                cases.content.map((item) => <CaseCard key={item.id} item={item} />)
              ) : (
                <EmptyState label="Case studies are being prepared." />
              )}
            </div>
            <Link href="/case-studies" className="aside-bottom-link">
              Browse engineering decisions <ArrowRight size={13} />
            </Link>
          </section>
          <section className="aside-section">
            <SectionLabel number="04" label="TECHNICAL FOCUS" />
            <div className="skill-list">
              {skills.content.length ? (
                skills.content.map((item, i) => {
                  const Icon = skillIcons[i % skillIcons.length];
                  return (
                    <Link key={item.id} href="/skills" className="skill-row">
                      <span className="skill-icon">
                        <Icon size={17} />
                      </span>
                      <div>
                        <h3>{item.title}</h3>
                        <p>{item.summary || textField(item.data, 'description')}</p>
                      </div>
                      <ChevronRight size={13} />
                    </Link>
                  );
                })
              ) : (
                <EmptyState label="Skills will be published here." />
              )}
            </div>
          </section>
          <section className="aside-section">
            <SectionLabel number="05" label="HOW I CAN HELP" />
            <p className="section-description">Engineering support from design to delivery.</p>
            <ul className="service-list">
              {services.map((name, i) => {
                const ServiceIcon = skillIcons[i % skillIcons.length];
                return (
                  <li key={i}>
                    <span>0{i + 1}</span>
                    <ServiceIcon size={15} />
                    <span>{name}</span>
                    <ArrowUpRight size={13} />
                  </li>
                );
              })}
            </ul>
          </section>
          <section className="aside-section">
            <SectionLabel number="06" label="ENGINEERING TOOLKIT" />
            <div className="tool-grid">
              {tools.map((tool, i) => (
                <div key={tool}>
                  <span>{['{ }', '◈', '▤', '⑂', '>_', '↔'][i % 6]}</span>
                  <p>{tool}</p>
                </div>
              ))}
            </div>
          </section>
          <section className="contact-panel">
            <div className="eyebrow">
              <span className="status-dot" /> LET&apos;S START A CONVERSATION
            </div>
            <ArrowDownRight className="contact-arrow" size={30} strokeWidth={1} />
            <h2>
              Ready to build
              <br />
              what <span>matters.</span>
            </h2>
            <p>Have an interesting challenge? Let&apos;s talk about your next system.</p>
            <Link href="/contact" className="button">
              Get in touch <ArrowUpRight size={16} />
            </Link>
            <span className="contact-panel-label">
              {'// GOOD SYSTEMS START WITH A CONVERSATION'}
            </span>
          </section>
          <div className="aside-signoff">
            <span className="accent">&lt;/&gt;</span>
            <p>
              Thoughtful architecture.
              <br />
              Dependable implementation.
            </p>
            <Link href="/contact">
              <ArrowUpRight size={16} />
              <span className="sr-only">Contact Yi Sivlay</span>
            </Link>
          </div>
        </aside>
      </div>
    </>
  );
}

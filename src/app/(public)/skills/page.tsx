import { ContentItem, Page, publicApi, textField } from '@/lib/api';
import { metadata as pageMetadata } from '@/lib/seo';
import { PageIntro, ServiceUnavailable, EmptyState, skillIcons } from '@/components/public/ui';
export const metadata = pageMetadata(
  'Technical skills',
  'Backend development, architecture, databases, and application security.',
  '/skills',
);
export default async function Skills() {
  let skills: Page<ContentItem>;
  try {
    skills = await publicApi<Page<ContentItem>>('/skills', { size: 100 });
  } catch {
    return <ServiceUnavailable />;
  }
  return (
    <div className="page-content">
      <PageIntro
        number="08"
        title="Engineering toolkit"
        description="Areas of technical focus. No arbitrary percentages, just practical engineering disciplines."
      />
      {skills.content.length ? (
        <div className="skills-grid">
          {skills.content.map((item, i) => {
            const Icon = skillIcons[i % skillIcons.length];
            return (
              <article className="skill-card" key={item.id}>
                <Icon size={24} />
                <span className="eyebrow">
                  {textField(item.data, 'category') || 'TECHNICAL FOCUS'}
                </span>
                <h2 style={{ marginTop: 12 }}>{item.title}</h2>
                <p>{item.summary || textField(item.data, 'description')}</p>
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState label="Technical skills have not been published yet." />
      )}
    </div>
  );
}

import { publicApi, Page, ContentItem, textField, listField } from '@/lib/api';
import { metadata as pageMetadata } from '@/lib/seo';
import { PageIntro, ServiceUnavailable, EmptyState, Tags } from '@/components/public/ui';
export const metadata = pageMetadata(
  'Experience',
  'Professional background and engineering experience.',
  '/experience',
);
export default async function Experience() {
  let result: Page<ContentItem>;
  try {
    result = await publicApi<Page<ContentItem>>('/experiences', { size: 100 });
  } catch {
    return <ServiceUnavailable />;
  }
  return (
    <div className="page-content">
      <PageIntro
        number="07"
        title="Professional experience"
        description="The work, teams, and engineering challenges behind the journey."
      />
      {result.content.length ? (
        <div className="experience-list">
          {result.content.map((item) => (
            <article className="experience-card" key={item.id}>
              <span className="dates">
                {textField(item.data, 'start_date')} —{' '}
                {item.data.currently_employed ? 'Present' : textField(item.data, 'end_date')}
              </span>
              <h2>{item.title}</h2>
              <p className="company">
                {textField(item.data, 'company')}
                {textField(item.data, 'location') ? ` / ${textField(item.data, 'location')}` : ''}
              </p>
              <p>{item.summary}</p>
              <p>{textField(item.data, 'description')}</p>
              <Tags values={listField(item.data, 'technologies')} />
              {textField(item.data, 'responsibilities') && (
                <p style={{ marginTop: 20 }}>{textField(item.data, 'responsibilities')}</p>
              )}
            </article>
          ))}
        </div>
      ) : (
        <EmptyState label="Verified employment history has not been supplied yet." />
      )}
    </div>
  );
}

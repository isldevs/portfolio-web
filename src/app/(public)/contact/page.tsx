import { ArrowUpRight, MapPin } from 'lucide-react';
import { Profile, publicApi, safeUrl } from '@/lib/api';
import { metadata as pageMetadata } from '@/lib/seo';
import { PageIntro, ServiceUnavailable } from '@/components/public/ui';
import { ContactForm } from '@/components/public/contact-form';
export const metadata = pageMetadata(
  'Contact',
  'Start a conversation about backend engineering and your next system.',
  '/contact',
);
export default async function Contact() {
  let profile: Profile;
  try {
    profile = await publicApi<Profile>('/profile');
  } catch {
    return <ServiceUnavailable />;
  }
  return (
    <div className="page-content">
      <PageIntro
        number="05"
        title="Let’s build what matters"
        description="An interesting problem is a good place to start."
      />
      <div className="contact-layout">
        <section className="contact-intro">
          <span className="eyebrow">{'// OPEN_A_CONVERSATION'}</span>
          <h2 style={{ marginTop: 20 }}>
            Reliable systems.
            <br />
            Thoughtful collaboration<span className="accent">.</span>
          </h2>
          <p>
            Have a backend challenge, a project idea, or a technical question? Share a little
            context and let&apos;s take it from there.
          </p>
          <div className="contact-details">
            <span>
              <MapPin
                size={13}
                style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8 }}
              />
              {profile.location}
            </span>
            {profile.publicEmail && (
              <a href={`mailto:${profile.publicEmail}`}>
                {profile.publicEmail}
                <ArrowUpRight size={13} />
              </a>
            )}
            {safeUrl(profile.githubUrl) && (
              <a href={safeUrl(profile.githubUrl)} rel="noopener noreferrer" target="_blank">
                GitHub / isldevs <ArrowUpRight size={13} />
              </a>
            )}
            <span>{profile.availability || 'Availability has not been specified.'}</span>
          </div>
        </section>
        <ContactForm />
      </div>
    </div>
  );
}

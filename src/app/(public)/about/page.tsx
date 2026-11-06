import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Profile, publicApi } from '@/lib/api';
import { metadata as pageMetadata } from '@/lib/seo';
import { PageIntro, ProfilePortrait, ServiceUnavailable, External } from '@/components/public/ui';
export const metadata = pageMetadata(
  'About',
  'The engineering focus and approach of Yi Sivlay.',
  '/about',
);
export default async function About() {
  let profile: Profile;
  try {
    profile = await publicApi<Profile>('/profile');
  } catch {
    return <ServiceUnavailable />;
  }
  return (
    <div className="page-content">
      <PageIntro
        number="02"
        title="The person behind the systems"
        description="Thoughtful architecture. Clear decisions. Software built to last."
      />
      <div className="about-grid">
        <div>
          <ProfilePortrait profile={profile} />
          <div className="detail-links" style={{ marginTop: 25 }}>
            <External href={profile.github_url}>GitHub</External>
            <External href={profile.linkedin_url}>LinkedIn</External>
          </div>
        </div>
        <div className="about-copy">
          <span className="eyebrow">{'// HELLO_WORLD'}</span>
          <h2 style={{ marginTop: 15 }}>
            I&apos;m {profile.full_name}
            <span className="accent">.</span>
          </h2>
          <p>{profile.full_bio || profile.short_bio}</p>
          <dl className="about-facts">
            <div>
              <dt>ROLE</dt>
              <dd>{profile.professional_title}</dd>
            </div>
            <div>
              <dt>LOCATION</dt>
              <dd>{profile.location}</dd>
            </div>
            <div>
              <dt>SPECIALIZATION</dt>
              <dd>{profile.specialization}</dd>
            </div>
            <div>
              <dt>AVAILABILITY</dt>
              <dd>{profile.availability || 'Not specified'}</dd>
            </div>
          </dl>
          <div className="hero-actions" style={{ marginTop: 30 }}>
            <Link href="/experience" className="button-secondary">
              Experience <ArrowRight size={14} />
            </Link>
            <Link href="/contact" className="button">
              Let&apos;s talk <ArrowRight size={14} />
            </Link>
          </div>
          <p className="content-note">
            Employment history, education, and certifications will be added when verified
            information is supplied.
          </p>
        </div>
      </div>
    </div>
  );
}

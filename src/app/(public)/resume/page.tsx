import Link from 'next/link';
import { ArrowDownToLine, ArrowUpRight, FileText } from 'lucide-react';
import { Profile, publicApi, safeUrl } from '@/lib/api';
import { metadata as pageMetadata } from '@/lib/seo';
import { PageIntro, ServiceUnavailable } from '@/components/public/ui';
export const metadata = pageMetadata('Résumé', 'Professional résumé of Yi Sivlay.', '/resume');
export default async function Resume() {
  let profile: Profile;
  try {
    profile = await publicApi<Profile>('/profile');
  } catch {
    return <ServiceUnavailable />;
  }
  const url = safeUrl(profile.resumeUrl);
  return (
    <div className="page-content">
      <PageIntro
        number="09"
        title="Résumé"
        description="A concise view of my professional background."
      />
      <section className="resume-panel panel">
        <FileText size={30} className="accent" />
        <h2 style={{ marginTop: 20 }}>{profile.fullName}</h2>
        <p>
          {profile.professionalTitle} / {profile.location}
        </p>
        <p>{profile.shortBio}</p>
        {url ? (
          <a href={url} className="button" download>
            Download résumé <ArrowDownToLine size={15} />
          </a>
        ) : (
          <>
            <p className="content-note" style={{ marginBottom: 25 }}>
              A verified résumé has not been uploaded yet. Please use the contact form to request
              more information.
            </p>
            <Link href="/contact" className="button">
              Get in touch <ArrowUpRight size={15} />
            </Link>
          </>
        )}
      </section>
    </div>
  );
}

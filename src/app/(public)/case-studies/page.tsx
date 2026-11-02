import { Listing, SearchParams } from '@/components/public/listing';
import { metadata as pageMetadata } from '@/lib/seo';
export const metadata = pageMetadata(
  'Case studies',
  'Engineering problems, architecture decisions, and lessons learned.',
  '/case-studies',
);
export default async function CaseStudies({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  return <Listing resource="case-studies" search={await searchParams} />;
}

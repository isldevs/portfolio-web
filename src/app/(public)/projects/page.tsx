import { Listing, SearchParams } from '@/components/public/listing';
import { metadata as pageMetadata } from '@/lib/seo';
export const metadata = pageMetadata(
  'Projects',
  'Backend engineering projects and architecture explorations.',
  '/projects',
);
export default async function Projects({ searchParams }: { searchParams: Promise<SearchParams> }) {
  return <Listing resource="projects" search={await searchParams} />;
}

import { Listing, SearchParams } from '@/components/public/listing';
import { metadata as pageMetadata } from '@/lib/seo';
export const metadata = pageMetadata(
  'Technical blog',
  'Practical engineering notes on Java, Spring Boot, security, databases, and architecture.',
  '/blog',
);
export default async function Blog({ searchParams }: { searchParams: Promise<SearchParams> }) {
  return <Listing resource="articles" search={await searchParams} />;
}

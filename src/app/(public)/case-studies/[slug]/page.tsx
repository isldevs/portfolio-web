import { Detail, detailMetadata } from '@/components/public/detail';
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return detailMetadata('case-studies', (await params).slug);
}
export default async function CaseStudy({ params }: { params: Promise<{ slug: string }> }) {
  return <Detail resource="case-studies" slug={(await params).slug} />;
}

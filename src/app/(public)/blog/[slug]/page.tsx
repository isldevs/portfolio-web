import { Detail, detailMetadata } from '@/components/public/detail';
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return detailMetadata('articles', (await params).slug);
}
export default async function Article({ params }: { params: Promise<{ slug: string }> }) {
  return <Detail resource="articles" slug={(await params).slug} />;
}

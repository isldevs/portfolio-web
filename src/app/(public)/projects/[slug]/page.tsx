import { Detail, detailMetadata } from '@/components/public/detail';
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return detailMetadata('projects', (await params).slug);
}
export default async function Project({ params }: { params: Promise<{ slug: string }> }) {
  return <Detail resource="projects" slug={(await params).slug} />;
}

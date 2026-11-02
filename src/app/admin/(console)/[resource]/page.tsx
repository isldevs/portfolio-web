import { notFound } from 'next/navigation';
import { isResource } from '@/components/admin/api';
import ContentList from '@/components/admin/content-list';
export default async function ResourcePage({ params }: { params: Promise<{ resource: string }> }) {
  const { resource } = await params;
  if (!isResource(resource)) notFound();
  return <ContentList resource={resource} />;
}

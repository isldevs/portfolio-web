import { notFound } from 'next/navigation';
import { isResource } from '@/components/admin/api';
import ContentEditor from '@/components/admin/content-editor';
export default async function NewResourcePage({
  params,
}: {
  params: Promise<{ resource: string }>;
}) {
  const { resource } = await params;
  if (!isResource(resource)) notFound();
  return <ContentEditor key={`${resource}-new`} resource={resource} />;
}

import { notFound } from 'next/navigation';
import { isResource } from '@/components/admin/api';
import ContentEditor from '@/components/admin/content-editor';
export default async function EditResourcePage({
  params,
}: {
  params: Promise<{ resource: string; id: string }>;
}) {
  const { resource, id } = await params;
  if (!isResource(resource)) notFound();
  return <ContentEditor key={`${resource}-${id}`} resource={resource} id={id} />;
}

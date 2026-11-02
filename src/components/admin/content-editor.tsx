'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Diagram } from '@/components/public/diagram';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import { z } from 'zod';
import { Copy, Eye, History, Save, Upload } from 'lucide-react';
import { Content, dateText, errorText, Media, request, Resource, resources } from './api';
import { Heading, Loading, Notice } from './ui';
import RichEditor from './rich-editor';

type Draft = Pick<
  Content,
  'title' | 'slug' | 'summary' | 'body' | 'data' | 'status' | 'featured' | 'displayOrder'
> & { version?: number };
type Revision = {
  id: string;
  title?: string;
  createdAt?: string;
  version?: number;
  content?: Content;
};
const schema = z.object({
  title: z.string().trim().min(1, 'A title is required.').max(200),
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use a lowercase URL slug with hyphens.')
    .max(180),
  summary: z.string().max(4000),
  displayOrder: z.number().int().min(0).max(100000),
});
const initial: Draft = {
  title: '',
  slug: '',
  summary: '',
  body: { type: 'doc', content: [{ type: 'paragraph' }] },
  data: {},
  status: 'DRAFT',
  featured: false,
  displayOrder: 0,
};
const arrayFields = new Set([
  'technologies',
  'tags',
  'gallery',
  'images',
  'responsibilities',
  'features',
  'achievements',
]);
const longFields = new Set([
  'problem',
  'solution',
  'architecture',
  'databaseDesign',
  'securityConsiderations',
  'engineeringDecisions',
  'challenges',
  'tradeOffs',
  'lessonsLearned',
  'outcomes',
  'technicalApproach',
  'description',
]);
const fieldGroups: Record<Resource, [string, string][]> = {
  projects: [
    ['category', 'Category'],
    ['technologies', 'Technologies (comma separated)'],
    ['coverImage', 'Cover image URL'],
    ['gallery', 'Gallery URLs (comma separated)'],
    ['githubUrl', 'GitHub URL'],
    ['demoUrl', 'Demo URL'],
    ['problem', 'Problem statement'],
    ['solution', 'Solution'],
    ['architecture', 'Architecture'],
    ['features', 'Features (comma separated)'],
    ['databaseDesign', 'Database design'],
    ['securityConsiderations', 'Security considerations'],
    ['engineeringDecisions', 'Engineering decisions'],
    ['challenges', 'Challenges'],
    ['tradeOffs', 'Trade-offs'],
    ['lessonsLearned', 'Lessons learned'],
  ],
  blog: [
    ['category', 'Category'],
    ['tags', 'Tags (comma separated)'],
    ['author', 'Author'],
    ['coverImage', 'Cover image URL'],
    ['canonicalUrl', 'Canonical URL'],
  ],
  'case-studies': [
    ['relatedProject', 'Related project ID'],
    ['technologies', 'Technologies (comma separated)'],
    ['problem', 'Problem'],
    ['architecture', 'Architecture'],
    ['technicalApproach', 'Technical approach'],
    ['engineeringDecisions', 'Engineering decisions'],
    ['securityConsiderations', 'Security'],
    ['challenges', 'Challenges'],
    ['tradeOffs', 'Trade-offs'],
    ['outcomes', 'Outcomes (verified facts only)'],
    ['lessonsLearned', 'Lessons learned'],
    ['images', 'Image URLs (comma separated)'],
  ],
  experience: [
    ['company', 'Company'],
    ['location', 'Location'],
    ['employmentType', 'Employment type'],
    ['startDate', 'Start date'],
    ['endDate', 'End date (blank if current)'],
    ['responsibilities', 'Responsibilities (comma separated)'],
    ['technologies', 'Technologies (comma separated)'],
    ['achievements', 'Verified achievements (comma separated)'],
  ],
  skills: [
    ['category', 'Category'],
    ['icon', 'Icon name'],
    ['description', 'Description'],
  ],
  categories: [['description', 'Description']],
  tags: [['description', 'Description']],
};
function draftOf(item: Content): Draft {
  return {
    title: item.title,
    slug: item.slug,
    summary: item.summary || '',
    body: item.body || initial.body,
    data: item.data || {},
    status: item.status,
    featured: item.featured,
    displayOrder: item.displayOrder,
    version: item.version,
  };
}

export default function ContentEditor({ resource, id }: { resource: Resource; id?: string }) {
  const config = resources[resource];
  const router = useRouter();
  const client = useQueryClient();
  const [draft, setDraft] = useState<Draft>(initial);
  const [baseline, setBaseline] = useState(JSON.stringify(initial));
  const [loaded, setLoaded] = useState(!id);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [preview, setPreview] = useState(false);
  const [history, setHistory] = useState(false);
  const [uploading, setUploading] = useState(false);
  const savingRef = useRef(false);
  const draftRef = useRef(draft);
  const dirty = JSON.stringify(draft) !== baseline;
  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);
  const query = useQuery({
    queryKey: ['content-item', resource, id],
    queryFn: () => request<Content>(`/admin/${config.api}/${id}`),
    enabled: !!id,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
  const revisions = useQuery({
    queryKey: ['revisions', id],
    queryFn: () => request<Revision[]>(`/admin/articles/${id}/revisions`),
    enabled: resource === 'blog' && !!id && history,
  });
  if (query.data && !loaded) {
    const value = draftOf(query.data);
    setDraft(value);
    setBaseline(JSON.stringify(value));
    setLoaded(true);
  }
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    const intercept = (event: MouseEvent) => {
      const link = (event.target as HTMLElement).closest('a');
      if (
        link &&
        link.href !== window.location.href &&
        link.target !== '_blank' &&
        !window.confirm('You have unsaved changes. Leave this page?')
      ) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    window.addEventListener('beforeunload', warn);
    document.addEventListener('click', intercept, true);
    return () => {
      window.removeEventListener('beforeunload', warn);
      document.removeEventListener('click', intercept, true);
    };
  }, [dirty]);
  const save = useCallback(
    async (status?: Draft['status'], automatic = false) => {
      if (savingRef.current) return;
      const value = { ...draftRef.current, ...(status ? { status } : {}) };
      const validated = schema.safeParse(value);
      if (!validated.success) {
        if (!automatic) setError(validated.error.issues.map((issue) => issue.message).join(' '));
        return;
      }
      savingRef.current = true;
      setSaving(true);
      setError('');
      setSuccess('');
      try {
        const saved = await request<Content>(`/admin/${config.api}${id ? `/${id}` : ''}`, {
          method: id ? 'PUT' : 'POST',
          body: JSON.stringify({ ...value, ...validated.data }),
        });
        const next = draftOf(saved);
        setDraft(next);
        setBaseline(JSON.stringify(next));
        setSuccess(
          automatic
            ? 'Draft autosaved.'
            : saved.status === 'PUBLISHED'
              ? 'Published. Your public site is up to date.'
              : 'Changes saved.',
        );
        await client.invalidateQueries({ queryKey: ['content', resource] });
        await client.invalidateQueries({ queryKey: ['dashboard'] });
        await client.invalidateQueries({ queryKey: ['revisions', id] });
        if (!id) router.replace(`/admin/${resource}/${saved.id}/edit`);
      } catch (failure) {
        setError(errorText(failure));
      } finally {
        setSaving(false);
        savingRef.current = false;
      }
    },
    [config.api, id, client, resource, router],
  );
  useEffect(() => {
    if (!id || !dirty || draft.status !== 'DRAFT' || saving || !loaded) return;
    const timer = setTimeout(() => {
      void save(undefined, true);
    }, 10000);
    return () => clearTimeout(timer);
  }, [id, dirty, draft, saving, loaded, save]);
  function change<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((previous) => ({ ...previous, [key]: value }));
  }
  function changeData(key: string, value: unknown) {
    setDraft((previous) => ({ ...previous, data: { ...previous.data, [key]: value } }));
  }
  async function upload(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const data = new FormData();
      data.set('file', file);
      const asset = await request<Media>('/admin/media', { method: 'POST', body: data });
      changeData('coverImage', asset.url);
      setSuccess('Cover uploaded. Save your content to apply it.');
    } catch (failure) {
      setError(errorText(failure));
    } finally {
      setUploading(false);
    }
  }
  async function duplicate() {
    setError('');
    setSaving(true);
    try {
      const suffix = `-copy-${Date.now().toString(36)}`;
      const prefix = draft.slug.slice(0, 180 - suffix.length).replace(/-+$/, '') || 'untitled';
      const copy = await request<Content>(`/admin/${config.api}`, {
        method: 'POST',
        body: JSON.stringify({
          ...draft,
          version: undefined,
          title: `${draft.title.slice(0, 193)} (copy)`,
          slug: `${prefix}${suffix}`,
          status: 'DRAFT',
        }),
      });
      router.push(`/admin/${resource}/${copy.id}/edit`);
    } catch (failure) {
      setError(errorText(failure));
    } finally {
      setSaving(false);
    }
  }
  async function restore(revisionId: string) {
    if (
      !window.confirm(
        'Restore this revision? Save your current changes first if you want to keep them.',
      )
    )
      return;
    setError('');
    setSaving(true);
    try {
      const item = await request<Content>(`/admin/articles/${id}/revisions/${revisionId}/restore`, {
        method: 'POST',
        body: JSON.stringify({ version: draft.version }),
      });
      const value = draftOf(item);
      setDraft(value);
      setBaseline(JSON.stringify(value));
      setSuccess('Revision restored as a draft. Review before publishing.');
      await revisions.refetch();
    } catch (failure) {
      setError(errorText(failure));
    } finally {
      setSaving(false);
    }
  }
  return (
    <>
      <Link href={`/admin/${resource}`} className="admin-back">
        ← Back to {config.title.toLowerCase()}
      </Link>
      <Heading
        code={id ? 'EDIT_CONTENT' : 'CREATE_CONTENT'}
        title={`${id ? 'Edit' : 'New'} ${config.singular}`}
        description="Make your work clear. Publish when it is ready."
      >
        <button className="admin-button secondary" onClick={() => setPreview(!preview)}>
          <Eye size={15} />
          {preview ? 'Edit' : 'Preview'}
        </button>
        {resource === 'blog' && id && (
          <button className="admin-button secondary" onClick={() => setHistory(!history)}>
            <History size={15} />
            History
          </button>
        )}
      </Heading>
      <Notice
        error={error || (query.error ? errorText(query.error) : undefined)}
        success={success}
      />
      {!loaded && !query.error ? (
        <Loading />
      ) : (
        loaded && (
          <>
            {history && (
              <section className="admin-panel admin-revisions">
                <h2>Revision history</h2>
                <p>Restoring a revision creates a new draft. Existing history remains available.</p>
                {revisions.isPending ? (
                  <Loading />
                ) : revisions.error ? (
                  <Notice error={errorText(revisions.error)} />
                ) : revisions.data?.length ? (
                  <ul>
                    {revisions.data.map((revision, index) => (
                      <li key={revision.id}>
                        <span>
                          {revision.title || `Revision ${revisions.data.length - index}`}{' '}
                          <small>{dateText(revision.createdAt)}</small>
                        </span>
                        <button
                          type="button"
                          className="admin-button secondary"
                          disabled={saving}
                          onClick={() => restore(revision.id)}
                        >
                          Restore
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No previous revisions yet.</p>
                )}
              </section>
            )}
            {preview ? (
              <section className="admin-panel admin-prose admin-content-preview">
                <span className="admin-status draft">PRIVATE PREVIEW</span>
                <h1>{draft.title || 'Untitled'}</h1>
                <p>{draft.summary}</p>
                <PreviewNode node={draft.body} />
                {Object.entries(draft.data)
                  .filter(([key]) => longFields.has(key))
                  .map(([key, value]) =>
                    value ? (
                      <section key={key}>
                        <h2>{fieldGroups[resource].find(([name]) => name === key)?.[1] || key}</h2>
                        <p>{String(value)}</p>
                      </section>
                    ) : null,
                  )}
              </section>
            ) : (
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  void save();
                }}
              >
                <fieldset className="admin-editor-grid" disabled={saving || uploading}>
                  <section className="admin-panel admin-form admin-editor-main">
                    <label>
                      Title
                      <input
                        value={draft.title}
                        required
                        maxLength={200}
                        onChange={(event) => {
                          const title = event.target.value;
                          setDraft((previous) => ({
                            ...previous,
                            title,
                            slug:
                              previous.slug ===
                              previous.title
                                .toLowerCase()
                                .replace(/[^a-z0-9]+/g, '-')
                                .replace(/^-|-$/g, '')
                                ? title
                                    .toLowerCase()
                                    .replace(/[^a-z0-9]+/g, '-')
                                    .replace(/^-|-$/g, '')
                                : previous.slug,
                          }));
                        }}
                      />
                    </label>
                    <label>
                      URL slug
                      <input
                        value={draft.slug}
                        required
                        pattern="[a-z0-9]+(-[a-z0-9]+)*"
                        maxLength={200}
                        onChange={(event) => change('slug', event.target.value)}
                      />
                      <small>Lowercase words separated by hyphens. Must be unique.</small>
                    </label>
                    <label>
                      {resource === 'blog' ? 'Excerpt' : 'Summary'}
                      <textarea
                        value={draft.summary}
                        rows={3}
                        maxLength={4000}
                        onChange={(event) => change('summary', event.target.value)}
                      />
                    </label>
                    <div className="admin-label">Content</div>
                    <RichEditor
                      value={draft.body}
                      onChange={(value) => change('body', value)}
                      disabled={saving}
                    />
                    {fieldGroups[resource].map(([key, label]) => (
                      <label key={key}>
                        {label}
                        {longFields.has(key) ? (
                          <textarea
                            value={String(draft.data[key] || '')}
                            rows={4}
                            maxLength={20000}
                            onChange={(event) => changeData(key, event.target.value)}
                          />
                        ) : (
                          <input
                            type={key.endsWith('Date') ? 'date' : 'text'}
                            value={
                              Array.isArray(draft.data[key])
                                ? (draft.data[key] as string[]).join(', ')
                                : String(draft.data[key] || '')
                            }
                            maxLength={4000}
                            onChange={(event) =>
                              changeData(
                                key,
                                arrayFields.has(key)
                                  ? event.target.value.split(',').map((part) => part.trim())
                                  : event.target.value,
                              )
                            }
                          />
                        )}
                      </label>
                    ))}
                    {resource === 'experience' && (
                      <label className="admin-check">
                        <input
                          type="checkbox"
                          checked={Boolean(draft.data.currentlyEmployed)}
                          onChange={(event) =>
                            changeData('currentlyEmployed', event.target.checked)
                          }
                        />
                        Currently employed
                      </label>
                    )}
                  </section>
                  <aside className="admin-editor-aside">
                    <section className="admin-panel admin-form">
                      <h2>Publication</h2>
                      <label>
                        Status
                        <select
                          value={draft.status}
                          onChange={(event) =>
                            change('status', event.target.value as Draft['status'])
                          }
                        >
                          <option>DRAFT</option>
                          <option>PUBLISHED</option>
                          <option>ARCHIVED</option>
                        </select>
                      </label>
                      <label className="admin-check">
                        <input
                          type="checkbox"
                          checked={draft.featured}
                          onChange={(event) => change('featured', event.target.checked)}
                        />
                        Featured content
                      </label>
                      <label>
                        Display order
                        <input
                          type="number"
                          min={0}
                          max={100000}
                          value={draft.displayOrder}
                          onChange={(event) => change('displayOrder', Number(event.target.value))}
                        />
                      </label>
                      <p className="admin-hint">
                        Lower values appear first. Only published records are publicly visible.
                      </p>
                      <button type="submit" className="admin-button">
                        <Save size={15} />
                        {saving ? 'Saving…' : 'Save changes'}
                      </button>
                      <button
                        type="button"
                        className="admin-button secondary"
                        onClick={() => save('DRAFT')}
                      >
                        Save draft
                      </button>
                      <button
                        type="button"
                        className="admin-button"
                        onClick={() => save('PUBLISHED')}
                      >
                        Publish {config.singular} ↗
                      </button>
                      {id && (
                        <button
                          type="button"
                          className="admin-button secondary"
                          onClick={duplicate}
                        >
                          <Copy size={14} />
                          Duplicate as draft
                        </button>
                      )}
                      <p className="admin-hint" role="status">
                        {saving
                          ? 'Saving to database…'
                          : dirty
                            ? id && draft.status === 'DRAFT'
                              ? 'Unsaved · autosaves after 10 seconds'
                              : 'Unsaved changes'
                            : 'All changes saved'}
                      </p>
                    </section>
                    <section className="admin-panel admin-form">
                      <h2>Search appearance</h2>
                      <label>
                        SEO title
                        <input
                          maxLength={200}
                          value={String(draft.data.seoTitle || '')}
                          onChange={(event) => changeData('seoTitle', event.target.value)}
                        />
                      </label>
                      <label>
                        SEO description
                        <textarea
                          maxLength={320}
                          rows={3}
                          value={String(draft.data.seoDescription || '')}
                          onChange={(event) => changeData('seoDescription', event.target.value)}
                        />
                      </label>
                    </section>
                    <section className="admin-panel admin-form">
                      <h2>Media</h2>
                      <p className="admin-hint">
                        Upload a cover image, or copy a reusable URL from the library.
                      </p>
                      <label className="admin-button secondary">
                        <Upload size={15} />
                        {uploading ? 'Uploading…' : 'Upload cover'}
                        <input
                          type="file"
                          hidden
                          accept="image/png,image/jpeg,image/gif,image/webp"
                          onChange={(event) => upload(event.target.files?.[0])}
                        />
                      </label>
                      <Link href="/admin/media" target="_blank" className="admin-back">
                        Open media library ↗
                      </Link>
                    </section>
                  </aside>
                </fieldset>
              </form>
            )}
          </>
        )
      )}
    </>
  );
}

function PreviewNode({ node }: { node: Record<string, unknown> }) {
  const children = (node.content as Record<string, unknown>[] | undefined)?.map((child, index) => (
    <PreviewNode key={index} node={child} />
  ));
  if (node.type === 'text') {
    let content: React.ReactNode = String(node.text || '');
    const marks = node.marks as { type: string; attrs?: { href?: string } }[] | undefined;
    for (const mark of marks || []) {
      if (mark.type === 'bold') content = <strong>{content}</strong>;
      if (mark.type === 'italic') content = <em>{content}</em>;
      if (mark.type === 'underline') content = <u>{content}</u>;
      if (mark.type === 'code') content = <code>{content}</code>;
      if (mark.type === 'link' && /^(https?:\/\/|mailto:)/.test(mark.attrs?.href || ''))
        content = (
          <a href={mark.attrs?.href} rel="noopener noreferrer">
            {content}
          </a>
        );
    }
    return content;
  }
  const attrs = node.attrs as Record<string, unknown> | undefined;
  switch (node.type) {
    case 'heading':
      return attrs?.level === 3 ? <h3>{children}</h3> : <h2>{children}</h2>;
    case 'paragraph':
      return <p>{children}</p>;
    case 'bulletList':
      return <ul>{children}</ul>;
    case 'orderedList':
      return <ol>{children}</ol>;
    case 'listItem':
      return <li>{children}</li>;
    case 'blockquote':
      return <blockquote>{children}</blockquote>;
    case 'codeBlock':
      return attrs?.language === 'mermaid' ? (
        <Diagram
          code={
            (node.content as { text?: string }[] | undefined)
              ?.map((child) => child.text || '')
              .join('') || ''
          }
        />
      ) : (
        <pre>
          <code>{children}</code>
        </pre>
      );
    case 'table':
      return (
        <table>
          <tbody>{children}</tbody>
        </table>
      );
    case 'tableRow':
      return <tr>{children}</tr>;
    case 'tableHeader':
      return <th>{children}</th>;
    case 'tableCell':
      return <td>{children}</td>;
    case 'hardBreak':
      return <br />;
    case 'horizontalRule':
      return <hr />;
    case 'image':
      return /^(\/api\/v1\/public\/media\/|https:\/\/)/.test(String(attrs?.src || '')) ? (
        <Image
          src={String(attrs?.src)}
          alt={String(attrs?.alt || '')}
          width={1000}
          height={650}
          unoptimized
        />
      ) : null;
    default:
      return <>{children}</>;
  }
}

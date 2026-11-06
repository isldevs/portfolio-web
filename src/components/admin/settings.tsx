'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Save } from 'lucide-react';
import { Content, errorText, Page, request } from './api';
import { Heading, Loading, Notice } from './ui';

export default function Settings() {
  const client = useQueryClient();
  const [changes, setChanges] = useState<{ services: string; tools: string } | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const query = useQuery({
    queryKey: ['site-settings'],
    queryFn: () => request<Page<Content>>('/admin/settings?size=100'),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
  const item = query.data?.content.find((value) => value.slug === 'site') || query.data?.content[0];
  const services =
    changes?.services ??
    (Array.isArray(item?.data.services) ? (item.data.services as string[]).join('\n') : '');
  const tools =
    changes?.tools ??
    (Array.isArray(item?.data.tools) ? (item.data.tools as string[]).join('\n') : '');
  async function save(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const parse = (value: string) =>
        value
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean);
      const payload = {
        ...(item || {
          title: 'Site settings',
          slug: 'site',
          summary: '',
          body: { type: 'doc', content: [] },
          status: 'PUBLISHED',
          featured: false,
          display_order: 0,
        }),
        data: { ...item?.data, services: parse(services), tools: parse(tools) },
      };
      await request(`/admin/settings${item ? `/${item.id}` : ''}`, {
        method: item ? 'PUT' : 'POST',
        body: JSON.stringify(payload),
      });
      await client.invalidateQueries({ queryKey: ['site-settings'] });
      setChanges(null);
      setSuccess('Settings saved. Public services and tools are up to date.');
    } catch (failure) {
      setError(errorText(failure));
    } finally {
      setSaving(false);
    }
  }
  return (
    <>
      <Heading
        code="SITE_CONFIGURATION"
        title="Site settings"
        description="Curate your services and the tools behind your work."
      />
      <Notice
        error={error || (query.error ? errorText(query.error) : undefined)}
        success={success}
      />
      {query.isPending ? (
        <Loading />
      ) : (
        query.data && (
          <form className="admin-panel admin-form" onSubmit={save}>
            <div className="admin-form-grid">
              <label>
                Services
                <textarea
                  aria-label="Services"
                  aria-describedby="services-hint"
                  rows={12}
                  value={services}
                  onChange={(event) => setChanges({ services: event.target.value, tools })}
                />
                <small id="services-hint">One service per line.</small>
              </label>
              <label>
                Tools
                <textarea
                  aria-label="Tools"
                  aria-describedby="tools-hint"
                  rows={12}
                  value={tools}
                  onChange={(event) => setChanges({ services, tools: event.target.value })}
                />
                <small id="tools-hint">
                  One tool per line. Keep names descriptive and accurate.
                </small>
              </label>
            </div>
            <div className="admin-alert">
              <p>
                Public contact details, resume, and SEO defaults are managed in Profile.
                Infrastructure and secret values belong in deployment configuration.
              </p>
            </div>
            <div className="admin-form-footer">
              <span>Database-backed configuration</span>
              <button type="submit" className="admin-button" disabled={saving}>
                <Save size={15} />
                {saving ? 'Saving…' : 'Save settings'}
              </button>
            </div>
          </form>
        )
      )}
    </>
  );
}

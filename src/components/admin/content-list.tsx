'use client';

import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { Content, dateText, errorText, Page, request, Resource, resources } from './api';
import { Heading, Loading, Notice, Pagination } from './ui';

export default function ContentList({ resource }: { resource: Resource }) {
  const config = resources[resource];
  const client = useQueryClient();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('updated_at,desc');
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);
  const query = useQuery({
    queryKey: ['content', resource, search, status, sort, page],
    queryFn: () =>
      request<Page<Content>>(
        `/admin/${config.api}?${new URLSearchParams({ q: search, status, sort, page: String(page), size: '12' })}`,
      ),
  });
  async function remove(item: Content) {
    if (!window.confirm(`Delete “${item.title}”? This cannot be undone.`)) return;
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      await request(`/admin/${config.api}/${item.id}?version=${item.version}`, {
        method: 'DELETE',
      });
      setSelected((previous) => previous.filter((id) => id !== item.id));
      await client.invalidateQueries({ queryKey: ['content', resource] });
      setSuccess('Content deleted.');
    } catch (failure) {
      setError(errorText(failure));
    } finally {
      setBusy(false);
    }
  }
  async function bulk(next: Content['status']) {
    if (!window.confirm(`Set ${selected.length} selected records to ${next.toLowerCase()}?`))
      return;
    setBusy(true);
    setError('');
    setSuccess('');
    let completed = 0;
    try {
      for (const id of selected) {
        const current = await request<Content>(`/admin/${config.api}/${id}`);
        await request(`/admin/${config.api}/${id}`, {
          method: 'PUT',
          body: JSON.stringify({ ...current, status: next }),
        });
        completed++;
      }
      setSelected([]);
      setSuccess(`${completed} records updated.`);
    } catch (failure) {
      setError(`${completed} records updated. ${errorText(failure)}`);
    } finally {
      await client.invalidateQueries({ queryKey: ['content', resource] });
      setBusy(false);
    }
  }
  return (
    <>
      <Heading
        code={`MANAGE_${config.api.toUpperCase().replaceAll('-', '_')}`}
        title={config.title}
        description={config.description}
      >
        <Link className="admin-button" href={`/admin/${resource}/new`}>
          <Plus size={16} />
          Add {config.singular}
        </Link>
      </Heading>
      <Notice
        error={error || (query.error ? errorText(query.error) : undefined)}
        success={success}
      />
      <div className="admin-panel">
        <div className="admin-toolbar">
          <label className="admin-search">
            <Search size={16} />
            <input
              aria-label={`Search ${config.title}`}
              placeholder={`Search ${config.title.toLowerCase()}…`}
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(0);
              }}
            />
          </label>
          <select
            aria-label="Publication status"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(0);
            }}
          >
            <option value="">All statuses</option>
            <option>DRAFT</option>
            <option>PUBLISHED</option>
            <option>ARCHIVED</option>
          </select>
          <select
            aria-label="Sort content"
            value={sort}
            onChange={(event) => {
              setSort(event.target.value);
              setPage(0);
            }}
          >
            <option value="updated_at,desc">Recently updated</option>
            <option value="title,asc">Title A–Z</option>
            <option value="display_order,asc">Display order</option>
          </select>
        </div>
        {selected.length > 0 && (
          <div className="admin-bulk">
            <span>{selected.length} selected</span>
            <button disabled={busy} onClick={() => bulk('PUBLISHED')}>
              Publish
            </button>
            <button disabled={busy} onClick={() => bulk('DRAFT')}>
              Unpublish
            </button>
            <button disabled={busy} onClick={() => bulk('ARCHIVED')}>
              Archive
            </button>
            <button onClick={() => setSelected([])}>Clear</button>
          </div>
        )}
        {query.isPending ? (
          <Loading />
        ) : (
          query.data &&
          (query.data.content.length ? (
            <>
              <div className="admin-table-scroll">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>
                        <input
                          type="checkbox"
                          aria-label="Select all on this page"
                          checked={
                            query.data.content.length > 0 &&
                            query.data.content.every((item) => selected.includes(item.id))
                          }
                          onChange={(event) =>
                            setSelected(
                              event.target.checked
                                ? query.data!.content.map((item) => item.id)
                                : [],
                            )
                          }
                        />
                      </th>
                      <th>Title / slug</th>
                      <th>Status</th>
                      <th>Category</th>
                      <th>Updated</th>
                      <th>
                        <span className="admin-sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {query.data.content.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <input
                            type="checkbox"
                            aria-label={`Select ${item.title}`}
                            checked={selected.includes(item.id)}
                            onChange={(event) =>
                              setSelected((previous) =>
                                event.target.checked
                                  ? [...previous, item.id]
                                  : previous.filter((id) => id !== item.id),
                              )
                            }
                          />
                        </td>
                        <td>
                          <Link
                            className="admin-table-title"
                            href={`/admin/${resource}/${item.id}/edit`}
                          >
                            {item.title}
                            {item.featured && <span className="admin-featured">★</span>}
                          </Link>
                          <span className="admin-table-detail">/{item.slug}</span>
                        </td>
                        <td>
                          <span className={`admin-status ${item.status.toLowerCase()}`}>
                            {item.status}
                          </span>
                        </td>
                        <td>{String(item.data?.category || '—')}</td>
                        <td>{dateText(item.updated_at)}</td>
                        <td>
                          <div className="admin-row-actions">
                            <Link
                              className="admin-icon-button"
                              href={`/admin/${resource}/${item.id}/edit`}
                              aria-label={`Edit ${item.title}`}
                            >
                              <Pencil size={15} />
                            </Link>
                            <button
                              className="admin-icon-button danger"
                              disabled={busy}
                              onClick={() => remove(item)}
                              aria-label={`Delete ${item.title}`}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination
                page={page}
                pages={query.data.total_pages}
                total={query.data.total_elements}
                setPage={setPage}
              />
            </>
          ) : (
            <div className="admin-empty">
              <span className="admin-eyebrow">NO_RECORDS_FOUND</span>
              <h2>
                {search || status
                  ? 'No matching content.'
                  : `Your first ${config.singular} starts here.`}
              </h2>
              <p>
                {search || status
                  ? 'Try a different search or status filter.'
                  : 'Add a record, save a draft, and publish when ready.'}
              </p>
              <Link className="admin-button secondary" href={`/admin/${resource}/new`}>
                Create {config.singular} →
              </Link>
            </div>
          ))
        )}
      </div>
    </>
  );
}

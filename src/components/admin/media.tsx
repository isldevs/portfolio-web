'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Copy, FileText, Search, Trash2, Upload } from 'lucide-react';
import { dateText, errorText, Media, Page, request } from './api';
import { Heading, Loading, Notice, Pagination } from './ui';

export default function MediaLibrary() {
  const [visibility, setVisibility] = useState<'PUBLIC' | 'PRIVATE'>('PUBLIC');
  const client = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);
  const query = useQuery({
    queryKey: ['media', search, page],
    queryFn: () =>
      request<Page<Media>>(
        `/admin/media?${new URLSearchParams({ q: search, page: String(page), size: '12' })}`,
      ),
  });
  async function upload(file: File | undefined) {
    if (!file) return;
    setError('');
    setSuccess('');
    if (file.size > 10 * 1024 * 1024) {
      setError('Choose a file smaller than 10 MB.');
      return;
    }
    setBusy(true);
    try {
      const data = new FormData();
      data.set('file', file);
      await request<Media>(`/admin/media?visibility=${visibility}`, { method: 'POST', body: data });
      await client.invalidateQueries({ queryKey: ['media'] });
      setSuccess('Media uploaded. Copy its URL to reuse it in content or your profile.');
    } catch (failure) {
      setError(errorText(failure));
    } finally {
      setBusy(false);
    }
  }
  async function remove(item: Media) {
    if (!window.confirm(`Delete “${item.originalName}”? Referenced files cannot be deleted.`))
      return;
    setError('');
    setSuccess('');
    setBusy(true);
    try {
      await request(`/admin/media/${item.id}`, { method: 'DELETE' });
      await client.invalidateQueries({ queryKey: ['media'] });
      setSuccess('Unused media deleted.');
    } catch (failure) {
      setError(errorText(failure));
    } finally {
      setBusy(false);
    }
  }
  async function copy(url: string) {
    setError('');
    setSuccess('');
    try {
      await navigator.clipboard.writeText(url);
      setSuccess('Media URL copied to your clipboard.');
    } catch {
      setError(`Clipboard unavailable. Copy this URL: ${url}`);
    }
  }
  return (
    <>
      <Heading
        code="MEDIA_STORAGE"
        title="Media library"
        description="A reusable home for your images and resume documents."
      >
        <select
          aria-label="Upload visibility"
          value={visibility}
          onChange={(event) => setVisibility(event.target.value as 'PUBLIC' | 'PRIVATE')}
        >
          <option value="PUBLIC">Public upload</option>
          <option value="PRIVATE">Private upload</option>
        </select>
        <label className="admin-button">
          <Upload size={16} />
          {busy ? 'Working…' : 'Upload media'}
          <input
            type="file"
            hidden
            disabled={busy}
            accept="image/png,image/jpeg,image/webp,image/gif,application/pdf"
            onChange={(event) => {
              void upload(event.target.files?.[0]);
              event.target.value = '';
            }}
          />
        </label>
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
              aria-label="Search media"
              placeholder="Search filenames…"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(0);
              }}
            />
          </label>
          <span className="admin-hint">PNG · JPEG · WebP · GIF · PDF / MAX 10 MB</span>
        </div>
        {query.isPending ? (
          <Loading />
        ) : (
          query.data &&
          (query.data.content.length ? (
            <>
              <div className="admin-media-grid">
                {query.data.content.map((item) => (
                  <article className="admin-media-card" key={item.id}>
                    <a
                      className="admin-media-preview"
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Preview ${item.originalName}`}
                    >
                      {item.contentType.startsWith('image/') ? (
                        <Image
                          src={item.url}
                          alt={item.originalName}
                          width={640}
                          height={360}
                          unoptimized
                        />
                      ) : (
                        <FileText size={40} />
                      )}
                    </a>
                    <div className="admin-media-details">
                      <h2 title={item.originalName}>{item.originalName}</h2>
                      <span
                        className={`admin-status ${item.visibility === 'PRIVATE' ? 'draft' : 'published'}`}
                      >
                        {item.visibility || 'PUBLIC'}
                      </span>
                      <p>
                        {(item.size / 1024).toFixed(1)} KB · {dateText(item.createdAt)}
                      </p>
                      <input
                        aria-label={`URL for ${item.originalName}`}
                        value={item.url}
                        readOnly
                        onFocus={(event) => event.target.select()}
                      />
                      <div className="admin-row-actions">
                        <button className="admin-button secondary" onClick={() => copy(item.url)}>
                          <Copy size={13} />
                          Copy URL
                        </button>
                        <button
                          className="admin-icon-button danger"
                          disabled={busy}
                          onClick={() => remove(item)}
                          aria-label={`Delete ${item.originalName}`}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
              <Pagination
                page={page}
                pages={query.data.totalPages}
                total={query.data.totalElements}
                setPage={setPage}
              />
            </>
          ) : (
            <div className="admin-empty">
              <Upload size={28} />
              <h2>{search ? 'No matching files.' : 'Your media library is ready.'}</h2>
              <p>
                {search ? 'Try a different filename.' : 'Upload your first image or resume PDF.'}
              </p>
            </div>
          ))
        )}
      </div>
    </>
  );
}

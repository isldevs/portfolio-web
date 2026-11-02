'use client';

import { useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Inbox, Search, Trash2, X } from 'lucide-react';
import { dateText, errorText, Message, Page, request } from './api';
import { Heading, Loading, Notice, Pagination } from './ui';

export default function Messages() {
  const client = useQueryClient();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Message | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const dialog = useRef<HTMLElement>(null);
  const selectedId = selected?.id;
  useEffect(() => {
    if (!selectedId) return;
    const previous = document.activeElement as HTMLElement | null;
    const target = dialog.current;
    const controls = () =>
      Array.from(
        target?.querySelectorAll<HTMLElement>(
          'button:not(:disabled),a[href],select:not(:disabled),input:not(:disabled),[tabindex="0"]',
        ) || [],
      );
    controls()[0]?.focus();
    const trap = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const focusable = controls();
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    target?.addEventListener('keydown', trap);
    return () => {
      target?.removeEventListener('keydown', trap);
      previous?.focus();
    };
  }, [selectedId]);
  const query = useQuery({
    queryKey: ['messages', search, status, page],
    queryFn: () =>
      request<Page<Message>>(
        `/admin/messages?${new URLSearchParams({ q: search, status, page: String(page), size: '12' })}`,
      ),
  });
  async function refresh() {
    await client.invalidateQueries({ queryKey: ['messages'] });
    await client.invalidateQueries({ queryKey: ['dashboard'] });
  }
  async function update(item: Message, next: Message['status']) {
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      const changed = await request<Message>(`/admin/messages/${item.id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: next, version: item.version }),
      });
      setSelected((previous) => (previous?.id === item.id ? changed : previous));
      await refresh();
      setSuccess(`Message marked ${next.toLowerCase()}.`);
    } catch (failure) {
      setError(errorText(failure));
    } finally {
      setBusy(false);
    }
  }
  async function remove(item: Message) {
    if (!window.confirm(`Permanently delete the message from ${item.name}?`)) return;
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      await request(`/admin/messages/${item.id}?version=${item.version}`, { method: 'DELETE' });
      if (selected?.id === item.id) setSelected(null);
      await refresh();
      setSuccess('Message deleted.');
    } catch (failure) {
      setError(errorText(failure));
    } finally {
      setBusy(false);
    }
  }
  function open(item: Message) {
    setSelected(item);
    if (item.status === 'UNREAD') void update(item, 'READ');
  }
  return (
    <>
      <Heading
        code="PRIVATE_INBOX"
        title="Conversations"
        description="Messages from people who would like to work with you."
      />
      <Notice
        error={error || (query.error ? errorText(query.error) : undefined)}
        success={success}
      />
      <section className="admin-panel">
        <div className="admin-toolbar">
          <label className="admin-search">
            <Search size={16} />
            <input
              aria-label="Search messages"
              placeholder="Search messages…"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(0);
              }}
            />
          </label>
          <select
            aria-label="Message status"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(0);
            }}
          >
            <option value="">All messages</option>
            {['UNREAD', 'READ', 'RESOLVED', 'ARCHIVED'].map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </div>
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
                      <th>From</th>
                      <th>Subject</th>
                      <th>Status</th>
                      <th>Received</th>
                      <th>
                        <span className="admin-sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {query.data.content.map((item) => (
                      <tr key={item.id} className={item.status === 'UNREAD' ? 'is-unread' : ''}>
                        <td>
                          <strong>{item.name}</strong>
                          <span className="admin-table-detail">{item.email}</span>
                        </td>
                        <td>
                          <button className="admin-table-title" onClick={() => open(item)}>
                            {item.subject}
                          </button>
                        </td>
                        <td>
                          <span
                            className={`admin-status ${item.status === 'UNREAD' ? 'published' : 'draft'}`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td>{dateText(item.createdAt)}</td>
                        <td>
                          <button
                            className="admin-icon-button danger"
                            disabled={busy}
                            aria-label={`Delete message from ${item.name}`}
                            onClick={() => remove(item)}
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
              <Inbox size={28} />
              <h2>{search || status ? 'No matching messages.' : 'Your inbox is clear.'}</h2>
              <p>New contact form submissions will appear here.</p>
            </div>
          ))
        )}
      </section>
      {selected && (
        <div
          className="admin-dialog-backdrop"
          onClick={(event) => {
            if (event.target === event.currentTarget) setSelected(null);
          }}
        >
          <section
            ref={dialog}
            className="admin-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="message-title"
            onKeyDown={(event) => {
              if (event.key === 'Escape') setSelected(null);
            }}
          >
            <button
              className="admin-dialog-close"
              aria-label="Close message"
              onClick={() => setSelected(null)}
            >
              <X size={20} />
            </button>
            <p className="admin-eyebrow">{'// CONTACT_MESSAGE'}</p>
            <h2 id="message-title">{selected.subject}</h2>
            <p>
              {selected.name} · <a href={`mailto:${selected.email}`}>{selected.email}</a>
            </p>
            <p className="admin-hint">{dateText(selected.createdAt)}</p>
            <div className="admin-message-body">{selected.message}</div>
            <div className="admin-dialog-actions">
              <select
                value={selected.status}
                aria-label="Change message status"
                disabled={busy}
                onChange={(event) => update(selected, event.target.value as Message['status'])}
              >
                {['UNREAD', 'READ', 'RESOLVED', 'ARCHIVED'].map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
              <a
                className="admin-button"
                href={`mailto:${selected.email}?subject=${encodeURIComponent(`Re: ${selected.subject}`)}`}
              >
                Reply by email ↗
              </a>
            </div>
          </section>
        </div>
      )}
    </>
  );
}

'use client';

import { LoaderCircle } from 'lucide-react';

export function Heading({
  code,
  title,
  description,
  children,
}: {
  code: string;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="admin-page-heading">
      <div>
        <p className="admin-eyebrow">{`// ${code}`}</p>
        <h1>
          {title}
          <span className="admin-accent">_</span>
        </h1>
        <p>{description}</p>
      </div>
      {children && <div className="admin-heading-actions">{children}</div>}
    </div>
  );
}
export function Notice({ error, success }: { error?: string; success?: string }) {
  return (
    <>
      {error && (
        <div className="admin-alert error" role="alert">
          {error}
        </div>
      )}
      {success && (
        <div className="admin-alert success" role="status">
          {success}
        </div>
      )}
    </>
  );
}
export function Loading() {
  return (
    <div className="admin-empty" role="status">
      <LoaderCircle size={20} className="admin-spin" />
      <p>Loading database records…</p>
    </div>
  );
}
export function Pagination({
  page,
  pages,
  total,
  setPage,
}: {
  page: number;
  pages: number;
  total: number;
  setPage: (page: number) => void;
}) {
  return (
    <div className="admin-pagination">
      <span>
        {total} records · Page {page + 1} / {Math.max(1, pages)}
      </span>
      <div>
        <button
          className="admin-button secondary"
          disabled={page === 0}
          onClick={() => setPage(page - 1)}
        >
          ← Previous
        </button>
        <button
          className="admin-button secondary"
          disabled={page + 1 >= pages}
          onClick={() => setPage(page + 1)}
        >
          Next →
        </button>
      </div>
    </div>
  );
}

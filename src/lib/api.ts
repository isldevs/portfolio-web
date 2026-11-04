import { cache } from 'react';
import { createPortfolioClient } from './generated/client';
export type JsonValue =
  string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };
export interface RichNode {
  type: string;
  text?: string;
  attrs?: Record<string, JsonValue>;
  marks?: { type: string; attrs?: Record<string, JsonValue> }[];
  content?: RichNode[];
}
export interface ContentItem {
  id: string;
  kind: string;
  title: string;
  slug: string;
  summary: string;
  body: RichNode | null;
  data: Record<string, JsonValue>;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  featured: boolean;
  displayOrder: number;
  version: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;
}
export interface Profile {
  id: string;
  version: number;
  fullName: string;
  professionalTitle: string;
  headline: string;
  shortBio: string;
  fullBio: string;
  location: string;
  specialization: string;
  availability: string;
  githubUrl: string;
  linkedinUrl: string;
  publicEmail: string;
  portraitUrl: string;
  resumeUrl: string;
  seoTitle: string;
  seoDescription: string;
}
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body && !(options.body instanceof FormData))
    headers.set('Content-Type', 'application/json');
  if (options.method && !['GET', 'HEAD', 'OPTIONS'].includes(options.method.toUpperCase())) {
    const response = await fetch('/api/v1/csrf', { credentials: 'same-origin', cache: 'no-store' });
    if (!response.ok)
      throw new ApiError(response.status, 'Could not establish a secure session. Please retry.');
    const csrf = await response.json();
    headers.set(csrf.headerName, csrf.token);
  }
  const response = await fetch(path.startsWith('/api/') ? path : `/api/v1${path}`, {
    ...options,
    headers,
    credentials: 'same-origin',
    cache: 'no-store',
  });
  if (!response.ok) {
    const problem = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      problem.detail || problem.message || 'The request could not be completed.',
    );
  }
  return response.status === 204 ? (undefined as T) : response.json();
}
export async function publicApi<T>(
  path: string,
  params?: Record<string, string | number | undefined>,
): Promise<T> {
  // Request-scoped memoization shares metadata/page reads without serving stale CMS data.
  const query = JSON.stringify(
    Object.entries(params || {})
      .filter(([, value]) => value !== undefined)
      .sort(([a], [b]) => a.localeCompare(b)),
  );
  return (await readPublicApi(path, query)) as T;
}
const readPublicApi = cache(async (path: string, query: string): Promise<unknown> => {
  const params = Object.fromEntries(JSON.parse(query)) as Record<
    string,
    string | number | undefined
  >;
  const client = createPortfolioClient(process.env.API_BASE_URL || 'http://127.0.0.1:8080');
  const parts = path.replace(/^\/+/, '').split('/');
  const options = { cache: 'no-store' as RequestCache, signal: AbortSignal.timeout(8000) };
  const result =
    parts[0] === 'profile'
      ? await client.GET('/api/v1/public/profile', options)
      : parts.length === 1
        ? await client.GET('/api/v1/public/{kind}', {
            ...options,
            params: { path: { kind: parts[0] }, query: params },
          })
        : await client.GET('/api/v1/public/{kind}/{slug}', {
            ...options,
            params: { path: { kind: parts[0], slug: parts[1] } },
          });
  if (!result.response.ok)
    throw new ApiError(
      result.response.status,
      result.response.status === 404
        ? 'Content not found.'
        : 'Content service is temporarily unavailable.',
    );
  return result.data;
});
export function textField(data: Record<string, JsonValue>, key: string): string {
  const value = data[key];
  return typeof value === 'string' ? value : '';
}
export function listField(data: Record<string, JsonValue>, key: string): string[] {
  const value = data[key];
  return Array.isArray(value)
    ? value.filter((v): v is string => typeof v === 'string')
    : typeof value === 'string'
      ? value
          .split(',')
          .map((v) => v.trim())
          .filter(Boolean)
      : [];
}
export function safeUrl(value: unknown): string | undefined {
  if (typeof value !== 'string' || !value) return;
  if (value === '/images/yi-sivlay.png') return value;
  if (/^\/api\/v1\/public\/media\/[a-zA-Z0-9-]+$/.test(value)) return value;
  try {
    const url = new URL(value);
    if (['https:', 'http:'].includes(url.protocol)) return url.href;
  } catch {}
}
export function dateLabel(value?: string | null): string {
  return value
    ? new Intl.DateTimeFormat('en', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC',
      }).format(new Date(value))
    : '';
}
export function plainText(node?: RichNode | null): string {
  return node ? [node.text || '', ...(node.content || []).map(plainText)].join(' ') : '';
}
export function readingTime(node?: RichNode | null): number {
  return Math.max(1, Math.ceil(plainText(node).split(/\s+/).filter(Boolean).length / 220));
}

export function safeLink(value: unknown): string | undefined {
  if (typeof value === 'string' && /^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return value;
  return safeUrl(value);
}

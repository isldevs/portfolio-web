export type Content = {
  id: string;
  kind: string;
  title: string;
  slug: string;
  summary: string;
  body: Record<string, unknown>;
  data: Record<string, unknown>;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  featured: boolean;
  display_order: number;
  version: number;
  created_at: string;
  updated_at: string;
  published_at?: string;
};
export type Page<T> = {
  content: T[];
  total_elements: number;
  total_pages: number;
  number: number;
  size: number;
};
export type Profile = { id: string; version: number; [key: string]: string | number | null };
export type Media = {
  id: string;
  url: string;
  original_name: string;
  content_type: string;
  size: number;
  visibility?: 'PUBLIC' | 'PRIVATE';
  created_at: string;
};
export type Message = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'UNREAD' | 'READ' | 'RESOLVED' | 'ARCHIVED';
  version: number;
  created_at: string;
};

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const method = (options.method || 'GET').toUpperCase();
  const headers = new Headers(options.headers);
  if (options.body && !(options.body instanceof FormData))
    headers.set('Content-Type', 'application/json');
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    const response = await fetch('/api/v1/csrf', { credentials: 'same-origin', cache: 'no-store' });
    if (!response.ok)
      throw new ApiError(response.status, 'Unable to establish a secure session. Please retry.');
    const csrf = (await response.json()) as { header_name: string; token: string };
    headers.set(csrf.header_name, csrf.token);
  }
  const response = await fetch(`/api/v1${path}`, {
    ...options,
    method,
    headers,
    credentials: 'same-origin',
    cache: 'no-store',
  });
  if (!response.ok) {
    const problem = (await response.json().catch(() => null)) as {
      detail?: string;
      title?: string;
    } | null;
    const message =
      response.status === 409
        ? problem?.detail || 'This item changed elsewhere. Reload before saving again.'
        : response.status === 401
          ? 'Your session has expired. Sign in again.'
          : problem?.detail || problem?.title || `Request failed (${response.status}).`;
    throw new ApiError(response.status, message);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const resources = {
  projects: {
    api: 'projects',
    title: 'Projects',
    singular: 'project',
    description: 'Engineering work, architecture, and the decisions behind it.',
  },
  blog: {
    api: 'articles',
    title: 'Blog posts',
    singular: 'article',
    description: 'Write, review, and publish your technical perspective.',
  },
  'case-studies': {
    api: 'case-studies',
    title: 'Case studies',
    singular: 'case study',
    description: 'Document problems, trade-offs, and verified outcomes.',
  },
  experience: {
    api: 'experiences',
    title: 'Experience',
    singular: 'experience',
    description: 'Your professional timeline. Add verified experience only.',
  },
  skills: {
    api: 'skills',
    title: 'Skills',
    singular: 'skill',
    description: 'Curate the technologies and disciplines you work with.',
  },
  categories: {
    api: 'categories',
    title: 'Categories',
    singular: 'category',
    description: 'Organize content into clear technical subjects.',
  },
  tags: {
    api: 'tags',
    title: 'Tags',
    singular: 'tag',
    description: 'Connect related articles and projects.',
  },
} as const;
export type Resource = keyof typeof resources;
export function isResource(value: string): value is Resource {
  return value in resources;
}
export function errorText(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong. Please retry.';
}
export function dateText(value?: string): string {
  return value
    ? new Date(value).toLocaleDateString('en-GB', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        timeZone: 'Asia/Bangkok',
      })
    : '—';
}

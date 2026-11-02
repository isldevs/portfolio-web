import createClient from 'openapi-fetch';
import type { paths } from './schema';

/** Generated OpenAPI paths keep route names, request bodies and responses in sync. */
export function createPortfolioClient(baseUrl = '') {
  const client = createClient<paths>({ baseUrl, credentials: 'same-origin' });
  client.use({
    async onRequest({ request }) {
      if (typeof window !== 'undefined' && !['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
        const response = await fetch('/api/v1/csrf', {
          credentials: 'same-origin',
          cache: 'no-store',
        });
        if (!response.ok) throw new Error('Could not establish CSRF protection.');
        const csrf = (await response.json()) as { headerName: string; token: string };
        request.headers.set(csrf.headerName, csrf.token);
      }
      return request;
    },
  });
  return client;
}

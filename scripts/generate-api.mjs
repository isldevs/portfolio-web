import { writeFile, mkdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
const base = process.env.API_BASE_URL || 'http://127.0.0.1:8080';
const cookies = new Map();
async function call(path, init = {}) {
  const headers = new Headers(init.headers);
  headers.set('cookie', [...cookies].map(([k, v]) => `${k}=${v}`).join('; '));
  const response = await fetch(`${base}${path}`, { ...init, headers });
  for (const cookie of response.headers.getSetCookie()) {
    const [pair] = cookie.split(';');
    const i = pair.indexOf('=');
    cookies.set(pair.slice(0, i), pair.slice(i + 1));
  }
  if (!response.ok) throw new Error(`OpenAPI request failed (${response.status}): ${path}`);
  return response.status === 204 ? undefined : response.json();
}
if (!process.env.OPENAPI_FILE) {
  if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD)
    throw new Error(
      'Set ADMIN_USERNAME and ADMIN_PASSWORD securely to export the protected schema, or use OPENAPI_FILE.',
    );
  const csrf = await call('/api/v1/csrf');
  await call('/api/v1/admin/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', [csrf.header_name]: csrf.token },
    body: JSON.stringify({
      username: process.env.ADMIN_USERNAME,
      password: process.env.ADMIN_PASSWORD,
    }),
  });
  const spec = await call('/api/v1/openapi');
  await mkdir('api', { recursive: true });
  await writeFile('api/openapi.json', `${JSON.stringify(spec, null, 2)}\n`);
  const logoutCsrf = await call('/api/v1/csrf');
  await call('/api/v1/admin/auth/logout', {
    method: 'POST',
    headers: { [logoutCsrf.header_name]: logoutCsrf.token },
  });
}
const result = spawnSync(
  process.execPath,
  [
    'node_modules/openapi-typescript/bin/cli.js',
    process.env.OPENAPI_FILE || 'api/openapi.json',
    '-o',
    'src/lib/generated/schema.d.ts',
  ],
  { stdio: 'inherit' },
);
process.exitCode = result.status ?? 1;

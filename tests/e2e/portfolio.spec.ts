import { test, expect, type APIRequestContext } from '@playwright/test';

type Item = {
  id: string;
  version: number;
  slug: string;
  title: string;
  status: string;
  [key: string]: unknown;
};
async function mutation(api: APIRequestContext, path: string, method: string, data?: unknown) {
  const csrfResponse = await api.get('/api/v1/csrf');
  expect(csrfResponse.ok()).toBeTruthy();
  const csrf = await csrfResponse.json();
  return api.fetch(`/api/v1${path}`, {
    method,
    headers: { [csrf.headerName]: csrf.token },
    ...(data !== undefined ? { data } : {}),
  });
}

test('public routes, accessible navigation, filters, and responsive layout', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Building Reliable Systems');
  await expect(page.getByText('Yi Sivlay').first()).toBeVisible();
  expect(
    await page.locator('body').evaluate((el) => el.scrollWidth <= window.innerWidth + 1),
  ).toBeTruthy();
  for (const route of [
    '/about',
    '/experience',
    '/skills',
    '/projects',
    '/case-studies',
    '/blog',
    '/contact',
    '/resume',
  ]) {
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    expect(
      await page.locator('body').evaluate((el) => el.scrollWidth <= window.innerWidth + 1),
    ).toBeTruthy();
  }
  await page.goto('/contact');
  await page.getByRole('button', { name: /send message/i }).click();
  await expect(page.getByText('Please enter your name.')).toBeVisible();
  await expect(page.getByText('Please enter a valid email address.')).toBeVisible();
  await page.goto('/projects?q=NoMatchingProjectXYZ');
  await expect(page.getByText(/no .*found|no .*match/i).first()).toBeVisible();
  await page
    .getByRole('contentinfo')
    .getByRole('link', { name: 'Admin login', exact: true })
    .click();
  await expect(page).toHaveURL(/\/admin\/login/);
  await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  await page.goto('/does-not-exist');
  await expect(page.getByRole('heading', { level: 1 })).toContainText(/404|not found/i);
});

test('secure publishing, drafts, conflicts, revisions, contact inbox and logout', async ({
  page,
  request,
}) => {
  test.skip(
    !process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD,
    'Set secure administrator credentials to run the integration workflow.',
  );
  const unauthorized = await request.get('/api/v1/admin/projects');
  expect(unauthorized.status()).toBe(401);
  const noCsrf = await request.post('/api/v1/admin/auth/login', {
    data: { username: 'x', password: 'x' },
  });
  expect(noCsrf.status()).toBe(403);
  await page.goto('/admin/login');
  await page.getByLabel('Username', { exact: true }).fill(process.env.ADMIN_USERNAME!);
  await page.getByLabel('Password', { exact: true }).fill(process.env.ADMIN_PASSWORD!);
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  const api = page.request;
  const unique = Date.now().toString();
  const created: { resource: string; item: Item }[] = [];
  let messageId: string | undefined;
  try {
    for (const resource of ['projects', 'articles']) {
      const payload = {
        title: `E2E ${resource} ${unique}`,
        slug: `e2e-${resource}-${unique}`,
        summary: 'Automated integration verification content.',
        status: 'DRAFT',
        featured: false,
        displayOrder: 100,
        body: {
          type: 'doc',
          content: [
            {
              type: 'heading',
              attrs: { level: 2 },
              content: [{ type: 'text', text: 'Engineering decisions' }],
            },
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: 'An integration test verifies the publishing contract.' },
              ],
            },
          ],
        },
        data: {
          category: 'Architecture',
          technologies: ['Java', 'PostgreSQL'],
          demonstration: true,
        },
      };
      const create = await mutation(api, `/admin/${resource}`, 'POST', payload);
      expect(create.status()).toBe(201);
      let item = (await create.json()) as Item;
      created.push({ resource, item });
      expect((await request.get(`/api/v1/public/${resource}/${item.slug}`)).status()).toBe(404);
      const publish = await mutation(api, `/admin/${resource}/${item.id}`, 'PUT', {
        ...item,
        status: 'PUBLISHED',
      });
      expect(publish.ok()).toBeTruthy();
      item = await publish.json();
      created[created.length - 1].item = item;
      const publicItem = await request.get(`/api/v1/public/${resource}/${item.slug}`);
      expect(publicItem.ok()).toBeTruthy();
      expect((await publicItem.json()).title).toBe(payload.title);
      const conflict = await mutation(api, `/admin/${resource}/${item.id}`, 'PUT', {
        ...item,
        version: item.version - 1,
      });
      expect(conflict.status()).toBe(409);
      if (resource === 'articles') {
        const updated = await mutation(api, `/admin/articles/${item.id}`, 'PUT', {
          ...item,
          title: `Updated ${payload.title}`,
        });
        expect(updated.ok()).toBeTruthy();
        item = await updated.json();
        created[created.length - 1].item = item;
        const revisions = await api.get(`/api/v1/admin/articles/${item.id}/revisions`);
        expect(revisions.ok()).toBeTruthy();
        expect((await revisions.json()).length).toBeGreaterThan(0);
        await page.goto(`/blog/${item.slug}`);
        await expect(page.getByRole('heading', { level: 1 })).toHaveText(item.title);
      } else {
        await page.goto(`/projects/${item.slug}`);
        await expect(page.getByRole('heading', { level: 1 })).toHaveText(item.title);
      }
    }
    // Submit as a visitor with a separate cookie jar, then inspect through the admin session.
    const contact = await mutation(request, '/public/contact', 'POST', {
      name: 'Integration Visitor',
      email: 'integration@example.org',
      subject: `E2E ${unique}`,
      message: 'This message verifies contact persistence and private admin inbox access.',
      website: '',
    });
    expect(contact.status()).toBe(201);
    messageId = (await contact.json()).id;
    expect((await request.get('/api/v1/admin/messages')).status()).toBe(401);
    const messages = await api.get(`/api/v1/admin/messages?q=${unique}`);
    expect(messages.ok()).toBeTruthy();
    const inbox = await messages.json();
    expect(inbox.content.some((m: { id: string }) => m.id === messageId)).toBeTruthy();
    const message = inbox.content.find((m: { id: string }) => m.id === messageId);
    expect(
      (
        await mutation(api, `/admin/messages/${messageId}`, 'PUT', {
          status: 'READ',
          version: message.version,
        })
      ).ok(),
    ).toBeTruthy();
    await page.goto('/admin/blog/new');
    await expect(page.locator('.tiptap')).toBeVisible();
    await page.locator('.tiptap').fill('Editor behavior verified with actual Tiptap content.');
    await expect(page.locator('.tiptap')).toContainText('Editor behavior verified');
  } finally {
    for (const { resource, item } of created) {
      const current = await api.get(`/api/v1/admin/${resource}/${item.id}`);
      if (current.ok())
        await mutation(
          api,
          `/admin/${resource}/${item.id}?version=${(await current.json()).version}`,
          'DELETE',
        );
    }
    if (messageId) await mutation(api, `/admin/messages/${messageId}`, 'DELETE');
    await mutation(api, '/admin/auth/logout', 'POST');
    expect((await api.get('/api/v1/admin/auth/me')).status()).toBe(401);
  }
});

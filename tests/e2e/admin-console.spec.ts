import { test, expect, type Page } from '@playwright/test';

// Authentication values are read at runtime. Disable traces for this suite so
// local bootstrap credentials are not retained in request trace artifacts.
test.use({ trace: 'off' });

async function login(page: Page) {
  const csrfResponse = await page.request.get('/api/v1/csrf');
  expect(csrfResponse.ok()).toBeTruthy();
  const csrf = await csrfResponse.json();
  const response = await page.request.post('/api/v1/admin/auth/login', {
    headers: { [csrf.header_name]: csrf.token },
    data: { username: process.env.ADMIN_USERNAME, password: process.env.ADMIN_PASSWORD },
  });
  expect(response.status()).toBe(200);
}

test('admin screens, profile persistence, settings, private media and responsive navigation', async ({
  page,
  request,
}, testInfo) => {
  test.skip(
    !process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD,
    'Requires a locally bootstrapped administrator.',
  );
  test.setTimeout(180_000);
  await login(page);
  try {
    const routes = [
      ['/admin', 'Your publishing workspace'],
      ['/admin/profile', 'Your introduction'],
      ['/admin/experience', 'Experience'],
      ['/admin/skills', 'Skills'],
      ['/admin/projects', 'Projects'],
      ['/admin/case-studies', 'Case studies'],
      ['/admin/blog', 'Blog posts'],
      ['/admin/categories', 'Categories'],
      ['/admin/tags', 'Tags'],
      ['/admin/media', 'Media library'],
      ['/admin/messages', 'Conversations'],
      ['/admin/settings', 'Site settings'],
      ['/admin/security', 'Keep your console secure'],
    ];
    for (const [route, title] of routes) {
      await page.goto(route);
      await expect(page.getByRole('heading', { name: `${title}_`, exact: true })).toBeVisible();
      await expect(page.getByText('Loading database records…', { exact: true })).toHaveCount(0, {
        timeout: 30_000,
      });
      await expect(page.locator('.admin-alert.error')).toHaveCount(0);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
        `No horizontal page overflow on ${route}`,
      ).toBeTruthy();
    }

    if (testInfo.project.name === 'mobile') {
      await page.getByRole('button', { name: 'Open menu' }).click();
      await expect(page.locator('.admin-sidebar')).toHaveClass(/is-open/);
      await page
        .locator('.admin-sidebar nav')
        .getByRole('link', { name: /Profile/ })
        .click();
      await expect(page).toHaveURL(/\/admin\/profile$/);
      await expect(page.locator('.admin-sidebar')).not.toHaveClass(/is-open/);
    } else await page.goto('/admin/profile');

    await expect(page.getByLabel('Full name', { exact: true })).not.toHaveValue('');
    const full_name = await page.getByLabel('Full name', { exact: true }).inputValue();
    await page.getByRole('button', { name: 'Preview', exact: true }).click();
    await expect(page.getByRole('heading', { name: full_name, exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Edit profile', exact: true }).click();
    await page.getByRole('button', { name: 'Save profile', exact: true }).click();
    await expect(page.getByRole('status')).toContainText('Profile saved');
    await page.reload();
    await expect(page.getByLabel('Full name', { exact: true })).toHaveValue(full_name);

    await page.goto('/admin/settings');
    await expect(page.getByLabel('Services', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Save settings', exact: true }).click();
    await expect(page.getByRole('status')).toContainText('Settings saved');

    await page.goto('/admin/media');
    await page.getByLabel('Upload visibility').selectOption('PRIVATE');
    const filename = `admin-browser-${testInfo.project.name}-${Date.now()}.png`;
    await page.locator('input[type=file]').setInputFiles({
      name: filename,
      mimeType: 'image/png',
      buffer: Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jL1sAAAAASUVORK5CYII=',
        'base64',
      ),
    });
    await expect(page.getByRole('status')).toContainText('Media uploaded');
    const card = page
      .locator('.admin-media-card')
      .filter({ has: page.getByRole('heading', { name: filename, exact: true }) });
    await expect(card.getByText('PRIVATE', { exact: true })).toBeVisible();
    const url = await card.getByRole('textbox').inputValue();
    const anonymous = await request.get(url);
    expect([401, 403]).toContain(anonymous.status());
    page.once('dialog', (dialog) => dialog.accept());
    await card.getByRole('button', { name: `Delete ${filename}`, exact: true }).click();
    await expect(page.getByRole('status')).toContainText('Unused media deleted');
    await expect(card).toHaveCount(0);

    await page.goto('/admin/blog/new');
    await expect(page.getByRole('heading', { name: 'New article_', exact: true })).toBeVisible();
    await expect(page.locator('.tiptap')).toBeVisible();
    await page.getByRole('button', { name: 'Insert table', exact: true }).click();
    await expect(page.locator('.tiptap table')).toBeVisible();
    await page.getByRole('button', { name: 'Remove table', exact: true }).click();
    await expect(page.locator('.tiptap table')).toHaveCount(0);
    await page.getByRole('button', { name: 'Insert Mermaid diagram', exact: true }).click();
    await expect(page.locator('.tiptap pre')).toContainText('flowchart LR');
    await expect(page.getByLabel('Code language')).toHaveValue('mermaid');
    await page.getByRole('button', { name: 'Preview', exact: true }).click();
    await expect(page.getByRole('figure', { name: 'Architecture diagram' })).toBeVisible();
    page.once('dialog', (dialog) => dialog.accept());
    await page.getByRole('button', { name: 'Sign out', exact: true }).click();
    await expect(page).toHaveURL(/\/admin\/login$/);
    await page.goto('/admin/profile');
    await expect(page).toHaveURL(/\/admin\/login$/);
  } finally {
    const csrfResponse = await page.request.get('/api/v1/csrf');
    if (csrfResponse.ok()) {
      const csrf = await csrfResponse.json();
      await page.request.post('/api/v1/admin/auth/logout', {
        headers: { [csrf.header_name]: csrf.token },
      });
    }
  }
});

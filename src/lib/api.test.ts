import { afterEach, describe, expect, it, vi } from 'vitest';
import { request, safeUrl, safeLink, plainText, readingTime, ApiError } from './api';
import { jsonLd, xml } from './seo';
afterEach(() => vi.unstubAllGlobals());
describe('untrusted CMS output', () => {
  it('rejects executable and protocol-relative image URLs', () => {
    for (const url of [
      'javascript:alert(1)',
      'data:text/html,<script>x</script>',
      '//evil.test/image',
      'file:///etc/passwd',
      'mailto:a@example.com',
    ])
      expect(safeUrl(url)).toBeUndefined();
    expect(safeUrl('/api/v1/public/media/12-ab')).toBe('/api/v1/public/media/12-ab');
    expect(safeUrl('/images/yi-sivlay.png')).toBe('/images/yi-sivlay.png');
    expect(safeUrl('/images/../private.png')).toBeUndefined();
    expect(safeUrl('/images/yi-sivlay.png?path=private')).toBeUndefined();
    expect(safeUrl('https://example.com/photo.png')).toBe('https://example.com/photo.png');
  });
  it('permits email in links without enabling executable protocols', () => {
    expect(safeLink('mailto:hello@example.com')).toBe('mailto:hello@example.com');
    expect(safeLink('mailto:a@example.com\nBcc:attacker@example.com')).toBeUndefined();
    expect(safeLink('javascript:alert(1)')).toBeUndefined();
  });
  it('escapes script boundaries in JSON-LD and markup in RSS', () => {
    expect(jsonLd({ name: '</script><script>alert(1)</script>' })).not.toContain('<');
    expect(xml('A & B <script>"\'')).toBe('A &amp; B &lt;script&gt;&quot;&apos;');
  });
  it('extracts reading text from structured content', () => {
    const body = {
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'An engineering note.' }] }],
    };
    expect(plainText(body)).toContain('An engineering note.');
    expect(readingTime(body)).toBe(1);
  });
});
describe('same-origin CSRF requests', () => {
  it('fetches current CSRF token before contact submission and preserves session cookies', async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ headerName: 'X-CSRF-TOKEN', token: 'test-csrf' }), {
          status: 200,
        }),
      )
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: 'message-id' }), { status: 201 }));
    vi.stubGlobal('fetch', fetcher);
    await expect(
      request('/public/contact', {
        method: 'POST',
        body: JSON.stringify({ message: 'Hello world' }),
      }),
    ).resolves.toEqual({ id: 'message-id' });
    expect(fetcher.mock.calls[0][0]).toBe('/api/v1/csrf');
    const [path, options] = fetcher.mock.calls[1];
    expect(path).toBe('/api/v1/public/contact');
    expect(options.credentials).toBe('same-origin');
    expect(options.headers.get('X-CSRF-TOKEN')).toBe('test-csrf');
  });
  it('reports API validation failures without pretending a write succeeded', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ token: 'x', headerName: 'X-CSRF-TOKEN' })),
        )
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ detail: 'Too many messages. Please try later.' }), {
            status: 429,
          }),
        ),
    );
    await expect(request('/public/contact', { method: 'POST', body: '{}' })).rejects.toMatchObject({
      status: 429,
      message: 'Too many messages. Please try later.',
    });
  });
  it('stops a mutation when a CSRF session cannot be established', async () => {
    const fetcher = vi.fn().mockResolvedValueOnce(new Response('', { status: 503 }));
    vi.stubGlobal('fetch', fetcher);
    await expect(request('/public/contact', { method: 'POST', body: '{}' })).rejects.toBeInstanceOf(
      ApiError,
    );
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
});

import { describe, expect, it } from 'vitest';
import { highlightCode } from './highlight';

describe('bounded CMS syntax highlighting', () => {
  it.each([
    'java',
    'sql',
    'json',
    'yaml',
    'xml',
    'bash',
    'typescript',
    'javascript',
    'ts',
    'js',
    'sh',
    'text',
  ])('renders %s without the full language registry', async (lang) => {
    const html = await highlightCode('sample <script>alert("x")</script>', {
      lang,
      theme: 'github-dark-default',
    });
    expect(html).toContain('class="shiki');
    expect(html).not.toContain('<script>');
    expect(html).toMatch(/&(?:lt|#x3C);/);
  });
});

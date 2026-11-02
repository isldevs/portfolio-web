import type { Metadata } from 'next';
export function siteUrl(path = '') {
  return new URL(path, process.env.SITE_URL || 'http://localhost:3000').toString();
}
export function metadata(title: string, description: string, path: string): Metadata {
  return {
    title,
    description,
    alternates: { canonical: siteUrl(path) },
    openGraph: { title, description, url: siteUrl(path), type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
  };
}
export function jsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}
export function xml(value: string) {
  return value.replace(
    /[<>&"']/g,
    (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[c]!,
  );
}

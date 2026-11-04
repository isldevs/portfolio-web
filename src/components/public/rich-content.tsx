import Image from 'next/image';
import { Fragment, ReactNode } from 'react';
import { RichNode, plainText, safeUrl, safeLink } from '@/lib/api';
import { CopyCode } from './reader-tools';
import { Diagram } from './diagram';
export function headingId(text: string, index: number) {
  return `${
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'section'
  }-${index}`;
}
export function headings(body: RichNode | null): { text: string; id: string; level: number }[] {
  const result: { text: string; id: string; level: number }[] = [];
  function visit(node: RichNode) {
    if (node.type === 'heading') {
      const text = plainText(node).trim();
      result.push({
        text,
        id: headingId(text, result.length),
        level: Number(node.attrs?.level) || 2,
      });
    }
    node.content?.forEach(visit);
  }
  if (body) visit(body);
  return result;
}
export async function RichContent({ body }: { body: RichNode | null }) {
  let headingIndex = 0;
  async function render(node: RichNode, index: number): Promise<ReactNode> {
    const children = await Promise.all((node.content || []).map(render));
    switch (node.type) {
      case 'doc':
        return <Fragment key={index}>{children}</Fragment>;
      case 'paragraph':
        return <p key={index}>{children.length ? children : <br />}</p>;
      case 'text': {
        let text: ReactNode = node.text || '';
        for (const mark of node.marks || []) {
          if (mark.type === 'bold') text = <strong>{text}</strong>;
          if (mark.type === 'italic') text = <em>{text}</em>;
          if (mark.type === 'underline') text = <u>{text}</u>;
          if (mark.type === 'strike') text = <s>{text}</s>;
          if (mark.type === 'code') text = <code>{text}</code>;
          if (mark.type === 'link') {
            const href = safeLink(mark.attrs?.href);
            if (href)
              text = (
                <a href={href} rel="noopener noreferrer">
                  {text}
                </a>
              );
          }
        }
        return <Fragment key={index}>{text}</Fragment>;
      }
      case 'heading': {
        const level = Math.min(4, Math.max(2, Number(node.attrs?.level) || 2)),
          id = headingId(plainText(node).trim(), headingIndex++);
        return level === 2 ? (
          <h2 id={id} key={index}>
            {children}
          </h2>
        ) : level === 3 ? (
          <h3 id={id} key={index}>
            {children}
          </h3>
        ) : (
          <h4 id={id} key={index}>
            {children}
          </h4>
        );
      }
      case 'bulletList':
        return <ul key={index}>{children}</ul>;
      case 'orderedList':
        return <ol key={index}>{children}</ol>;
      case 'listItem':
        return <li key={index}>{children}</li>;
      case 'blockquote':
      case 'callout':
        return <blockquote key={index}>{children}</blockquote>;
      case 'hardBreak':
        return <br key={index} />;
      case 'horizontalRule':
        return <hr key={index} />;
      case 'image': {
        const src = safeUrl(node.attrs?.src);
        return src ? (
          <Image
            unoptimized
            width={1200}
            height={800}
            key={index}
            src={src}
            alt={String(node.attrs?.alt || 'Article illustration')}
            loading="lazy"
          />
        ) : null;
      }
      case 'codeBlock': {
        const code = (node.content || []).map((n) => n.text || '').join('');
        const language = String(node.attrs?.language || 'text').toLowerCase();
        if (language === 'mermaid') return <Diagram key={index} code={code} />;
        let html = '';
        try {
          const { highlightCode } = await import('@/lib/highlight');
          html = await highlightCode(code, {
            lang: [
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
            ].includes(language)
              ? language
              : 'text',
            theme: 'github-dark-default',
          });
        } catch {}
        return (
          <div className="code-block" key={index}>
            <div className="code-caption">
              <span>{language.toUpperCase()}</span>
              <CopyCode code={code} />
            </div>
            {html ? (
              <div dangerouslySetInnerHTML={{ __html: html }} />
            ) : (
              <pre>
                <code>{code}</code>
              </pre>
            )}
          </div>
        );
      }
      case 'mermaid':
        return <Diagram key={index} code={String(node.attrs?.code || plainText(node))} />;
      case 'table':
        return (
          <table key={index}>
            <tbody>{children}</tbody>
          </table>
        );
      case 'tableRow':
        return <tr key={index}>{children}</tr>;
      case 'tableCell':
        return <td key={index}>{children}</td>;
      case 'tableHeader':
        return <th key={index}>{children}</th>;
      default:
        return <Fragment key={index}>{children}</Fragment>;
    }
  }
  return <div className="prose">{body ? await render(body, 0) : null}</div>;
}

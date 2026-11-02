'use client';

import { useEffect } from 'react';
import { EditorContent, useEditor, type JSONContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';

const lowlight = createLowlight(common);

export default function RichEditor({
  value,
  onChange,
  disabled = false,
}: {
  value: Record<string, unknown>;
  onChange: (value: Record<string, unknown>) => void;
  disabled?: boolean;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ link: false, underline: false, codeBlock: false }),
      CodeBlockLowlight.configure({ lowlight }),
      Underline,
      Link.configure({ openOnClick: false, protocols: ['https', 'http', 'mailto'] }),
      Image.configure({ allowBase64: false }),
      Table.configure({ resizable: false }),
      TableRow,
      TableCell,
      TableHeader,
    ],
    content: value as JSONContent,
    immediatelyRender: false,
    editable: !disabled,
    editorProps: { attributes: { 'aria-label': 'Article body', class: 'admin-prose' } },
    onUpdate: ({ editor: instance }) => onChange(instance.getJSON() as Record<string, unknown>),
  });
  useEffect(() => {
    if (editor && JSON.stringify(editor.getJSON()) !== JSON.stringify(value))
      editor.commands.setContent(value as JSONContent, { emitUpdate: false });
  }, [value, editor]);
  useEffect(() => {
    editor?.setEditable(!disabled);
  }, [editor, disabled]);
  if (!editor) return <div className="admin-editor-loading">Loading editor…</div>;
  function addLink() {
    const href = window.prompt(
      'Link URL (https://…)',
      editor?.getAttributes('link').href || 'https://',
    );
    if (!href || !/^(https?:\/\/|mailto:)/i.test(href)) return;
    editor?.chain().focus().extendMarkRange('link').setLink({ href }).run();
  }
  function addImage() {
    const src = window.prompt('Image URL from your media library', '/api/v1/public/media/');
    if (!src || !/^(\/api\/v1\/public\/media\/|https:\/\/)/i.test(src)) return;
    const alt = window.prompt('Describe the image for screen readers', '') || '';
    editor?.chain().focus().setImage({ src, alt }).run();
  }
  const tools = [
    {
      label: 'H2',
      title: 'Heading 2',
      active: editor.isActive('heading', { level: 2 }),
      run: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      label: 'H3',
      title: 'Heading 3',
      active: editor.isActive('heading', { level: 3 }),
      run: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
    },
    {
      label: 'B',
      title: 'Bold',
      active: editor.isActive('bold'),
      run: () => editor.chain().focus().toggleBold().run(),
    },
    {
      label: 'I',
      title: 'Italic',
      active: editor.isActive('italic'),
      run: () => editor.chain().focus().toggleItalic().run(),
    },
    {
      label: 'U',
      title: 'Underline',
      active: editor.isActive('underline'),
      run: () => editor.chain().focus().toggleUnderline().run(),
    },
    {
      label: '• List',
      title: 'Bullet list',
      active: editor.isActive('bulletList'),
      run: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      label: '1. List',
      title: 'Numbered list',
      active: editor.isActive('orderedList'),
      run: () => editor.chain().focus().toggleOrderedList().run(),
    },
    {
      label: '❞',
      title: 'Quote or callout',
      active: editor.isActive('blockquote'),
      run: () => editor.chain().focus().toggleBlockquote().run(),
    },
    {
      label: '</>',
      title: 'Code block',
      active: editor.isActive('codeBlock'),
      run: () => editor.chain().focus().toggleCodeBlock().run(),
    },
    { label: 'Link', title: 'Insert link', active: editor.isActive('link'), run: addLink },
    { label: 'Image', title: 'Insert image', active: false, run: addImage },
    {
      label: 'Table',
      title: 'Insert table',
      active: editor.isActive('table'),
      run: () =>
        editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
    },
    {
      label: 'Diagram',
      title: 'Insert Mermaid diagram',
      active: false,
      run: () =>
        editor
          .chain()
          .focus()
          .insertContent({
            type: 'codeBlock',
            attrs: { language: 'mermaid' },
            content: [{ type: 'text', text: 'flowchart LR\n  Client --> API\n  API --> Database' }],
          })
          .run(),
    },
    { label: '↶', title: 'Undo', active: false, run: () => editor.chain().focus().undo().run() },
    { label: '↷', title: 'Redo', active: false, run: () => editor.chain().focus().redo().run() },
  ];
  return (
    <div className="admin-editor">
      <div className="admin-editor-toolbar" aria-label="Text formatting">
        {tools.map((tool) => (
          <button
            key={tool.title}
            type="button"
            title={tool.title}
            aria-label={tool.title}
            aria-pressed={tool.active}
            disabled={disabled}
            className={tool.active ? 'active' : ''}
            onClick={tool.run}
          >
            {tool.label}
          </button>
        ))}
      </div>
      {editor.isActive('codeBlock') && (
        <label className="admin-code-language">
          Code language
          <select
            aria-label="Code language"
            value={editor.getAttributes('codeBlock').language || 'text'}
            onChange={(event) =>
              editor
                .chain()
                .focus()
                .updateAttributes('codeBlock', { language: event.target.value })
                .run()
            }
          >
            {[
              'text',
              'java',
              'sql',
              'json',
              'yaml',
              'xml',
              'bash',
              'typescript',
              'javascript',
              'mermaid',
            ].map((language) => (
              <option key={language}>{language}</option>
            ))}
          </select>
        </label>
      )}
      <EditorContent editor={editor} />
      {editor.isActive('table') && (
        <div className="admin-editor-toolbar">
          <button type="button" onClick={() => editor.chain().focus().addRowAfter().run()}>
            Add row
          </button>
          <button type="button" onClick={() => editor.chain().focus().addColumnAfter().run()}>
            Add column
          </button>
          <button type="button" onClick={() => editor.chain().focus().deleteRow().run()}>
            Delete row
          </button>
          <button type="button" onClick={() => editor.chain().focus().deleteTable().run()}>
            Remove table
          </button>
        </div>
      )}
      <div className="admin-editor-help">
        Structured content · Use code language “mermaid” for diagrams · Insert media URLs from the
        library
      </div>
    </div>
  );
}

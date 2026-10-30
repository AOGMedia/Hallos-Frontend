'use client';

import { useEffect, useRef, useState } from 'react';
import {
  AlignCenter,
  AlignLeft,
  Bold,
  Code2,
  Heading2,
  Image as ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  MousePointerClick,
  Pilcrow,
  Redo2,
  RemoveFormatting,
  Underline,
  Undo2,
} from 'lucide-react';

const MERGE_TAGS = [
  { label: 'First name', tag: '{{firstName|there}}' },
  { label: 'Last name', tag: '{{lastName}}' },
  { label: 'Full name', tag: '{{fullName}}' },
  { label: 'Email', tag: '{{email}}' },
];

const BUTTON_STYLE =
  'display:inline-block;padding:12px 24px;background-color:#6c5ce7;color:#ffffff;border-radius:8px;text-decoration:none;font-weight:bold';

interface RichEmailEditorProps {
  value: string;
  onChange: (html: string) => void;
}

export default function RichEmailEditor({ value, onChange }: RichEmailEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [sourceMode, setSourceMode] = useState(false);

  useEffect(() => {
    const editor = editorRef.current;
    if (editor && !sourceMode && editor.innerHTML !== value) editor.innerHTML = value;
  }, [value, sourceMode]);

  const emit = () => onChange(editorRef.current?.innerHTML ?? '');

  const run = (command: string, argument?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, argument);
    emit();
  };

  const askUrl = (message: string) => {
    const url = window.prompt(message, 'https://');
    if (!url || url === 'https://') return null;
    return /^(https?:\/\/|mailto:|tel:)/i.test(url.trim()) ? url.trim() : `https://${url.trim()}`;
  };

  const insertLink = () => {
    const url = askUrl('Link address');
    if (url) run('createLink', url);
  };

  const insertImage = () => {
    const url = askUrl('Image address (a public https link to the image)');
    if (url) run('insertImage', url);
  };

  const insertButton = () => {
    const url = askUrl('Where should the button link to?');
    if (!url) return;
    const label = window.prompt('Button text', 'Join the next class');
    if (!label) return;
    const safeLabel = label.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    run('insertHTML', `<p><a href="${url}" style="${BUTTON_STYLE}">${safeLabel}</a></p>`);
  };

  const insertTag = (tag: string) => {
    if (sourceMode) {
      onChange(`${value}${tag}`);
      return;
    }
    run('insertText', tag);
  };

  const toolButton = (title: string, icon: React.ReactNode, action: () => void) => (
    <button
      key={title}
      type="button"
      title={title}
      aria-label={title}
      disabled={sourceMode}
      onMouseDown={(event) => event.preventDefault()}
      onClick={action}
      className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100 disabled:opacity-30"
    >
      {icon}
    </button>
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 focus-within:border-violet-500">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-zinc-800 bg-zinc-900 p-1.5">
        {toolButton('Bold', <Bold size={16} />, () => run('bold'))}
        {toolButton('Italic', <Italic size={16} />, () => run('italic'))}
        {toolButton('Underline', <Underline size={16} />, () => run('underline'))}
        <span className="mx-1 h-5 w-px bg-zinc-800" />
        {toolButton('Heading', <Heading2 size={16} />, () => run('formatBlock', 'h2'))}
        {toolButton('Paragraph', <Pilcrow size={16} />, () => run('formatBlock', 'p'))}
        {toolButton('Bulleted list', <List size={16} />, () => run('insertUnorderedList'))}
        {toolButton('Numbered list', <ListOrdered size={16} />, () => run('insertOrderedList'))}
        <span className="mx-1 h-5 w-px bg-zinc-800" />
        {toolButton('Align left', <AlignLeft size={16} />, () => run('justifyLeft'))}
        {toolButton('Align centre', <AlignCenter size={16} />, () => run('justifyCenter'))}
        {toolButton('Add link', <Link2 size={16} />, insertLink)}
        {toolButton('Add image', <ImageIcon size={16} />, insertImage)}
        {toolButton('Add button', <MousePointerClick size={16} />, insertButton)}
        <span className="mx-1 h-5 w-px bg-zinc-800" />
        {toolButton('Clear formatting', <RemoveFormatting size={16} />, () => run('removeFormat'))}
        {toolButton('Undo', <Undo2 size={16} />, () => run('undo'))}
        {toolButton('Redo', <Redo2 size={16} />, () => run('redo'))}

        <div className="ml-auto flex items-center gap-1">
          <select
            aria-label="Insert personalisation"
            value=""
            onChange={(event) => event.target.value && insertTag(event.target.value)}
            className="rounded-lg border border-zinc-800 bg-zinc-950 px-2 py-1.5 text-xs font-semibold text-zinc-300 focus:outline-none"
          >
            <option value="">Insert name / email…</option>
            {MERGE_TAGS.map((item) => (
              <option key={item.tag} value={item.tag}>
                {item.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setSourceMode((current) => !current)}
            title="Edit HTML"
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${
              sourceMode ? 'bg-violet-600 text-white' : 'text-zinc-400 hover:bg-zinc-800'
            }`}
          >
            <Code2 size={14} />
            HTML
          </button>
        </div>
      </div>

      {sourceMode ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          spellCheck={false}
          aria-label="Email HTML"
          className="block min-h-[320px] w-full resize-y bg-zinc-950 p-4 font-mono text-xs leading-relaxed text-zinc-200 focus:outline-none"
        />
      ) : (
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-multiline="true"
          aria-label="Email body"
          onInput={emit}
          onBlur={emit}
          className="prose-email min-h-[320px] p-5 text-[15px] leading-relaxed text-zinc-100 focus:outline-none [&_a]:text-violet-400 [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-zinc-700 [&_blockquote]:pl-3 [&_h2]:mb-2 [&_h2]:text-xl [&_h2]:font-bold [&_img]:my-2 [&_img]:max-w-full [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-6"
        />
      )}
    </div>
  );
}

import React from 'react';

/**
 * Minimal, dependency-free markdown renderer for blog post bodies.
 *
 * No `react-markdown`/`remark` is installed in this app, and this project is
 * on React 19 / Next 15 — pulling in a markdown dependency tree mid-feature
 * risks a peer-dependency fight that's outside this feature's scope. Blog
 * copy only needs headings, paragraphs, bold/italic, links, and lists, so
 * this covers that subset with plain React elements — no `dangerouslySetInnerHTML`
 * of arbitrary HTML, since the body is admin-authored but still untrusted input
 * as far as the renderer is concerned.
 */

function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  // Order matters: links before bold/italic so `**[text](url)**` doesn't
  // get mangled by the emphasis pass running first.
  const nodes: React.ReactNode[] = [];
  const pattern = /(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let i = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    const token = match[0];
    const key = `${keyPrefix}-${i++}`;

    const linkMatch = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      nodes.push(
        <a key={key} href={linkMatch[2]} target="_blank" rel="noopener noreferrer" className="text-accent-cyan hover:underline">
          {linkMatch[1]}
        </a>
      );
    } else if (token.startsWith('**')) {
      nodes.push(<strong key={key}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith('*')) {
      nodes.push(<em key={key}>{token.slice(1, -1)}</em>);
    }

    lastIndex = match.index + token.length;
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));

  return nodes;
}

export function MarkdownBody({ content, className }: { content: string; className?: string }) {
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  const blocks: React.ReactNode[] = [];
  let listItems: string[] = [];
  let paragraph: string[] = [];

  const flushParagraph = (key: string) => {
    if (paragraph.length === 0) return;
    blocks.push(<p key={key}>{renderInline(paragraph.join(' '), key)}</p>);
    paragraph = [];
  };
  const flushList = (key: string) => {
    if (listItems.length === 0) return;
    blocks.push(
      <ul key={key}>
        {listItems.map((item, i) => <li key={`${key}-${i}`}>{renderInline(item, `${key}-${i}`)}</li>)}
      </ul>
    );
    listItems = [];
  };

  lines.forEach((rawLine, idx) => {
    const line = rawLine.trim();
    const key = `b${idx}`;

    if (line === '') {
      flushParagraph(key);
      flushList(key);
      return;
    }

    const heading = line.match(/^(#{1,3})\s+(.*)$/);
    if (heading) {
      flushParagraph(key);
      flushList(key);
      const level = heading[1].length;
      const text = renderInline(heading[2], key);
      if (level === 1) blocks.push(<h2 key={key} className="text-2xl font-bold text-text-primary mt-8 mb-3 first:mt-0">{text}</h2>);
      else if (level === 2) blocks.push(<h3 key={key} className="text-xl font-bold text-text-primary mt-6 mb-2">{text}</h3>);
      else blocks.push(<h4 key={key} className="text-lg font-semibold text-text-primary mt-4 mb-2">{text}</h4>);
      return;
    }

    const listItem = line.match(/^[-*]\s+(.*)$/);
    if (listItem) {
      flushParagraph(key);
      listItems.push(listItem[1]);
      return;
    }

    flushList(key);
    paragraph.push(line);
  });
  flushParagraph('tail-p');
  flushList('tail-l');

  return (
    <div className={`space-y-4 text-text-secondary leading-relaxed [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1.5 [&_strong]:text-text-primary [&_strong]:font-semibold ${className ?? ''}`}>
      {blocks}
    </div>
  );
}

export default MarkdownBody;

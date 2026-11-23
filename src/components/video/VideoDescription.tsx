'use client';

import { useLayoutEffect, useRef, useState } from 'react';

/** The description in a soft panel, three lines until "Show more" (YouTube style). */
export function VideoDescription({ description, category, tags }: { description?: string; category?: string; tags?: string[] }) {
  const [expanded, setExpanded] = useState(false);
  const [clamped, setClamped] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);
  const text = (description || '').trim();
  const chips = [category, ...(tags || [])].filter((t): t is string => Boolean(t && t.trim())).slice(0, 8);

  useLayoutEffect(() => {
    const el = textRef.current;
    if (el) setClamped(el.scrollHeight > el.clientHeight + 1);
  }, [text]);

  if (!text && chips.length === 0) return null;

  return (
    <section className="rounded-2xl bg-white/[0.05] p-4">
      {chips.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {chips.map((chip) => (
            <span key={chip} className="text-xs font-medium capitalize text-primary">#{chip.replace(/\s+/g, '')}</span>
          ))}
        </div>
      )}
      {text && (
        <p ref={textRef} className={`whitespace-pre-line text-sm leading-relaxed text-text-primary/90 ${expanded ? '' : 'line-clamp-3'}`}>
          {text}
        </p>
      )}
      {text && (clamped || expanded) && (
        <button type="button" onClick={() => setExpanded((v) => !v)} className="mt-2 text-sm font-semibold text-text-primary">
          {expanded ? 'Show less' : 'Show more'}
        </button>
      )}
    </section>
  );
}

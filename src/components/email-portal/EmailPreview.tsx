'use client';

import { useMemo, useState } from 'react';
import { Monitor, Smartphone } from 'lucide-react';

const SAMPLE = { firstname: 'Ada', lastname: 'Okafor', fullname: 'Ada Okafor', email: 'ada@example.com', unsubscribeurl: '#' };

const escapeHtml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const mergePreview = (template: string, escape = true) =>
  template.replace(/\{\{\s*(\w+)(?:\s*\|\s*([^}]*?))?\s*\}\}/g, (match, key: string, fallback?: string) => {
    const value = SAMPLE[key.toLowerCase() as keyof typeof SAMPLE];
    if (value === undefined) return match;
    const resolved = value || (fallback ?? '');
    return escape ? escapeHtml(resolved) : resolved;
  });

interface EmailPreviewProps {
  subject: string;
  preheader: string;
  html: string;
}

export default function EmailPreview({ subject, preheader, html }: EmailPreviewProps) {
  const [mobile, setMobile] = useState(false);

  const srcDoc = useMemo(
    () => `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:16px;background:#f4f4f7;font-family:Arial,Helvetica,sans-serif;">
<div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;">
<div style="padding:24px 28px 8px;font-size:20px;font-weight:bold;color:#6c5ce7;">Hallos</div>
<div style="padding:8px 28px 24px;font-size:16px;line-height:1.6;color:#222;word-wrap:break-word;">${mergePreview(html) || '<p style="color:#999">Your message will appear here.</p>'}</div>
<div style="padding:18px 28px;border-top:1px solid #eee;font-size:12px;line-height:1.6;color:#888;text-align:center;">You are receiving this email because you have an account on Hallos.<br><u>Unsubscribe</u> from these emails.</div>
</div></body></html>`,
    [html]
  );

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Preview as “Ada Okafor”</p>
        <div className="flex gap-1 rounded-lg bg-zinc-800 p-0.5">
          <button
            type="button"
            onClick={() => setMobile(false)}
            aria-label="Desktop preview"
            className={`rounded-md p-1.5 ${!mobile ? 'bg-zinc-700 text-white' : 'text-zinc-500'}`}
          >
            <Monitor size={14} />
          </button>
          <button
            type="button"
            onClick={() => setMobile(true)}
            aria-label="Mobile preview"
            className={`rounded-md p-1.5 ${mobile ? 'bg-zinc-700 text-white' : 'text-zinc-500'}`}
          >
            <Smartphone size={14} />
          </button>
        </div>
      </div>
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
        <p className="truncate text-sm font-semibold text-zinc-100">{mergePreview(subject, false) || 'Your subject line'}</p>
        {preheader && <p className="truncate text-xs text-zinc-500">{mergePreview(preheader, false)}</p>}
      </div>
      <iframe
        title="Email preview"
        sandbox=""
        srcDoc={srcDoc}
        className={`mx-auto mt-3 h-[460px] rounded-xl border border-zinc-800 bg-[#f4f4f7] transition-all ${mobile ? 'w-[375px] max-w-full' : 'w-full'}`}
      />
    </div>
  );
}

'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CalendarClock, Loader2, Save, Send, TestTube2, Trash2 } from 'lucide-react';
import { emailPortalService, portalErrorMessage } from '@/services/emailPortalService';
import { emptyAudience } from '@/types/emailPortal';
import type { Audience, Campaign, PortalStats, TestSendResult } from '@/types/emailPortal';
import { usePortal } from '@/components/email-portal/PortalProvider';
import AudienceBuilder from '@/components/email-portal/AudienceBuilder';
import EmailPreview from '@/components/email-portal/EmailPreview';
import RichEmailEditor from '@/components/email-portal/RichEmailEditor';
import {
  Card,
  dangerButton,
  formatNumber,
  inputClass,
  Modal,
  primaryButton,
  secondaryButton,
  SectionTitle,
  Spinner,
} from '@/components/email-portal/ui';

const STARTER_BODY = '<p>Hi {{firstName|there}},</p><p>Write your message here.</p><p>Warm regards,<br>The Hallos Team</p>';

const hasText = (html: string) => html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim().length > 0;

const localInputValue = (date: Date) => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

function ComposeForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { me, notify } = usePortal();
  const draftParam = params.get('draft');
  const copyParam = params.get('copy');

  const [campaignId, setCampaignId] = useState<string | null>(draftParam);
  const [loading, setLoading] = useState(Boolean(draftParam || copyParam));
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [preheader, setPreheader] = useState('');
  const [bodyHtml, setBodyHtml] = useState(STARTER_BODY);
  const [audience, setAudience] = useState<Audience>(emptyAudience());
  const [total, setTotal] = useState<number | null>(null);
  const [stats, setStats] = useState<PortalStats | null>(null);
  const [dirty, setDirty] = useState(false);

  const [saving, setSaving] = useState(false);
  const [testTo, setTestTo] = useState(me.email);
  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState<TestSendResult[] | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [reviewed, setReviewed] = useState(false);
  const [scheduleMode, setScheduleMode] = useState<'now' | 'later'>('now');
  const [scheduleAt, setScheduleAt] = useState(() => localInputValue(new Date(Date.now() + 60 * 60 * 1000)));
  const [sending, setSending] = useState(false);

  const createdHereRef = useRef<string | null>(null);

  const markDirty = useCallback(() => setDirty(true), []);

  useEffect(() => {
    emailPortalService.stats().then(setStats).catch(() => undefined);
  }, []);

  useEffect(() => {
    const sourceId = draftParam || copyParam;
    if (!sourceId || sourceId === createdHereRef.current) return;
    let cancelled = false;
    emailPortalService
      .getCampaign(sourceId)
      .then((campaign: Campaign) => {
        if (cancelled) return;
        if (draftParam && campaign.status !== 'draft') {
          router.replace(`/email-portal/campaigns/${campaign.id}`);
          return;
        }
        setName(copyParam ? `${campaign.name} (copy)` : campaign.name);
        setSubject(campaign.subject);
        setPreheader(campaign.preheader ?? '');
        setBodyHtml(campaign.bodyHtml ?? '');
        setAudience(campaign.audience);
        if (copyParam) setDirty(true);
      })
      .catch((err) => {
        if (cancelled) return;
        notify(portalErrorMessage(err, 'Could not load that campaign'), 'error');
        router.replace('/email-portal');
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [draftParam, copyParam, router, notify]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const payload = useMemo(() => ({ name: name.trim(), subject: subject.trim(), preheader: preheader.trim(), bodyHtml, audience }), [name, subject, preheader, bodyHtml, audience]);

  const validate = (): string | null => {
    if (!payload.name) return 'Give the campaign a name so you can find it later.';
    if (!payload.subject) return 'Add a subject line.';
    if (!hasText(bodyHtml)) return 'Write your message before continuing.';
    return null;
  };

  const save = async (silent = false): Promise<string | null> => {
    const problem = validate();
    if (problem) {
      notify(problem, 'error');
      return null;
    }
    setSaving(true);
    try {
      const saved = campaignId ? await emailPortalService.updateCampaign(campaignId, payload) : await emailPortalService.createCampaign(payload);
      setCampaignId(saved.id);
      setDirty(false);
      if (!campaignId) {
        createdHereRef.current = saved.id;
        router.replace(`/email-portal/compose?draft=${saved.id}`);
      }
      if (!silent) notify('Draft saved');
      return saved.id;
    } catch (err) {
      notify(portalErrorMessage(err, 'Could not save the draft'), 'error');
      return null;
    } finally {
      setSaving(false);
    }
  };

  const sendTest = async () => {
    const addresses = testTo.split(/[,\s;]+/).filter(Boolean);
    if (!subject.trim() || !hasText(bodyHtml)) {
      notify('Add a subject and a message before sending a test.', 'error');
      return;
    }
    setTesting(true);
    setTestResults(null);
    try {
      const results = await emailPortalService.sendTest({ subject: subject.trim(), preheader: preheader.trim(), bodyHtml, to: addresses });
      setTestResults(results);
      const failures = results.filter((r) => !r.ok).length;
      notify(failures ? `${failures} test email(s) failed` : 'Test email sent — check your inbox', failures ? 'error' : 'success');
    } catch (err) {
      notify(portalErrorMessage(err, 'Could not send the test email'), 'error');
    } finally {
      setTesting(false);
    }
  };

  const openConfirm = async () => {
    if (total === 0) {
      notify('Your audience is empty — adjust the filters first.', 'error');
      return;
    }
    const id = await save(true);
    if (!id) return;
    setReviewed(false);
    setScheduleMode('now');
    setConfirmOpen(true);
  };

  const confirmSend = async () => {
    if (!campaignId) return;
    setSending(true);
    try {
      const scheduledFor = scheduleMode === 'later' ? new Date(scheduleAt).toISOString() : null;
      const result = await emailPortalService.sendCampaign(campaignId, scheduledFor);
      setDirty(false);
      notify(result.campaign.status === 'scheduled' ? 'Campaign scheduled' : 'Sending started');
      router.replace(`/email-portal/campaigns/${campaignId}`);
    } catch (err) {
      notify(portalErrorMessage(err, 'Could not start the campaign'), 'error');
      setConfirmOpen(false);
    } finally {
      setSending(false);
    }
  };

  const discard = async () => {
    if (!campaignId) {
      router.push('/email-portal');
      return;
    }
    if (!window.confirm('Delete this draft? This cannot be undone.')) return;
    try {
      await emailPortalService.deleteCampaign(campaignId);
      setDirty(false);
      router.replace('/email-portal');
    } catch (err) {
      notify(portalErrorMessage(err, 'Could not delete the draft'), 'error');
    }
  };

  const perHour = stats ? Math.min(stats.limits.hourlyCap, stats.limits.dailyCap) : 0;
  const estimate = (() => {
    if (!total || !stats || !perHour) return null;
    const days = Math.ceil(total / stats.limits.dailyCap);
    if (days > 1) return `about ${days} days`;
    const hours = Math.ceil(total / perHour);
    return hours <= 1 ? 'within the hour' : `about ${hours} hours`;
  })();

  if (loading) return <Spinner label="Loading campaign..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">{campaignId ? 'Edit campaign' : 'New campaign'}</h1>
          <p className="mt-1 text-sm text-zinc-500">Write your message, choose who gets it, send yourself a test, then send.</p>
        </div>
        {dirty && <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">Unsaved changes</span>}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <Card>
            <SectionTitle step={1} title="Campaign details" hint="The name is only for your team. The subject is what users see in their inbox." />
            <div className="space-y-4">
              <div>
                <label htmlFor="c-name" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-zinc-500">Campaign name</label>
                <input id="c-name" value={name} onChange={(e) => { setName(e.target.value); markDirty(); }} maxLength={150} placeholder="e.g. Personal Branding class follow-up" className={inputClass} />
              </div>
              <div>
                <label htmlFor="c-subject" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-zinc-500">Subject line</label>
                <input id="c-subject" value={subject} onChange={(e) => { setSubject(e.target.value); markDirty(); }} maxLength={200} placeholder="How was yesterday's class, {{firstName|friend}}?" className={inputClass} />
                <p className="mt-1 text-right text-[11px] text-zinc-600">{subject.length}/200</p>
              </div>
              <div>
                <label htmlFor="c-pre" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-zinc-500">Preview text <span className="font-normal normal-case text-zinc-600">(optional — the grey text next to the subject)</span></label>
                <input id="c-pre" value={preheader} onChange={(e) => { setPreheader(e.target.value); markDirty(); }} maxLength={200} placeholder="A short teaser that makes people open it" className={inputClass} />
              </div>
            </div>
          </Card>

          <Card>
            <SectionTitle step={2} title="Who should get it?" hint="Combine filters to reach exactly the right people." />
            <AudienceBuilder audience={audience} onChange={(next) => { setAudience(next); markDirty(); }} onTotalChange={setTotal} />
          </Card>

          <Card>
            <SectionTitle step={3} title="Your message" hint="Use “Insert name / email” to personalise. Every email includes an unsubscribe link automatically." />
            <RichEmailEditor value={bodyHtml} onChange={(html) => { setBodyHtml(html); markDirty(); }} />
          </Card>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <Card>
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Summary</p>
            <p className="mt-2 text-3xl font-bold text-zinc-100">{total === null ? '—' : formatNumber(total)}</p>
            <p className="text-sm text-zinc-500">recipients{estimate ? ` · sends ${estimate}` : ''}</p>

            <div className="mt-5 space-y-2">
              <button onClick={() => save()} disabled={saving} className={`${secondaryButton} w-full`}>
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Save draft
              </button>
              <button onClick={openConfirm} disabled={saving || sending} className={`${primaryButton} w-full`}>
                <Send size={16} />
                Review &amp; send
              </button>
              {campaignId && (
                <button onClick={discard} className={`${dangerButton} w-full`}>
                  <Trash2 size={16} />
                  Delete draft
                </button>
              )}
            </div>
          </Card>

          <Card>
            <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-200">
              <TestTube2 size={16} className="text-violet-400" />
              Send a test first
            </p>
            <input value={testTo} onChange={(e) => setTestTo(e.target.value)} placeholder="you@hallos.net" aria-label="Test email address" className={inputClass} />
            <p className="mt-1 text-[11px] text-zinc-600">Up to 3 addresses, separated by commas.</p>
            <button onClick={sendTest} disabled={testing} className={`${secondaryButton} mt-3 w-full`}>
              {testing ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              Send test email
            </button>
            {testResults && (
              <ul className="mt-3 space-y-1 text-xs">
                {testResults.map((r) => (
                  <li key={r.email} className={r.ok ? 'text-emerald-400' : 'text-rose-400'}>
                    {r.ok ? '✓ Sent to' : '✕ Failed for'} {r.email}
                    {r.error ? ` — ${r.error}` : ''}
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <EmailPreview subject={subject} preheader={preheader} html={bodyHtml} />
          </Card>
        </aside>
      </div>

      <Modal
        open={confirmOpen}
        title="Ready to send?"
        onClose={() => !sending && setConfirmOpen(false)}
        footer={
          <>
            <button onClick={() => setConfirmOpen(false)} disabled={sending} className={secondaryButton}>Go back</button>
            <button onClick={confirmSend} disabled={!reviewed || sending || (scheduleMode === 'later' && !scheduleAt)} className={primaryButton}>
              {sending ? <Loader2 size={16} className="animate-spin" /> : scheduleMode === 'later' ? <CalendarClock size={16} /> : <Send size={16} />}
              {scheduleMode === 'later' ? 'Schedule campaign' : `Send to ${total === null ? '' : formatNumber(total)} people`}
            </button>
          </>
        }
      >
        <div className="space-y-4 text-sm">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
            <p className="text-xs uppercase tracking-widest text-zinc-500">Subject</p>
            <p className="mt-1 font-semibold text-zinc-100">{subject}</p>
            <p className="mt-3 text-xs uppercase tracking-widest text-zinc-500">Audience</p>
            <p className="mt-1 font-semibold text-zinc-100">{total === null ? '—' : formatNumber(total)} people{estimate ? ` · delivered ${estimate}` : ''}</p>
          </div>

          <div className="flex gap-2">
            {(['now', 'later'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setScheduleMode(mode)}
                className={`flex-1 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ${
                  scheduleMode === mode ? 'border-violet-500 bg-violet-600/15 text-violet-200' : 'border-zinc-800 text-zinc-400 hover:text-zinc-100'
                }`}
              >
                {mode === 'now' ? 'Send now' : 'Schedule for later'}
              </button>
            ))}
          </div>
          {scheduleMode === 'later' && (
            <input type="datetime-local" value={scheduleAt} min={localInputValue(new Date())} onChange={(e) => setScheduleAt(e.target.value)} className={inputClass} aria-label="Send date and time" />
          )}

          <label className="flex cursor-pointer items-start gap-2.5 text-zinc-300">
            <input type="checkbox" checked={reviewed} onChange={(e) => setReviewed(e.target.checked)} className="mt-0.5 h-4 w-4 accent-violet-600" />
            <span>I checked the preview and sent myself a test. I understand sent emails can&apos;t be recalled.</span>
          </label>
        </div>
      </Modal>
    </div>
  );
}

export default function ComposePage() {
  return (
    <Suspense fallback={<Spinner label="Loading..." />}>
      <ComposeForm />
    </Suspense>
  );
}

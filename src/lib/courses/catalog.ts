import type { PublicDepartment } from '@/lib/seo/publicApi';

/**
 * Presentation helpers for the public self-paced course catalog. The backend
 * data came from a bulk import, so department names carry counts like
 * "Business Skills(250)" or "Accounting & Finance Primary (2" and slugs like
 * "business-skills250". These turn that into clean names and stable URLs.
 */

const MINOR_WORDS = new Set(['and', 'of', 'the', 'for', 'in', 'to', 'a']);

/** "Business Skills(250)" → "Business Skills", "Animal care (5)" → "Animal Care". */
export function cleanDepartmentName(raw: string): string {
  const base = raw.replace(/\s*\(?\d+\)?\s*$/, '').trim() || raw.trim();
  return base
    .split(/\s+/)
    .map((w, i) => {
      if (w === '&') return w;
      if (i > 0 && MINOR_WORDS.has(w.toLowerCase())) return w.toLowerCase();
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(' ');
}

/** URL slug derived from the clean name: "IT & Software" → "it-and-software". */
export function departmentSlug(raw: string): string {
  return cleanDepartmentName(raw)
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function departmentPath(dept: Pick<PublicDepartment, 'name'>): string {
  return `/course/department/${departmentSlug(dept.name)}`;
}

export function findDepartmentBySlug(departments: PublicDepartment[], slug: string): PublicDepartment | null {
  return departments.find((d) => departmentSlug(d.name) === slug) ?? null;
}

export function coursePath(id: string): string {
  return `/course/${id}`;
}

// ── Course text ─────────────────────────────────────────────────────────────

export type ContentBlock =
  | { kind: 'heading'; text: string }
  | { kind: 'paragraph'; text: string }
  | { kind: 'list'; items: string[] };

/** A line that reads like a bullet point rather than a sentence. */
const isListItem = (line: string) => line.length <= 100 && !/[.!?]$/.test(line);

/** A short label such as "Overview" or "Who should take the course:". */
const isLabel = (line: string) => line.length <= 60 && !/[.!?]$/.test(line) && line.split(/\s+/).length <= 8;

/**
 * Course `content` is plain text: blank-line separated blocks, where a block
 * may open with a short label ("Overview", "Certification") and feature lists
 * are runs of non-sentence lines. This turns it into headings, paragraphs and lists.
 */
export function parseCourseContent(content: string): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  for (const chunk of content.replace(/\r\n/g, '\n').split(/\n{2,}/)) {
    let lines = chunk.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) continue;

    // A whole block of bullet-like lines is one list (its first line is an item, not a heading).
    if (lines.length >= 3 && lines.every(isListItem)) {
      blocks.push({ kind: 'list', items: lines });
      continue;
    }

    // "Overview:" on its own (content follows in the next block).
    if (lines.length === 1 && isLabel(lines[0]) && lines[0].endsWith(':')) {
      blocks.push({ kind: 'heading', text: lines[0].replace(/:\s*$/, '') });
      continue;
    }

    if (lines.length > 1 && isLabel(lines[0])) {
      blocks.push({ kind: 'heading', text: lines[0].replace(/:\s*$/, '') });
      lines = lines.slice(1);
    }

    if (lines.length >= 3 && lines.every(isListItem)) {
      blocks.push({ kind: 'list', items: lines });
    } else {
      for (const line of lines) blocks.push({ kind: 'paragraph', text: line });
    }
  }
  return blocks;
}

/** "Module 01: Introduction to X" lines → module titles. */
export function parseCurriculum(curriculum: string): string[] {
  return curriculum
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
}

/** One-paragraph summary for cards and meta descriptions (skips the "Overview" label). */
export function courseSummary(content: string): string {
  for (const block of parseCourseContent(content)) {
    if (block.kind === 'paragraph' && !isLabel(block.text)) return block.text;
  }
  return '';
}

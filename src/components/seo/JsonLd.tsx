/**
 * Renders schema.org JSON-LD. Server component — the script ships in the
 * initial HTML, which is where crawlers read it. `<` is escaped so content
 * from the CMS can never close the script tag early.
 */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}

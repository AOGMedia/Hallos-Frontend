'use client';

import { useFetchRegistrations } from "@/hooks/useEventRegistration";
interface Registration {
  id: string | number;
  firstname: string;
  lastname: string;
  role?: string;
  email: string;
  phone?: string;
  location: string;
  created_at?: string;
  createdAt?: string;
}

function resolvePhone(reg: unknown): string {
  const r = reg as Record<string, unknown>;
  const v = (r.phone as string)
    ?? (r.phoneNumber as string)
    ?? (r.phone_number as string)
    ?? (r.whatsapp as string)
    ?? (r.whatsappNumber as string)
    ?? (r.mobile as string)
    ?? (r.telephone as string);
  return v ?? '';
}

function resolveDate(reg: unknown): string {
  const r = reg as Record<string, unknown>;
  const v = (r.created_at as string) ?? (r.createdAt as string) ?? (r.date as string);
  if (!v) return '';
  try {
    return new Date(v).toLocaleString();
  } catch {
    return v;
  }
}

export function RegistrationsList() {
  const { data: registrations, isLoading, isError, error } = useFetchRegistrations();

  if (isLoading) return <p>Loading registrations...</p>;
  if (isError) return <p>Error: {(error as Error).message}</p>;

  if (!registrations || registrations.length === 0) {
    return <p>No registrations found.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => {
            const headers = ['Date', 'First Name','Last Name','Role','Email','Phone','Location']
            const rows = (registrations as Registration[]).map((r) => [resolveDate(r), r.firstname, r.lastname, r.role ?? '', r.email, resolvePhone(r), r.location])
            const csv = [headers, ...rows]
              .map(row => row.map((cell) => {
                const s = String(cell ?? '')
                if (s.includes('"') || s.includes(',') || s.includes('\n')) {
                  return '"' + s.replaceAll('"','""') + '"'
                }
                return s
              }).join(','))
              .join('\n')
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'registrations.csv'
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
          }}
          className="px-4 py-2 rounded-md bg-primary text-white hover:opacity-80 transition-opacity"
        >
          Export CSV
        </button>
        <button
          type="button"
          onClick={() => {
            const w = window.open('', '_blank')
            if (!w) return
            const style = `
              <style>
                body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; padding: 24px; }
                h1 { font-size: 18px; margin-bottom: 12px; }
                table { width: 100%; border-collapse: collapse; }
                th, td { border: 1px solid #ddd; padding: 8px; font-size: 12px; }
                th { background: #f5f5f5; text-align: left; }
              </style>
            `
            const headers = ['Date', 'First Name','Last Name','Role','Email','Phone','Location']
            const rowsHtml = (registrations as Registration[]).map((r) => `
              <tr>
                <td>${resolveDate(r)}</td>
                <td>${String(r.firstname ?? '')}</td>
                <td>${String(r.lastname ?? '')}</td>
                <td>${String(r.role ?? '')}</td>
                <td>${String(r.email ?? '')}</td>
                <td>${String(resolvePhone(r))}</td>
                <td>${String(r.location ?? '')}</td>
              </tr>
            `).join('')
            const html = `
              <html>
                <head>
                  <title>Registrations</title>
                  ${style}
                </head>
                <body>
                  <h1>Registrations</h1>
                  <table>
                    <thead>
                      <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
                    </thead>
                    <tbody>
                      ${rowsHtml}
                    </tbody>
                  </table>
                </body>
              </html>
            `
            w.document.open()
            w.document.write(html)
            w.document.close()
            w.focus()
            w.print()
          }}
          className="px-4 py-2 rounded-md bg-secondary text-white hover:opacity-80 transition-opacity"
        >
          Export PDF
        </button>
      </div>
      <div className="overflow-x-auto border rounded-md scrollbar-hide">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-background-dark/20 border-b border-border">
              <th className="text-left px-4 py-2">Date</th>
              <th className="text-left px-4 py-2">First Name</th>
              <th className="text-left px-4 py-2">Last Name</th>
              <th className="text-left px-4 py-2">Role</th>
              <th className="text-left px-4 py-2">Email</th>
              <th className="text-left px-4 py-2">Phone</th>
              <th className="text-left px-4 py-2">Location</th>
            </tr>
          </thead>
          <tbody>
            {(registrations as Registration[]).map((reg) => (
              <tr key={reg.id} className="odd:bg-background-dark/10 border-b border-border">
                <td className="px-4 py-2 whitespace-nowrap">{resolveDate(reg)}</td>
                <td className="px-4 py-2">{reg.firstname}</td>
                <td className="px-4 py-2">{reg.lastname}</td>
                <td className="px-4 py-2 font-medium">{reg.role}</td>
                <td className="px-4 py-2">{reg.email}</td>
                <td className="px-4 py-2">{resolvePhone(reg)}</td>
                <td className="px-4 py-2">{reg.location}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

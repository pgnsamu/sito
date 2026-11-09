import type { Job } from "@/lib/api/jobs";
export const inputStyle = "mt-2 w-full border-b border-black/25 bg-white px-0 py-3 text-base outline-none focus:border-black";
export const buttonStyle = "rounded-full border border-black px-6 py-3 text-xs uppercase tracking-[0.2em] transition hover:bg-black hover:text-white disabled:opacity-40 disabled:cursor-not-allowed";
export function JobFields({ job, admin = false }: { job?: Job; admin?: boolean }) {
  return <>
    {([['company', 'Azienda'], ['email', 'Email di contatto'], ['title', 'Posizione ricercata'], ['location', 'Sede / da remoto']] as const).map(([name, label]) =>
      <label key={name} className="block text-xs uppercase tracking-[0.2em]">{label}<input className={inputStyle} name={name} type={name === 'email' ? 'email' : 'text'} defaultValue={job?.[name]} maxLength={name === 'email' ? 254 : 160} required /></label>)}
    <label className="block text-xs uppercase tracking-[0.2em] md:col-span-2">Descrizione della richiesta<textarea className={inputStyle} name="description" defaultValue={job?.description} rows={5} maxLength={10000} required /></label>
    {admin && <label className="block text-xs uppercase tracking-[0.2em]">Stato<select className={inputStyle} name="status" defaultValue={job?.status ?? 'pending'}><option value="pending">Da approvare</option><option value="published">Pubblicata</option><option value="closed">Chiusa</option></select></label>}
  </>;
}

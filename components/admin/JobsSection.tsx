"use client";
import { useEffect, useState } from "react";
import { jobsRequest, type Job, type Application } from "@/lib/api/jobs";
import { JobFields, buttonStyle, inputStyle } from "@/components/jobs/JobFields";

export default function JobsSection({ view }: { view: "jobs" | "applications" }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<Job | null>(null);
  const [filter, setFilter] = useState("");
  const [formVersion, setFormVersion] = useState(0);
  async function load() {
    setLoading(true); setError("");
    try { const data = await jobsRequest<{ jobs: Job[]; applications: Application[] }>({ action: "list" }, true); setJobs(data.jobs); setApplications(data.applications); }
    catch (err) { setError(err instanceof Error ? err.message : "Caricamento non riuscito."); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    const values = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const { job } = await jobsRequest<{ job: Job }>({ ...values, action: "save", id: editing?.id }, true);
      setJobs(prev => editing ? prev.map(item => item.id === job.id ? job : item) : [job, ...prev]);
      setEditing(null); setFormVersion(value => value + 1); setMessage("Richiesta salvata.");
    } catch (err) { setError(err instanceof Error ? err.message : "Salvataggio non riuscito."); }
    finally { setBusy(false); }
  }
  async function changeStatus(id: string, status: Job["status"]) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const { job } = await jobsRequest<{ job: Job }>({ action: "set-status", id, status }, true);
      setJobs(prev => prev.map(item => item.id === id ? job : item));
      setMessage("Stato aggiornato.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Aggiornamento dello stato non riuscito.");
    } finally {
      setBusy(false);
    }
  }
  async function remove(job: Job) {
    if (!window.confirm(`Eliminare “${job.title}”? Le candidature ricevute verranno conservate.`)) return;
    setBusy(true); setError(""); setMessage("");
    try {
      await jobsRequest({ action: "delete", id: job.id }, true);
      setJobs(prev => prev.filter(item => item.id !== job.id));
      if (editing?.id === job.id) setEditing(null);
      setMessage("Richiesta eliminata. Candidature conservate.");
    } catch (err) { setError(err instanceof Error ? err.message : "Eliminazione non riuscita."); }
    finally { setBusy(false); }
  }
  const statuses = { pending: "Da approvare", published: "Pubblicata", closed: "Chiusa" };
  return <section>
    <h2 className="mb-8 font-serif text-5xl tracking-[-0.04em] md:text-7xl">{view === 'jobs' ? 'Richieste di lavoro' : 'Candidature'}</h2>
    {error && <p role="alert" className="mb-6 text-red-700">{error} <button className="underline" onClick={load} disabled={busy}>Riprova caricamento</button></p>}
    {message && <p role="status" className="mb-6">{message}</p>}
    {loading ? <p role="status">Caricamento…</p> : view === 'jobs' ? <>
      <form key={`${editing?.id ?? 'new'}-${formVersion}`} onSubmit={save} className="mb-12 border-b border-black/15 pb-10">
        <h3 className="mb-6 font-serif text-3xl">{editing ? 'Modifica richiesta' : 'Nuova richiesta'}</h3>
        <fieldset disabled={busy} className="grid gap-6 md:grid-cols-2"><JobFields job={editing ?? undefined} admin /><div className="flex flex-wrap gap-3 md:col-span-2"><button className={buttonStyle}>{busy ? 'Salvataggio…' : 'Salva richiesta'}</button>{editing && <button type="button" className={buttonStyle} onClick={() => setEditing(null)}>Annulla</button>}</div></fieldset>
      </form>
      {!jobs.length && <p>Nessuna richiesta di lavoro ricevuta.</p>}
      <div className="divide-y divide-black/15">{jobs.map(job => <article key={job.id} className="flex flex-wrap items-start justify-between gap-5 py-6"><div className="min-w-0"><p className="mb-2 text-xs uppercase tracking-[0.2em]">{statuses[job.status]} · {job.company}</p><h3 className="break-words font-serif text-3xl">{job.title}</h3><p className="mt-2 text-sm text-black/60">{job.location}</p><a className="break-all text-sm underline" href={`mailto:${job.email}`}>{job.email}</a></div><div className="flex flex-wrap items-center gap-3">
          <select
            aria-label={`Stato di ${job.title}`}
            className="rounded-full border border-black bg-white px-4 py-3 text-xs disabled:opacity-50"
            disabled={busy || editing?.id === job.id}
            value={job.status}
            onChange={event => void changeStatus(job.id, event.target.value as Job["status"])}
          >
            {Object.entries(statuses).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <button disabled={busy} className={buttonStyle} onClick={() => { setEditing(job); setMessage(''); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Modifica</button><button disabled={busy} className={buttonStyle} onClick={() => remove(job)}>Elimina</button></div></article>)}</div>
    </> : <>
      <label className="mb-8 block max-w-lg text-xs uppercase tracking-wider">Filtra per posizione<select className={inputStyle} value={filter} onChange={event => setFilter(event.target.value)}><option value="">Tutte le candidature</option>{Array.from(new Set(applications.map(item => `${item.job_title} — ${item.company}`))).map(label => <option key={label}>{label}</option>)}</select></label>
      {!applications.length && <p>Nessuna candidatura ricevuta.</p>}
      <div className="divide-y divide-black/15">{applications.filter(item => !filter || `${item.job_title} — ${item.company}` === filter).map(item => <article key={item.id} className="py-6"><p className="text-xs uppercase tracking-wider text-black/55">{item.job_title} — {item.company}</p><h3 className="mt-3 font-serif text-3xl">{item.name}</h3><a className="mt-2 inline-block break-all underline" href={`mailto:${item.email}`}>{item.email}</a><p className="mt-4 whitespace-pre-wrap text-sm">{item.message}</p><p className="mt-4 text-xs text-black/50">{new Date(item.created_at).toLocaleString('it-IT')}</p></article>)}</div>
    </>}
  </section>;
}

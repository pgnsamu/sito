"use client";
import { useEffect, useState } from "react";
import { jobsRequest, type PublicJob } from "@/lib/api/jobs";
import { JobFields, inputStyle, buttonStyle } from "@/components/jobs/JobFields";

export default function JobsPage() {
  const [mode, setMode] = useState("apply");
  const [jobs, setJobs] = useState<PublicJob[]>([]);
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  async function loadJobs() {
    setLoading(true); setLoadError("");
    try { const result = await jobsRequest<{ jobs: PublicJob[] }>(); setJobs(result.jobs); }
    catch { setLoadError("Non è stato possibile caricare le posizioni."); }
    finally { setLoading(false); }
  }
  useEffect(() => { void loadJobs(); }, []);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setBusy(true); setError(""); setMessage("");
    try {
      await jobsRequest({ ...Object.fromEntries(new FormData(form)), action: mode });
      form.reset(); setSelected("");
      setMessage(mode === "apply" ? "Candidatura inviata. Ti contatteremo via email." : "Richiesta inviata. Verrà verificata prima della pubblicazione.");
    } catch (err) { setError(err instanceof Error ? err.message : "Invio non riuscito."); }
    finally { setBusy(false); }
  }
  const job = jobs.find(item => item.id === selected);
  return <section className="min-h-screen bg-white px-6 pb-20 pt-32 text-black md:px-12 lg:px-20">
    <div className="mx-auto max-w-3xl">
      <p className="mb-4 text-xs uppercase tracking-[0.35em] text-black/45">New opportunities</p>
      <h1 className="mb-12 font-serif text-6xl tracking-[-0.04em] md:text-8xl">Jobs</h1>
      <form onSubmit={submit} className="space-y-8">
        <fieldset disabled={busy} className="space-y-8">
          <legend className="sr-only">Invia una candidatura o una richiesta di lavoro</legend>
          <div className="flex flex-wrap gap-3">{[["apply", "Cerco lavoro"], ["submit", "Sono un’azienda"]].map(([value, label]) => <button key={value} type="button" aria-pressed={mode === value} onClick={() => { setMode(value); setError(""); setMessage(""); }} className={`${buttonStyle} ${mode === value ? 'bg-black text-white' : ''}`}>{label}</button>)}</div>
          <div key={mode} className="grid gap-6 md:grid-cols-2">
            {mode === "submit" ? <JobFields /> : <>
              <label className="block text-xs uppercase tracking-[0.2em] md:col-span-2">Posizione<select name="job_id" required className={inputStyle} value={selected} onChange={event => setSelected(event.target.value)} disabled={loading || !!loadError}><option value="">{loading ? "Caricamento…" : "Seleziona una posizione"}</option>{jobs.map(item => <option key={item.id} value={item.id}>{item.title} — {item.company}</option>)}</select></label>
              {loadError ? <div role="alert" className="md:col-span-2">{loadError} <button type="button" className="underline" onClick={loadJobs}>Riprova</button></div> : !loading && jobs.length === 0 ? <p className="md:col-span-2 text-sm text-black/60">Al momento non ci sono posizioni aperte. Torna a trovarci.</p> : null}
              {job && <div className="border-l border-black/25 pl-4 text-sm md:col-span-2"><p className="mb-2 uppercase tracking-wider">{job.location}</p><p className="whitespace-pre-wrap">{job.description}</p></div>}
              <label className="text-xs uppercase tracking-[0.2em]">Nome e cognome<input name="name" required maxLength={160} autoComplete="name" className={inputStyle} /></label>
              <label className="text-xs uppercase tracking-[0.2em]">Email<input name="email" type="email" required maxLength={254} autoComplete="email" className={inputStyle} /></label>
              <label className="text-xs uppercase tracking-[0.2em] md:col-span-2">Presentati (facoltativo)<textarea name="message" rows={5} maxLength={10000} className={inputStyle} /></label>
            </>}
          </div>
          <div hidden aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
          <p className="text-sm text-black/55">I dati inviati saranno consultabili dagli amministratori per gestire la richiesta e ricontattarti.</p>
          <button className={buttonStyle} disabled={busy || (mode === 'apply' && (loading || !!loadError || !selected))}>{busy ? "Invio in corso…" : mode === 'apply' ? "Invia candidatura" : "Invia richiesta"}</button>
        </fieldset>
        {message && <p role="status" className="border-t border-black/15 pt-4">{message}</p>}
        {error && <p role="alert" className="text-red-700">{error}</p>}
      </form>
    </div>
  </section>;
}

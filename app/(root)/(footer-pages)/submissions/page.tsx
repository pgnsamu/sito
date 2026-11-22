import type { Metadata } from "next";
import Link from "next/link";
import { PolicyPage, PolicySection, StudioEmail } from "../PolicyPage";

export const metadata: Metadata = { title: "Submission Guidelines | New Guard Studio" };

export default function Page() {
  return (
    <PolicyPage title="Submission Guidelines">
      <PolicySection title="Chi può candidarsi">
        <p>Accogliamo proposte da creativi emergenti che desiderano presentare il proprio lavoro e la propria ricerca.</p>
        <ul>
          <li><strong>Fashion.</strong> Designer e marchi indipendenti che sviluppano la propria identità attraverso la progettazione e la sperimentazione.</li>
          <li><strong>Visual Culture.</strong> Artisti e professionisti della fotografia, dell’illustrazione, della grafica, del collage, dell’arte digitale e di altre forme di ricerca visiva.</li>
        </ul>
      </PolicySection>

      <PolicySection title="Come inviare una proposta">
        <p>Scrivi a <StudioEmail /> o usa il modulo <Link href="/about#work-with-us">Work with us</Link>, che apre il tuo programma di posta. Includi nel messaggio queste informazioni.</p>
        <ul>
          <li>Nome e cognome, oppure nome del progetto e del referente.</li>
          <li>Indirizzo email di contatto e profilo Instagram, se disponibile.</li>
          <li>Una breve presentazione del tuo percorso e della tua ricerca.</li>
          <li>Un collegamento al portfolio o a una selezione aggiornata dei tuoi lavori.</li>
        </ul>
        <p>Per candidarti a una posizione pubblicata o proporre un annuncio aziendale, usa la sezione <Link href="/jobs">Jobs</Link>.</p>
      </PolicySection>

      <PolicySection title="Selezione e pubblicazione">
        <p>Valutiamo originalità, qualità della ricerca e coerenza con la linea editoriale. Il numero di follower, la notorietà e le collaborazioni precedenti non sono requisiti di selezione. Potremmo contattarti per approfondire la proposta. L’invio non garantisce una risposta individuale o una pubblicazione.</p>
        <p>Le collaborazioni possono includere un profilo, una selezione di opere o un’intervista. Concordiamo con i creativi i materiali, i crediti e le modalità di pubblicazione. La partecipazione a pubblicazioni cartacee o ad altre iniziative richiede un accordo specifico.</p>
      </PolicySection>

      <PolicySection title="Diritti e dati personali">
        <p>Condividi solo materiali che sei autorizzato a inviare e indica gli eventuali contributi di terzi. L’invio consente allo studio di esaminare il lavoro per la selezione. Per pubblicarlo o utilizzarlo in altro modo servono le autorizzazioni dei titolari. Per approfondire, consulta <Link href="/copyright-and-credits">Copyright &amp; Credits</Link>.</p>
        <p>Per sapere come gestiamo i dati delle candidature, i tempi di conservazione e i tuoi diritti, consulta la <Link href="/privacy-policy">Privacy Policy</Link>.</p>
      </PolicySection>
    </PolicyPage>
  );
}

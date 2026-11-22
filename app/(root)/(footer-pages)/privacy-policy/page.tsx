import type { Metadata } from "next";
import Link from "next/link";
import { PolicyPage, PolicySection, StudioEmail } from "../PolicyPage";

export const metadata: Metadata = { title: "Privacy Policy | New Guard Studio" };

export default function Page() {
  return (
    <PolicyPage title="Privacy Policy">
      <PolicySection title="Titolare del trattamento">
        <p>Iris Garbini, fondatrice e responsabile di New Guard Studio, è la titolare del trattamento. Per domande sul trattamento o per esercitare i tuoi diritti puoi scrivere a <StudioEmail />.</p>
      </PolicySection>

      <PolicySection title="Dati, finalità e basi giuridiche">
        <ul>
          <li><strong>Navigazione e sicurezza.</strong> I servizi che erogano il sito e le immagini possono trattare indirizzi IP, informazioni sul browser, URL richiesti, data e ora, esito delle richieste e log tecnici. Il trattamento serve a erogare il sito, diagnosticare problemi e prevenire abusi, sulla base del legittimo interesse a mantenerlo disponibile e sicuro (art. 6, par. 1, lett. f, GDPR).</li>
          <li><strong>Contatti e proposte editoriali.</strong> Trattiamo l’indirizzo email, il contenuto del messaggio e gli eventuali dati che scegli di includere, come nome, profilo Instagram, presentazione e collegamento al portfolio. Usiamo questi dati per rispondere alle richieste e valutare le proposte, sulla base del legittimo interesse a gestire le comunicazioni (lett. f) o, quando la richiesta riguarda una possibile collaborazione contrattuale, per adottare misure precontrattuali su tua richiesta (lett. b).</li>
          <li><strong>Collaborazioni e pubblicazioni.</strong> Per organizzare la collaborazione e pubblicare i contenuti concordati possiamo trattare dati di contatto, nome, biografia, fotografia, opere e crediti. La base giuridica è l’esecuzione degli accordi con l’interessato (lett. b) o il consenso, quando richiesto (lett. a). Nomi, immagini e altri dati inclusi nei contenuti concordati possono diventare pubblici sul sito.</li>
          <li><strong>Jobs.</strong> Per le candidature raccogliamo nome, email, posizione scelta ed eventuale messaggio. Per le richieste aziendali raccogliamo nome dell’azienda, email di contatto, titolo, sede e descrizione della posizione. Il trattamento serve a gestire gli invii, le comunicazioni e la pubblicazione degli annunci approvati, sulla base del legittimo interesse a gestire il servizio Jobs richiesto dagli utenti (lett. f). L’email di contatto resta riservata. Nell’annuncio approvato sono pubblici azienda, posizione, sede e descrizione.</li>
          <li><strong>Avviso di lancio.</strong> Se scegli di ricevere l’avviso di lancio, trattiamo il tuo indirizzo email e lo stato dell’iscrizione per inviarti l’avviso richiesto, sulla base del tuo consenso (lett. a). Puoi revocarlo scrivendo a <StudioEmail /> o utilizzando il link di disiscrizione, se presente nel messaggio.</li>
          <li><strong>Obblighi di legge e tutela dei diritti.</strong> Quando necessario, trattiamo i dati per adempiere a obblighi di legge (lett. c) o per accertare, esercitare o difendere un diritto (lett. f).</li>
        </ul>
      </PolicySection>

      <PolicySection title="Conferimento dei dati e decisioni automatizzate">
        <p>L’invio dei dati è facoltativo. Senza le informazioni necessarie, potremmo non riuscire a rispondere, valutare la proposta o gestire l’invio tramite Jobs e l’avviso di lancio. Invia solo i dati pertinenti e ometti le informazioni sensibili o i dati di terzi superflui.</p>
        <p>Le decisioni editoriali e l’approvazione degli annunci sono gestite da persone. I controlli automatici sui moduli servono a validare gli invii e a prevenire spam e duplicati.</p>
      </PolicySection>

      <PolicySection title="Conservazione">
        <ul>
          <li>Le richieste di contatto sono conservate per il tempo necessario a gestirle e fino a 6 mesi dalla chiusura della comunicazione.</li>
          <li>Le proposte editoriali non selezionate sono conservate fino a 12 mesi dalla ricezione.</li>
          <li>I dati di collaborazione sono conservati per la durata della collaborazione e per il tempo necessario a gestire gli accordi. I dati inclusi in contenuti pubblicati possono restare disponibili per il periodo di pubblicazione concordato.</li>
          <li>I dati di Jobs sono conservati per il tempo necessario alla valutazione e alla gestione della richiesta o della posizione, incluse le eventuali comunicazioni successive alla sua chiusura.</li>
          <li>L’indirizzo per l’avviso di lancio è utilizzato fino al completamento dell’invio o alla revoca del consenso. Dopo la revoca possono essere conservate le informazioni necessarie a rispettare la disiscrizione o documentare la scelta.</li>
          <li>I log tecnici sono conservati secondo le impostazioni e i periodi applicabili ai servizi utilizzati, per il tempo necessario a gestire il funzionamento e gli incidenti di sicurezza.</li>
        </ul>
        <p>Una conservazione ulteriore può essere necessaria per adempiere a obblighi di legge o per la tutela dei diritti.</p>
      </PolicySection>

      <PolicySection title="Chi può accedere ai dati">
        <p>I dati sono accessibili alla titolare e alle persone autorizzate nella misura necessaria alle rispettive attività. Il sito e le comunicazioni si appoggiano a questi fornitori.</p>
        <ul>
          <li><strong>Vercel</strong> ospita il sito ed esegue le route server che ricevono e inoltrano le richieste dei moduli Jobs e avviso di lancio. <a href="https://vercel.com/legal/privacy-policy">Informativa Vercel</a></li>
          <li><strong>Cloudflare</strong> fornisce R2 per l’archiviazione delle foto e servizi per la distribuzione delle immagini. Può trattare dati tecnici relativi alle richieste di immagini. <a href="https://www.cloudflare.com/privacypolicy/">Informativa Cloudflare</a></li>
          <li><strong>Supabase</strong> gestisce il database dei contenuti editoriali, delle richieste e candidature Jobs e delle iscrizioni all’avviso di lancio. Fornisce anche le funzioni server dei moduli e l’autenticazione dell’area amministrativa. <a href="https://supabase.com/privacy">Informativa Supabase</a></li>
          <li><strong>Google Gmail</strong> gestisce la casella utilizzata per la corrispondenza, incluse le proposte editoriali e le relative risposte. <a href="https://policies.google.com/privacy?hl=it">Informativa Google</a></li>
        </ul>
        <p>I fornitori accedono ai dati nei limiti necessari a prestare i rispettivi servizi e secondo i ruoli applicabili. I dati possono essere comunicati alle autorità quando richiesto dalla legge.</p>
      </PolicySection>

      <PolicySection title="Trasferimenti fuori dallo Spazio economico europeo">
        <p>I fornitori e i loro subfornitori possono trattare dati anche fuori dallo Spazio economico europeo, inclusi gli Stati Uniti. Ove applicabile, i trasferimenti si fondano su una decisione di adeguatezza della Commissione europea (art. 45 GDPR) o su garanzie appropriate come le clausole contrattuali tipo (art. 46 GDPR). Per informazioni sulle destinazioni, sulle garanzie applicabili al trattamento o per ottenere una copia delle garanzie, scrivi a <StudioEmail />.</p>
        <p>Documentazione contrattuale dei fornitori: <a href="https://vercel.com/legal/dpa">Vercel</a>, <a href="https://www.cloudflare.com/cloudflare-customer-dpa/">Cloudflare</a> e <a href="https://supabase.com/legal/dpa">Supabase</a>.</p>
      </PolicySection>

      <PolicySection title="I tuoi diritti">
        <p>Nei casi previsti dagli artt. 15–22 del GDPR, puoi chiedere accesso ai dati, rettifica, cancellazione, limitazione o portabilità. Puoi opporti al trattamento basato sul legittimo interesse. Se il trattamento si basa sul consenso, puoi revocarlo in qualsiasi momento, senza effetti sulla liceità del trattamento precedente alla revoca.</p>
        <p>Per esercitare i tuoi diritti scrivi a <StudioEmail />. Puoi inoltre presentare un reclamo al <a href="https://www.garanteprivacy.it/">Garante per la protezione dei dati personali</a> o all’autorità competente.</p>
      </PolicySection>

      <PolicySection title="Cookie e aggiornamenti">
        <p>Per i dettagli sui cookie e sulle tecnologie analoghe, consulta la <Link href="/cookie-policy">Cookie Policy</Link>. Gli aggiornamenti all’informativa vengono pubblicati su questa pagina con la relativa data.</p>
      </PolicySection>
    </PolicyPage>
  );
}

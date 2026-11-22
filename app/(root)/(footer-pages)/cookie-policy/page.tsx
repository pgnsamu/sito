import type { Metadata } from "next";
import Link from "next/link";
import { PolicyPage, PolicySection, StudioEmail } from "../PolicyPage";

export const metadata: Metadata = { title: "Cookie Policy | New Guard Studio" };

export default function Page() {
  return (
    <PolicyPage title="Cookie Policy">
      <PolicySection title="Cookie e tecnologie analoghe">
        <p>I cookie sono piccoli dati che un sito può memorizzare nel browser. Possono servire a mantenere una sessione o a proteggere il servizio. Le pagine pubbliche di New Guard Studio sono configurate senza cookie pubblicitari, pixel di profilazione o strumenti di analisi del traffico integrati nell’applicazione.</p>
      </PolicySection>

      <PolicySection title="Cookie tecnici">
        <ul>
          <li><strong>Supabase Auth · <code>sb-…-auth-token</code></strong>, eventualmente suddiviso in più cookie numerati. È usato per conservare la sessione degli utenti autorizzati che accedono all’area amministrativa. La durata massima configurata dal client è di 400 giorni dalla scrittura del cookie. La validità della sessione e dei token segue le impostazioni di autenticazione e può terminare prima.</li>
          <li><strong>Servizi di infrastruttura.</strong> Se sui domini utilizzati sono attive protezioni di accesso o antiabuso, il browser può ricevere cookie tecnici dal relativo servizio. Le finalità e le durate delle funzioni opzionali sono descritte nella <a href="https://developers.cloudflare.com/fundamentals/reference/policies-compliances/cloudflare-cookies/">documentazione Cloudflare</a> e nella <a href="https://vercel.com/docs/deployment-protection">documentazione Vercel</a>.</li>
        </ul>
        <p>Per i cookie strettamente necessari a fornire un servizio richiesto dall’utente non è richiesto il consenso. Per maggiori informazioni consulta le <a href="https://www.garanteprivacy.it/faq/Cookie">FAQ del Garante sui cookie</a>.</p>
      </PolicySection>

      <PolicySection title="Gestione nel browser e siti esterni">
        <p>Nelle impostazioni del browser puoi consultare, cancellare o bloccare i cookie. Il blocco dei cookie tecnici può impedire l’autenticazione o il funzionamento di servizi protetti. Se segui un collegamento esterno, come un link a Instagram o a un portfolio, si applicano le informative di quel sito.</p>
      </PolicySection>

      <PolicySection title="Contatti e aggiornamenti">
        <p>La titolare è Iris Garbini. Per domande scrivi a <StudioEmail />. Per le informazioni sul trattamento dei dati di navigazione e sui tuoi diritti consulta la <Link href="/privacy-policy">Privacy Policy</Link>. Eventuali aggiornamenti vengono pubblicati su questa pagina con la relativa data.</p>
      </PolicySection>
    </PolicyPage>
  );
}

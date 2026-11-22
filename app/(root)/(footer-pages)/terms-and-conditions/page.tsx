import type { Metadata } from "next";
import Link from "next/link";
import { PolicyPage, PolicySection, StudioEmail } from "../PolicyPage";

export const metadata: Metadata = { title: "Terms & Conditions | New Guard Studio" };

export default function Page() {
  return (
    <PolicyPage title="Terms &amp; Conditions">
      <PolicySection title="Il progetto e questi termini">
        <p>New Guard Studio è un progetto editoriale indipendente fondato e gestito da Iris Garbini. Il sito presenta contenuti, portfolio e collaborazioni dedicate alla moda e alla cultura visiva. Questi termini disciplinano l’accesso al sito e l’uso delle sue funzionalità.</p>
      </PolicySection>

      <PolicySection title="Utilizzo del sito">
        <p>Puoi consultare i contenuti nel rispetto della legge e dei diritti dei rispettivi titolari. È vietato usare il sito per attività illecite, compromettere il suo funzionamento o la sua sicurezza, inviare spam o usare i moduli per trasmettere materiali che violano diritti di terzi.</p>
      </PolicySection>

      <PolicySection title="Proposte e collaborazioni editoriali">
        <p>Le modalità di invio e i criteri di selezione sono descritti nelle <Link href="/submissions">Submission Guidelines</Link>. Chi invia materiali deve avere il diritto di condividerli. L’invio consente a New Guard Studio di esaminarli per la selezione. La pubblicazione, gli eventuali compensi, i crediti e gli altri usi editoriali sono definiti in accordi specifici.</p>
        <p>La selezione può portare a un profilo, a un’intervista o alla pubblicazione di una selezione di opere. L’invio di una proposta non garantisce una risposta, la pubblicazione o una collaborazione. La presenza sul sito non dà origine, di per sé, a un rapporto di lavoro, di rappresentanza o di collaborazione continuativa.</p>
      </PolicySection>

      <PolicySection title="Annunci e candidature Jobs">
        <p>Su <Link href="/jobs">Jobs</Link> le aziende possono proporre annunci e le persone interessate possono candidarsi alle posizioni pubblicate. Le richieste aziendali sono esaminate prima della pubblicazione. Chi invia un annuncio è responsabile dell’accuratezza delle informazioni e della legittimità dei contenuti forniti.</p>
        <p>New Guard Studio gestisce la pubblicazione degli annunci e la ricezione delle candidature. La decisione sull’eventuale assunzione spetta all’azienda interessata. La pubblicazione di un annuncio o l’invio di una candidatura non garantisce un colloquio o un’offerta di lavoro.</p>
      </PolicySection>

      <PolicySection title="Proprietà intellettuale e crediti">
        <p>I diritti sui testi, sulla grafica, sulle fotografie, sui progetti e sugli altri materiali spettano ai rispettivi titolari. Per gli utilizzi consentiti e per segnalare un’attribuzione inesatta, consulta <Link href="/copyright-and-credits">Copyright &amp; Credits</Link>.</p>
      </PolicySection>

      <PolicySection title="Contenuti, disponibilità e link esterni">
        <p>New Guard Studio può correggere, aggiornare o rimuovere contenuti per esigenze editoriali o tecniche, per rispettare gli accordi di pubblicazione o per tutelare diritti di terzi. Per segnalare errori o chiedere una modifica, scrivi a <StudioEmail /> indicando il contenuto e il collegamento alla pagina.</p>
        <p>Il sito può essere temporaneamente indisponibile per manutenzione o problemi tecnici. I portfolio e i profili social raggiungibili tramite collegamenti esterni sono gestiti dai rispettivi fornitori e soggetti alle loro condizioni. Restano ferme le responsabilità previste dalle norme inderogabili.</p>
      </PolicySection>

      <PolicySection title="Dati personali">
        <p>Per sapere come vengono trattati i dati personali e quali tecnologie usa il sito, consulta la <Link href="/privacy-policy">Privacy Policy</Link> e la <Link href="/cookie-policy">Cookie Policy</Link>.</p>
      </PolicySection>

      <PolicySection title="Legge applicabile e aggiornamenti">
        <p>Si applica la legge italiana, fatte salve le norme inderogabili applicabili e le regole di legge sulla competenza giudiziaria. Gli aggiornamenti sono pubblicati su questa pagina con la relativa data. Restano salvi i diritti acquisiti in base agli accordi già conclusi.</p>
        <p>Per domande sui termini puoi contattare Iris Garbini, responsabile di New Guard Studio, a <StudioEmail />.</p>
      </PolicySection>
    </PolicyPage>
  );
}

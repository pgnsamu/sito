import type { Metadata } from "next";
import Link from "next/link";
import { PolicyPage, PolicySection, StudioEmail } from "../PolicyPage";

export const metadata: Metadata = { title: "Copyright & Credits | New Guard Studio" };

export default function Page() {
  return (
    <PolicyPage title="Copyright &amp; Credits">
      <PolicySection title="Diritti sui contenuti">
        <p>Testi editoriali, identità visiva, impaginazioni, fotografie, illustrazioni, progetti di moda e altri contributi pubblicati su New Guard Studio sono tutelati dalla normativa applicabile. I diritti spettano ai rispettivi autori o titolari, secondo la legge e gli accordi conclusi. La pubblicazione sul sito lascia invariata la titolarità delle opere, salvo accordi espressi.</p>
      </PolicySection>

      <PolicySection title="Crediti e produzioni editoriali">
        <p>I crediti sono riportati nelle pubblicazioni secondo i contributi, le informazioni disponibili e gli accordi con le persone coinvolte. Possono includere fotografi, designer, stylist, art director, make-up artist, hair stylist, persone ritratte e altri collaboratori.</p>
        <p>Nelle produzioni originali, i diritti sulle singole opere e i diritti delle persone ritratte sono disciplinati dalla normativa e dalle autorizzazioni applicabili. La direzione creativa del progetto, da sola, non trasferisce i diritti sui singoli contributi.</p>
      </PolicySection>

      <PolicySection title="Consultazione, condivisione e riproduzione">
        <p>Puoi consultare i contenuti e condividere i link alle pagine pubbliche del sito. Per riprodurre, ripubblicare, modificare o distribuire materiali protetti occorre ottenere le autorizzazioni richieste dai rispettivi titolari, salvo gli utilizzi consentiti dalla legge. L’attribuzione dell’autore o della fonte non sostituisce un’autorizzazione quando è richiesta.</p>
        <p>Per richieste di utilizzo editoriale, scrivi a <StudioEmail /> indicando il materiale e l’uso previsto.</p>
      </PolicySection>

      <PolicySection title="Materiali inviati allo studio">
        <p>Lo studio esamina i materiali ricevuti per valutare le proposte. I diritti rimangono ai rispettivi titolari e ogni utilizzo editoriale viene concordato. Se una proposta comprende opere di terzi, indica gli autori e i titolari dei diritti per consentire la verifica delle autorizzazioni. Consulta le <Link href="/submissions">Submission Guidelines</Link> per le modalità di invio.</p>
      </PolicySection>

      <PolicySection title="Segnalazioni e rettifiche">
        <p>Per segnalare un credito inesatto, un uso non autorizzato o una violazione relativa a un’immagine, scrivi a <StudioEmail />. Indica il link alla pagina, il materiale interessato e il motivo della richiesta. New Guard Studio esaminerà la segnalazione e, quando necessario, correggerà i crediti, modificherà o rimuoverà il contenuto.</p>
      </PolicySection>
    </PolicyPage>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { PolicyPage, PolicySection, StudioEmail, StudioInstagram } from "../PolicyPage";

export const metadata: Metadata = { title: "Contact | New Guard Studio" };

export default function Page() {
  return (
    <PolicyPage title="Contact" dated={false}>
      <PolicySection title="New Guard Studio">
        <p>Per informazioni, collaborazioni e segnalazioni, scrivi a <StudioEmail />.</p>
        <p>Instagram <StudioInstagram /></p>
        <p>Per proporre il tuo lavoro, consulta le <Link href="/submissions">Submission Guidelines</Link>.</p>
      </PolicySection>
    </PolicyPage>
  );
}

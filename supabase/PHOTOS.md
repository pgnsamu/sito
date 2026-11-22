# Foto su Cloudflare R2

Il sito rimane su Vercel. Supabase gestisce autenticazione, metadati e associazioni;
R2 conserva i file. Il pannello admin supporta JPEG, PNG e WebP fino a 10 MB per
artisti e opere, con anteprima, sostituzione e rimozione. Un’opera richiede una foto.
Gli URL esterni esistenti continuano a funzionare e non vengono eliminati da R2.

## 1. Rendi disponibili le foto senza acquistare un dominio

Il Worker incluso espone solo le foto pubblicate in `artists/` e `works/`, senza
esporre `_uploads/` o permettere scritture pubbliche. Il bucket può restare privato.

1. In `workers/photo-delivery/wrangler.jsonc`, sostituisci `bucket_name` con il nome
   del bucket esistente. Per un bucket con giurisdizione EU aggiungi
   `"jurisdiction": "eu"` nello stesso oggetto del binding.
2. Accedi a Cloudflare e distribuisci il Worker:

   ```bash
   npx wrangler login
   npx wrangler deploy --config workers/photo-delivery/wrangler.jsonc
   ```

3. Conserva l’indirizzo restituito, per esempio
   `https://sito-foto.nome-account.workers.dev`. Sarà `R2_PUBLIC_URL`.

Per i primi test puoi anche abilitare il Public Development URL del bucket e usare
`https://pub-….r2.dev`, senza distribuire il Worker. Cloudflare lo limita allo
sviluppo. `workers.dev` permette di iniziare senza dominio; per un servizio
commerciale critico Cloudflare raccomanda successivamente un dominio proprio.

## 2. Credenziali e regole del bucket

In R2 → Manage API Tokens crea credenziali **Object Read & Write** limitate al tuo
bucket. Copia Access Key ID, Secret Access Key e l’endpoint S3 fornito da Cloudflare.
L’endpoint include `.eu` se hai scelto la giurisdizione EU.

In Bucket → Settings → CORS configura (sostituendo l’URL Vercel):

```json
[
  {
    "AllowedOrigins": ["http://localhost:3000", "https://TUO-SITO.vercel.app"],
    "AllowedMethods": ["PUT"],
    "AllowedHeaders": ["Content-Type"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

Aggiungi anche gli URL di preview Vercel che vuoi utilizzare. Gli origin devono
corrispondere all’indirizzo della pagina, senza slash finale o percorsi.

In **Object lifecycle rules** aggiungi una regola che elimini gli oggetti con
prefisso `_uploads/` dopo un giorno. Serve a rimuovere gli upload interrotti e
quelli eventualmente ripetuti prima della scadenza dell’URL temporaneo.
Non applicare questa regola ai prefissi `artists/` e `works/`.

## 3. Configura Supabase e applica la migrazione

Copia `supabase/.env.r2.example` in `supabase/.env.r2.local` e inserisci i valori.
Questo file è ignorato da Git. Le chiavi R2 non devono entrare nelle variabili
`NEXT_PUBLIC_*` o essere inviate in chat.

Dalla radice del progetto, collegato al progetto Supabase corretto:

```bash
npx supabase secrets set --env-file supabase/.env.r2.local
npx supabase db push
npx supabase functions deploy admin-photos
npx supabase functions deploy create-artist
npx supabase functions deploy update-artist
npx supabase functions deploy create-work
npx supabase functions deploy update-work
npx supabase functions deploy delete-artist
npx supabase functions deploy delete-work
```

Applica prima la migrazione: aggiunge `photo_assets`, `photo_deletions`, `image_key`
e aggiorna la funzione atomica di creazione artisti con ruoli. Le nuove tabelle
sono accessibili solo al backend con service role. Le funzioni verificano il token
con Supabase Auth e richiedono `app_metadata.role = 'admin'`; il controllo JWT del
gateway è disattivato per queste funzioni per supportare anche le chiavi asimmetriche.

## 4. Configura Vercel e l’ambiente locale

Aggiungi `R2_PUBLIC_URL` a `.env.local` e alle variabili Vercel negli ambienti
utilizzati. Usa lo stesso valore dei segreti Supabase, senza slash finale.
Le variabili Supabase già presenti restano necessarie. Vedi `.env.example`.

Riavvia `npm run dev` e ridistribuisci il sito su Vercel: Next.js usa questa
variabile durante la build per autorizzare il dominio esatto in `next/image`.
Su Vercel non servono le chiavi segrete R2.

## Comportamento e pulizia

- Il browser ottiene un URL PUT valido per cinque minuti dopo la verifica admin.
- Il file va in `_uploads/`. Il backend legge al massimo 10 MB, controlla
  dimensione e firma del formato e lo pubblica con una chiave UUID separata.
  Questo controllo verifica il formato di base; non è una scansione antivirus
  né una decodifica completa dell’immagine. Il browser verifica anche che la foto
  sia decodificabile prima del caricamento.
- Una seconda chiamata di completamento restituisce la foto già pronta. L’URL
  temporaneo non può sovrascrivere il file pubblicato.
- Il modulo salva `image_key` e `url_image`. Il database accetta solo foto R2 pronte
  e ricava l’URL dai metadati verificati. I precedenti URL esterni restano supportati.
- La sostituzione o l’eliminazione di un record accoda la vecchia foto per la pulizia,
  anche quando l’operazione avviene fuori dal pannello. Le chiavi esterne non vengono
  eliminate. I vincoli impediscono di cancellare foto ancora associate ad altri record.
- Il pannello tenta la pulizia dopo ogni salvataggio/eliminazione. Se R2 non è
  raggiungibile la coda resta disponibile per il tentativo successivo.
- **Pulisci foto inutilizzate** riprova la coda e rimuove fino a 25 bozze abbandonate
  da oltre 24 ore, oltre a processare fino a 50 file della coda per chiamata. Ripeti
  se rimangono file. Non è necessario configurare un job periodico per iniziare.
- Le foto sono pubbliche e hanno cache lunga. La cancellazione non revoca eventuali
  copie già in cache. Non usare questo flusso per documenti o foto riservate.

## Verifica dopo il collegamento

1. Crea un artista con foto e ruoli, salva e ricarica la pagina.
2. Crea un’opera con foto; verifica la foto anche nella pagina pubblica dell’artista.
3. Sostituisci la foto, salva e verifica che la nuova rimanga dopo il refresh.
4. Rimuovi la foto di un artista oppure elimina un’opera; verifica la pulizia su R2.
5. Prova un file non supportato, un file oltre 10 MB e un utente non admin.

Test locali: `node --test tests/*.test.mjs` e `npx tsc --noEmit`.
I test Edge usano R2 e Supabase simulati; la verifica reale richiede il bucket,
i segreti, la migrazione e le funzioni distribuite.

Riferimenti ufficiali:
- https://developers.cloudflare.com/r2/api/s3/presigned-urls/
- https://developers.cloudflare.com/r2/buckets/cors/
- https://developers.cloudflare.com/r2/api/workers/workers-api-usage/
- https://developers.cloudflare.com/workers/configuration/routing/workers-dev/

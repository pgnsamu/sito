# Jobs

La pagina `/jobs` contiene un form per candidarsi e un form alternativo per inviare richieste aziendali. L’admin gestisce richieste e candidature nelle nuove schede della dashboard.

## Attivazione

Dalla radice del progetto, con la CLI autenticata al progetto Supabase corretto:

```sh
npx supabase login
npx supabase migration list --linked
npx supabase db push --linked --dry-run
npx supabase db push --linked
npx supabase functions deploy jobs
```

Verificare la cronologia delle migrazioni remote prima del push: questa repository non contiene migrazioni delle tabelle preesistenti. Non eseguire reset del database né riparazioni della cronologia senza confrontare lo schema remoto.

La funzione usa SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY fornite automaticamente da Supabase; la chiave service role non va nel frontend. Il sito usa le variabili NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY già previste nel progetto.

`verify_jwt = false` consente i due invii pubblici. Le azioni admin list/save/delete verificano autonomamente il token con auth.getUser e richiedono app_metadata.role = admin. Le email non sono incluse nella risposta GET pubblica. RLS impedisce letture anonime delle tabelle e scritture dirette dal browser.

Le richieste pubbliche vengono sempre salvate come pending, indipendentemente dallo stato ricevuto. Le candidature sono accettate solo per posizioni pubblicate; una email può candidarsi una sola volta per posizione. La cancellazione di un annuncio conserva le candidature e una copia del titolo/azienda. Il form include un honeypot; non sostituisce un servizio di rate limiting o CAPTCHA in caso di spam.

## Verifica dopo il deploy

1. Inviare una richiesta aziendale da /jobs: deve apparire solo nell’admin come Da approvare.
2. Modificarla e pubblicarla: deve apparire nel selettore pubblico, senza email aziendale.
3. Inviare una candidatura: verificare nome/email/messaggio nella scheda Candidature.
4. Ripetere con la stessa email: deve essere rifiutata come duplicata.
5. Chiudere la posizione: non deve più accettare candidature.
6. Eliminare l’annuncio: le candidature devono rimanere consultabili.
7. Verificare che list/save/delete senza JWT o con un utente non admin restituiscano 401/403.

# Kroky, které musí udělat Radek

Postupně a s odškrtáváním. U všeho, co ukáže konzole, pošli screenshot, ať ti dám přesné další kroky. Klíče ani hesla nikdy neposílej do chatu.

## 1. Název v e-mailech a přihlášení (Firebase konzole)
1. console.firebase.google.com → projekt **navigator-pece** → **Authentication** → **Settings** → **Project settings** (ozubené kolo → Project settings → General).
2. Políčko **Public-facing name** přepiš na **Opatruj**. Ulož.
3. **Authentication → Templates**: u „Email address verification“ a „Password reset“ klikni na tužku, nastav jazyk na **Čeština** a jako název odesílatele **Opatruj**. Text šablony nech výchozí český, případně ho pošli ke kontrole.

## 2. Domény (opatruj.cz = web, app.opatruj.cz = appka)
Architektura je v `docs/DOMENY.md`. Postup:
1. Kup opatruj.cz u registrátora (s přístupem do správy DNS).
2. Site `opatruj-web` (marketingový web) už je založená, appka má site `navigator-pece`.
3. U site `navigator-pece`: **Add custom domain** → `app.opatruj.cz`. U site `opatruj-web`: **Add custom domain** → `opatruj.cz` (a `www.opatruj.cz` jako přesměrování na `opatruj.cz`). U každé domény ti konzole ukáže DNS záznamy: pošli mi screenshot, přepíšu je do tvaru pro tvého registrátora.
4. Záznamy zadej u registrátora v DNS. DNSSEC nech vypnutý, dokud nebude web ověřený.
5. Po vystavení certifikátu (až hodiny) napiš, ověřím všechny tři adresy.
6. **Authentication → Settings → Authorized domains → Add domain**: `app.opatruj.cz` (jinak nepůjde přihlášení). `opatruj.cz` sem přidávat nemusíš, přihlašuje se jen v appce.
7. U registrátora zřiď přesměrování e-mailu `podpora@opatruj.cz` na svůj e-mail.
8. Chceš koupit do zásoby i opatruj.sk? Dej vědět, domény `vklidu.*` a `pecujvklidu.cz` se nekupují.

## 3. Automatické testy a náhledy (GitHub)
1. Google Cloud Console → projekt navigator-pece → **IAM a správa → Servisní účty → Vytvořit**: název `github-hosting`, role **Firebase Hosting Admin**.
2. Na účtu: **Klíče → Přidat klíč → JSON**. Soubor se stáhne, **nikam ho neposílej ani nenahrávej do repa**.
3. GitHub → repo navigator-pece → **Settings → Secrets and variables → Actions → New repository secret**: název `FIREBASE_SERVICE_ACCOUNT`, hodnota = celý obsah toho JSON souboru. Pak soubor smaž z počítače.
4. **Settings → Environments → New environment** `production` → zapni **Required reviewers** a přidej sebe. Produkční deploy pak vždy čeká na tvoje schválení.

## 4. Logo a značka
1. Obsahuje PNG loga text „V klidu“? Pokud ano, zadání pro ChatGPT: *„Logo: jedna plynulá linka vychází ze zamotaného klubka vlevo a končí rovně u zlatého kruhového bodu světla vpravo. Barvy #2C4A4E (linka), #D9A441 (bod), pozadí průhledné. Bez textu. Varianta 2: pod symbolem slovo ‚Opatruj‘ vyváženým bezpatkovým písmem (Work Sans), barva #2C4A4E.“* Symbol bez textu jde použít hned.
2. Před větší reklamou nech zkontrolovat ochrannou známku „Opatruj“ (třídy 9, 42, 44) v databázi ÚPV (isdv.upv.cz) a EUIPO TMview, ideálně s právníkem. Známá rizika: slovenský OPATRIO (aplikace pro domácí péči) a slovo „opatrovať“ v nabídkách práce na Slovensku. Riziko záměny je nízké.

## 5. Schválit
- Tagline „Opatruj své blízké. A sebe taky.“
- Změnu `appId` na `cz.growea.opatruj` (nevratná po vydání na Google Play, zatím nic nevydáno).

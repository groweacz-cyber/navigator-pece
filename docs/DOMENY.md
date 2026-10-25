# Domény a distribuce (rozhodl Radek 2026-10-25)

| Adresa | Co to je | Kde běží |
|---|---|---|
| **opatruj.cz** | marketingový web (landing, zásady, podmínky, kontakt), indexuje se | Firebase Hosting, site `opatruj-web`, cíl `web`, složka `web/` |
| **app.opatruj.cz** | webová appka (přihlášení, deník, podklady), neindexuje se nikdy | Firebase Hosting, site `navigator-pece`, cíl `app`, výstup Vite `dist/` |
| **appka ke stažení** | samostatná nativní appka (Android přes Capacitor, `cz.growea.opatruj`), stejný kód a backend; odkaz z opatruj.cz | Google Play (iOS zvážit později) |

## Důsledky
- **Jeden projekt Firebase, dvě Hosting site.** Cíle jsou v `.firebaserc` (`app` → `navigator-pece`, `web` → `opatruj-web`), konfigurace v `firebase.json` (pole `hosting`). Nasazení appky: `firebase deploy --only hosting:app`, webu: `--only hosting:web`. `npm run deploy:prod` nasazuje jen appku.
- **Přihlášení:** v Authentication → Authorized domains musí být `app.opatruj.cz`. Marketingový web se nepřihlašuje.
- **Pozvánky** (`/?pozvanka=…`) se skládají z `window.location.origin`, takže v appce vedou na app.opatruj.cz. V nativní appce je origin jiný: až bude Android build, odkaz musí používat pevnou adresu `https://app.opatruj.cz` (a appka ho musí umět otevřít, Android App Links). Řešit v D1.
- **Nativní appka** balí stejný build (`dist/`) do Capacitoru, volá stejné funkce a Firestore. Nezávisí na doméně, jen na Firebase konfiguraci.
- **Web odkazuje na obojí:** „Otevřít v prohlížeči“ (app.opatruj.cz) a „Stáhnout appku“ (Google Play, až bude).
- **SEO:** indexuje se jen opatruj.cz. Appka má `X-Robots-Tag: noindex` trvale, web do spuštění (hlavičku odstranit při spuštění).
- **Site `opatruj-web` je založená** (2026-10-25, zdarma, schváleno Radkem), zatím bez nasazeného obsahu: https://opatruj-web.web.app. Vlastní domény se připojují až po koupi.

## Stav připojení (2026-10-25, Radek koupil opatruj.cz u Forpsi)
- **Nasazeno** (schváleno): `hosting:app` → navigator-pece.web.app (přejmenovaná appka Opatruj, noindex), `hosting:web` → opatruj-web.web.app (zástupná stránka, noindex).
- **DNS u Forpsi** (nastaveno přes jejich správu DNS): `A opatruj.cz → 199.36.158.100` (původně 81.2.196.19), `TXT opatruj.cz = hosting-site=opatruj-web`, `CNAME app.opatruj.cz → navigator-pece.web.app`. Wildcard `*.opatruj.cz CNAME opatruj.cz` zůstal (www tak míří na opatruj.cz, ale pro HTTPS je potřeba přidat `www.opatruj.cz` jako doménu ve Firebase). Poštovní server Forpsi nezměněn. **DNSSEC u domény je zapnutý** (nechal jsem beze změny).
- **Firebase:** domény přidané v obou site, v Authentication → Authorized domains přidáno `app.opatruj.cz`.
- **HTTPS funguje na obou adresách** (ověřeno 2026-10-25, certifikáty platné, 200 OK): https://app.opatruj.cz (Opatruj, noindex) a https://opatruj.cz (zástupná stránka, noindex). `www.opatruj.cz` ve Firebase zatím není přidané.

## Marketingový web (nasazeno 2026-10-25 na opatruj.cz, větev `web-opatruj`, PR 22)
- Statický web bez JavaScriptu ve složce `web/`: úvodní stránka (problém, jak to funguje, co umí, pro koho, bezpečnost dat, časté otázky, výzva k akci), `/kontakt`, `/zasady-ochrany-osobnich-udaju`, `/obchodni-podminky`. Písmo Work Sans lokálně, dočasná značka `favicon.svg` (do příchodu loga). Náhled: `npm run web` (http://localhost:5190).
- Nasazení: `firebase deploy --only hosting:web`. Na opatruj.cz běží úvod a kontakt, s `noindex`. **Zásady ochrany osobních údajů a obchodní podmínky jsou z webu vyřazené**, návrhy jsou v `docs/navrhy-pravnich-stranek/` (čekají na schválení a právníka). Pozor: adresa podpora@opatruj.cz na webu musí u Forpsi skutečně fungovat.
- Ceník na webu zatím není (cena není rozhodnutá), místo toho je v časté otázce „Kolik Opatruj stojí?“ věta, že cenu oznámíme před zpoplatněním.
- Chybí: `og:image` 1200×630 (čeká na logo), formulář pro e-mailové oznámení spuštění (vyžaduje rozhodnutí, kam se e-maily ukládají, a souhlas se zpracováním), appka pro Android (odkaz „stáhnout“ přibude po vydání).
- Při ostrém spuštění: odstranit `<meta name="robots" content="noindex">` ve všech stránkách, hlavičku `X-Robots-Tag` u cíle `web` v `firebase.json`, `Disallow: /` v `web/robots.txt` a odkomentovat Sitemap.

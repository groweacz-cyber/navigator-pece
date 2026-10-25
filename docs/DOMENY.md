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

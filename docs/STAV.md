# Stav projektu

Aktualizováno 2026-10-25 (větev `stabilizace`, nezmergováno do `main`).

## Nasazeno v produkci (2026-10-25, se souhlasem Radka)
- Funkce v `europe-west1`, Node 22: `zalozitRodinu`, `vytvoritPozvanku`, `prijmoutPozvanku`, `generovatPripravuNaSetreni` (nové) a `klasifikovatZaznam` (přepsaná na místě, trigger zůstal v eur3). Callable funkce jsou veřejně volatelné a bez přihlášení vrací 401 z kódu funkce, ne 403 z IAM.
- Firestore pravidla, index `notes` (osobaId + vytvoreno) a Storage pravidla.
- Nasazením se zapnulo API Firebase Extensions a v Artifact Registry se nastavilo mazání starých obrazů po 1 dni (obojí zdarma / šetří náklady).
- **Funkce `acceptInvite` se jmenuje `prijmoutPozvanku`**, protože služba `acceptinvite` ve Cloud Run už existuje a smazat ji bez souhlasu nešlo.

## Dávka 3 (nasazená v produkci)
- **Detekce zhoršení** (C3): záložka Vývoj porovná posledních 30 dní s předchozími 30 podle třídění deníku (včetně ruční opravy). Ukáže nové oblasti s potížemi, oblasti, kde potíží přibývá nebo jsou těžší ("s pomocí" → "nezvládá"), zlepšení, a když orientační stupeň vyjde vyšší, upozorní, že lze požádat úřad práce o nové posouzení. Server: funkce `vyhodnotitVyvoj` (jen pečovatel a člen), čistá logika `functions/src/vyvoj.js`, 9 unit testů. Pod 6 hodnocených zápisů za dva měsíce hlásí "málo dat".
- Nasazeno v produkci 2026-10-25: funkce `vyhodnotitVyvoj` (pravidla beze změny).

## Dávka 2 (nasazená v produkci, klient zatím běží jen lokálně)
- Ruční oprava třídění deníku (`rucniHodnoceni` přebíjí AI v zobrazení, odhadu i PDF), pravidla a testy.
- Správa členů: funkce `zmenitRoli` a `odebratClena` (pečovatel mění role a odebírá, kdokoli smí odejít, poslední pečovatel odejít nesmí).
- Rychlá karta pro nového pečovatele (čte i host), zdravotní poznámky v záložce Osoby, Rozložení péče (jen počty za 30 dní).
- `npm run seed` naplní emulátory ukázkovými daty (pecovatel@demo.cz, host@demo.cz, heslo demo1234).
- Nasazeno v produkci 2026-10-25: pravidla a funkce `zmenitRoli`, `odebratClena` (nové) a aktualizace ostatních.

## Hotové a ověřené v emulátorech (dávka 1, nasazeno)
- **Pravidla Firestore** opravená a pokrytá 26 testy (role × kolekce, negativní případy). `npm run test:rules`
- **Storage pravidla**: čtení PDF exportů jen pro pečovatele a členy, zápis jen server.
- **Funkce** (`functions/`, Node 22, region europe-west1): `zalozitRodinu`, `vytvoritPozvanku`, `prijmoutPozvanku`, `generovatPripravuNaSetreni`, trigger `klasifikovatZaznam`. Unit testy logiky (19) a integrační test celého řetězu v emulátorech (`npm run test:retezec`): registrace → rodina → pozvánka → přijetí → deník → klasifikace → PDF, včetně zamítnutí hosta a cizího uživatele.
- **Klient**: přihlášení, registrace, založení rodiny, výběr rodiny, přijetí pozvánky (odkaz nebo kód), záložky Deník (s AI štítky), Úkoly, Osoby (biografie, krizový plán), Kontakty, Podklady (PDF), Dokumenty (zatím jen evidence), Rodina (členové, pozvánky). Prošel jsem ho v prohlížeči proti emulátorům.
- **PDF** s českou diakritikou (Work Sans), upozornění „orientační“ v textu i v zápatí.
- Služby bez obrazovky: `health.js` (zdravotní záznamy).

## Neověřeno / chybí
- **Skutečné volání Anthropic** nebylo vyzkoušeno (klíč je jen v Secret Manageru, v emulátoru běží mock). Model v kódu je `claude-sonnet-5-5`, před ostrým během ověřit jedním voláním.
- Staré ruční Cloud Run služby `acceptinvite` a `generovatprava` zatím existují a nic nevolá (čekají na souhlas se smazáním). Služba `klasifikovatzaznam` je nahrazená novou verzí.
- Z produkce nebyl vyzkoušen žádný průchod (nevytvářel jsem testovací účty ani data). Ověřeno je jen, že funkce odpovídají.
- Nahrávání dokumentů do Storage, obrazovka pro zdravotní záznamy, ruční oprava AI kategorií, výmaz účtu, App Check.
- Klient běží na https://navigator-pece.web.app (Firebase Hosting, nasazeno 2026-10-25). Nasazení: `npm run build` a `firebase deploy --only hosting`.
- Android (Capacitor), ikona, zásady zpracování.

## Stav známých chyb (sekce 6 předání)
| # | Chyba | Stav |
|---|---|---|
| 1 | Založení rodiny nejde | **Opraveno** (funkce `zalozitRodinu`, pravidla), čeká na nasazení |
| 2 | Callable funkce vrací 403 / názvy | **Opraveno v kódu** (firebase-functions v2, veřejný invoker, názvy odpovídají klientovi), čeká na deploy |
| 3 | Node 20 končí | **Opraveno** (`engines: 22`). Poznámka: na tomhle stroji je Node 24, emulátor běží s ním. |
| 4 | `aiKategorie` zapisuje klient | **Opraveno + otestováno** |
| 5 | Chybí index | **Přidán** |
| 6 | `odhadnoutStupen` hrubý | **Předělán** (zvládá / s pomocí / nezvládá, min. 2 záznamy), metodika čeká na Radka |
| 7 | PDF bez diakritiky | **Opraveno** |
| 8 | Jedna rodina na uživatele | **Opraveno** (výběr rodiny) |
| 9 | UI pozvánky | **Hotovo** (odkaz platný 7 dní, jednorázový) |
| 10 | Dashboard jako obří obrazovka | **Rozděleno** na obrazovky, `documents` a další služby doplněny |
| 11 | Ochrana dat při volání Anthropic | Částečně: posílá se jen text záznamu. Smluvní rámec a souhlas čeká na Radka. |

## Rady (nasazeno 2026-11-17 v appce i na webu, PR 27)
- Záložka Rady a opatruj.cz/rady, texty ke kontrole fyzioterapeutem.

## Léky (nasazeno v produkci 2026-11-17: pravidla + app.opatruj.cz, větev `leky`, PR 26)
- Záložka Léky (jen pečovatel a člen): seznam léků u osoby (název, dávka, časy, poznámka), denní odškrtávání „podáno“ s údajem, kdo a kdy, možnost vzít zpět, přestat podávat. Data v `carePersons/{id}/leky` a `podani` (jako zdravotní údaje, host je nevidí). 4 nové testy pravidel. K nasazení: Firestore pravidla + klient (Hosting appky). Funkce beze změny.
- Zatím bez připomínek (notifikace přijdou s Androidem/PWA).

## Přehled (nasazeno 2026-11-19, PR 28)
- Úvodní záložka **Přehled**: dlaždice Dnešní léky (x z y, další dávka, zpožděné červeně), Deník za 7 dní s posledním zápisem, Úkoly, Rychlá karta, Vývoj stavu, Rodina, Rady. Host vidí jen úkoly, kartu, rodinu a rady. Bez nových dat a pravidel, jen klient.

## Nouzová karta a Jídelníček (nasazeno 2026-11-19, PR 29)
- **Nouzová karta** (jen plný přístup): datum narození, alergie, diagnózy, pojišťovna, praktik, 2 kontakty na rodinu, co říct záchranářům. Léky (aktivní) a kontakty na lékaře se berou z appky. Tlačítko pro tisk nebo uložení jako PDF (tisková šablona). Data v `carePersons/{id}/nouzova/karta`, host je nevidí.
- **Jídelníček** (jen plný přístup): týdenní plán (snídaně, svačina, oběd, večeře, poznámka), listování týdny, nahoře upozornění na alergie z nouzové karty. Data v `carePersons/{id}/jidelnicek/{YYYY-MM-DD}`.
- 4 nové testy pravidel (celkem 36). K nasazení: Firestore pravidla + klient.

## Rychlý zápis (nasazeno 2026-11-23, PR 30)
- V Deníku je 10 tlačítek s hotovými větami (snědl/a dobře, špatně spal/a, odmítl/a léky, upadl/a, bolest…). Klepnutí větu vloží do textu, jde je skládat a upravit. Jen klient, bez nových pravidel.
- **Diktování hlasem** zatím není: prohlížeč by posílal zvuk třetí straně (Google), takže jde o rozhodnutí o předávání dat mimo Firebase a Anthropic (Issue).

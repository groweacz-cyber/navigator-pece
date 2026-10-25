# Stav projektu

Aktualizováno 2026-10-25 (větev `stabilizace`, nezmergováno do `main`).

## Nasazeno v produkci (2026-10-25, se souhlasem Radka)
- Funkce v `europe-west1`, Node 22: `zalozitRodinu`, `vytvoritPozvanku`, `prijmoutPozvanku`, `generovatPripravuNaSetreni` (nové) a `klasifikovatZaznam` (přepsaná na místě, trigger zůstal v eur3). Callable funkce jsou veřejně volatelné a bez přihlášení vrací 401 z kódu funkce, ne 403 z IAM.
- Firestore pravidla, index `notes` (osobaId + vytvoreno) a Storage pravidla.
- Nasazením se zapnulo API Firebase Extensions a v Artifact Registry se nastavilo mazání starých obrazů po 1 dni (obojí zdarma / šetří náklady).
- **Funkce `acceptInvite` se jmenuje `prijmoutPozvanku`**, protože služba `acceptinvite` ve Cloud Run už existuje a smazat ji bez souhlasu nešlo.

## Dávka 2 (větev `davka-2`, v emulátorech hotová, v produkci zatím není)
- Ruční oprava třídění deníku (`rucniHodnoceni` přebíjí AI v zobrazení, odhadu i PDF), pravidla a testy.
- Správa členů: funkce `zmenitRoli` a `odebratClena` (pečovatel mění role a odebírá, kdokoli smí odejít, poslední pečovatel odejít nesmí).
- Rychlá karta pro nového pečovatele (čte i host), zdravotní poznámky v záložce Osoby, Rozložení péče (jen počty za 30 dní).
- `npm run seed` naplní emulátory ukázkovými daty (pecovatel@demo.cz, host@demo.cz, heslo demo1234).
- K nasazení: pravidla (nové pole `rucniHodnoceni`) a funkce `zmenitRoli`, `odebratClena`, `generovatPripravuNaSetreni`.

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

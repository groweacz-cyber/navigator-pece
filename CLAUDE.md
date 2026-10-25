# Opatruj (technicky `navigator-pece`)

> Dříve pracovní název „V klidu“ / „Navigátor péče“. Přejmenováno 2026-10-25, viz `docs/ROZHODNUTI.md`.

Aplikace pro rodiny pečující o blízkého s demencí. Společný deník péče, který AI třídí do 10 potřeb dle vyhlášky 505/2006 Sb., a z něj podklady pro úřady (sociální šetření, příspěvek na péči). Web/PWA (React + Vite), Android přes Capacitor, backend Firebase.

Technické identifikátory (Firebase projekt `navigator-pece`, repo `navigator-pece`) se nepřejmenovávají. Navenek je název „Opatruj“ (doména opatruj.cz, kupuje Radek). Název má dvojí smysl: postarej se o blízkého, ale i „opatruj se“ (péče o pečujícího). Tagline (návrh, schvaluje Radek): „Opatruj své blízké. A sebe taky.“

## Pevná pravidla
- **Pozicování**: koordinace péče a příprava podkladů pro úřady. Není zdravotnický prostředek, nediagnostikuje, nenahrazuje posudek. Každý odhad (stupeň závislosti, riziko pádů) je v UI i PDF označen jako orientační. Změnu pozicování schvaluje Radek.
- **Architektura** (jako Střídavě): samostatný Firebase projekt; entita `families`; pravidla od prvního commitu; členství nikdy nezapisuje klient (jen Cloud Function); peníze v haléřích, časy v UTC; zdravotní údaje v oddělené podkolekci; PDF exporty generuje funkce. Detail: `docs/ARCHITEKTURA.md`.
- **Kód**: `src/services/*.js` (logika, Firestore/Functions), `src/screens/*.jsx` (UI), `functions/` (server). Komentáře a UI texty česky, komentář říká PROČ. UI tykání, klidný tón, jednoduché věty, velká písma, vysoký kontrast.
- **Brand**: `#2C4A4E`, `#F3EFE6`, `#D9A441` (střídmě), `#B85C38`. Work Sans + Georgia.
- Žádné secrets v repu, kódu ani logu. Žádný `console.log` s osobními údaji. Nikdy nežádat Radka o vložení klíčů/hesel do chatu.
- Cizí projekt `valiant-bonbon-455806-f4` se nedotýkat.

## Autonomie
Sám: čtení, kód, testy, emulátory, větve, commity, PR, Issues (štítky `agent-ready`, `decision-required`), dokumentace.
**Jen se souhlasem Radka** (AskUserQuestion, jednou, s doporučením): merge do `main`; jakýkoli deploy do produkce (pravidla, functions, hosting); mazání čehokoli v cloudu; billing a kvóty; ceny, právně závazné texty, grafika, název, doména; vše, co posílá data mimo Firebase/Anthropic; nové placené služby; změna pozicování.
Rozhodnutí patřící Radkovi: krátce možnosti, jedno doporučení, riziko; pokračuj na nezávislých částech. Záznam do `docs/ROZHODNUTI.md`.

## Komunikace
Česky, stručně. Po ucelené práci max. 5 řádků: hotovo / co zkusit / co čeká na Radka. Radek nepíše kód, dávej konkrétní kroky.

## Příkazy
- `npm run dev` / `npm run build`
- `npm run emulators` (auth, functions, firestore, storage s mockem klasifikace) a `npm run dev:emul` (klient proti emulátorům)
- `npm run seed` (při běžících emulátorech) naplní ukázková data: pecovatel@demo.cz / host@demo.cz, heslo demo1234
- `npm test` = unit testy funkcí + `test:rules` (pravidla) + `test:retezec` (celý řetěz v emulátorech). Potřebuje Javu. Porty 8180/9199/5101/9499/4010, protože 8080 bývá obsazený. Po zrušeném běhu mohou zůstat osiřelé emulátory a blokovat porty.
- Před PR: build, testy, žádné secrets v diffu.

## Další dokumenty
`docs/STAV.md` (aktuální stav), `docs/BACKLOG.md`, `docs/ROZHODNUTI.md`, `docs/ARCHITEKTURA.md`.

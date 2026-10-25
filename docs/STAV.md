# Stav projektu

Aktualizováno 2026-10-25 (převzetí vývoje).

## Co je v repu (ověřeno)
- Kostra z Bloku 1: `src/App.jsx` (dočasná úvodní obrazovka), `src/main.jsx`, `src/firebase/config.js`, Vite, `capacitor.config.json`.
- `firestore.rules` (publikovaná ručně v konzoli, ve větvi `stabilizace` opravená, zatím nenasazená), `storage.rules` (vše zavřeno).
- Testy pravidel (`tests/rules`), konfigurace Firebase (`firebase.json`, `.firebaserc`, `firestore.indexes.json`).

## Co v repu chybí, i když to předávací popis uvádí
- `src/services/*` (auth, family, carePersons, notes, tasks, krizovyPlan, contacts, health, exports)
- `src/screens/*` (Register, Login, CreateFamily, Dashboard)
- `functions/` (acceptInvite, generovatPripravuNaSetreni, klasifikovatZaznam)
- Plnohodnotný `App.jsx`

Na GitHubu nikdy nebyly (historie má 6 commitů, poslední je `config.js`). Funkce běží v cloudu nasazené z webového editoru; jejich zdroj je jen tam.

## Cloud (podle předání, neověřeno)
Firebase projekt `navigator-pece`, Blaze, Firestore `eur3`, Auth e-mail/heslo, Secret Manager `ANTHROPIC_API_KEY`, tři Cloud Run služby v `europe-west1`. Funkce nikdy nebyly otestované z klienta.

## Stav známých chyb (sekce 6 předání)
| # | Chyba | Stav |
|---|---|---|
| 1 | Založení rodiny nejde (pravidla zakazují zápis do `members`) | Potvrzeno v pravidlech. Pravidla opravena (`families` create false). Chybí funkce `zalozitRodinu`. |
| 2 | Callable funkce vrací 403 / špatné názvy | Neověřeno (kód funkcí není v repu). Řeší se přenasazením přes CLI. |
| 3 | Node 20 končí 2026-10-30 | Otevřeno, dělá se při psaní `functions/`. |
| 4 | `notes` dovolují klientovi zapsat `aiKategorie` | **Opraveno + otestováno** ve větvi. |
| 5 | Chybí index pro `notes` | **Přidán** `firestore.indexes.json`. |
| 6–11 | Odhad stupně, PDF diakritika, výběr rodiny, UI pozvánky, rozdělení Dashboardu, ochrana dat u Anthropic | Otevřeno, viz `BACKLOG.md`. |

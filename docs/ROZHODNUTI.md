# Log rozhodnutí

Formát: datum, rozhodnutí, důvod. Otevřené body jsou označené `OTEVŘENO` a mají i Issue `decision-required`.

## Rozhodnuto
- 2026-10-25: Pravidla `notes` povolují klientovi jen pole `osobaId`, `text`, `autorUid`, `vytvoreno`. Důvod: AI kategorie jsou podklad pro úřad, nesmí je jít falšovat.
- 2026-10-25: Pozvánka klientem smí mít jen roli `clen`/`host`. Důvod: pozvánka nesmí vytvořit dalšího správce členů. (Pečovatele lze později povýšit funkcí.)
- 2026-10-25: Lokální emulátory na portech 8180/9199/4010. Důvod: 8080 je na stroji obsazený.
- 2026-10-25: `@firebase/rules-unit-testing@3` a `vitest@2`. Důvod: kompatibilita s `firebase@10` a `vite@5`; novější verze vyžadují `firebase@13` / `vite@6+`.

## OTEVŘENO (čeká na Radka)
1. **Chybějící kód** (`services`, `screens`, `functions`): Radek dohledá soubory z dřívějšího chatu, nebo je napíšu znovu podle popisu a nasazeného kódu. Doporučení: napsat znovu s opravami ze sekce 6. Kód nasazených funkcí se po přihlášení do GCP dá stáhnout jako reference.
2. **Dev Firebase projekt** `navigator-pece-dev`. Doporučení: ano, před prvním ostrým deployem.
3. **Metodika odhadu stupně závislosti** (jádro hodnoty a riziko zavádějícího odhadu).
4. **Ochrana dat při volání Anthropic** (minimalizace, DPA, souhlas, zásady zpracování).
5. **Cena a model předplatného.**
6. **Doména a název webu.**

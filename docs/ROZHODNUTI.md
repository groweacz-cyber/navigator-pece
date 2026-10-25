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

## Doplněno 2026-10-25 (přepis chybějícího kódu)
- Chybějící `services`, `screens` a `functions` jsem napsal znovu podle popisu předání, ne podle nasazeného kódu. Rozhodnutí 1 z části OTEVŘENO výše je tím vyřešené. Nasazený kód ve Cloud Run se nepoužil.
- **Pozvánky zakládá server** (`vytvoritPozvanku`), ne klient. Důvod: platnost (7 dní) a role nejdou podvrhnout. Kód pozvánky je `rodinaId.pozvankaId` (obě části jsou náhodné ID Firestore), předává se odkazem `/?pozvanka=…`. Pozvánka je jednorázová a po použití se zneplatní. Pozvat jako `pecovatel` nejde.
- **Jméno v `members`**: server při vzniku členství zkopíruje jméno z `users`, protože ostatní členy `users/{uid}` číst nesmí a rodina by jinak viděla anonymní uid.
- **Klasifikace**: model vrací pro každou zmíněnou potřebu úroveň `zvlada`, `s_pomoci`, `nezvlada` nebo `nelze_urcit`. Ukládá se `aiKategorie` (pole klíčů) i `aiHodnoceni` (klíč → úroveň) a `aiStav` (`hotovo`/`chyba`). Do služby jde jen text záznamu, bez jmen osoby a autora.
- **Dočasná metodika odhadu stupně** (čeká na schválení, Issue „Rozhodnutí: metodika odhadu stupně“): potřeba se počítá jako nezvládaná, když jsou v deníku aspoň 2 záznamy s úrovní `s_pomoci` nebo `nezvlada`. Počet nezvládaných potřeb se převede na stupeň podle § 8 zákona 108/2006 Sb. (3–4 = I, 5–6 = II, 7–8 = III, 9–10 = IV). Zákon říká, že potřeba je nezvládaná, když člověk nezvládá aspoň jednu aktivitu z přílohy 1 vyhlášky 505/2006 Sb. Odhad je v PDF vždy označen jako orientační.
- **Emulátorový mock klasifikace** se zapíná jen s `FUNCTIONS_EMULATOR` a `KLASIFIKACE_MOCK=1`. V produkci nejde zapnout.
- **Písmo**: PDF používá Work Sans (licence OFL, `functions/fonts/OFL.txt`), aplikace ho načítá z balíčku `@fontsource/work-sans`, ne z Google Fontů (kvůli IP adresám uživatelů).
- **Porty emulátorů**: auth 9199, functions 5101, firestore 8180, storage 9499, eventarc 9399, UI 4010.
- Mazání deníku: autor smí smazat vlastní zápis, pečovatel libovolný. Úprava textu zápisu po klasifikaci zatím nespouští nové třídění (Issue B3).
- 2026-10-25: Radek schválil nasazení pravidel, indexu a funkcí do produkce (včetně Storage pravidel pro exporty). Staré Cloud Run služby se nemažou. Funkce `acceptInvite` přejmenována na `prijmoutPozvanku`, aby nekolidovala se starou službou `acceptinvite`.

## Dávka 2 (2026-10-25)
- Radek delegoval práci na mě („všechno udělej ty“). Metodika odhadu stupně zůstává dočasná (viz výše) a doladí se na skutečných datech z provozu. Právně závazné texty a mazání cloudových služeb se tím neschvalují, ty čekají na výslovný souhlas.
- **Ruční oprava třídění** jde do pole `rucniHodnoceni` (celá mapa potřeba → úroveň), ne do AI polí. Smí ji zapsat každý s plným přístupem. Přebíjí AI při zobrazení, v odhadu i v PDF.
- **Poslední pečovatel** nesmí změnit roli ani odejít, rodina by zůstala bez správce. Kontrola je v transakci.
- **Rozložení péče** ukazuje jen počty zápisů a úkolů bez hodnocení. Jen pro plný přístup (zápisy v deníku host nevidí).
- V ostré databázi nevytvářím testovací účty. Ověření skutečného volání Anthropic proběhne jedním přihlášením Radka.
- Emulátory: `FUNCTIONS_DISCOVERY_TIMEOUT=60`, protože na vytíženém stroji načtení funkcí překročilo výchozích 10 s.
- 2026-10-25: Radek schválil nasazení dávky 2 (pravidla, funkce) a merge PR 13.

## Dávka 3 (2026-10-25): detekce zhoršení
- **Metodika** (dočasná, doladit na skutečných datech): okno 30 dní vs. předchozích 30 dní; potřeba je nezvládaná při aspoň 2 záznamech s pomocí/nezvládáním v okně; "nová" = nezvládaná teď a ne dřív; "přibývá" = aspoň o 2 a o polovinu víc záznamů; "těžší" = aspoň o 2 víc záznamů "nezvládá"; "zvážit žádost" jen když odhadovaný stupeň vyjde vyšší než v předchozím okně. Pod 6 hodnocených zápisů nebo při prázdném okně: "málo dat".
- **TEXTY KE SCHVÁLENÍ RADKEM** (právní dopad, doporučena kontrola právníkem): věta v `src/screens/Vyvoj.jsx`: "Pokud se zdravotní stav opravdu zhoršil, můžete na úřadu práce požádat o nové posouzení a zvýšení příspěvku na péči." a "Jde jen o odhad z vašich poznámek. O stupni rozhoduje úřad na základě šetření a posudku." Postup žádosti a lhůty se ověřují v Issue C4 (právní navigátor), do té doby text jen obecně odkazuje na úřad práce.
- Vývoj se počítá při otevření záložky a neukládá se (žádná nová kolekce, vždy odpovídá aktuálnímu deníku).
- 2026-10-25: Radek schválil nasazení funkce vyhodnotitVyvoj a merge PR 14. Texty s právním dopadem v záložce Vývoj zůstávají ke schválení/kontrole právníkem.
- 2026-10-25: Radek schválil nasazení klienta na Firebase Hosting (navigator-pece.web.app), doména zatím ne. CSP hlavička zatím není (riziko rozbití Firebase SDK), přidat později.

## Přejmenování na Opatruj (2026-10-25, rozhodl Radek)
- Název produktu **Opatruj** (dříve pracovní „V klidu“ / „Navigátor péče“). Doména **opatruj.cz** (kupuje Radek, do té doby se s ní nepočítá). Dvojí smysl názvu: postarej se o blízkého i „opatruj se“. Tagline (návrh ke schválení): „Opatruj své blízké. A sebe taky.“ Google Play: „Opatruj – péče o blízké“.
- **Nemění se:** Firebase projekt `navigator-pece`, repo, `authDomain`, názvy kolekcí, názvy funkcí, `package.json` `name`.
- **appId (Android) změněn z `cz.growea.navigatorpece` na `cz.growea.opatruj`**, protože appka není publikovaná a po vydání na Google Play by to nešlo. Složka `android/` zatím neexistuje, proto se mění jen `capacitor.config.json`. Při vytvoření Firebase Android aplikace použít nový appId. Změna je ve vlastním commitu. **Potvrdil Radek 2026-10-25.**
- Změněno: UI (hlavička, přihlášení, registrace), `<title>`, meta a Open Graph, PWA `manifest.webmanifest` (bez ikon, čekají na logo), PDF (značka v hlavičce a zápatí; název souboru `opatruj-priprava-na-setreni-YYYY-MM-DD.pdf`), klíče localStorage (`opatruj.*`), dokumentace.
- Pozicování se nemění (koordinace péče a podklady pro úřady, ne zdravotnický prostředek).
- Nasazený web na navigator-pece.web.app zatím ukazuje starý název. Nasazení přejmenovaného klienta čeká na souhlas.

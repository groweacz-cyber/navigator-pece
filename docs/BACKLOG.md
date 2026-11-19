# Backlog

Pořadí a štítky viz GitHub Issues (`agent-ready`, `decision-required`).

## Fáze A: převzetí a stabilizace
- A1 Ověřit stav repa, doplnit chybějící soubory (hotovo, přepsáno)
- A2 Dokumentace, štítky (hotovo)
- A3 Firebase CLI konfigurace, emulátory (hotovo)
- A4 Opravy 1–5 včetně testů pravidel (hotovo)
- A5 Přenasadit funkce přes CLI (po schválení), ověřit celý řetěz z klienta

## Fáze B: použitelné jádro
B1 obrazovky, navigace, stavy, přístupnost · B2 pozvánky, výběr rodiny, správa členů · B3 deník + ruční oprava AI kategorií · B4 biografie, rychlá karta, krizový plán, kontakty, úkoly, dokumenty (Storage)

## Fáze C: vlajkové funkce
C1 klasifikace zvládá/nezvládá (metodika) · C2 PDF s diakritikou · C3 detekce zhoršení (hotovo v dávce 3, texty čekají na schválení) · C4 právní navigátor + odvolání · C5 pády, časová osa, rozložení péče (hotovo), respit, banka vzpomínek, podpora rozhodování

## Fáze D: vydání
D1 Capacitor/Android · D2 zásady, Data safety, Google Play · D3 web · D4 cena a platby

## Přejmenování a web (Opatruj)
- Marketingový web opatruj.cz: hotový návrh ve větvi `web-opatruj` (landing, kontakt, zásady a podmínky jako návrhy), čeká na schválení textů a nasazení. Chybí og:image, formulář pro oznámení spuštění, odkaz na Android appku.
- Logo: ověřit, zda PNG obsahuje text „V klidu“; případně nové s „Opatruj“. Adaptivní ikona Android, favicon, `og:image` 1200×630, ikony do manifestu.
- Ochranné známky: kontrola ÚPV a EUIPO (TMview) třídy 9, 42, 44 před výdaji na reklamu.
- Doména: koupě opatruj.cz (Radek), `opatruj.sk` do zásoby (otázka), přidání do Authentication → Authorized domains, připojení k Hosting, `podpora@opatruj.cz`.
- Hosting: CSP ostře po zkušebním režimu Report-Only, GitHub Actions (build, testy, preview kanál, ruční produkční deploy se schválením), Lighthouse.

## Rozšíření na seniory (návrh pořadí, 2026-11-17)
1. **Léky (hotovo ve větvi `leky`)**: seznam léků u osoby (název, dávka, časy) a denní odškrtávání „podáno“. Připomínky přes notifikace později (PWA/Android).
2. **Termíny a návštěvy lékaře**: úkoly s datem a kalendářní přehled, kdo doprovodí.
3. **Riziko pádů a bloudění** (C5): vzorce v kategoriích mobilita/orientace, konkrétní upozornění.
4. **Časová osa pro lékaře** (PDF): fakticky uspořádaná pozorování z deníku a zdravotních poznámek.
5. **Respitní plánovač**: upozorní, že jeden člověk táhne dlouho bez pauzy.
6. **Opatruj se: bezpečné zvedání a přesuny pro pečující** (obecné zásady bez diagnóz, viz decision-required Issue).
7. Obecný „stav osoby“ (volný text: demence, po mrtvici, křehkost), využitý v klasifikaci a PDF.
8. Android appka, nahrávání dokumentů, zásady ochrany údajů.

## Brainstorming: další funkce (2026-11-19), seřazeno podle hodnoty a náročnosti
**Hotovo v této dávce:** Přehled (dashboard) jako úvodní obrazovka.

| # | Nápad | Proč | Náročnost |
|---|---|---|---|
| 1 | **Nouzová karta (QR na lednici / do peněženky)**: léky, alergie, kontakty, praktik, co říct záchranářům, PDF k vytištění | Zachraňuje čas při 155, využívá data, která už máme | střední |
| 2 | **Termíny a návštěvy lékaře + připomínky** (kdo doprovodí, co vzít s sebou) | Každá rodina to řeší | střední |
| 3 | **Rychlý zápis jedním klepnutím** („Jedl dobře“, „Špatně spal“, „Pád“, „Byl zmatený“) a **diktování hlasem** | Unavený pečující nebude psát romány; víc zápisů = lepší podklady | nízká až střední |
| 4 | **Pády a události**: strukturovaný záznam (kdy, kde, následky) + vzorce | Podklad pro lékaře i šetření, riziko pádů (C5) | střední |
| 5 | **Týdenní souhrn pro rodinu** („co se dělo tenhle týden“, PDF nebo e-mail) | Rodina, která není na místě, je v obraze | střední |
| 6 | **Časová osa pro lékaře (PDF)**: spánek, jídlo, nálada, léky, události za 3 měsíce | Do ordinace s fakty, ne s dojmy | střední |
| 7 | **Rozvrh hlídání** (kdo kdy je u blízkého) + upozornění na přetížení jednoho člověka (respit) | Rozloží zátěž, navazuje na Rozložení péče | střední |
| 8 | **Jak se máš ty? (týdenní check pečujícího)** a doporučení odlehčovací služby | Dvojí smysl značky „opatruj se“ | nízká |
| 9 | **Právní navigátor s lhůtami** (žádost, šetření, posudek, odvolání) a hlídání termínů | Peníze a nervy rodin | vyšší (ověřit zdroje) |
| 10 | **Náklady na péči** (haléře), příspěvek na péči, export pro rodinu | Rodiny to řeší tabulkou | střední |
| 11 | **Trendy: spánek, nálada, váha, hydratace** (jednoduché grafy) | Změny se vidí dřív | střední |
| 12 | **Push notifikace** (léky, termíny) přes PWA/Android | Bez toho jsou připomínky jen na papíře | vyšší (Android) |
| 13 | **Adresář služeb v okolí** (pečovatelská, odlehčovací, denní stacionář) | Kam se obrátit | vyšší (data) |
| 14 | **Nahrávání dokumentů** (zprávy, posudky) do Storage | Vše na jednom místě | střední |

## Jídelníček: další kroky (nápad Radka 2026-11-19)
- Nákupní seznam generovaný z týdenního jídelníčku.
- Dietní omezení jako strukturovaná pole (bez lepku, diabetická, kašovitá strava) a kontrola jídel proti alergiím.
- Šablony oblíbených jídel a kopírování minulého týdne.
- Hlídání pitného režimu a váhy s jednoduchým grafem.

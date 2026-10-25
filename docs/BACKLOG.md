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
- Marketingový web opatruj.cz: návrh struktury je v Issue (decision-required). Landing stránka, `/zasady-ochrany-osobnich-udaju`, `/obchodni-podminky`, `/kontakt`.
- Logo: ověřit, zda PNG obsahuje text „V klidu“; případně nové s „Opatruj“. Adaptivní ikona Android, favicon, `og:image` 1200×630, ikony do manifestu.
- Ochranné známky: kontrola ÚPV a EUIPO (TMview) třídy 9, 42, 44 před výdaji na reklamu.
- Doména: koupě opatruj.cz (Radek), `opatruj.sk` do zásoby (otázka), přidání do Authentication → Authorized domains, připojení k Hosting, `podpora@opatruj.cz`.
- Hosting: CSP ostře po zkušebním režimu Report-Only, GitHub Actions (build, testy, preview kanál, ruční produkční deploy se schválením), Lighthouse.

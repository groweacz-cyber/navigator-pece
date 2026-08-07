# Navigátor péče — datový model

Blok 1 z technického postupu (stejný vzorec jako u appky Střídavě). Tento dokument popisuje strukturu Firestore databáze a proč je navržená tak, jak je navržená — ne jak se s ní pracuje z appky, to přijde v Bloku 2 a 3.

## Základní princip

Entita se jmenuje `families`, přesně jako u Střídavě — záměrně obecně, ne `pecovatele` nebo `demence-domacnost`. Definice: **domácnost s více dospělými, kteří se společně starají o jednu nebo více osob.** U Střídavě to byli dva rodiče a děti, tady je to skupina příbuzných a jedna nebo víc opatrovaných osob. Stejné jádro (rodina → role → sdílená data) unese i třetí produkt později, aniž by se datový model přepisoval — jen se přidá jiná sada podkolekcí pro konkrétní obsah.

Tohle je **samostatný Firebase projekt**. Žádné ID, žádná kolekce, žádné pravidlo se nedotýká dat Střídavě, i kdyby se jmenovaly stejně.

## Struktura

```
users/{uid}
families/{familyId}
    ├── members/{uid}                        (role — kdo je v rodině a s jakým oprávněním)
    ├── carePersons/{personId}                (opatrovaná osoba)
    │       └── health/{recordId}             (zdravotní záznamy — oddělená podkolekce)
    ├── tasks/{taskId}                        (úkoly, checklist)
    ├── documents/{documentId}                (dokumenty, žádosti, potvrzení)
    ├── notes/{noteId}                        (deník péče)
    ├── contacts/{contactId}                  (lékaři, úřady, sociální pracovníci)
    ├── invites/{inviteId}                    (aktivní pozvánky)
    ├── exports/{exportId}                    (hotové PDF snímky — metadata, ne živá data)
    └── auditLog/{entryId}                    (kdo, kdy, co — píšou jen Cloud Functions)
```

## Proč `members` jako podkolekce, ne pole v dokumentu rodiny

Dvě možnosti byly: pole `members: [...]` přímo v `families/{familyId}`, nebo podkolekce `families/{familyId}/members/{uid}`. Zvolena podkolekce — Firestore pravidla pak umí ověřit členství jedním `exists()` voláním na přesný dokument, místo aby musela stahovat celý dokument rodiny a procházet pole. Při růstu počtu členů (víc příbuzných než u typické appky pro rozvedené rodiče) je to i levnější na čtení.

## Role a kdo co vidí

| Role | Co znamená | Přístup |
|---|---|---|
| `pecovatel` | hlavní pečovatel, obvykle ten, kdo rodinu založil | plný přístup + správa členů (pozvánky, odebrání) |
| `clen` | další příbuzný s aktivní rolí v péči | plný přístup k datům, bez správy členů |
| `host` | vzdálenější příbuzný, občasná výpomoc | úkoly a kontakty ano, zdravotní záznamy a dokumenty ne |

Stejný princip jako dítě/host u Střídavě: omezená role nesmí vidět víc, než potřebuje pro svou část pomoci. Tady je citlivost dat vyšší (zdravotní stav, ne jen rozvrh), takže dělení je přísnější — `host` nemá přístup ani k `documents`, ani k `carePersons/{id}/health`.

## carePersons a oddělená podkolekce health

Osoba, o kterou se pečuje, je samostatná entita — jedna rodina může mít víc `carePersons` (typicky oba rodiče). Zdravotní údaje jsou ale v **oddělené podkolekci**, ne jako pole na `carePersons` dokumentu. Důvod je přímo z GDPR: zdravotní údaje spadají do zvláštní kategorie osobních údajů (čl. 9), a když leží fyzicky odděleně, jde v pravidlech napsat jedno explicitní omezení pro celou kategorii dat, místo aby se citlivost řešila pole po poli.

## Peníze a čas — konvence od první appky

I když v Bloku 1 ještě žádná finanční data nejsou, konvence se stanovuje teď, aby se nemusela měnit později:

- **Peníze v haléřích jako celé číslo** (`1500000` = 15 000 Kč), nikdy desetinné číslo v korunách. Desetinná čísla u peněz dřív nebo později způsobí zaokrouhlovací chybu.
- **Časy v UTC** (`serverTimestamp()` z Firestore), převod na český čas až při zobrazení v appce. Server nikdy neřeší časové pásmo, to je věc UI.

## exports — snímek, ne živý pohled

`exports/{exportId}` obsahuje jen metadata (kdy vznikl, kdo ho vyžádal, odkaz na hotový PDF soubor v Cloud Storage). Samotné PDF vzniká jednorázově v Cloud Function v okamžiku vyžádání — je to fotka dat k tomu dni, ne dokument, který se sám aktualizuje. Až se rodinná data příští týden změní, starý export zůstane přesně takový, jaký byl, když se generoval. To je důležité u dokumentu, který jde třeba k žádosti o příspěvek na péči — nesmí se za člověkem "potichu" změnit.

## auditLog — kdo píše

Nikdy appka přímo. Všechny zápisy do `auditLog` dělá výhradně Cloud Function, která danou akci provedla (přijetí pozvánky, vygenerování exportu, apod.). Klient do něj nemá zapisovací přístup vůbec — viz `firestore.rules`.

## Deset průlomových funkcí — mapování na architekturu

Žádná z nich nevyžaduje nový typ kolekce mimo tři mechanismy níže — jen využívají to, co appka stejně sbírá.

**Mechanismus A — AI klasifikace deníku.** `notes/{noteId}` dostává pole `aiKategorie` (pole hodnot z oficiálních 10 základních životních potřeb dle vyhlášky 505/2006 Sb.), doplňované Cloud Function po zápisu, ne appkou. Na tomhle jednom mechanismu stojí čtyři funkce:
1. Příprava na sociální šetření (PDF, kategorie + citace z deníku)
2. Detekce zhoršení → návrh na navýšení příspěvku (trend v čase)
6. Riziko pádů a bloudění (vzorec v kategoriích mobilita/orientace)
7. Zdravotní časová osa pro lékaře (chronologický přehled)

**Mechanismus B — biografický profil.** Pole na `carePersons/{personId}` (životní příběh, zvyky, co uklidní), čtou všichni členové rodiny včetně role `host`, píše jen `maPlnyPristup`. Stojí na něm:
4. Biografický profil / rychlá karta pro nového pečovatele
9. Banka vzpomínek (odvozený návrh témat z biografie)

**Mechanismus C — přímé strukturované zápisy.** Vlastní podkolekce, žádná AI: 
5. Krizový plán → `carePersons/{personId}/krizovyPlan/{planId}`
8. Respitní plánovač → čte existující `tasks`/`notes` napříč členy, žádná nová kolekce
10. Podpora rozhodování o dalším kroku péče → čte trendy z mechanismu A, žádná nová kolekce

3. Rozložení péče mezi rodinou → čte `tasks`/`notes` po `createdBy`, žádná nová kolekce, jen agregace při čtení.

Cloud Functions pro mechanismus A (klasifikace, generování PDF přípravy, detekce zhoršení) přijdou ve vlastním bloku po dokončení Bloku 2 (auth a založení rodiny) — tady v Bloku 1 se jen rezervuje místo v datovém modelu a pravidlech, aby se později nic nepřepisovalo.

## invites — proč pozvánky nejde přijmout přímo z appky

Popsáno detailně v `firestore.rules` a bude implementováno jako Cloud Function v Bloku 2 (stejně jako `acceptInvite` u Střídavě). Princip: pravidla zakazují komukoli zapsat do `members`, takže o přidání nového člena rozhoduje výhradně server na základě platného, dosud nepoužitého pozvánkového tokenu — ne appka na základě toho, že někdo zná `familyId`.

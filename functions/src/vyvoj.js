// Detekce zhoršení: porovnání posledních 30 dní s předchozími 30 dny.
// Čistá logika bez databáze. Pracuje s hodnocením, které už je "účinné"
// (ruční oprava rodiny přebíjí odhad AI), viz rodina.js.
//
// Není to diagnóza ani rada, jen upozornění, že se zápisy v deníku změnily.
// Metodika čeká na schválení Radkem (docs/ROZHODNUTI.md).

import { KLICE, odhadnoutStupen } from './kategorie.js'

export const DNI_OKNA = 30
// Proč 6: s méně hodnocenými zápisy za dva měsíce by jeden špatný den vypadal jako trend.
export const MIN_HODNOCENYCH_ZAZNAMU = 6
// Přibývání potíží v už nezvládané oblasti: aspoň o 2 záznamy a aspoň o polovinu víc.
const MIN_NARUST = 2
const MIN_POMER = 1.5

const DEN = 24 * 3600 * 1000

function pocetPotizi(poKategorii, klic) {
  return poKategorii[klic].s_pomoci + poKategorii[klic].nezvlada
}

export function vyhodnotitVyvoj(zaznamy, ted = new Date()) {
  const hranice = ted.getTime() - DNI_OKNA * DEN
  const dalnaHranice = hranice - DNI_OKNA * DEN
  const hodnocene = zaznamy.filter((z) => z.aiHodnoceni && Object.keys(z.aiHodnoceni).length > 0)
  const nedavno = hodnocene.filter((z) => z.vytvoreno.getTime() > hranice && z.vytvoreno.getTime() <= ted.getTime())
  const predtim = hodnocene.filter((z) => z.vytvoreno.getTime() > dalnaHranice && z.vytvoreno.getTime() <= hranice)

  const vysledek = {
    dni: DNI_OKNA,
    pocetZaznamu: { nedavno: nedavno.length, predtim: predtim.length },
    odhad: null,
    zmeny: [],
    zlepseni: [],
    doporuceni: 'malo_dat',
  }
  if (nedavno.length + predtim.length < MIN_HODNOCENYCH_ZAZNAMU || nedavno.length === 0 || predtim.length === 0) {
    return vysledek
  }

  const a = odhadnoutStupen(nedavno)
  const b = odhadnoutStupen(predtim)
  vysledek.odhad = {
    nedavno: { stupen: a.stupen, pocet: a.pocet },
    predtim: { stupen: b.stupen, pocet: b.pocet },
  }

  for (const klic of KLICE) {
    const nyni = pocetPotizi(a.poKategorii, klic)
    const driv = pocetPotizi(b.poKategorii, klic)
    const novaNezvladana = a.nezvladane.includes(klic) && !b.nezvladane.includes(klic)
    const pribyva = nyni >= driv + MIN_NARUST && nyni >= driv * MIN_POMER && a.nezvladane.includes(klic)
    if (novaNezvladana) vysledek.zmeny.push({ kategorie: klic, typ: 'nova', nedavno: nyni, predtim: driv })
    else if (pribyva) vysledek.zmeny.push({ kategorie: klic, typ: 'pribyva', nedavno: nyni, predtim: driv })
    else if (a.nezvladane.includes(klic) && b.nezvladane.includes(klic) &&
      a.poKategorii[klic].nezvlada >= b.poKategorii[klic].nezvlada + MIN_NARUST) {
      // Proč zvlášť: potíže jsou stejně časté, ale víc zápisů říká "nezvládá" místo "s pomocí".
      vysledek.zmeny.push({ kategorie: klic, typ: 'tezsi', nedavno: nyni, predtim: driv })
    } else if (b.nezvladane.includes(klic) && !a.nezvladane.includes(klic)) {
      vysledek.zlepseni.push({ kategorie: klic, nedavno: nyni, predtim: driv })
    }
  }

  if (a.stupen > b.stupen) vysledek.doporuceni = 'zvazit_zadost'
  else if (vysledek.zmeny.length > 0) vysledek.doporuceni = 'sledovat'
  else vysledek.doporuceni = 'beze_zmeny'
  return vysledek
}

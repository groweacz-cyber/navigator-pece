// Klasifikace záznamu z deníku do 10 potřeb pomocí Claude.
// Čistá logika: klient Anthropic se předává zvenku, aby šlo testovat bez sítě.

import { KLICE, UROVNE } from './kategorie.js'

export const MODEL = 'claude-sonnet-5-5'
const MAX_ZNAKU = 4000

const SYSTEM = `Třídíš krátké zápisy z deníku péče o člověka s demencí do 10 základních životních potřeb podle zákona 108/2006 Sb.

Potřeby (klíč: význam):
- mobilita: chůze, vstávání, přesuny, pády
- orientace: čas, místo, osoby, bloudění, ztráta orientace
- komunikace: mluvení, porozumění, telefon
- stravovani: jídlo, pití, příprava jídla, odmítání jídla
- oblekani: oblékání, obouvání, výběr oblečení
- hygiena: mytí, koupání, péče o tělo
- vylucovani: toaleta, inkontinence
- pece_o_zdravi: léky, návštěvy lékaře, dodržování léčby
- osobni_aktivity: zájmy, kontakt s lidmi, trávení času
- domacnost: vaření, úklid, nákupy, finance, domácí spotřebiče

U každé zmíněné potřeby urči úroveň:
- zvlada: zvládl/a sám/sama bez pomoci
- s_pomoci: zvládl/a jen s pomocí, dohledem nebo připomenutím
- nezvlada: nezvládl/a ani s pomocí nebo to musel/a udělat někdo jiný
- nelze_urcit: potřeba je zmíněna, ale ze zápisu nejde poznat, jak to šlo

Pravidla: zařaď jen potřeby, které zápis opravdu zmiňuje. Nic nevymýšlej a nediagnostikuj. Pokud zápis žádnou potřebu nezmiňuje, vrať prázdný seznam.
Odpověz pouze JSON bez dalšího textu v tomto tvaru:
{"potreby":[{"kategorie":"hygiena","uroven":"s_pomoci"}]}`

// Proč přísná validace: odpověď modelu je nedůvěryhodný vstup. Do Firestore
// se dostane jen známý klíč a známá úroveň.
export function zpracovatOdpoved(text) {
  const zacatek = text.indexOf('{')
  const konec = text.lastIndexOf('}')
  if (zacatek < 0 || konec < zacatek) throw new Error('Odpověď neobsahuje JSON')
  const data = JSON.parse(text.slice(zacatek, konec + 1))
  if (!Array.isArray(data.potreby)) throw new Error('Chybí pole potreby')

  const hodnoceni = {}
  for (const p of data.potreby) {
    if (!KLICE.includes(p?.kategorie) || !UROVNE.includes(p?.uroven)) continue
    // Při opakování téže potřeby platí nejhorší úroveň.
    const poradi = { zvlada: 0, nelze_urcit: 1, s_pomoci: 2, nezvlada: 3 }
    const stara = hodnoceni[p.kategorie]
    if (!stara || poradi[p.uroven] > poradi[stara]) hodnoceni[p.kategorie] = p.uroven
  }
  return { aiKategorie: Object.keys(hodnoceni), aiHodnoceni: hodnoceni }
}

// Do služby jde jen text záznamu. Jméno osoby, rodiny ani autora neposíláme
// (minimalizace údajů, viz docs/ROZHODNUTI.md).
export async function klasifikovat(klient, text) {
  const odpoved = await klient.messages.create({
    model: MODEL,
    max_tokens: 400,
    system: SYSTEM,
    messages: [{ role: 'user', content: String(text).slice(0, MAX_ZNAKU) }],
  })
  const blok = odpoved.content.find((b) => b.type === 'text')
  if (!blok) throw new Error('Prázdná odpověď')
  return zpracovatOdpoved(blok.text)
}

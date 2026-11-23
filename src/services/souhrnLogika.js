// Týdenní souhrn: čistá logika bez databáze (jde testovat). Orientační přehled
// ze zápisů v deníku a z odškrtnutých léků za posledních 7 dní.

const DEN = 24 * 3600 * 1000
const formatDatum = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Prague' })
const formatCas = new Intl.DateTimeFormat('cs-CZ', { timeZone: 'Europe/Prague', hour: '2-digit', minute: '2-digit', hour12: false })

export const datumPraha = (d) => formatDatum.format(d)

// Dny souhrnu: dnes a 6 dní zpět (YYYY-MM-DD), nejstarší první.
export const dnySouhrnu = (ted = new Date()) => Array.from({ length: 7 }, (_, i) => datumPraha(new Date(ted.getTime() - (6 - i) * DEN)))

export function spocitatSouhrn({ zaznamy, leky, podani, ted = new Date() }) {
  const hranice = ted.getTime() - 7 * DEN
  const predHranice = hranice - 7 * DEN
  const tyden = zaznamy.filter((z) => z.vytvoreno.getTime() > hranice && z.vytvoreno.getTime() <= ted.getTime())
  const predtyden = zaznamy.filter((z) => z.vytvoreno.getTime() > predHranice && z.vytvoreno.getTime() <= hranice)

  const poAutorech = {}
  for (const z of tyden) poAutorech[z.autorUid] = (poAutorech[z.autorUid] ?? 0) + 1

  // Potíže: kolikrát se v týdnu objevila potřeba s "s pomocí" nebo "nezvládá".
  const potize = {}
  for (const z of tyden) {
    for (const [k, u] of Object.entries(z.hodnoceni ?? {})) {
      if (u === 's_pomoci' || u === 'nezvlada') potize[k] = (potize[k] ?? 0) + 1
    }
  }
  const nejcastejsiPotize = Object.entries(potize).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([kategorie, pocet]) => ({ kategorie, pocet }))

  // Plán léků: aktivní léky × časy × dny. Dnešní dávky se počítají jen do aktuální chvíle.
  const dny = dnySouhrnu(ted)
  const dnesDatum = dny[6]
  const ted_ = formatCas.format(ted)
  const podane = new Set(podani.map((p) => `${p.lekId}_${p.datum}_${p.cas}`))
  let plan = 0
  let podano = 0
  for (const lek of leky.filter((l) => l.aktivni)) {
    for (const den of dny) {
      for (const cas of lek.casy) {
        if (den === dnesDatum && cas > ted_) continue
        plan += 1
        if (podane.has(`${lek.id}_${den}_${cas}`)) podano += 1
      }
    }
  }

  return {
    zapisy: { tyden: tyden.length, predtyden: predtyden.length },
    poAutorech,
    nejcastejsiPotize,
    leky: { plan, podano, procent: plan ? Math.round((podano / plan) * 100) : null },
  }
}

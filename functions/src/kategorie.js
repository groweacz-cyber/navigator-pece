// 10 základních životních potřeb podle § 9 zákona 108/2006 Sb.
// (podrobnosti v příloze 1 vyhlášky 505/2006 Sb.).

export const KATEGORIE = [
  { klic: 'mobilita', nazev: 'Mobilita' },
  { klic: 'orientace', nazev: 'Orientace' },
  { klic: 'komunikace', nazev: 'Komunikace' },
  { klic: 'stravovani', nazev: 'Stravování' },
  { klic: 'oblekani', nazev: 'Oblékání a obouvání' },
  { klic: 'hygiena', nazev: 'Tělesná hygiena' },
  { klic: 'vylucovani', nazev: 'Výkon fyziologické potřeby' },
  { klic: 'pece_o_zdravi', nazev: 'Péče o zdraví' },
  { klic: 'osobni_aktivity', nazev: 'Osobní aktivity' },
  { klic: 'domacnost', nazev: 'Péče o domácnost' },
]

export const KLICE = KATEGORIE.map((k) => k.klic)

// Proč "nelze_urcit": zmínka v deníku ještě neříká, jestli člověk potřebu
// zvládá. Takové záznamy se do odhadu nepočítají.
export const UROVNE = ['zvlada', 's_pomoci', 'nezvlada', 'nelze_urcit']

// Minimální počet záznamů s pomocí/nezvládáním, aby se potřeba považovala
// za nezvládanou. Jeden špatný den nestačí.
export const MIN_ZAZNAMU = 2

export function nazevKategorie(klic) {
  return KATEGORIE.find((k) => k.klic === klic)?.nazev ?? klic
}

// Zákon 108/2006 Sb. § 8: stupeň I = 3–4 nezvládané potřeby, II = 5–6,
// III = 7–8, IV = 9–10. Méně než 3 = žádný stupeň.
export function stupenPodlePoctu(pocet) {
  if (pocet >= 9) return 4
  if (pocet >= 7) return 3
  if (pocet >= 5) return 2
  if (pocet >= 3) return 1
  return 0
}

// Orientační odhad z deníku. Počítá jen potřeby, kde jsou aspoň MIN_ZAZNAMU
// záznamy s úrovní "s_pomoci" nebo "nezvlada". Zmínka sama o sobě nestačí.
// Záznamy bez hodnocení (starší, před zavedením úrovní) se nepočítají.
// Metodika čeká na schválení Radkem (docs/ROZHODNUTI.md).
export function odhadnoutStupen(zaznamy) {
  const poKategorii = Object.fromEntries(KLICE.map((k) => [k, { zvlada: 0, s_pomoci: 0, nezvlada: 0 }]))
  for (const z of zaznamy) {
    for (const [klic, uroven] of Object.entries(z.aiHodnoceni ?? {})) {
      if (poKategorii[klic] && poKategorii[klic][uroven] !== undefined) poKategorii[klic][uroven] += 1
    }
  }
  const nezvladane = KLICE.filter((k) => poKategorii[k].s_pomoci + poKategorii[k].nezvlada >= MIN_ZAZNAMU)
  return { poKategorii, nezvladane, pocet: nezvladane.length, stupen: stupenPodlePoctu(nezvladane.length) }
}

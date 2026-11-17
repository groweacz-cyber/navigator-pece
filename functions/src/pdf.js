// PDF "Příprava na sociální šetření": jednorázový snímek deníku podle 10 potřeb.
// Proč Unicode font: standardní PDF fonty neumí českou diakritiku.

import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { PDFDocument, rgb } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
import { KATEGORIE, odhadnoutStupen, MIN_ZAZNAMU } from './kategorie.js'

const FONT_DIR = new URL('../fonts/', import.meta.url)
const BARVA_HLAVNI = rgb(0.173, 0.29, 0.306) // #2C4A4E
const BARVA_TEXT = rgb(0.13, 0.13, 0.13)
const BARVA_JEMNA = rgb(0.4, 0.4, 0.4)
const BARVA_VAROVANI = rgb(0.722, 0.361, 0.22) // #B85C38

const A4 = [595.28, 841.89]
const OKRAJ = 50
const MAX_CITACI = 5
const MAX_DELKA_CITACE = 300

const formatData = new Intl.DateTimeFormat('cs-CZ', {
  timeZone: 'Europe/Prague', day: 'numeric', month: 'numeric', year: 'numeric',
})

export function formatDatum(datum) {
  return formatData.format(datum)
}

export const UPOZORNENI =
  'Orientační podklad pro přípravu na sociální šetření. Nejde o zdravotnický prostředek, ' +
  'neurčuje diagnózu ani nenahrazuje posudek. O stupni závislosti rozhoduje úřad na základě ' +
  'šetření a posudku. Odhad níže vychází jen z poznámek rodiny a může být nepřesný.'

function zalamovat(text, font, velikost, sirka) {
  const radky = []
  let radek = ''
  for (const slovo of text.split(' ')) {
    const pokus = radek ? `${radek} ${slovo}` : slovo
    if (font.widthOfTextAtSize(pokus, velikost) <= sirka) {
      radek = pokus
    } else {
      if (radek) radky.push(radek)
      radek = slovo
    }
  }
  if (radek) radky.push(radek)
  return radky
}

export async function vytvoritPripravuPdf({ osoba, zaznamy, vygenerovano = new Date() }) {
  const pdf = await PDFDocument.create()
  pdf.registerFontkit(fontkit)
  const normal = await pdf.embedFont(await readFile(fileURLToPath(new URL('WorkSans-Regular.ttf', FONT_DIR))), { subset: true })
  const tucny = await pdf.embedFont(await readFile(fileURLToPath(new URL('WorkSans-SemiBold.ttf', FONT_DIR))), { subset: true })
  const znamaPismena = new Set(normal.getCharacterSet())

  // Proč čištění: deník může obsahovat emoji nebo řídicí znaky, které font
  // nemá, a embedování by selhalo.
  const cistit = (t) =>
    String(t ?? '')
      .replace(/\s+/g, ' ')
      .split('')
      .filter((ch) => znamaPismena.has(ch.codePointAt(0)))
      .join('')
      .trim()

  const sirka = A4[0] - 2 * OKRAJ
  let strana = pdf.addPage(A4)
  let y = A4[1] - OKRAJ

  const misto = (potreba) => {
    if (y - potreba < OKRAJ + 20) {
      strana = pdf.addPage(A4)
      y = A4[1] - OKRAJ
    }
  }
  const text = (t, { font = normal, velikost = 11, barva = BARVA_TEXT, odsazeni = 0, mezera = 4 } = {}) => {
    for (const radek of zalamovat(cistit(t), font, velikost, sirka - odsazeni)) {
      misto(velikost + mezera)
      y -= velikost + mezera
      strana.drawText(radek, { x: OKRAJ + odsazeni, y, size: velikost, font, color: barva })
    }
  }
  const mezera = (v) => { y -= v }

  const jmeno = cistit(osoba?.jmeno) || 'neuvedeno'
  text('Opatruj', { font: tucny, velikost: 11, barva: BARVA_JEMNA, mezera: 4 })
  text('Příprava na sociální šetření', { font: tucny, velikost: 20, barva: BARVA_HLAVNI, mezera: 8 })
  text(`Osoba: ${jmeno}`, { velikost: 12 })
  text(`Vygenerováno: ${formatDatum(vygenerovano)}  ·  Počet záznamů v deníku: ${zaznamy.length}`, { barva: BARVA_JEMNA, velikost: 10 })
  mezera(8)
  text(UPOZORNENI, { velikost: 10, barva: BARVA_VAROVANI })
  mezera(10)

  const odhad = odhadnoutStupen(zaznamy)
  text('Orientační odhad', { font: tucny, velikost: 14, barva: BARVA_HLAVNI, mezera: 6 })
  if (odhad.stupen === 0) {
    text(
      `Z poznámek zatím nelze odhadnout stupeň závislosti. Potřeba se počítá jako nezvládaná, když je v deníku ` +
        `aspoň ${MIN_ZAZNAMU} záznamů, kde je zvládána jen s pomocí nebo vůbec. Nezvládané potřeby podle deníku: ${odhad.pocet} z 10.`,
    )
  } else {
    text(
      `Podle poznámek rodiny vychází orientačně stupeň ${odhad.stupen} (nezvládané potřeby: ${odhad.pocet} z 10). ` +
        `Jde o odhad, ne o rozhodnutí.`,
    )
  }
  mezera(10)

  const serazene = [...zaznamy].sort((a, b) => b.vytvoreno - a.vytvoreno)
  for (const kat of KATEGORIE) {
    const souhrn = odhad.poKategorii[kat.klic]
    const tykaSe = serazene.filter((z) => z.aiHodnoceni?.[kat.klic])
    const potize = tykaSe.filter((z) => ['s_pomoci', 'nezvlada'].includes(z.aiHodnoceni[kat.klic]))

    misto(60)
    text(kat.nazev, { font: tucny, velikost: 13, barva: BARVA_HLAVNI, mezera: 6 })
    text(
      `Záznamů se zmínkou: ${tykaSe.length}  ·  zvládá: ${souhrn.zvlada}  ·  s pomocí: ${souhrn.s_pomoci}  ·  nezvládá: ${souhrn.nezvlada}` +
        (odhad.nezvladane.includes(kat.klic) ? '  ·  počítá se jako nezvládaná' : ''),
      { velikost: 10, barva: BARVA_JEMNA },
    )
    if (potize.length === 0) {
      text('Žádné záznamy o potížích.', { velikost: 10, barva: BARVA_JEMNA })
    }
    for (const z of potize.slice(0, MAX_CITACI)) {
      const cely = cistit(z.text)
      const zkraceno = cely.slice(0, MAX_DELKA_CITACE) + (cely.length > MAX_DELKA_CITACE ? '…' : '')
      text(`${formatDatum(z.vytvoreno)}: „${zkraceno}“`, {
        velikost: 10, odsazeni: 12,
      })
    }
    if (potize.length > MAX_CITACI) {
      text(`… a dalších ${potize.length - MAX_CITACI} záznamů.`, { velikost: 10, barva: BARVA_JEMNA, odsazeni: 12 })
    }
    mezera(8)
  }

  const strany = pdf.getPages()
  strany.forEach((s, i) => {
    s.drawText(`Opatruj  ·  orientační podklad  ·  strana ${i + 1} z ${strany.length}`, {
      x: OKRAJ, y: 28, size: 8, font: normal, color: BARVA_JEMNA,
    })
  })
  return pdf.save()
}

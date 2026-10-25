import { describe, expect, test } from 'vitest'
import { PDFDocument } from 'pdf-lib'
import { odhadnoutStupen, stupenPodlePoctu } from '../src/kategorie.js'
import { klasifikovat, zpracovatOdpoved } from '../src/klasifikace.js'
import { vytvoritPripravuPdf } from '../src/pdf.js'

const zaznam = (uroven, klic = 'hygiena', den = 1, text = 'Dnes potřeboval pomoc při mytí') => ({
  text, vytvoreno: new Date(Date.UTC(2026, 9, den, 10)), aiHodnoceni: { [klic]: uroven },
})

describe('stupeň podle zákona 108/2006 Sb. § 8', () => {
  test.each([[0, 0], [2, 0], [3, 1], [4, 1], [5, 2], [6, 2], [7, 3], [8, 3], [9, 4], [10, 4]])(
    '%i nezvládaných potřeb = stupeň %i', (pocet, stupen) => {
      expect(stupenPodlePoctu(pocet)).toBe(stupen)
    })
})

describe('odhad stupně z deníku', () => {
  test('pouhá zmínka a zvládnutá potřeba se nepočítá', () => {
    const odhad = odhadnoutStupen([zaznam('zvlada'), zaznam('zvlada', 'hygiena', 2), zaznam('nelze_urcit', 'mobilita')])
    expect(odhad.pocet).toBe(0)
  })

  test('jeden špatný den nestačí, dva ano', () => {
    expect(odhadnoutStupen([zaznam('nezvlada')]).pocet).toBe(0)
    expect(odhadnoutStupen([zaznam('nezvlada'), zaznam('s_pomoci', 'hygiena', 2)]).nezvladane).toEqual(['hygiena'])
  })

  test('staré záznamy bez hodnocení se nepočítají', () => {
    expect(odhadnoutStupen([{ text: 'x', vytvoreno: new Date() }]).pocet).toBe(0)
  })
})

describe('zpracování odpovědi modelu', () => {
  test('přijme jen známé klíče a úrovně', () => {
    const v = zpracovatOdpoved('Tady: {"potreby":[{"kategorie":"hygiena","uroven":"s_pomoci"},{"kategorie":"vymysleno","uroven":"zvlada"},{"kategorie":"mobilita","uroven":"hodne"}]}')
    expect(v).toEqual({ aiKategorie: ['hygiena'], aiHodnoceni: { hygiena: 's_pomoci' } })
  })

  test('při opakování platí nejhorší úroveň', () => {
    const v = zpracovatOdpoved('{"potreby":[{"kategorie":"hygiena","uroven":"zvlada"},{"kategorie":"hygiena","uroven":"nezvlada"}]}')
    expect(v.aiHodnoceni.hygiena).toBe('nezvlada')
  })

  test('nesmysl vyhodí chybu', () => {
    expect(() => zpracovatOdpoved('žádný json')).toThrow()
    expect(() => zpracovatOdpoved('{"x":1}')).toThrow()
  })

  test('klasifikovat posílá jen text záznamu', async () => {
    let poslano
    const klient = { messages: { create: async (p) => { poslano = p; return { content: [{ type: 'text', text: '{"potreby":[]}' }] } } } }
    await klasifikovat(klient, 'Maminka se dnes nechtěla mýt')
    expect(poslano.messages).toEqual([{ role: 'user', content: 'Maminka se dnes nechtěla mýt' }])
  })
})

describe('PDF', () => {
  test('vznikne platné PDF s českou diakritikou a emoji v textu nevadí', async () => {
    const zaznamy = [
      zaznam('nezvlada', 'orientace', 3, 'Žluťoučký kůň ztracený venku 😀 příliš dlouho'),
      zaznam('s_pomoci', 'orientace', 4),
      ...Array.from({ length: 40 }, (_, i) => zaznam('s_pomoci', 'mobilita', 5, `Záznam číslo ${i} ${'dlouhý text '.repeat(30)}`)),
    ]
    const bytes = await vytvoritPripravuPdf({ osoba: { jmeno: 'Božena Němcová' }, zaznamy })
    const pdf = await PDFDocument.load(bytes)
    expect(pdf.getPageCount()).toBeGreaterThan(1)
    expect(bytes.length).toBeGreaterThan(5000)
  })

  test('prázdný deník nevadí', async () => {
    const bytes = await vytvoritPripravuPdf({ osoba: { jmeno: 'A' }, zaznamy: [] })
    expect((await PDFDocument.load(bytes)).getPageCount()).toBeGreaterThanOrEqual(1)
  })
})

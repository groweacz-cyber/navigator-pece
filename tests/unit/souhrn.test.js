import { describe, expect, test } from 'vitest'
import { datumPraha, dnySouhrnu, spocitatSouhrn } from '../../src/services/souhrnLogika.js'

const TED = new Date(Date.UTC(2026, 10, 23, 18, 0)) // 19:00 v Praze
const DEN = 24 * 3600 * 1000
const zapis = (dniZpet, autorUid, hodnoceni = {}) => ({ vytvoreno: new Date(TED.getTime() - dniZpet * DEN), autorUid, hodnoceni })

describe('týdenní souhrn', () => {
  test('dny souhrnu: sedm dní končících dneškem', () => {
    const dny = dnySouhrnu(TED)
    expect(dny).toHaveLength(7)
    expect(dny[6]).toBe(datumPraha(TED))
  })

  test('zápisy za týden a předchozí týden, podle autorů', () => {
    const s = spocitatSouhrn({ zaznamy: [zapis(1, 'a'), zapis(2, 'a'), zapis(3, 'b'), zapis(9, 'a'), zapis(20, 'a')], leky: [], podani: [], ted: TED })
    expect(s.zapisy).toEqual({ tyden: 3, predtyden: 1 })
    expect(s.poAutorech).toEqual({ a: 2, b: 1 })
  })

  test('nejčastější potíže jen z "s pomocí" a "nezvládá"', () => {
    const z = [zapis(1, 'a', { hygiena: 'nezvlada' }), zapis(2, 'a', { hygiena: 's_pomoci', stravovani: 'zvlada' }), zapis(3, 'a', { orientace: 'nezvlada' })]
    const s = spocitatSouhrn({ zaznamy: z, leky: [], podani: [], ted: TED })
    expect(s.nejcastejsiPotize).toEqual([{ kategorie: 'hygiena', pocet: 2 }, { kategorie: 'orientace', pocet: 1 }])
  })

  test('léky: plán a podání, dnešní pozdější dávky se nepočítají', () => {
    const dny = dnySouhrnu(TED)
    const leky = [{ id: 'l1', aktivni: true, casy: ['08:00', '23:00'] }, { id: 'l2', aktivni: false, casy: ['08:00'] }]
    const podani = [{ lekId: 'l1', datum: dny[0], cas: '08:00' }, { lekId: 'l1', datum: dny[6], cas: '08:00' }]
    const s = spocitatSouhrn({ zaznamy: [], leky, podani, ted: TED })
    // 6 minulých dnů × 2 + dnes jen 08:00 (23:00 je ještě před námi) = 13
    expect(s.leky).toEqual({ plan: 13, podano: 2, procent: 15 })
  })

  test('bez léků je procento null', () => {
    expect(spocitatSouhrn({ zaznamy: [], leky: [], podani: [], ted: TED }).leky.procent).toBeNull()
  })
})

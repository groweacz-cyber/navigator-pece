import { describe, expect, test } from 'vitest'
import { vyhodnotitVyvoj } from '../src/vyvoj.js'

const TED = new Date(Date.UTC(2026, 9, 25, 12))
const DEN = 24 * 3600 * 1000
// Záznam před `dni` dny s hodnocením (klíče potřeb → úroveň).
const z = (dni, hodnoceni) => ({ text: 'x', vytvoreno: new Date(TED.getTime() - dni * DEN), aiHodnoceni: hodnoceni })
// Dva záznamy s potížemi v dané potřebě v daném okně (okno 'ted' = 1.–30. den, 'driv' = 31.–60. den).
const potize = (klic, okno, uroven = 's_pomoci') => {
  const zaklad = okno === 'ted' ? 5 : 40
  return [z(zaklad, { [klic]: uroven }), z(zaklad + 3, { [klic]: uroven })]
}

describe('detekce zhoršení', () => {
  test('málo dat: málo záznamů nebo jedno z oken prázdné', () => {
    expect(vyhodnotitVyvoj([z(2, { hygiena: 'nezvlada' })], TED).doporuceni).toBe('malo_dat')
    const jenNedavno = [...potize('hygiena', 'ted'), ...potize('orientace', 'ted'), ...potize('mobilita', 'ted')]
    expect(vyhodnotitVyvoj(jenNedavno, TED).doporuceni).toBe('malo_dat')
  })

  test('beze změny, když se vzorec nemění', () => {
    const zaznamy = [...potize('hygiena', 'ted'), ...potize('hygiena', 'driv'), z(7, { stravovani: 'zvlada' }), z(45, { stravovani: 'zvlada' })]
    const v = vyhodnotitVyvoj(zaznamy, TED)
    expect(v.doporuceni).toBe('beze_zmeny')
    expect(v.zmeny).toEqual([])
  })

  test('nová nezvládaná oblast bez změny stupně = sledovat', () => {
    const zaznamy = [...potize('hygiena', 'driv'), ...potize('hygiena', 'ted'), ...potize('orientace', 'ted')]
    const v = vyhodnotitVyvoj(zaznamy, TED)
    expect(v.doporuceni).toBe('sledovat')
    expect(v.zmeny).toEqual([{ kategorie: 'orientace', typ: 'nova', nedavno: 2, predtim: 0 }])
    expect(v.odhad.nedavno.stupen).toBe(0)
  })

  test('vyšší odhadovaný stupeň = zvážit žádost', () => {
    const driv = [...potize('hygiena', 'driv'), ...potize('orientace', 'driv')]
    const ted = [...potize('hygiena', 'ted'), ...potize('orientace', 'ted'), ...potize('mobilita', 'ted', 'nezvlada')]
    const v = vyhodnotitVyvoj([...driv, ...ted], TED)
    expect(v.odhad).toEqual({ nedavno: { stupen: 1, pocet: 3 }, predtim: { stupen: 0, pocet: 2 } })
    expect(v.doporuceni).toBe('zvazit_zadost')
    expect(v.zmeny.map((c) => c.kategorie)).toEqual(['mobilita'])
  })

  test('přibývání potíží v už nezvládané oblasti', () => {
    const zaznamy = [...potize('hygiena', 'driv'), ...potize('hygiena', 'ted'), ...potize('hygiena', 'ted'), ...potize('orientace', 'driv')]
    const v = vyhodnotitVyvoj(zaznamy, TED)
    expect(v.zmeny).toEqual([{ kategorie: 'hygiena', typ: 'pribyva', nedavno: 4, predtim: 2 }])
  })

  test('stejně časté potíže, ale těžší (s pomocí → nezvládá)', () => {
    const zaznamy = [...potize('hygiena', 'driv', 's_pomoci'), ...potize('hygiena', 'ted', 'nezvlada'), z(7, { stravovani: 'zvlada' }), z(45, { stravovani: 'zvlada' })]
    const v = vyhodnotitVyvoj(zaznamy, TED)
    expect(v.zmeny).toEqual([{ kategorie: 'hygiena', typ: 'tezsi', nedavno: 2, predtim: 2 }])
    expect(v.doporuceni).toBe('sledovat')
  })

  test('zlepšení se hlásí zvlášť a nespouští upozornění', () => {
    const zaznamy = [...potize('hygiena', 'driv'), ...potize('orientace', 'driv'), ...potize('orientace', 'ted'), z(3, { hygiena: 'zvlada' })]
    const v = vyhodnotitVyvoj(zaznamy, TED)
    expect(v.zlepseni.map((c) => c.kategorie)).toEqual(['hygiena'])
    expect(v.doporuceni).toBe('beze_zmeny')
  })

  test('záznamy starší než 60 dní a z budoucnosti se ignorují', () => {
    const stare = [z(70, { mobilita: 'nezvlada' }), z(75, { mobilita: 'nezvlada' }), z(-3, { mobilita: 'nezvlada' }), z(-4, { mobilita: 'nezvlada' })]
    const v = vyhodnotitVyvoj([...stare, ...potize('hygiena', 'driv'), ...potize('hygiena', 'ted')], TED)
    expect(v.pocetZaznamu).toEqual({ nedavno: 2, predtim: 2 })
  })

  test('záznamy bez hodnocení se nepočítají', () => {
    const v = vyhodnotitVyvoj([{ text: 'x', vytvoreno: new Date(TED.getTime() - DEN), aiHodnoceni: null }], TED)
    expect(v.pocetZaznamu).toEqual({ nedavno: 0, predtim: 0 })
  })
})

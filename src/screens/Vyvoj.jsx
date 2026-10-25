// Vývoj stavu: srovnání posledního měsíce s předchozím podle zápisů v deníku.
// Texty jsou klidné a nikdy netvrdí, že se něco "stalo": jde o orientační
// upozornění z poznámek rodiny, ne o diagnózu ani radu. O příspěvku rozhoduje úřad.

import { useEffect, useState } from 'react'
import { NAZVY_KATEGORII } from '../services/kategorie.js'
import { nacistVyvoj } from '../services/vyvoj.js'
import { Chyba, Nacitani, Prazdno } from './komponenty.jsx'

const STUPEN = ['žádný stupeň', 'stupeň I (lehká závislost)', 'stupeň II (středně těžká závislost)', 'stupeň III (těžká závislost)', 'stupeň IV (úplná závislost)']

const POPISKY_ZMEN = { nova: 'nová potíž', pribyva: 'potíží přibývá', tezsi: 'potíže jsou těžší' }

function Shrnuti({ v }) {
  switch (v.doporuceni) {
    case 'malo_dat':
      return (
        <div className="hlaska info">
          <p>Zatím je v deníku málo zápisů na srovnání.</p>
          <p>Až jich bude aspoň 6 za poslední dva měsíce, ukážeme, jak se situace vyvíjí. Čím pravidelněji zapisujete, tím je přehled užitečnější.</p>
        </div>
      )
    case 'zvazit_zadost':
      return (
        <div className="hlaska varovani">
          <p><strong>Za poslední měsíc vychází orientačně vyšší stupeň než dřív</strong> (dříve {STUPEN[v.odhad.predtim.stupen]}, nyní {STUPEN[v.odhad.nedavno.stupen]}).</p>
          <p>Pokud se zdravotní stav opravdu zhoršil, můžete na úřadu práce požádat o nové posouzení a zvýšení příspěvku na péči. Podklad z deníku připravíš v záložce Podklady.</p>
          <p className="jemne">Jde jen o odhad z vašich poznámek. O stupni rozhoduje úřad na základě šetření a posudku.</p>
        </div>
      )
    case 'sledovat':
      return (
        <div className="hlaska info">
          <p><strong>Za poslední měsíc přibyly potíže v některých oblastech.</strong></p>
          <p>Na vyšší stupeň to zatím nevypadá, ale stojí za to dál zapisovat a vývoj sledovat.</p>
        </div>
      )
    default:
      return (
        <div className="hlaska ok">
          <p>V posledním měsíci nevidíme výraznou změnu oproti předchozímu.</p>
        </div>
      )
  }
}

export default function Vyvoj({ rodina, osoby }) {
  const [osobaId, setOsobaId] = useState('')
  const [vysledek, setVysledek] = useState(null)
  const [chyba, setChyba] = useState(null)

  useEffect(() => {
    if (osoby.length && !osoby.some((o) => o.id === osobaId)) setOsobaId(osoby[0].id)
  }, [osoby, osobaId])

  useEffect(() => {
    if (!osobaId) return
    let zruseno = false
    setVysledek(null)
    setChyba(null)
    nacistVyvoj(rodina.id, osobaId).then((v) => !zruseno && setVysledek(v)).catch((e) => !zruseno && setChyba(e))
    return () => { zruseno = true }
  }, [rodina.id, osobaId])

  if (osoby.length === 0) return <Prazdno>Nejdřív přidej osobu a piš do deníku. Z něj se vývoj spočítá.</Prazdno>

  return (
    <section>
      <h2>Vývoj stavu</h2>
      <p className="jemne">
        Srovnání posledních {vysledek?.dni ?? 30} dní s předchozími. Vychází jen ze zápisů v deníku a z jejich třídění,
        je orientační a může se mýlit.
      </p>
      {osoby.length > 1 && (
        <label className="pole">
          <span className="pole-popisek">O koho jde?</span>
          <select value={osobaId} onChange={(e) => setOsobaId(e.target.value)}>
            {osoby.map((o) => <option key={o.id} value={o.id}>{o.jmeno}</option>)}
          </select>
        </label>
      )}
      <Chyba chyba={chyba} />
      {!vysledek && !chyba && <Nacitani />}
      {vysledek && (
        <>
          <Shrnuti v={vysledek} />
          {vysledek.zmeny.length > 0 && (
            <>
              <h3>Co přibylo</h3>
              <ul className="seznam">
                {vysledek.zmeny.map((c) => (
                  <li key={c.kategorie} className="polozka radek">
                    <strong>{NAZVY_KATEGORII[c.kategorie]}</strong>
                    <span>{POPISKY_ZMEN[c.typ]}: {c.predtim} → {c.nedavno} zápisů</span>
                  </li>
                ))}
              </ul>
            </>
          )}
          {vysledek.zlepseni.length > 0 && (
            <>
              <h3>Co se zlepšilo</h3>
              <ul className="seznam">
                {vysledek.zlepseni.map((c) => (
                  <li key={c.kategorie} className="polozka radek">
                    <strong>{NAZVY_KATEGORII[c.kategorie]}</strong>
                    <span>potíží ubylo: {c.predtim} → {c.nedavno} zápisů</span>
                  </li>
                ))}
              </ul>
            </>
          )}
          <p className="jemne">Zápisů s hodnocením: poslední období {vysledek.pocetZaznamu.nedavno}, předchozí {vysledek.pocetZaznamu.predtim}.</p>
        </>
      )}
    </section>
  )
}

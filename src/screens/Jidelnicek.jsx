// Jídelníček na týden. Nahoře se ukazují alergie z nouzové karty, ať se na ně při
// plánování nezapomene. Dietní omezení a upozornění ověřuje lékař, ne Opatruj.

import { useEffect, useState } from 'react'
import { JIDLA, dnyTydne, sledovatTyden, ulozitDen } from '../services/jidelnicek.js'
import { dnes } from '../services/leky.js'
import { sledovatKartu } from '../services/nouzova.js'
import { Chyba, Nacitani, Pole, Prazdno, useOdeslani, useSeznam } from './komponenty.jsx'

function Den({ rodina, osobaId, den, data, dnesni }) {
  const [hodnoty, setHodnoty] = useState(data ?? {})
  const [ulozeno, setUlozeno] = useState(false)
  const { bezi, chyba, spustit } = useOdeslani()
  // Po změně dat ze serveru (jiný člen rodiny) se formulář obnoví.
  useEffect(() => { setHodnoty(data ?? {}) }, [data])

  const uloz = (e) => {
    e.preventDefault()
    spustit(async () => { await ulozitDen(rodina.id, osobaId, den.datum, hodnoty); setUlozeno(true) })
  }
  const nastavit = (k) => (e) => { setHodnoty({ ...hodnoty, [k]: e.target.value }); setUlozeno(false) }

  return (
    <details className={dnesni ? 'rada dnesni' : 'rada'} open={dnesni || undefined}>
      <summary>
        {den.nazev} {den.den}. {den.mesic}.{dnesni ? ' (dnes)' : ''}
        <span className="jemne"> {data?.obed ? `· oběd: ${data.obed.slice(0, 40)}` : ''}</span>
      </summary>
      <form onSubmit={uloz} className="den-formular">
        {JIDLA.map((j) => <Pole key={j.klic} popisek={j.nazev} maxLength={200} value={hodnoty[j.klic] ?? ''} onChange={nastavit(j.klic)} />)}
        <Pole popisek="Poznámka" napoveda="Třeba „bez soli“ nebo „kašovitě“." maxLength={200} value={hodnoty.poznamka ?? ''} onChange={nastavit('poznamka')} />
        <Chyba chyba={chyba} />
        {ulozeno && <p className="hlaska ok" role="status">Uloženo.</p>}
        <button className="tlacitko" disabled={bezi}>Uložit den</button>
      </form>
    </details>
  )
}

export default function Jidelnicek({ rodina, osoby }) {
  const [osobaId, setOsobaId] = useState('')
  const [posun, setPosun] = useState(0)
  const [alergie, setAlergie] = useState('')
  useEffect(() => {
    if (osoby.length && !osoby.some((o) => o.id === osobaId)) setOsobaId(osoby[0].id)
  }, [osoby, osobaId])

  const dny = dnyTydne(posun)
  const tyden = useSeznam((ok, ko) => (osobaId ? sledovatTyden(rodina.id, osobaId, dny, ok, ko) : () => {}), [rodina.id, osobaId, dny[0].datum])
  useEffect(() => {
    if (!osobaId) return undefined
    return sledovatKartu(rodina.id, osobaId, (k) => setAlergie(k.alergie ?? ''), () => {})
  }, [rodina.id, osobaId])

  if (osoby.length === 0) return <Prazdno>Nejdřív přidej osobu v záložce Osoby.</Prazdno>
  const poDnech = Object.fromEntries((tyden.data ?? []).map((d) => [d.id, d]))
  const dneska = dnes()

  return (
    <section>
      <h2>Jídelníček</h2>
      {alergie
        ? <div className="hlaska varovani" role="note"><strong>Pozor, alergie:</strong> {alergie}</div>
        : <p className="jemne">Alergie se tu ukážou, když je vyplníš v Nouzové kartě.</p>}
      {osoby.length > 1 && (
        <label className="pole">
          <span className="pole-popisek">O koho jde?</span>
          <select value={osobaId} onChange={(e) => setOsobaId(e.target.value)}>
            {osoby.map((o) => <option key={o.id} value={o.id}>{o.jmeno}</option>)}
          </select>
        </label>
      )}
      <div className="tyden-nav">
        <button className="odkaz maly" onClick={() => setPosun(posun - 1)}>← Předchozí týden</button>
        <strong>{dny[0].den}. {dny[0].mesic}. – {dny[6].den}. {dny[6].mesic}.</strong>
        <button className="odkaz maly" onClick={() => setPosun(posun + 1)}>Další týden →</button>
      </div>
      {tyden.chyba && <Chyba chyba={tyden.chyba} />}
      {!tyden.data && !tyden.chyba && <Nacitani />}
      {tyden.data && dny.map((den) => (
        <Den key={den.datum + osobaId} rodina={rodina} osobaId={osobaId} den={den} data={poDnech[den.datum]} dnesni={den.datum === dneska} />
      ))}
    </section>
  )
}

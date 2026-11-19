// Léky: seznam a denní odškrtávání "podáno". Čtou a píšou jen pečovatel a člen
// (seznam léků prozrazuje zdravotní stav). Opatruj nenahrazuje pokyny lékaře.

import { useEffect, useState } from 'react'
import { sledovatClenyRodiny } from '../services/family.js'
import { dnes, nastavitAktivni, oznacitPodano, pridatLek, rozdelitCasy, sledovatLeky, sledovatPodani, vzitPodaniZpet, idPodani } from '../services/leky.js'
import { Chyba, formatCas, Nacitani, Pole, Prazdno, useOdeslani, useSeznam } from './komponenty.jsx'

function Dnes({ rodina, osoba, uid, leky }) {
  const datum = dnes()
  const podani = useSeznam((ok, ko) => sledovatPodani(rodina.id, osoba.id, datum, ok, ko), [rodina.id, osoba.id, datum])
  const clenove = useSeznam((ok, ko) => sledovatClenyRodiny(rodina.id, ok, ko), [rodina.id])
  const { chyba, spustit } = useOdeslani()

  const aktivni = leky.filter((l) => l.aktivni)
  const davky = aktivni.flatMap((l) => l.casy.map((cas) => ({ lek: l, cas }))).sort((a, b) => a.cas.localeCompare(b.cas) || a.lek.nazev.localeCompare(b.lek.nazev, 'cs'))
  const podaneJako = Object.fromEntries((podani.data ?? []).map((p) => [p.id, p]))
  const jmeno = (u) => clenove.data?.find((c) => c.uid === u)?.jmeno || 'někdo z rodiny'

  if (davky.length === 0) return <Prazdno>Zatím tu není žádný aktivní lék. Přidej ho níže.</Prazdno>
  if (!podani.data && !podani.chyba) return <Nacitani />

  return (
    <>
      <Chyba chyba={podani.chyba} />
      <Chyba chyba={chyba} />
      <ul className="seznam">
        {davky.map(({ lek, cas }) => {
          const p = podaneJako[idPodani(lek.id, datum, cas)]
          return (
            <li key={`${lek.id}${cas}`} className="polozka radek">
              <label className="zaskrtnuti">
                <input
                  type="checkbox"
                  checked={!!p}
                  onChange={(e) => spustit(() => (e.target.checked
                    ? oznacitPodano(rodina.id, osoba.id, lek.id, datum, cas, uid)
                    : vzitPodaniZpet(rodina.id, osoba.id, lek.id, datum, cas)))}
                />
                <span className={p ? 'hotovo' : ''}>
                  <strong>{cas}</strong> {lek.nazev}{lek.davka ? `, ${lek.davka}` : ''}
                  {lek.poznamka && <span className="jemne"> · {lek.poznamka}</span>}
                </span>
              </label>
              {p && <span className="jemne">podal/a {jmeno(p.podalUid)}, {formatCas(p.vytvoreno)}</span>}
            </li>
          )
        })}
      </ul>
    </>
  )
}

function NovyLek({ rodina, osoba }) {
  const [formular, setFormular] = useState({ nazev: '', davka: '', casy: '8:00', poznamka: '' })
  const [chybaCasu, setChybaCasu] = useState(null)
  const { bezi, chyba, spustit } = useOdeslani()
  const nastavit = (pole) => (e) => setFormular({ ...formular, [pole]: e.target.value })

  const odeslat = (e) => {
    e.preventDefault()
    const casy = rozdelitCasy(formular.casy)
    if (!casy) return setChybaCasu('Zadej časy jako 8:00, 12:30, 20:00 (oddělené čárkou).')
    setChybaCasu(null)
    spustit(async () => {
      await pridatLek(rodina.id, osoba.id, { ...formular, casy })
      setFormular({ nazev: '', davka: '', casy: '8:00', poznamka: '' })
    })
  }

  return (
    <form onSubmit={odeslat} className="karta">
      <h3>Přidat lék</h3>
      <Pole popisek="Název léku" required maxLength={100} value={formular.nazev} onChange={nastavit('nazev')} />
      <Pole popisek="Dávka" napoveda="Třeba „5 mg“ nebo „půl tablety“." maxLength={60} value={formular.davka} onChange={nastavit('davka')} />
      <Pole popisek="V kolik hodin" napoveda="Více časů odděl čárkou, třeba 8:00, 20:00." required value={formular.casy} onChange={nastavit('casy')} />
      <Pole popisek="Poznámka" napoveda="Třeba „po jídle“." maxLength={100} value={formular.poznamka} onChange={nastavit('poznamka')} />
      <Chyba chyba={chybaCasu} />
      <Chyba chyba={chyba} />
      <button className="tlacitko" disabled={bezi}>Přidat lék</button>
    </form>
  )
}

export default function Leky({ rodina, uid, osoby }) {
  const [osobaId, setOsobaId] = useState('')
  useEffect(() => {
    if (osoby.length && !osoby.some((o) => o.id === osobaId)) setOsobaId(osoby[0].id)
  }, [osoby, osobaId])
  const osoba = osoby.find((o) => o.id === osobaId)
  const leky = useSeznam((ok, ko) => (osobaId ? sledovatLeky(rodina.id, osobaId, ok, ko) : () => {}), [rodina.id, osobaId])

  if (osoby.length === 0) return <Prazdno>Nejdřív přidej osobu v záložce Osoby.</Prazdno>

  return (
    <section>
      <h2>Léky</h2>
      <p className="hlaska info">
        Slouží jako pomůcka, ať víte, kdo co podal. Opatruj nenahrazuje pokyny lékaře ani lékárníka. Seznam si ověř podle lékařské zprávy.
      </p>
      {osoby.length > 1 && (
        <label className="pole">
          <span className="pole-popisek">O koho jde?</span>
          <select value={osobaId} onChange={(e) => setOsobaId(e.target.value)}>
            {osoby.map((o) => <option key={o.id} value={o.id}>{o.jmeno}</option>)}
          </select>
        </label>
      )}
      <h3>Dnes</h3>
      {leky.chyba && <Chyba chyba={leky.chyba} />}
      {!leky.data && !leky.chyba && <Nacitani />}
      {leky.data && osoba && <Dnes rodina={rodina} osoba={osoba} uid={uid} leky={leky.data} />}

      {leky.data?.length > 0 && (
        <>
          <h3>Všechny léky</h3>
          <ul className="seznam">
            {leky.data.map((l) => (
              <li key={l.id} className="polozka radek">
                <div>
                  <strong>{l.nazev}</strong>{l.davka ? `, ${l.davka}` : ''}
                  <p className="jemne">{l.casy.join(', ')}{l.aktivni ? '' : ' · nepodává se'}</p>
                </div>
                <button className="odkaz maly" onClick={() => nastavitAktivni(rodina.id, osobaId, l.id, !l.aktivni)}>
                  {l.aktivni ? 'Přestat podávat' : 'Obnovit'}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
      {osoba && <NovyLek rodina={rodina} osoba={osoba} />}
    </section>
  )
}

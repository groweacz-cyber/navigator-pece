// Rychlá karta pro nového pečovatele: odvozený pohled z biografie a krizového plánu
// na jedné obrazovce. Čtou ji všechny role včetně hosta (nic ze zdravotních údajů).

import { useEffect, useState } from 'react'
import { sledovatKrizovyPlan } from '../services/krizovyPlan.js'
import { Nacitani, Prazdno, useSeznam } from './komponenty.jsx'

function Blok({ nadpis, text }) {
  if (!text) return null
  return (
    <div className="karta-blok">
      <h3>{nadpis}</h3>
      <p>{text}</p>
    </div>
  )
}

export default function RychlaKarta({ rodina, osoby }) {
  const [osobaId, setOsobaId] = useState('')
  useEffect(() => {
    if (osoby.length && !osoby.some((o) => o.id === osobaId)) setOsobaId(osoby[0].id)
  }, [osoby, osobaId])

  const osoba = osoby.find((o) => o.id === osobaId)
  const plan = useSeznam((ok, ko) => (osobaId ? sledovatKrizovyPlan(rodina.id, osobaId, ok, ko) : () => {}), [rodina.id, osobaId])

  if (osoby.length === 0) return <Prazdno>Zatím tu není nikdo, o koho by se pečovalo.</Prazdno>
  const b = osoba?.biografie ?? {}
  const prazdna = !b.zvyky && !b.uklidni && !b.vyvarovat

  return (
    <section>
      <h2>Rychlá karta</h2>
      <p className="jemne">Co je dobré vědět, když jsi s člověkem poprvé nebo po delší době.</p>
      {osoby.length > 1 && (
        <label className="pole">
          <span className="pole-popisek">O koho jde?</span>
          <select value={osobaId} onChange={(e) => setOsobaId(e.target.value)}>
            {osoby.map((o) => <option key={o.id} value={o.id}>{o.jmeno}</option>)}
          </select>
        </label>
      )}
      <div className="karta rychla-karta">
        <h3 className="karta-jmeno">{osoba?.jmeno}</h3>
        {prazdna && <Prazdno>Biografie zatím není vyplněná. Doplnit ji jde v záložce Osoby.</Prazdno>}
        <Blok nadpis="Jak s ním/ní dnes mluvit a co uklidní" text={b.uklidni} />
        <Blok nadpis="Čeho se vyvarovat" text={b.vyvarovat} />
        <Blok nadpis="Zvyky a rituály" text={b.zvyky} />
        <div className="karta-blok">
          <h3>Co dělat, když…</h3>
          {!plan.data && !plan.chyba && <Nacitani />}
          {plan.data?.length === 0 && <p className="jemne">Zatím žádný postup.</p>}
          {plan.data?.map((p) => (
            <p key={p.id}><strong>{p.situace}:</strong> {p.postup}</p>
          ))}
        </div>
      </div>
    </section>
  )
}

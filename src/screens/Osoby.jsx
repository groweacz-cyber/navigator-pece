import { useState } from 'react'
import { pridatOsobu, ulozitBiografii } from '../services/carePersons.js'
import { pridatPostup, sledovatKrizovyPlan, smazatPostup } from '../services/krizovyPlan.js'
import { Chyba, Nacitani, Pole, Prazdno, useOdeslani, useSeznam } from './komponenty.jsx'

function Biografie({ rodina, osoba, mozeUpravit }) {
  const b = osoba.biografie ?? {}
  const [zvyky, setZvyky] = useState(b.zvyky ?? '')
  const [uklidni, setUklidni] = useState(b.uklidni ?? '')
  const [vyvarovat, setVyvarovat] = useState(b.vyvarovat ?? '')
  const { bezi, chyba, spustit } = useOdeslani()
  const [ulozeno, setUlozeno] = useState(false)

  const ulozit = (e) => {
    e.preventDefault()
    spustit(async () => {
      await ulozitBiografii(rodina.id, osoba.id, { zvyky, uklidni, vyvarovat })
      setUlozeno(true)
    })
  }

  if (!mozeUpravit) {
    return (
      <div>
        <h4>Co je dobré vědět</h4>
        {!b.zvyky && !b.uklidni && !b.vyvarovat && <Prazdno>Zatím nic nevyplněno.</Prazdno>}
        {b.zvyky && <p><strong>Zvyky a rituály:</strong> {b.zvyky}</p>}
        {b.uklidni && <p><strong>Co uklidní:</strong> {b.uklidni}</p>}
        {b.vyvarovat && <p><strong>Čeho se vyvarovat:</strong> {b.vyvarovat}</p>}
      </div>
    )
  }
  return (
    <form onSubmit={ulozit}>
      <h4>Co je dobré vědět</h4>
      <p className="jemne">Pomůže to komukoli, kdo se o člověka postará poprvé. Čtou to i hosté.</p>
      <Pole popisek="Zvyky a rituály" rows={3} value={zvyky} onChange={(e) => { setZvyky(e.target.value); setUlozeno(false) }} />
      <Pole popisek="Co ho/ji uklidní" rows={3} value={uklidni} onChange={(e) => { setUklidni(e.target.value); setUlozeno(false) }} />
      <Pole popisek="Čeho se vyvarovat" rows={3} value={vyvarovat} onChange={(e) => { setVyvarovat(e.target.value); setUlozeno(false) }} />
      <Chyba chyba={chyba} />
      {ulozeno && <p className="hlaska ok" role="status">Uloženo.</p>}
      <button className="tlacitko" disabled={bezi}>Uložit</button>
    </form>
  )
}

function KrizovyPlan({ rodina, osoba, mozeUpravit }) {
  const [situace, setSituace] = useState('')
  const [postup, setPostup] = useState('')
  const { bezi, chyba, spustit } = useOdeslani()
  const plan = useSeznam((ok, ko) => sledovatKrizovyPlan(rodina.id, osoba.id, ok, ko), [rodina.id, osoba.id])

  const pridat = (e) => {
    e.preventDefault()
    spustit(async () => {
      await pridatPostup(rodina.id, osoba.id, { situace, postup })
      setSituace('')
      setPostup('')
    })
  }

  return (
    <div>
      <h4>Co dělat, když…</h4>
      {plan.chyba && <Chyba chyba={plan.chyba} />}
      {!plan.data && !plan.chyba && <Nacitani />}
      {plan.data?.length === 0 && <Prazdno>Zatím žádný postup.</Prazdno>}
      <ul className="seznam">
        {plan.data?.map((p) => (
          <li key={p.id} className="polozka">
            <strong>{p.situace}</strong>
            <p>{p.postup}</p>
            {mozeUpravit && <button className="odkaz maly" onClick={() => smazatPostup(rodina.id, osoba.id, p.id)}>Smazat</button>}
          </li>
        ))}
      </ul>
      {mozeUpravit && (
        <form onSubmit={pridat} className="karta">
          <Pole popisek="Situace" napoveda="Třeba „Ztratí se“ nebo „Odmítá jíst“." required maxLength={200} value={situace} onChange={(e) => setSituace(e.target.value)} />
          <Pole popisek="Co udělat" rows={3} required maxLength={2000} value={postup} onChange={(e) => setPostup(e.target.value)} />
          <Chyba chyba={chyba} />
          <button className="tlacitko" disabled={bezi}>Přidat postup</button>
        </form>
      )}
    </div>
  )
}

export default function Osoby({ rodina, osoby, plnyPristup }) {
  const [jmeno, setJmeno] = useState('')
  const [otevrena, setOtevrena] = useState(null)
  const { bezi, chyba, spustit } = useOdeslani()

  const pridat = (e) => {
    e.preventDefault()
    spustit(async () => {
      const ref = await pridatOsobu(rodina.id, jmeno)
      setJmeno('')
      setOtevrena(ref.id)
    })
  }

  return (
    <section>
      <h2>Osoby, o které pečujete</h2>
      {plnyPristup && (
        <form onSubmit={pridat} className="karta">
          <Pole popisek="Jméno" required maxLength={100} value={jmeno} onChange={(e) => setJmeno(e.target.value)} />
          <Chyba chyba={chyba} />
          <button className="tlacitko" disabled={bezi}>Přidat osobu</button>
        </form>
      )}
      {osoby.length === 0 && <Prazdno>{plnyPristup ? 'Přidej první osobu.' : 'Zatím tu nikdo není.'}</Prazdno>}
      <ul className="seznam">
        {osoby.map((o) => (
          <li key={o.id} className="polozka">
            <button className="radek-tlacitko" aria-expanded={otevrena === o.id} onClick={() => setOtevrena(otevrena === o.id ? null : o.id)}>
              <strong>{o.jmeno}</strong>
              <span>{otevrena === o.id ? 'Skrýt' : 'Otevřít'}</span>
            </button>
            {otevrena === o.id && (
              <div className="rozbaleno">
                <Biografie rodina={rodina} osoba={o} mozeUpravit={plnyPristup} />
                <KrizovyPlan rodina={rodina} osoba={o} mozeUpravit={plnyPristup} />
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}

import { useState } from 'react'
import { sledovatClenyRodiny, vytvoritPozvanku } from '../services/family.js'
import { Chyba, Nacitani, useOdeslani, useSeznam } from './komponenty.jsx'

const ROLE = { pecovatel: 'hlavní pečovatel', clen: 'člen', host: 'host' }

function Pozvanka({ rodina }) {
  const [role, setRole] = useState('clen')
  const [pozvanka, setPozvanka] = useState(null)
  const [zkopirovano, setZkopirovano] = useState(false)
  const { bezi, chyba, spustit } = useOdeslani()

  const vytvorit = (e) => {
    e.preventDefault()
    spustit(async () => {
      setPozvanka(await vytvoritPozvanku(rodina.id, role))
      setZkopirovano(false)
    })
  }

  const odkaz = pozvanka ? `${window.location.origin}/?pozvanka=${pozvanka.kod}` : ''
  const zkopirovat = async () => {
    try {
      await navigator.clipboard.writeText(odkaz)
      setZkopirovano(true)
    } catch {
      /* schránka nemusí být dostupná, odkaz je vidět a jde ho označit ručně */
    }
  }

  return (
    <form onSubmit={vytvorit} className="karta">
      <h3>Pozvat někoho do rodiny</h3>
      <label className="pole">
        <span className="pole-popisek">Kdo to je?</span>
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="clen">Člen – vidí vše, i deník a zdravotní údaje</option>
          <option value="host">Host – úkoly, kontakty, biografie a krizový plán</option>
        </select>
      </label>
      <Chyba chyba={chyba} />
      <button className="tlacitko" disabled={bezi}>Vytvořit pozvánku</button>
      {pozvanka && (
        <div className="pozvanka">
          <p>Pošli tenhle odkaz. Platí 7 dní a jde použít jen jednou.</p>
          <input readOnly value={odkaz} onFocus={(e) => e.target.select()} aria-label="Odkaz na pozvánku" />
          <button type="button" className="tlacitko druhe" onClick={zkopirovat}>{zkopirovano ? 'Zkopírováno' : 'Zkopírovat odkaz'}</button>
        </div>
      )}
    </form>
  )
}

export default function Clenove({ rodina }) {
  const clenove = useSeznam((ok, ko) => sledovatClenyRodiny(rodina.id, ok, ko), [rodina.id])
  return (
    <section>
      <h2>Rodina {rodina.nazev}</h2>
      {clenove.chyba && <Chyba chyba={clenove.chyba} />}
      {!clenove.data && !clenove.chyba && <Nacitani />}
      <ul className="seznam">
        {clenove.data?.map((c) => (
          <li key={c.uid} className="polozka radek">
            <strong>{c.jmeno || 'Člen rodiny'}</strong>
            <span className="jemne">{ROLE[c.role] ?? c.role}</span>
          </li>
        ))}
      </ul>
      {rodina.role === 'pecovatel' && <Pozvanka rodina={rodina} />}
    </section>
  )
}

import { useState } from 'react'
import { odebratClena, sledovatClenyRodiny, vytvoritPozvanku, zmenitRoli } from '../services/family.js'
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

function Clen({ rodina, clen, jsem, onChyba }) {
  const jePecovatel = rodina.role === 'pecovatel'
  const { bezi, spustit } = useOdeslani()

  const zmenit = async (role) => {
    onChyba(null)
    try {
      await zmenitRoli(rodina.id, clen.uid, role)
      // Vlastní role se mění i v hlavičce a v nabídce záložek, nejjednodušší je načíst znovu.
      if (jsem) window.location.reload()
    } catch (e) {
      onChyba(e)
    }
  }
  const odebrat = () => {
    const otazka = jsem ? 'Opravdu chceš odejít z téhle rodiny?' : `Odebrat ${clen.jmeno || 'tohoto člena'} z rodiny?`
    if (!window.confirm(otazka)) return
    onChyba(null)
    spustit(() => odebratClena(rodina.id, clen.uid)).then(() => jsem && window.location.reload())
  }

  return (
    <li className="polozka radek">
      <div>
        <strong>{clen.jmeno || 'Člen rodiny'}{jsem ? ' (ty)' : ''}</strong>
        {!jePecovatel && <p className="jemne">{ROLE[clen.role] ?? clen.role}</p>}
      </div>
      <div className="akce-clena">
        {jePecovatel && (
          <select aria-label={`Role: ${clen.jmeno || 'člen'}`} value={clen.role} onChange={(e) => zmenit(e.target.value)}>
            {Object.entries(ROLE).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        )}
        {(jePecovatel || jsem) && (
          <button className="odkaz maly" disabled={bezi} onClick={odebrat}>{jsem ? 'Odejít' : 'Odebrat'}</button>
        )}
      </div>
    </li>
  )
}

export default function Clenove({ rodina, uid }) {
  const clenove = useSeznam((ok, ko) => sledovatClenyRodiny(rodina.id, ok, ko), [rodina.id])
  const [chyba, setChyba] = useState(null)
  return (
    <section>
      <h2>Rodina {rodina.nazev}</h2>
      <Chyba chyba={chyba} />
      {clenove.chyba && <Chyba chyba={clenove.chyba} />}
      {!clenove.data && !clenove.chyba && <Nacitani />}
      <ul className="seznam">
        {clenove.data?.map((c) => <Clen key={c.uid} rodina={rodina} clen={c} jsem={c.uid === uid} onChyba={setChyba} />)}
      </ul>
      {rodina.role === 'pecovatel' && <Pozvanka rodina={rodina} />}
    </section>
  )
}

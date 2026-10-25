import { useState } from 'react'
import { nastavitHotovo, pridatUkol, sledovatUkoly, smazatUkol } from '../services/tasks.js'
import { Chyba, Nacitani, Pole, Prazdno, useOdeslani, useSeznam } from './komponenty.jsx'

export default function Ukoly({ rodina, uid }) {
  const [nazev, setNazev] = useState('')
  const { bezi, chyba, spustit } = useOdeslani()
  const ukoly = useSeznam((ok, ko) => sledovatUkoly(rodina.id, ok, ko), [rodina.id])

  const odeslat = (e) => {
    e.preventDefault()
    spustit(async () => {
      await pridatUkol(rodina.id, nazev, uid)
      setNazev('')
    })
  }

  return (
    <section>
      <h2>Úkoly</h2>
      <form onSubmit={odeslat} className="karta">
        <Pole popisek="Co je potřeba udělat?" required maxLength={200} value={nazev} onChange={(e) => setNazev(e.target.value)} />
        <Chyba chyba={chyba} />
        <button className="tlacitko" disabled={bezi}>Přidat úkol</button>
      </form>
      {ukoly.chyba && <Chyba chyba={ukoly.chyba} />}
      {!ukoly.data && !ukoly.chyba && <Nacitani />}
      {ukoly.data?.length === 0 && <Prazdno>Žádné úkoly. Aspoň je nic netíží.</Prazdno>}
      <ul className="seznam">
        {ukoly.data?.map((u) => (
          <li key={u.id} className="polozka radek">
            <label className="zaskrtnuti">
              <input type="checkbox" checked={!!u.hotovo} onChange={(e) => nastavitHotovo(rodina.id, u.id, e.target.checked)} />
              <span className={u.hotovo ? 'hotovo' : ''}>{u.nazev}</span>
            </label>
            <button className="odkaz maly" onClick={() => smazatUkol(rodina.id, u.id)}>Smazat</button>
          </li>
        ))}
      </ul>
    </section>
  )
}

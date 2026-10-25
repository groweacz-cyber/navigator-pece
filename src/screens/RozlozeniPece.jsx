import { useEffect, useState } from 'react'
import { sledovatClenyRodiny } from '../services/family.js'
import { spocitatRozlozeni } from '../services/rozlozeni.js'
import { Chyba, Nacitani, useSeznam } from './komponenty.jsx'

// Jen čísla, bez hodnocení: kdo kolik zapsal a naplánoval. Cílem je, aby rodina
// viděla, kdo toho nese hodně, ne aby si to navzájem vyčítala.
export default function RozlozeniPece({ rodina }) {
  const [rozlozeni, setRozlozeni] = useState(null)
  const [chyba, setChyba] = useState(null)
  const clenove = useSeznam((ok, ko) => sledovatClenyRodiny(rodina.id, ok, ko), [rodina.id])

  useEffect(() => {
    setRozlozeni(null)
    spocitatRozlozeni(rodina.id).then(setRozlozeni).catch(setChyba)
  }, [rodina.id])

  if (chyba) return <Chyba chyba={chyba} />
  if (!rozlozeni || !clenove.data) return <Nacitani />

  const radky = clenove.data
    .map((c) => ({ ...c, ...(rozlozeni.pocty[c.uid] ?? { zaznamy: 0, ukoly: 0 }) }))
    .sort((a, b) => (a.jmeno || '').localeCompare(b.jmeno || '', 'cs'))

  return (
    <section>
      <h2>Rozložení péče</h2>
      <p className="jemne">Posledních {rozlozeni.dni} dní. Jen počty zápisů v deníku a založených úkolů, nic víc.</p>
      <ul className="seznam">
        {radky.map((c) => (
          <li key={c.uid} className="polozka radek">
            <strong>{c.jmeno || 'Člen rodiny'}</strong>
            <span>zápisů: {c.zaznamy} · úkolů: {c.ukoly}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

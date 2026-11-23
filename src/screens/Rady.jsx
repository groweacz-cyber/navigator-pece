// Praktické rady pro pohyb doma. Čtou všichni členové včetně hosta (nic osobního).
import { KDY_PRESTAT, RADY, UPOZORNENI } from '../data/rady.js'

export default function Rady() {
  return (
    <section>
      <h2>Rady pro pohodlnější den doma</h2>
      <p className="hlaska info">{UPOZORNENI}</p>
      <div className="hlaska varovani" role="note">
        <p><strong>{KDY_PRESTAT.nadpis}.</strong> {KDY_PRESTAT.text}</p>
      </div>
      {RADY.map((r) => (
        <details key={r.id} className="rada">
          <summary>{r.ikona} {r.nazev}</summary>
          <p className="jemne">{r.uvod}</p>
          <ul className="odrazky">
            {r.tipy.map((t) => <li key={t}>{t}</li>)}
          </ul>
        </details>
      ))}
    </section>
  )
}

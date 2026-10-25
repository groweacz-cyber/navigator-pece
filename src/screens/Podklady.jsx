import { useEffect, useState } from 'react'
import { sledovatExporty, stahnoutPdf, vygenerovatPripravu } from '../services/exports.js'
import { Chyba, formatCas, Nacitani, Prazdno, useOdeslani, useSeznam } from './komponenty.jsx'

export default function Podklady({ rodina, osoby }) {
  const [osobaId, setOsobaId] = useState('')
  const { bezi, chyba, spustit } = useOdeslani()
  const stahovani = useOdeslani()
  const exporty = useSeznam((ok, ko) => sledovatExporty(rodina.id, ok, ko), [rodina.id])

  useEffect(() => {
    if (osoby.length && !osoby.some((o) => o.id === osobaId)) setOsobaId(osoby[0].id)
  }, [osoby, osobaId])

  if (osoby.length === 0) return <Prazdno>Nejdřív přidej osobu a piš do deníku. Z něj se podklad vytvoří.</Prazdno>

  const jmeno = (id) => osoby.find((o) => o.id === id)?.jmeno ?? 'neznámá osoba'

  return (
    <section>
      <h2>Příprava na sociální šetření</h2>
      <p className="hlaska info">
        Orientační podklad z poznámek rodiny. Není to zdravotnický prostředek ani posudek a neurčuje stupeň příspěvku na péči.
        O tom rozhoduje úřad.
      </p>
      <div className="karta">
        {osoby.length > 1 && (
          <label className="pole">
            <span className="pole-popisek">O koho jde?</span>
            <select value={osobaId} onChange={(e) => setOsobaId(e.target.value)}>
              {osoby.map((o) => <option key={o.id} value={o.id}>{o.jmeno}</option>)}
            </select>
          </label>
        )}
        <p className="jemne">PDF je snímek deníku k dnešnímu dni. Pozdější zápisy se do něj nepřidají, vytvoř nový.</p>
        <Chyba chyba={chyba} />
        <button className="tlacitko" disabled={bezi} onClick={() => spustit(() => vygenerovatPripravu(rodina.id, osobaId))}>
          {bezi ? 'Připravuji PDF…' : 'Vytvořit podklad (PDF)'}
        </button>
      </div>

      <h3>Hotové podklady</h3>
      <Chyba chyba={stahovani.chyba} />
      {exporty.chyba && <Chyba chyba={exporty.chyba} />}
      {!exporty.data && !exporty.chyba && <Nacitani />}
      {exporty.data?.length === 0 && <Prazdno>Zatím žádné.</Prazdno>}
      <ul className="seznam">
        {exporty.data?.map((x) => (
          <li key={x.id} className="polozka radek">
            <div>
              <strong>{jmeno(x.osobaId)}</strong>
              <p className="jemne">{formatCas(x.vytvoreno)} · záznamů v deníku: {x.pocetZaznamu}</p>
              {x.pocetBezHodnoceni > 0 && (
                <p className="jemne">{x.pocetBezHodnoceni} záznamů ještě nebylo roztříděných.</p>
              )}
            </div>
            <button className="tlacitko druhe" onClick={() => stahovani.spustit(() => stahnoutPdf(x.cesta, `priprava-${x.id}.pdf`))}>
              Stáhnout
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}

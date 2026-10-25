import { useState } from 'react'
import { pridatDokument, sledovatDokumenty, smazatDokument } from '../services/documents.js'
import { Chyba, formatCas, Nacitani, Pole, Prazdno, useOdeslani, useSeznam } from './komponenty.jsx'

export default function Dokumenty({ rodina }) {
  const [nazev, setNazev] = useState('')
  const [poznamka, setPoznamka] = useState('')
  const { bezi, chyba, spustit } = useOdeslani()
  const dokumenty = useSeznam((ok, ko) => sledovatDokumenty(rodina.id, ok, ko), [rodina.id])

  const odeslat = (e) => {
    e.preventDefault()
    spustit(async () => {
      await pridatDokument(rodina.id, { nazev, poznamka })
      setNazev('')
      setPoznamka('')
    })
  }

  return (
    <section>
      <h2>Dokumenty</h2>
      <p className="jemne">Zatím jen seznam: co je za dokument a kde je originál. Nahrávání souborů přibude později.</p>
      <form onSubmit={odeslat} className="karta">
        <Pole popisek="Název" napoveda="Třeba „Žádost o příspěvek na péči“." required maxLength={150} value={nazev} onChange={(e) => setNazev(e.target.value)} />
        <Pole popisek="Poznámka, kde je originál" rows={2} maxLength={500} value={poznamka} onChange={(e) => setPoznamka(e.target.value)} />
        <Chyba chyba={chyba} />
        <button className="tlacitko" disabled={bezi}>Přidat dokument</button>
      </form>
      {dokumenty.chyba && <Chyba chyba={dokumenty.chyba} />}
      {!dokumenty.data && !dokumenty.chyba && <Nacitani />}
      {dokumenty.data?.length === 0 && <Prazdno>Zatím žádné dokumenty.</Prazdno>}
      <ul className="seznam">
        {dokumenty.data?.map((d) => (
          <li key={d.id} className="polozka radek">
            <div>
              <strong>{d.nazev}</strong>
              {d.poznamka && <p>{d.poznamka}</p>}
              <p className="jemne">{formatCas(d.vytvoreno)}</p>
            </div>
            <button className="odkaz maly" onClick={() => window.confirm(`Smazat „${d.nazev}“ ze seznamu?`) && smazatDokument(rodina.id, d.id)}>
              Smazat
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}

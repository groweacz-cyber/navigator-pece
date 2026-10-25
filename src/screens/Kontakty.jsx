import { useState } from 'react'
import { pridatKontakt, sledovatKontakty, smazatKontakt } from '../services/contacts.js'
import { Chyba, Nacitani, Pole, Prazdno, useOdeslani, useSeznam } from './komponenty.jsx'

const PRAZDNY = { jmeno: '', role: '', telefon: '' }

export default function Kontakty({ rodina }) {
  const [formular, setFormular] = useState(PRAZDNY)
  const { bezi, chyba, spustit } = useOdeslani()
  const kontakty = useSeznam((ok, ko) => sledovatKontakty(rodina.id, ok, ko), [rodina.id])
  const nastavit = (pole) => (e) => setFormular({ ...formular, [pole]: e.target.value })

  const odeslat = (e) => {
    e.preventDefault()
    spustit(async () => {
      await pridatKontakt(rodina.id, formular)
      setFormular(PRAZDNY)
    })
  }

  return (
    <section>
      <h2>Kontakty</h2>
      <p className="jemne">Lékaři, úřady, sociální pracovnice. Vše na jednom místě, ať to nikdo nehledá.</p>
      <form onSubmit={odeslat} className="karta">
        <Pole popisek="Jméno" required maxLength={100} value={formular.jmeno} onChange={nastavit('jmeno')} />
        <Pole popisek="Kdo to je" napoveda="Třeba neurolog, úřad práce, pečovatelská služba." maxLength={100} value={formular.role} onChange={nastavit('role')} />
        <Pole popisek="Telefon" type="tel" maxLength={30} value={formular.telefon} onChange={nastavit('telefon')} />
        <Chyba chyba={chyba} />
        <button className="tlacitko" disabled={bezi}>Přidat kontakt</button>
      </form>
      {kontakty.chyba && <Chyba chyba={kontakty.chyba} />}
      {!kontakty.data && !kontakty.chyba && <Nacitani />}
      {kontakty.data?.length === 0 && <Prazdno>Zatím žádné kontakty.</Prazdno>}
      <ul className="seznam">
        {kontakty.data?.map((k) => (
          <li key={k.id} className="polozka radek">
            <div>
              <strong>{k.jmeno}</strong>
              {k.role && <p className="jemne">{k.role}</p>}
              {k.telefon && <a href={`tel:${k.telefon.replace(/\s/g, '')}`} className="telefon">{k.telefon}</a>}
            </div>
            <button className="odkaz maly" onClick={() => window.confirm(`Smazat kontakt ${k.jmeno}?`) && smazatKontakt(rodina.id, k.id)}>
              Smazat
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}

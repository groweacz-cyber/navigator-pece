// Rámec po přihlášení: záhlaví, navigace a vybraná záložka.
// Proč záložky podle role: host nesmí do deníku, dokumentů ani podkladů
// (zdravotní údaje, GDPR čl. 9). Pravidla to hlídají tak jako tak, tady jen
// neukazujeme tlačítka, která by skončila chybou.

import { useState } from 'react'
import { sledovatOsoby } from '../services/carePersons.js'
import Clenove from './Clenove.jsx'
import Denik from './Denik.jsx'
import Dokumenty from './Dokumenty.jsx'
import Kontakty from './Kontakty.jsx'
import Osoby from './Osoby.jsx'
import Podklady from './Podklady.jsx'
import RychlaKarta from './RychlaKarta.jsx'
import RozlozeniPece from './RozlozeniPece.jsx'
import Ukoly from './Ukoly.jsx'
import Vyvoj from './Vyvoj.jsx'
import { Chyba, Nacitani, useSeznam } from './komponenty.jsx'

const ZALOZKY = [
  { id: 'denik', nazev: 'Deník', jenPlny: true },
  { id: 'ukoly', nazev: 'Úkoly' },
  { id: 'karta', nazev: 'Rychlá karta' },
  { id: 'osoby', nazev: 'Osoby' },
  { id: 'kontakty', nazev: 'Kontakty' },
  { id: 'vyvoj', nazev: 'Vývoj', jenPlny: true },
  { id: 'podklady', nazev: 'Podklady', jenPlny: true },
  { id: 'dokumenty', nazev: 'Dokumenty', jenPlny: true },
  { id: 'pece', nazev: 'Rozložení péče', jenPlny: true },
  { id: 'rodina', nazev: 'Rodina' },
]

export default function Dashboard({ rodina, uid, pocetRodin, onZmenitRodinu, onOdhlasit }) {
  const plnyPristup = rodina.role !== 'host'
  const zalozky = ZALOZKY.filter((z) => plnyPristup || !z.jenPlny)
  const [aktivni, setAktivni] = useState(zalozky[0].id)
  const osoby = useSeznam((ok, ko) => sledovatOsoby(rodina.id, ok, ko), [rodina.id])

  const obsah = () => {
    if (osoby.chyba) return <Chyba chyba={osoby.chyba} />
    if (!osoby.data) return <Nacitani />
    switch (aktivni) {
      case 'denik': return <Denik rodina={rodina} uid={uid} osoby={osoby.data} />
      case 'ukoly': return <Ukoly rodina={rodina} uid={uid} />
      case 'karta': return <RychlaKarta rodina={rodina} osoby={osoby.data} />
      case 'pece': return <RozlozeniPece rodina={rodina} />
      case 'osoby': return <Osoby rodina={rodina} osoby={osoby.data} plnyPristup={plnyPristup} />
      case 'kontakty': return <Kontakty rodina={rodina} />
      case 'vyvoj': return <Vyvoj rodina={rodina} osoby={osoby.data} />
      case 'podklady': return <Podklady rodina={rodina} osoby={osoby.data} />
      case 'dokumenty': return <Dokumenty rodina={rodina} />
      default: return <Clenove rodina={rodina} uid={uid} />
    }
  }

  return (
    <div className="ramec">
      <header className="zahlavi">
        <div>
          <strong className="logo">Opatruj</strong>
          <span className="rodina-nazev">{rodina.nazev}</span>
        </div>
        <div className="zahlavi-akce">
          {pocetRodin > 1 && <button className="odkaz maly" onClick={onZmenitRodinu}>Změnit rodinu</button>}
          <button className="odkaz maly" onClick={onOdhlasit}>Odhlásit</button>
        </div>
      </header>
      <nav className="zalozky" aria-label="Hlavní navigace">
        {zalozky.map((z) => (
          <button key={z.id} className={z.id === aktivni ? 'zalozka aktivni' : 'zalozka'} aria-current={z.id === aktivni ? 'page' : undefined} onClick={() => setAktivni(z.id)}>
            {z.nazev}
          </button>
        ))}
      </nav>
      <main className="obsah">{obsah()}</main>
    </div>
  )
}

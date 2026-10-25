import { useState } from 'react'
import { prijmoutPozvanku } from '../services/family.js'
import { Chyba, Pole, useOdeslani } from './komponenty.jsx'

// Pozvánka je jednorázový kód (rodina.pozvánka), který platí 7 dní. Přijde jako
// odkaz, nebo ho jde vložit ručně. Po použití ho server zneplatní.
export default function AcceptInvite({ predvyplneno = '', onPrijato, onZpet }) {
  const [kod, setKod] = useState(predvyplneno)
  const { bezi, chyba, spustit } = useOdeslani()

  const odeslat = (e) => {
    e.preventDefault()
    spustit(async () => {
      const { rodinaId } = await prijmoutPozvanku(kod)
      onPrijato(rodinaId)
    })
  }

  return (
    <main className="stred">
      <h1>Pozvánka do rodiny</h1>
      <p className="podtitul">Vlož kód z pozvánky, nebo otevři odkaz, který ti někdo poslal.</p>
      <form onSubmit={odeslat} className="karta">
        <Pole popisek="Kód pozvánky" required autoComplete="off" spellCheck={false} value={kod} onChange={(e) => setKod(e.target.value)} />
        <Chyba chyba={chyba} />
        <button className="tlacitko" disabled={bezi}>{bezi ? 'Ověřuji…' : 'Přijmout pozvánku'}</button>
      </form>
      {onZpet && <button className="odkaz" onClick={onZpet}>Zpět</button>}
    </main>
  )
}

import { useState } from 'react'
import { zalozitRodinu } from '../services/family.js'
import { Chyba, Pole, useOdeslani } from './komponenty.jsx'

export default function CreateFamily({ onZalozeno, onPozvanka, onOdhlasit }) {
  const [nazev, setNazev] = useState('')
  const { bezi, chyba, spustit } = useOdeslani()

  const odeslat = (e) => {
    e.preventDefault()
    spustit(async () => {
      const { rodinaId } = await zalozitRodinu(nazev)
      onZalozeno(rodinaId)
    })
  }

  return (
    <main className="stred">
      <h1>Založíme vaši rodinu</h1>
      <p className="podtitul">
        Rodina je společné místo, kde si pečující sdílejí deník, úkoly a kontakty. Ostatní do ní pak pozveš.
      </p>
      <form onSubmit={odeslat} className="karta">
        <Pole
          popisek="Název rodiny"
          napoveda="Třeba „Rodina Novákových“ nebo „Péče o babičku“."
          required
          maxLength={80}
          value={nazev}
          onChange={(e) => setNazev(e.target.value)}
        />
        <Chyba chyba={chyba} />
        <button className="tlacitko" disabled={bezi}>{bezi ? 'Zakládám…' : 'Založit rodinu'}</button>
      </form>
      <button className="odkaz" onClick={onPozvanka}>Dostal/a jsem pozvánku</button>
      <button className="odkaz" onClick={onOdhlasit}>Odhlásit se</button>
    </main>
  )
}

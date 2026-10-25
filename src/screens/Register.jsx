import { useState } from 'react'
import { registrovat } from '../services/auth.js'
import { Chyba, Pole, useOdeslani } from './komponenty.jsx'

export default function Register({ onPrihlaseni, upozorneni }) {
  const [jmeno, setJmeno] = useState('')
  const [email, setEmail] = useState('')
  const [heslo, setHeslo] = useState('')
  const { bezi, chyba, spustit } = useOdeslani()

  const odeslat = (e) => {
    e.preventDefault()
    spustit(() => registrovat({ jmeno, email, heslo }))
  }

  return (
    <main className="stred">
      <h1>Opatruj</h1>
      <p className="podtitul">Vytvoř si účet. Zabere to chviličku.</p>
      {upozorneni && <p className="hlaska info">{upozorneni}</p>}
      <form onSubmit={odeslat} className="karta">
        <Pole popisek="Jak ti máme říkat?" autoComplete="name" required value={jmeno} onChange={(e) => setJmeno(e.target.value)} />
        <Pole popisek="E-mail" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <Pole
          popisek="Heslo"
          napoveda="Aspoň 8 znaků."
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          value={heslo}
          onChange={(e) => setHeslo(e.target.value)}
        />
        <Chyba chyba={chyba} />
        <button className="tlacitko" disabled={bezi}>{bezi ? 'Zakládám…' : 'Vytvořit účet'}</button>
      </form>
      <button className="odkaz" onClick={onPrihlaseni}>Už mám účet</button>
    </main>
  )
}

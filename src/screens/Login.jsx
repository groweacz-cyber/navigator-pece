import { useState } from 'react'
import { prihlasit } from '../services/auth.js'
import { Chyba, Pole, useOdeslani } from './komponenty.jsx'

export default function Login({ onRegistrace, upozorneni }) {
  const [email, setEmail] = useState('')
  const [heslo, setHeslo] = useState('')
  const { bezi, chyba, spustit } = useOdeslani()

  const odeslat = (e) => {
    e.preventDefault()
    spustit(() => prihlasit({ email, heslo }))
  }

  return (
    <main className="stred">
      <h1>V klidu</h1>
      <p className="podtitul">Přihlas se a pokračuj tam, kde jsi skončil/a.</p>
      {upozorneni && <p className="hlaska info">{upozorneni}</p>}
      <form onSubmit={odeslat} className="karta">
        <Pole popisek="E-mail" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <Pole popisek="Heslo" type="password" autoComplete="current-password" required value={heslo} onChange={(e) => setHeslo(e.target.value)} />
        <Chyba chyba={chyba} />
        <button className="tlacitko" disabled={bezi}>{bezi ? 'Přihlašuji…' : 'Přihlásit se'}</button>
      </form>
      <button className="odkaz" onClick={onRegistrace}>Ještě nemám účet</button>
    </main>
  )
}

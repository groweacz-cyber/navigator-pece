// Opatruj: řízení stavu aplikace.
// Tok: přihlášení → (pozvánka?) → výběr nebo založení rodiny → Dashboard.

import { useCallback, useEffect, useState } from 'react'
import { odhlasit, sledovatPrihlaseni } from './services/auth.js'
import { najitMojeRodiny } from './services/family.js'
import AcceptInvite from './screens/AcceptInvite.jsx'
import ChooseFamily from './screens/ChooseFamily.jsx'
import CreateFamily from './screens/CreateFamily.jsx'
import Dashboard from './screens/Dashboard.jsx'
import Login from './screens/Login.jsx'
import Register from './screens/Register.jsx'
import { Chyba, Nacitani } from './screens/komponenty.jsx'

const KLIC_POZVANKY = 'opatruj.pozvanka'
const KLIC_RODINY = 'opatruj.rodina'

// Proč sessionStorage: kód z odkazu musí přežít registraci nebo přihlášení,
// ale nemá zůstat uložený navždy.
function precistPozvankuZOdkazu() {
  try {
    const kod = new URLSearchParams(window.location.search).get('pozvanka')
    if (kod) {
      sessionStorage.setItem(KLIC_POZVANKY, kod)
      window.history.replaceState({}, '', window.location.pathname)
    }
    return sessionStorage.getItem(KLIC_POZVANKY) ?? ''
  } catch {
    return ''
  }
}

function zapamatovat(klic, hodnota) {
  try {
    if (hodnota) localStorage.setItem(klic, hodnota)
    else localStorage.removeItem(klic)
  } catch { /* úložiště nemusí být dostupné, appka funguje i bez něj */ }
}

export default function App() {
  const [uzivatel, setUzivatel] = useState(undefined) // undefined = zjišťuji, null = odhlášen
  const [pozvanka, setPozvanka] = useState(precistPozvankuZOdkazu)
  const [registrace, setRegistrace] = useState(false)
  const [rodiny, setRodiny] = useState(null)
  const [chyba, setChyba] = useState(null)
  const [vybrana, setVybrana] = useState(() => {
    try { return localStorage.getItem(KLIC_RODINY) } catch { return null }
  })
  const [zadamPozvanku, setZadamPozvanku] = useState(false)

  useEffect(() => sledovatPrihlaseni(setUzivatel), [])

  const nacistRodiny = useCallback(async (uid) => {
    setChyba(null)
    try {
      setRodiny(await najitMojeRodiny(uid))
    } catch (e) {
      setChyba(e)
      setRodiny([])
    }
  }, [])

  useEffect(() => {
    setRodiny(null)
    if (uzivatel) nacistRodiny(uzivatel.uid)
  }, [uzivatel, nacistRodiny])

  const hotovaPozvanka = () => {
    try { sessionStorage.removeItem(KLIC_POZVANKY) } catch { /* nevadí */ }
    setPozvanka('')
    setZadamPozvanku(false)
  }

  const poVstupuDoRodiny = async (rodinaId) => {
    hotovaPozvanka()
    zapamatovat(KLIC_RODINY, rodinaId)
    setVybrana(rodinaId)
    await nacistRodiny(uzivatel.uid)
  }

  const odejit = async () => {
    zapamatovat(KLIC_RODINY, null)
    setVybrana(null)
    await odhlasit()
  }

  if (uzivatel === undefined) return <Nacitani />

  const upozorneni = pozvanka ? 'Máš pozvánku do rodiny. Po přihlášení ji přijmeš.' : ''
  if (!uzivatel) {
    return registrace
      ? <Register onPrihlaseni={() => setRegistrace(false)} upozorneni={upozorneni} />
      : <Login onRegistrace={() => setRegistrace(true)} upozorneni={upozorneni} />
  }

  if (rodiny === null) return <Nacitani />
  if (chyba) return <main className="stred"><Chyba chyba={chyba} /><button className="tlacitko" onClick={() => nacistRodiny(uzivatel.uid)}>Zkusit znovu</button></main>

  if (pozvanka || zadamPozvanku) {
    return (
      <AcceptInvite
        predvyplneno={pozvanka}
        onPrijato={poVstupuDoRodiny}
        onZpet={rodiny.length > 0 || zadamPozvanku ? hotovaPozvanka : undefined}
      />
    )
  }

  if (rodiny.length === 0) {
    return <CreateFamily onZalozeno={poVstupuDoRodiny} onPozvanka={() => setZadamPozvanku(true)} onOdhlasit={odejit} />
  }

  const rodina = rodiny.find((r) => r.id === vybrana) ?? (rodiny.length === 1 ? rodiny[0] : null)
  if (!rodina) {
    return (
      <ChooseFamily
        rodiny={rodiny}
        onVybrat={(id) => { zapamatovat(KLIC_RODINY, id); setVybrana(id) }}
        onPozvanka={() => setZadamPozvanku(true)}
        onOdhlasit={odejit}
      />
    )
  }

  return (
    <Dashboard
      key={rodina.id}
      rodina={rodina}
      uid={uzivatel.uid}
      pocetRodin={rodiny.length}
      onZmenitRodinu={() => { zapamatovat(KLIC_RODINY, null); setVybrana(null) }}
      onOdhlasit={odejit}
    />
  )
}

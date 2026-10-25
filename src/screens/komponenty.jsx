// Sdílené drobnosti obrazovek: pole formuláře, hlášky, načítání, živé seznamy.

import { useEffect, useState } from 'react'
import { zpravaChyby } from '../services/chyby.js'

export function Pole({ popisek, napoveda, ...props }) {
  return (
    <label className="pole">
      <span className="pole-popisek">{popisek}</span>
      {props.rows ? <textarea {...props} /> : <input {...props} />}
      {napoveda && <span className="pole-napoveda">{napoveda}</span>}
    </label>
  )
}

export function Chyba({ chyba }) {
  if (!chyba) return null
  return <p className="hlaska chyba" role="alert">{typeof chyba === 'string' ? chyba : zpravaChyby(chyba)}</p>
}

export function Nacitani({ text = 'Načítám…' }) {
  return <p className="nacitani" role="status">{text}</p>
}

export function Prazdno({ children }) {
  return <p className="prazdno">{children}</p>
}

// Proč vlastní hook: každý seznam potřebuje stejné tři stavy (načítá se, chyba,
// data) a úklid odběru po odchodu z obrazovky.
export function useSeznam(prihlasit, zavislosti) {
  const [stav, setStav] = useState({ data: null, chyba: null })
  useEffect(() => {
    setStav({ data: null, chyba: null })
    return prihlasit(
      (data) => setStav({ data, chyba: null }),
      (chyba) => setStav({ data: null, chyba }),
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, zavislosti)
  return stav
}

// Proč Europe/Prague: časy jsou v databázi v UTC, místní čas se řeší až při zobrazení.
export function formatCas(cas) {
  if (!cas?.toDate) return ''
  return cas.toDate().toLocaleString('cs-CZ', {
    timeZone: 'Europe/Prague', day: 'numeric', month: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

// Proč jedna funkce pro odeslání: zamezí dvojitému kliknutí a ukáže chybu.
export function useOdeslani() {
  const [bezi, setBezi] = useState(false)
  const [chyba, setChyba] = useState(null)
  const spustit = async (akce) => {
    setBezi(true)
    setChyba(null)
    try {
      return await akce()
    } catch (e) {
      setChyba(e)
    } finally {
      setBezi(false)
    }
  }
  return { bezi, chyba, spustit }
}

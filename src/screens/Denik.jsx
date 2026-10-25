import { useEffect, useState } from 'react'
import { NAZVY_KATEGORII, NAZVY_UROVNI } from '../services/kategorie.js'
import { pridatZaznam, sledovatZaznamy, smazatZaznam } from '../services/notes.js'
import { Chyba, formatCas, Nacitani, Pole, Prazdno, useOdeslani, useSeznam } from './komponenty.jsx'

function Stitky({ zaznam }) {
  if (zaznam.aiStav === 'chyba') return <p className="stitky jemne">Zápis se nepodařilo roztřídit.</p>
  if (!zaznam.aiStav) return <p className="stitky jemne">Třídím…</p>
  const kategorie = Object.entries(zaznam.aiHodnoceni ?? {})
  if (kategorie.length === 0) return <p className="stitky jemne">Žádná z potřeb tu není zmíněná.</p>
  return (
    <p className="stitky">
      {kategorie.map(([klic, uroven]) => (
        <span key={klic} className={`stitek uroven-${uroven}`}>
          {NAZVY_KATEGORII[klic] ?? klic}: {NAZVY_UROVNI[uroven] ?? uroven}
        </span>
      ))}
    </p>
  )
}

export default function Denik({ rodina, uid, osoby }) {
  const [osobaId, setOsobaId] = useState('')
  const [text, setText] = useState('')
  const { bezi, chyba, spustit } = useOdeslani()

  // Výchozí osoba: první v seznamu, a pokud vybraná zmizela, znovu první.
  useEffect(() => {
    if (osoby.length && !osoby.some((o) => o.id === osobaId)) setOsobaId(osoby[0].id)
  }, [osoby, osobaId])

  const zaznamy = useSeznam((ok, ko) => (osobaId ? sledovatZaznamy(rodina.id, osobaId, ok, ko) : () => {}), [rodina.id, osobaId])

  if (osoby.length === 0) {
    return <Prazdno>Nejdřív přidej osobu, o kterou pečujete. Najdeš to v záložce Osoby.</Prazdno>
  }

  const odeslat = (e) => {
    e.preventDefault()
    spustit(async () => {
      await pridatZaznam(rodina.id, osobaId, text, uid)
      setText('')
    })
  }

  return (
    <section>
      <h2>Deník péče</h2>
      <p className="jemne">
        Piš jednoduše, co se dnes dělo. Zápisy se samy roztřídí podle 10 základních životních potřeb. Třídění je
        orientační a může se mýlit.
      </p>
      {osoby.length > 1 && (
        <label className="pole">
          <span className="pole-popisek">O koho jde?</span>
          <select value={osobaId} onChange={(e) => setOsobaId(e.target.value)}>
            {osoby.map((o) => <option key={o.id} value={o.id}>{o.jmeno}</option>)}
          </select>
        </label>
      )}
      <form onSubmit={odeslat} className="karta">
        <Pole popisek="Co se dnes dělo?" rows={4} required maxLength={4000} value={text} onChange={(e) => setText(e.target.value)} />
        <Chyba chyba={chyba} />
        <button className="tlacitko" disabled={bezi}>{bezi ? 'Ukládám…' : 'Zapsat do deníku'}</button>
      </form>

      {zaznamy.chyba && <Chyba chyba={zaznamy.chyba} />}
      {!zaznamy.data && !zaznamy.chyba && <Nacitani />}
      {zaznamy.data?.length === 0 && <Prazdno>Zatím tu nic není. První zápis může být i jedna věta.</Prazdno>}
      <ul className="seznam">
        {zaznamy.data?.map((z) => (
          <li key={z.id} className="polozka">
            <p className="cas">{formatCas(z.vytvoreno)}</p>
            <p>{z.text}</p>
            <Stitky zaznam={z} />
            {z.autorUid === uid && (
              <button className="odkaz maly" onClick={() => window.confirm('Smazat tenhle zápis?') && smazatZaznam(rodina.id, z.id)}>
                Smazat
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}

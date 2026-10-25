import { useEffect, useState } from 'react'
import { NAZVY_KATEGORII, NAZVY_UROVNI } from '../services/kategorie.js'
import { opravitHodnoceni, pridatZaznam, sledovatZaznamy, smazatZaznam, ucinneHodnoceni } from '../services/notes.js'
import { Chyba, formatCas, Nacitani, Pole, Prazdno, useOdeslani, useSeznam } from './komponenty.jsx'

function Stitky({ zaznam }) {
  const opraveno = !!zaznam.rucniHodnoceni
  if (!opraveno && zaznam.aiStav === 'chyba') return <p className="stitky jemne">Zápis se nepodařilo roztřídit. Můžeš ho roztřídit ručně.</p>
  if (!opraveno && !zaznam.aiStav) return <p className="stitky jemne">Třídím…</p>
  const kategorie = Object.entries(ucinneHodnoceni(zaznam))
  if (kategorie.length === 0) return <p className="stitky jemne">Žádná z potřeb tu není zmíněná.</p>
  return (
    <p className="stitky">
      {kategorie.map(([klic, uroven]) => (
        <span key={klic} className={`stitek uroven-${uroven}`}>
          {NAZVY_KATEGORII[klic] ?? klic}: {NAZVY_UROVNI[uroven] ?? uroven}
        </span>
      ))}
      {opraveno && <span className="stitek opraveno">opraveno rodinou</span>}
    </p>
  )
}

// Oprava třídění: u každé potřeby jde nastavit, jak to šlo. "Nezmíněno" potřebu
// ze zápisu vyřadí. Hodnocení z AI se tím nemaže, jen se přebije.
function Oprava({ rodina, zaznam, onZavrit }) {
  const [hodnoceni, setHodnoceni] = useState({ ...ucinneHodnoceni(zaznam) })
  const { bezi, chyba, spustit } = useOdeslani()

  const nastavit = (klic, uroven) => {
    const dalsi = { ...hodnoceni }
    if (uroven) dalsi[klic] = uroven
    else delete dalsi[klic]
    setHodnoceni(dalsi)
  }
  const ulozit = (e) => {
    e.preventDefault()
    spustit(async () => {
      await opravitHodnoceni(rodina.id, zaznam.id, hodnoceni)
      onZavrit()
    })
  }

  return (
    <form onSubmit={ulozit} className="oprava">
      <p className="jemne">Jak to podle tebe v tomhle zápisu šlo? Oprava se použije místo odhadu AI.</p>
      {Object.entries(NAZVY_KATEGORII).map(([klic, nazev]) => (
        <label key={klic} className="oprava-radek">
          <span>{nazev}</span>
          <select value={hodnoceni[klic] ?? ''} onChange={(e) => nastavit(klic, e.target.value)}>
            <option value="">nezmíněno</option>
            {Object.entries(NAZVY_UROVNI).map(([u, popisek]) => <option key={u} value={u}>{popisek}</option>)}
          </select>
        </label>
      ))}
      <Chyba chyba={chyba} />
      <button className="tlacitko" disabled={bezi}>Uložit opravu</button>
      <button type="button" className="odkaz" onClick={onZavrit}>Zrušit</button>
    </form>
  )
}

export default function Denik({ rodina, uid, osoby }) {
  const [osobaId, setOsobaId] = useState('')
  const [text, setText] = useState('')
  const [opravovany, setOpravovany] = useState(null)
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
        orientační a může se mýlit, proto ho můžeš opravit.
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
            {opravovany === z.id ? (
              <Oprava rodina={rodina} zaznam={z} onZavrit={() => setOpravovany(null)} />
            ) : (
              <>
                <Stitky zaznam={z} />
                <button className="odkaz maly" onClick={() => setOpravovany(z.id)}>Opravit třídění</button>
                {z.autorUid === uid && (
                  <button className="odkaz maly" onClick={() => window.confirm('Smazat tenhle zápis?') && smazatZaznam(rodina.id, z.id)}>
                    Smazat
                  </button>
                )}
              </>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}

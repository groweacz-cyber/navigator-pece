// Týdenní souhrn pro rodinu: co se za posledních 7 dní dělo. Jde zkopírovat do
// rodinného chatu. Orientační přehled z poznámek, ne zdravotní hodnocení.

import { useEffect, useState } from 'react'
import { sledovatClenyRodiny } from '../services/family.js'
import { NAZVY_KATEGORII } from '../services/kategorie.js'
import { nacistSouhrn } from '../services/souhrn.js'
import { Chyba, Nacitani, Prazdno, useSeznam } from './komponenty.jsx'

export default function Souhrn({ rodina, osoby }) {
  const [osobaId, setOsobaId] = useState('')
  const [souhrn, setSouhrn] = useState(null)
  const [chyba, setChyba] = useState(null)
  const [zkopirovano, setZkopirovano] = useState(false)
  const clenove = useSeznam((ok, ko) => sledovatClenyRodiny(rodina.id, ok, ko), [rodina.id])

  useEffect(() => {
    if (osoby.length && !osoby.some((o) => o.id === osobaId)) setOsobaId(osoby[0].id)
  }, [osoby, osobaId])

  useEffect(() => {
    if (!osobaId) return undefined
    let zruseno = false
    setSouhrn(null)
    setChyba(null)
    nacistSouhrn(rodina.id, osobaId).then((s) => !zruseno && setSouhrn(s)).catch((e) => !zruseno && setChyba(e))
    return () => { zruseno = true }
  }, [rodina.id, osobaId])

  if (osoby.length === 0) return <Prazdno>Nejdřív přidej osobu v záložce Osoby.</Prazdno>
  const osoba = osoby.find((o) => o.id === osobaId)
  const jmeno = (uid) => clenove.data?.find((c) => c.uid === uid)?.jmeno || 'člen rodiny'

  const text = souhrn && [
    `Souhrn týdne: ${osoba?.jmeno}`,
    `Zápisů v deníku: ${souhrn.zapisy.tyden} (předchozí týden ${souhrn.zapisy.predtyden})`,
    souhrn.leky.procent === null ? 'Léky: žádné aktivní' : `Léky: podáno ${souhrn.leky.podano} z ${souhrn.leky.plan} dávek (${souhrn.leky.procent} %)`,
    souhrn.nejcastejsiPotize.length ? `Nejčastější potíže: ${souhrn.nejcastejsiPotize.map((p) => `${NAZVY_KATEGORII[p.kategorie]} (${p.pocet}×)`).join(', ')}` : 'Potíže v zápisech: žádné výrazné',
    Object.keys(souhrn.poAutorech).length ? `Zapisovali: ${Object.entries(souhrn.poAutorech).map(([u, n]) => `${jmeno(u)} ${n}`).join(', ')}` : '',
    'Orientační přehled z poznámek rodiny (Opatruj).',
  ].filter(Boolean).join('\n')

  const zkopirovat = async () => {
    try { await navigator.clipboard.writeText(text); setZkopirovano(true) } catch { /* schránka nemusí být dostupná */ }
  }
  const rozdil = souhrn && souhrn.zapisy.tyden - souhrn.zapisy.predtyden

  return (
    <section>
      <h2>Souhrn týdne</h2>
      <p className="jemne">Posledních 7 dní z deníku a z odškrtnutých léků. Orientační přehled z poznámek, ne zdravotní hodnocení.</p>
      {osoby.length > 1 && (
        <label className="pole">
          <span className="pole-popisek">O koho jde?</span>
          <select value={osobaId} onChange={(e) => setOsobaId(e.target.value)}>
            {osoby.map((o) => <option key={o.id} value={o.id}>{o.jmeno}</option>)}
          </select>
        </label>
      )}
      <Chyba chyba={chyba} />
      {!souhrn && !chyba && <Nacitani />}
      {souhrn && (
        <>
          <div className="dlazdice-mrizka">
            <div className="dlazdice">
              <div className="dlazdice-hlava">📓 Zápisy v deníku</div>
              <div className="dlazdice-cislo">{souhrn.zapisy.tyden}</div>
              <p className="dlazdice-popis">{rozdil === 0 ? 'Stejně jako minulý týden.' : `${rozdil > 0 ? '+' : ''}${rozdil} oproti minulému týdnu (${souhrn.zapisy.predtyden}).`}</p>
            </div>
            <div className={`dlazdice ${souhrn.leky.procent !== null && souhrn.leky.procent < 80 ? 'pozor' : souhrn.leky.procent >= 95 ? 'ok' : ''}`}>
              <div className="dlazdice-hlava">💊 Léky</div>
              <div className="dlazdice-cislo">{souhrn.leky.procent === null ? '—' : `${souhrn.leky.procent} %`}</div>
              <p className="dlazdice-popis">{souhrn.leky.procent === null ? 'Žádné aktivní léky.' : `Podáno ${souhrn.leky.podano} z ${souhrn.leky.plan} dávek.`}</p>
            </div>
            <div className="dlazdice">
              <div className="dlazdice-hlava">🧩 Nejčastější potíže</div>
              {souhrn.nejcastejsiPotize.length === 0
                ? <p className="dlazdice-popis">V zápisech nejsou výrazné potíže.</p>
                : <ul className="odrazky">{souhrn.nejcastejsiPotize.map((p) => <li key={p.kategorie}>{NAZVY_KATEGORII[p.kategorie]}: {p.pocet}×</li>)}</ul>}
            </div>
            <div className="dlazdice">
              <div className="dlazdice-hlava">👨‍👩‍👧 Kdo zapisoval</div>
              {Object.keys(souhrn.poAutorech).length === 0
                ? <p className="dlazdice-popis">Tento týden nikdo.</p>
                : <ul className="odrazky">{Object.entries(souhrn.poAutorech).sort((a, b) => b[1] - a[1]).map(([u, n]) => <li key={u}>{jmeno(u)}: {n}</li>)}</ul>}
            </div>
          </div>
          <button className="tlacitko druhe" onClick={zkopirovat}>{zkopirovano ? 'Zkopírováno' : 'Zkopírovat souhrn pro rodinu'}</button>
        </>
      )}
    </section>
  )
}

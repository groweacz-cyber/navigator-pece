// Nouzová karta: jedna stránka k vytištění (na lednici, do peněženky, k lůžku) pro
// záchranáře a nového pečovatele. Léky a kontakty na lékaře se berou z appky samy.
// Opatruj nenahrazuje zdravotnickou dokumentaci, údaje je potřeba udržovat aktuální.

import { useEffect, useState } from 'react'
import { sledovatKontakty } from '../services/contacts.js'
import { sledovatLeky } from '../services/leky.js'
import { POLE, sledovatKartu, ulozitKartu } from '../services/nouzova.js'
import { Chyba, formatCas, Nacitani, Pole, Prazdno, useOdeslani, useSeznam } from './komponenty.jsx'

const POPISKY = {
  narozeni: 'Datum narození',
  alergie: 'Alergie (léky, jídlo, další)',
  diagnozy: 'Diagnózy a důležité zdravotní informace',
  pojistovna: 'Zdravotní pojišťovna',
  praktik: 'Praktický lékař (jméno a telefon)',
  kontakt1: 'Kontakt na rodinu 1 (jméno a telefon)',
  kontakt2: 'Kontakt na rodinu 2 (jméno a telefon)',
  poznamka: 'Co říct záchranářům (třeba „nedoslýchá“, „bojí se cizích lidí“)',
}
const DLOUHA = ['alergie', 'diagnozy', 'poznamka']

export default function NouzovaKarta({ rodina, osoby }) {
  const [osobaId, setOsobaId] = useState('')
  const [hodnoty, setHodnoty] = useState({})
  const [nacteno, setNacteno] = useState(false)
  const [ulozeno, setUlozeno] = useState(false)
  const { bezi, chyba, spustit } = useOdeslani()

  useEffect(() => {
    if (osoby.length && !osoby.some((o) => o.id === osobaId)) setOsobaId(osoby[0].id)
  }, [osoby, osobaId])

  const karta = useSeznam((ok, ko) => {
    if (!osobaId) return () => {}
    setNacteno(false)
    return sledovatKartu(rodina.id, osobaId, (k) => { setHodnoty(k); setNacteno(true); ok([k]) }, ko)
  }, [rodina.id, osobaId])
  const leky = useSeznam((ok, ko) => (osobaId ? sledovatLeky(rodina.id, osobaId, ok, ko) : () => {}), [rodina.id, osobaId])
  const lekari = useSeznam((ok, ko) => sledovatKontakty(rodina.id, ok, ko), [rodina.id])

  if (osoby.length === 0) return <Prazdno>Nejdřív přidej osobu v záložce Osoby.</Prazdno>
  const osoba = osoby.find((o) => o.id === osobaId)
  const aktivniLeky = leky.data?.filter((l) => l.aktivni) ?? []
  const nastavit = (p) => (e) => { setHodnoty({ ...hodnoty, [p]: e.target.value }); setUlozeno(false) }

  const ulozit = (e) => {
    e.preventDefault()
    spustit(async () => { await ulozitKartu(rodina.id, osobaId, hodnoty); setUlozeno(true) })
  }

  return (
    <section className="nouzova">
      <div className="bez-tisku">
        <h2>Nouzová karta</h2>
        <p className="jemne">Vytiskni ji a dej na lednici nebo ke dveřím. Záchranáři i nový pečovatel hned uvidí to nejdůležitější. Údaje udržuj aktuální.</p>
        {osoby.length > 1 && (
          <label className="pole">
            <span className="pole-popisek">O koho jde?</span>
            <select value={osobaId} onChange={(e) => setOsobaId(e.target.value)}>
              {osoby.map((o) => <option key={o.id} value={o.id}>{o.jmeno}</option>)}
            </select>
          </label>
        )}
        {!nacteno && !karta.chyba ? <Nacitani /> : (
          <form onSubmit={ulozit} className="karta">
            {POLE.map((p) => (
              <Pole key={p} popisek={POPISKY[p]} rows={DLOUHA.includes(p) ? 3 : undefined} maxLength={DLOUHA.includes(p) ? 600 : 150} value={hodnoty[p] ?? ''} onChange={nastavit(p)} />
            ))}
            <Chyba chyba={chyba ?? karta.chyba} />
            {ulozeno && <p className="hlaska ok" role="status">Uloženo.</p>}
            <button className="tlacitko" disabled={bezi}>Uložit kartu</button>
          </form>
        )}
        <button className="tlacitko druhe" onClick={() => window.print()}>Vytisknout nebo uložit jako PDF</button>
      </div>

      <article className="tisk-karta" aria-label="Náhled nouzové karty">
        <header>
          <strong>NOUZOVÁ KARTA</strong>
          <span>Při ohrožení života volejte 155 nebo 112</span>
        </header>
        <h3>{osoba?.jmeno}{hodnoty.narozeni ? `, nar. ${hodnoty.narozeni}` : ''}</h3>
        <dl>
          {hodnoty.alergie && <><dt>Alergie</dt><dd className="vyrazne">{hodnoty.alergie}</dd></>}
          {hodnoty.diagnozy && <><dt>Diagnózy, důležité informace</dt><dd>{hodnoty.diagnozy}</dd></>}
          {aktivniLeky.length > 0 && (
            <><dt>Léky</dt><dd>{aktivniLeky.map((l) => `${l.nazev}${l.davka ? ` ${l.davka}` : ''} (${l.casy.join(', ')})`).join('; ')}</dd></>
          )}
          {hodnoty.pojistovna && <><dt>Pojišťovna</dt><dd>{hodnoty.pojistovna}</dd></>}
          {hodnoty.praktik && <><dt>Praktický lékař</dt><dd>{hodnoty.praktik}</dd></>}
          {(hodnoty.kontakt1 || hodnoty.kontakt2) && <><dt>Kontakt na rodinu</dt><dd>{[hodnoty.kontakt1, hodnoty.kontakt2].filter(Boolean).join(' · ')}</dd></>}
          {lekari.data?.length > 0 && <><dt>Další lékaři a služby</dt><dd>{lekari.data.slice(0, 5).map((k) => `${k.jmeno}${k.role ? ` (${k.role})` : ''}${k.telefon ? ` ${k.telefon}` : ''}`).join('; ')}</dd></>}
          {hodnoty.poznamka && <><dt>Co říct záchranářům</dt><dd>{hodnoty.poznamka}</dd></>}
        </dl>
        <footer>Aktualizováno {hodnoty.upraveno ? formatCas(hodnoty.upraveno) : 'zatím neuloženo'} · Opatruj</footer>
      </article>
    </section>
  )
}

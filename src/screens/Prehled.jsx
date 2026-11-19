// Přehled: úvodní obrazovka. Jedním pohledem ukáže, co je dnes důležité.
// Plný přístup vidí léky a deník, host jen úkoly a rodinu (zdravotní údaje mu pravidla nedají).

import { useEffect, useState } from 'react'
import { sledovatClenyRodiny } from '../services/family.js'
import { dnes, sledovatLeky, sledovatPodani, idPodani } from '../services/leky.js'
import { sledovatZaznamy } from '../services/notes.js'
import { sledovatUkoly } from '../services/tasks.js'
import { formatCas, Nacitani, Prazdno, useSeznam } from './komponenty.jsx'

const DEN = 24 * 3600 * 1000

function Dlazdice({ nadpis, ikona, velke, popis, akce, onAkce, barva = '', children }) {
  return (
    <div className={`dlazdice ${barva}`}>
      <div className="dlazdice-hlava"><span aria-hidden="true">{ikona}</span> {nadpis}</div>
      {velke && <div className="dlazdice-cislo">{velke}</div>}
      {popis && <p className="dlazdice-popis">{popis}</p>}
      {children}
      {akce && <button className="odkaz maly" onClick={onAkce}>{akce}</button>}
    </div>
  )
}

function Leky({ rodina, osoba, onPrejit }) {
  const datum = dnes()
  const leky = useSeznam((ok, ko) => sledovatLeky(rodina.id, osoba.id, ok, ko), [rodina.id, osoba.id])
  const podani = useSeznam((ok, ko) => sledovatPodani(rodina.id, osoba.id, datum, ok, ko), [rodina.id, osoba.id, datum])
  if (!leky.data || !podani.data) return <Dlazdice nadpis="Dnešní léky" ikona="💊"><Nacitani /></Dlazdice>

  const davky = leky.data.filter((l) => l.aktivni).flatMap((l) => l.casy.map((cas) => ({ lek: l, cas })))
  if (davky.length === 0) {
    return <Dlazdice nadpis="Dnešní léky" ikona="💊" popis="Zatím tu není žádný lék." akce="Přidat lék" onAkce={() => onPrejit('leky')} />
  }
  const podane = new Set(podani.data.map((p) => p.id))
  const hotovo = davky.filter((d) => podane.has(idPodani(d.lek.id, datum, d.cas)))
  const ted = new Intl.DateTimeFormat('cs-CZ', { timeZone: 'Europe/Prague', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date())
  const zbyva = davky.filter((d) => !podane.has(idPodani(d.lek.id, datum, d.cas))).sort((a, b) => a.cas.localeCompare(b.cas))
  const zameskane = zbyva.filter((d) => d.cas < ted)
  const dalsi = zbyva.find((d) => d.cas >= ted)
  const popis = zbyva.length === 0
    ? 'Všechno na dnes je podáno.'
    : zameskane.length > 0
      ? `Čeká ${zameskane.length}× po termínu (od ${zameskane[0].cas}).`
      : `Další v ${dalsi.cas}: ${dalsi.lek.nazev}.`
  return (
    <Dlazdice nadpis="Dnešní léky" ikona="💊" velke={`${hotovo.length} z ${davky.length}`} popis={popis} barva={zameskane.length ? 'pozor' : zbyva.length === 0 ? 'ok' : ''} akce="Otevřít léky" onAkce={() => onPrejit('leky')} />
  )
}

function Denik({ rodina, osoba, onPrejit }) {
  const zaznamy = useSeznam((ok, ko) => sledovatZaznamy(rodina.id, osoba.id, ok, ko), [rodina.id, osoba.id])
  if (!zaznamy.data) return <Dlazdice nadpis="Deník" ikona="📓"><Nacitani /></Dlazdice>
  const tyden = zaznamy.data.filter((z) => z.vytvoreno?.toDate && Date.now() - z.vytvoreno.toDate().getTime() < 7 * DEN)
  const posledni = zaznamy.data[0]
  return (
    <Dlazdice nadpis="Deník, 7 dní" ikona="📓" velke={String(tyden.length)} popis={posledni ? `Poslední zápis ${formatCas(posledni.vytvoreno)}: ${posledni.text.slice(0, 90)}${posledni.text.length > 90 ? '…' : ''}` : 'Zatím žádný zápis. První může být jedna věta.'} akce="Zapsat do deníku" onAkce={() => onPrejit('denik')} />
  )
}

export default function Prehled({ rodina, osoby, plnyPristup, onPrejit }) {
  const [osobaId, setOsobaId] = useState('')
  useEffect(() => {
    if (osoby.length && !osoby.some((o) => o.id === osobaId)) setOsobaId(osoby[0].id)
  }, [osoby, osobaId])
  const osoba = osoby.find((o) => o.id === osobaId)
  const ukoly = useSeznam((ok, ko) => sledovatUkoly(rodina.id, ok, ko), [rodina.id])
  const clenove = useSeznam((ok, ko) => sledovatClenyRodiny(rodina.id, ok, ko), [rodina.id])

  const otevrene = ukoly.data?.filter((u) => !u.hotovo) ?? []

  return (
    <section>
      <h2>Přehled{osoba ? `: ${osoba.jmeno}` : ''}</h2>
      {osoby.length === 0 && (
        <Prazdno>Začni tím, že přidáš osobu, o kterou pečujete. <button className="odkaz maly" onClick={() => onPrejit('osoby')}>Přidat osobu</button></Prazdno>
      )}
      {osoby.length > 1 && (
        <label className="pole">
          <span className="pole-popisek">O koho jde?</span>
          <select value={osobaId} onChange={(e) => setOsobaId(e.target.value)}>
            {osoby.map((o) => <option key={o.id} value={o.id}>{o.jmeno}</option>)}
          </select>
        </label>
      )}

      <div className="dlazdice-mrizka">
        {plnyPristup && osoba && <Leky rodina={rodina} osoba={osoba} onPrejit={onPrejit} />}
        {plnyPristup && osoba && <Denik rodina={rodina} osoba={osoba} onPrejit={onPrejit} />}
        <Dlazdice nadpis="Úkoly" ikona="✅" velke={ukoly.data ? String(otevrene.length) : '…'} popis={otevrene.length ? otevrene.slice(0, 3).map((u) => u.nazev).join(' · ') : 'Nic nečeká.'} akce="Otevřít úkoly" onAkce={() => onPrejit('ukoly')} />
        {osoba && <Dlazdice nadpis="Rychlá karta" ikona="🪪" popis="Co uklidní, čeho se vyvarovat a co dělat, když se něco stane." akce="Otevřít kartu" onAkce={() => onPrejit('karta')} />}
        {plnyPristup && osoba && <Dlazdice nadpis="Nouzová karta" ikona="🆘" popis="Alergie, léky a kontakty na jedné stránce k vytištění." akce="Otevřít a vytisknout" onAkce={() => onPrejit('nouzova')} />}
        {plnyPristup && osoba && <Dlazdice nadpis="Vývoj stavu" ikona="📈" popis="Srovnání posledního měsíce s předchozím." akce="Zobrazit vývoj" onAkce={() => onPrejit('vyvoj')} />}
        <Dlazdice nadpis="Rodina" ikona="👨‍👩‍👧" velke={clenove.data ? String(clenove.data.length) : '…'} popis={clenove.data ? clenove.data.map((c) => c.jmeno || 'člen').join(', ') : ''} akce="Členové a pozvánky" onAkce={() => onPrejit('rodina')} />
        <Dlazdice nadpis="Rady pro den doma" ikona="🏠" popis="Vaření, úklid i pohyb po bytě bez zbytečné námahy." akce="Přečíst rady" onAkce={() => onPrejit('rady')} />
      </div>
    </section>
  )
}

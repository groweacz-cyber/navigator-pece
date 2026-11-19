import { addDoc, collection, deleteDoc, doc, orderBy, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore'
import { db } from '../firebase/config.js'
import { sledovat } from './sledovani.js'

const kolekce = (rodinaId, osobaId, nazev) => collection(db, 'families', rodinaId, 'carePersons', osobaId, nazev)

// Dnešní datum v českém čase (YYYY-MM-DD). Proč: časy jsou v databázi v UTC, ale
// "dnešní dávka" se počítá podle dne, jak ho zná rodina.
export const dnes = (ted = new Date()) => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Prague' }).format(ted)

// Čas "8", "8:5", "08:00" na tvar HH:MM. Neplatné časy vrací jako null.
export function upravitCas(text) {
  const m = /^(\d{1,2})[:.](\d{1,2})$/.exec(text.trim()) ?? /^(\d{1,2})$/.exec(text.trim())
  if (!m) return null
  const h = Number(m[1])
  const min = Number(m[2] ?? 0)
  if (h > 23 || min > 59) return null
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`
}

export function rozdelitCasy(text) {
  const casy = text.split(/[,;\s]+/).filter(Boolean).map(upravitCas)
  if (casy.length === 0 || casy.includes(null)) return null
  return [...new Set(casy)].sort()
}

export const sledovatLeky = (rodinaId, osobaId, zmena, chyba) =>
  sledovat(query(kolekce(rodinaId, osobaId, 'leky'), orderBy('vytvoreno')), zmena, chyba)

export const pridatLek = (rodinaId, osobaId, { nazev, davka, casy, poznamka }) =>
  addDoc(kolekce(rodinaId, osobaId, 'leky'), {
    nazev: nazev.trim(), davka: davka.trim(), casy, poznamka: poznamka.trim(), aktivni: true, vytvoreno: serverTimestamp(),
  })

export const nastavitAktivni = (rodinaId, osobaId, lekId, aktivni) =>
  updateDoc(doc(db, 'families', rodinaId, 'carePersons', osobaId, 'leky', lekId), { aktivni })

export const sledovatPodani = (rodinaId, osobaId, datum, zmena, chyba) =>
  sledovat(query(kolekce(rodinaId, osobaId, 'podani'), where('datum', '==', datum)), zmena, chyba)

// Proč pevné ID: jedna dávka za den se nedá odškrtnout dvakrát (druhý zápis jen přepíše první).
export const idPodani = (lekId, datum, cas) => `${lekId}_${datum}_${cas.replace(':', '')}`

export const oznacitPodano = (rodinaId, osobaId, lekId, datum, cas, uid) =>
  setDoc(doc(db, 'families', rodinaId, 'carePersons', osobaId, 'podani', idPodani(lekId, datum, cas)), {
    lekId, datum, cas, podalUid: uid, vytvoreno: serverTimestamp(),
  })

export const vzitPodaniZpet = (rodinaId, osobaId, lekId, datum, cas) =>
  deleteDoc(doc(db, 'families', rodinaId, 'carePersons', osobaId, 'podani', idPodani(lekId, datum, cas)))

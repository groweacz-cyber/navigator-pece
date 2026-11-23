import { doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from '../firebase/config.js'

// Nouzová karta je jeden dokument "karta" u osoby (pravidla povolují jen toto ID).
const ref = (rodinaId, osobaId) => doc(db, 'families', rodinaId, 'carePersons', osobaId, 'nouzova', 'karta')

export const POLE = ['narozeni', 'alergie', 'diagnozy', 'pojistovna', 'praktik', 'kontakt1', 'kontakt2', 'poznamka']

export function sledovatKartu(rodinaId, osobaId, zmena, chyba) {
  return onSnapshot(ref(rodinaId, osobaId), (s) => zmena(s.exists() ? s.data({ serverTimestamps: 'estimate' }) : {}), chyba)
}

export const ulozitKartu = (rodinaId, osobaId, hodnoty) => {
  const data = Object.fromEntries(POLE.map((p) => [p, (hodnoty[p] ?? '').trim()]))
  return setDoc(ref(rodinaId, osobaId), { ...data, upraveno: serverTimestamp() })
}

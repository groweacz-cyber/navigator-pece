import { addDoc, collection, doc, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db } from '../firebase/config.js'
import { sledovat } from './sledovani.js'

const kolekce = (rodinaId) => collection(db, 'families', rodinaId, 'carePersons')

export const sledovatOsoby = (rodinaId, zmena, chyba) =>
  sledovat(query(kolekce(rodinaId), orderBy('vytvoreno')), zmena, chyba)

export const pridatOsobu = (rodinaId, jmeno) =>
  addDoc(kolekce(rodinaId), { jmeno: jmeno.trim(), biografie: {}, vytvoreno: serverTimestamp() })

// Biografie: zvyky, co uklidní, čeho se vyvarovat. Čtou i hosté, píše plný přístup.
export const ulozitBiografii = (rodinaId, osobaId, biografie) =>
  updateDoc(doc(db, 'families', rodinaId, 'carePersons', osobaId), { biografie })

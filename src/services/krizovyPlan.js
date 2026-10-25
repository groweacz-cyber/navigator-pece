import { addDoc, collection, deleteDoc, doc, orderBy, query, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config.js'
import { sledovat } from './sledovani.js'

const kolekce = (rodinaId, osobaId) => collection(db, 'families', rodinaId, 'carePersons', osobaId, 'krizovyPlan')

// Krizový plán "co dělat, když": čte i host, píše plný přístup.
export const sledovatKrizovyPlan = (rodinaId, osobaId, zmena, chyba) =>
  sledovat(query(kolekce(rodinaId, osobaId), orderBy('vytvoreno')), zmena, chyba)

export const pridatPostup = (rodinaId, osobaId, { situace, postup }) =>
  addDoc(kolekce(rodinaId, osobaId), { situace: situace.trim(), postup: postup.trim(), vytvoreno: serverTimestamp() })

export const smazatPostup = (rodinaId, osobaId, planId) =>
  deleteDoc(doc(db, 'families', rodinaId, 'carePersons', osobaId, 'krizovyPlan', planId))

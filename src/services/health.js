import { addDoc, collection, deleteDoc, doc, orderBy, query, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config.js'
import { sledovat } from './sledovani.js'

// Zdravotní záznamy jsou v oddělené podkolekci (GDPR čl. 9). Host je nevidí.
const kolekce = (rodinaId, osobaId) => collection(db, 'families', rodinaId, 'carePersons', osobaId, 'health')

export const sledovatZdravi = (rodinaId, osobaId, zmena, chyba) =>
  sledovat(query(kolekce(rodinaId, osobaId), orderBy('vytvoreno', 'desc')), zmena, chyba)

export const pridatZdravotniZaznam = (rodinaId, osobaId, { nadpis, poznamka }) =>
  addDoc(kolekce(rodinaId, osobaId), { nadpis: nadpis.trim(), poznamka: poznamka.trim(), vytvoreno: serverTimestamp() })

export const smazatZdravotniZaznam = (rodinaId, osobaId, zaznamId) =>
  deleteDoc(doc(db, 'families', rodinaId, 'carePersons', osobaId, 'health', zaznamId))

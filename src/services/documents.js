import { addDoc, collection, deleteDoc, doc, orderBy, query, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config.js'
import { sledovat } from './sledovani.js'

// Zatím jen evidence dokumentů (název, poznámka, kde je originál). Nahrávání
// souborů do Storage přijde s pravidly pro složku dokumentů (Issue B4).
const kolekce = (rodinaId) => collection(db, 'families', rodinaId, 'documents')

export const sledovatDokumenty = (rodinaId, zmena, chyba) =>
  sledovat(query(kolekce(rodinaId), orderBy('vytvoreno', 'desc')), zmena, chyba)

export const pridatDokument = (rodinaId, { nazev, poznamka }) =>
  addDoc(kolekce(rodinaId), { nazev: nazev.trim(), poznamka: poznamka.trim(), vytvoreno: serverTimestamp() })

export const smazatDokument = (rodinaId, dokumentId) =>
  deleteDoc(doc(db, 'families', rodinaId, 'documents', dokumentId))

import { addDoc, collection, deleteDoc, doc, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db } from '../firebase/config.js'
import { sledovat } from './sledovani.js'

const kolekce = (rodinaId) => collection(db, 'families', rodinaId, 'tasks')

export const sledovatUkoly = (rodinaId, zmena, chyba) =>
  sledovat(query(kolekce(rodinaId), orderBy('vytvoreno', 'desc')), zmena, chyba)

export const pridatUkol = (rodinaId, nazev, uid) =>
  addDoc(kolekce(rodinaId), { nazev: nazev.trim(), hotovo: false, vytvoril: uid, vytvoreno: serverTimestamp() })

export const nastavitHotovo = (rodinaId, ukolId, hotovo) =>
  updateDoc(doc(db, 'families', rodinaId, 'tasks', ukolId), { hotovo })

export const smazatUkol = (rodinaId, ukolId) => deleteDoc(doc(db, 'families', rodinaId, 'tasks', ukolId))

import { addDoc, collection, deleteDoc, doc, limit, orderBy, query, serverTimestamp, where } from 'firebase/firestore'
import { db } from '../firebase/config.js'
import { sledovat } from './sledovani.js'

const kolekce = (rodinaId) => collection(db, 'families', rodinaId, 'notes')

export const sledovatZaznamy = (rodinaId, osobaId, zmena, chyba) =>
  sledovat(
    query(kolekce(rodinaId), where('osobaId', '==', osobaId), orderBy('vytvoreno', 'desc'), limit(100)),
    zmena,
    chyba,
  )

// Proč přesně tahle pole: pravidla klientovi povolují jen osobaId, text, autorUid
// a vytvoreno. Kategorie (aiKategorie) doplní server po uložení.
export const pridatZaznam = (rodinaId, osobaId, text, autorUid) =>
  addDoc(kolekce(rodinaId), { osobaId, text: text.trim(), autorUid, vytvoreno: serverTimestamp() })

export const smazatZaznam = (rodinaId, zaznamId) => deleteDoc(doc(db, 'families', rodinaId, 'notes', zaznamId))

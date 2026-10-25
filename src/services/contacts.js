import { addDoc, collection, deleteDoc, doc, orderBy, query, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config.js'
import { sledovat } from './sledovani.js'

const kolekce = (rodinaId) => collection(db, 'families', rodinaId, 'contacts')

export const sledovatKontakty = (rodinaId, zmena, chyba) =>
  sledovat(query(kolekce(rodinaId), orderBy('jmeno')), zmena, chyba)

// Kontakty: lékaři, úřady, sociální pracovníci. Role je volný text ("neurolog").
export const pridatKontakt = (rodinaId, { jmeno, role, telefon }) =>
  addDoc(kolekce(rodinaId), {
    jmeno: jmeno.trim(), role: role.trim(), telefon: telefon.trim(), vytvoreno: serverTimestamp(),
  })

export const smazatKontakt = (rodinaId, kontaktId) => deleteDoc(doc(db, 'families', rodinaId, 'contacts', kontaktId))

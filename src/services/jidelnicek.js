import { collection, deleteDoc, doc, documentId, query, serverTimestamp, setDoc, where } from 'firebase/firestore'
import { db } from '../firebase/config.js'
import { dnes } from './leky.js'
import { sledovat } from './sledovani.js'

const kolekce = (rodinaId, osobaId) => collection(db, 'families', rodinaId, 'carePersons', osobaId, 'jidelnicek')

export const JIDLA = [
  { klic: 'snidane', nazev: 'Snídaně' },
  { klic: 'svacina', nazev: 'Svačina' },
  { klic: 'obed', nazev: 'Oběd' },
  { klic: 'vecere', nazev: 'Večeře' },
]

const DNY = ['neděle', 'pondělí', 'úterý', 'středa', 'čtvrtek', 'pátek', 'sobota']
const jakoDatum = (t) => new Date(t).toISOString().slice(0, 10)

// Dny týdne od pondělí. Proč počítání v UTC z českého data: den "dnes" bere Praha,
// ale posun o 7 dní nesmí záviset na letním čase.
export function dnyTydne(posun = 0, ted = new Date()) {
  const [r, m, d] = dnes(ted).split('-').map(Number)
  const zaklad = Date.UTC(r, m - 1, d)
  const denTydne = new Date(zaklad).getUTCDay()
  const pondeli = zaklad - ((denTydne + 6) % 7) * 86400000 + posun * 7 * 86400000
  return Array.from({ length: 7 }, (_, i) => {
    const t = pondeli + i * 86400000
    return { datum: jakoDatum(t), nazev: DNY[new Date(t).getUTCDay()], den: Number(jakoDatum(t).slice(8)), mesic: Number(jakoDatum(t).slice(5, 7)) }
  })
}

export const sledovatTyden = (rodinaId, osobaId, dny, zmena, chyba) =>
  sledovat(query(kolekce(rodinaId, osobaId), where(documentId(), '>=', dny[0].datum), where(documentId(), '<=', dny[6].datum)), zmena, chyba)

export const ulozitDen = (rodinaId, osobaId, datum, hodnoty) => {
  const data = Object.fromEntries([...JIDLA.map((j) => j.klic), 'poznamka'].map((k) => [k, (hodnoty[k] ?? '').trim()]))
  const prazdny = Object.values(data).every((v) => !v)
  const ref = doc(db, 'families', rodinaId, 'carePersons', osobaId, 'jidelnicek', datum)
  // Prázdný den se maže, ať v databázi nezůstávají prázdné dokumenty.
  return prazdny ? deleteDoc(ref) : setDoc(ref, { ...data, upraveno: serverTimestamp() })
}

import { collection, getDocs, query, Timestamp, where } from 'firebase/firestore'
import { db } from '../firebase/config.js'

const DNI = 30

// Rozložení péče mezi členy rodiny: jen počty zápisů a úkolů za posledních 30 dní,
// bez hodnocení. Počítá se z dat při čtení, žádná nová kolekce.
export async function spocitatRozlozeni(rodinaId, ted = new Date()) {
  const od = Timestamp.fromMillis(ted.getTime() - DNI * 24 * 3600 * 1000)
  const [zaznamy, ukoly] = await Promise.all([
    getDocs(query(collection(db, 'families', rodinaId, 'notes'), where('vytvoreno', '>=', od))),
    getDocs(query(collection(db, 'families', rodinaId, 'tasks'), where('vytvoreno', '>=', od))),
  ])
  const pocty = {}
  const zvysit = (uid, pole) => {
    if (!uid) return
    pocty[uid] ??= { zaznamy: 0, ukoly: 0 }
    pocty[uid][pole] += 1
  }
  zaznamy.forEach((d) => zvysit(d.data().autorUid, 'zaznamy'))
  ukoly.forEach((d) => zvysit(d.data().vytvoril, 'ukoly'))
  return { dni: DNI, pocty }
}

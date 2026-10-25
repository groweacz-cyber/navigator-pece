import { collection, doc, getDoc, onSnapshot } from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'
import { db, functions } from '../firebase/config.js'

const volat = (jmeno, data) => httpsCallable(functions, jmeno)(data).then((r) => r.data)

// Proč přes funkci: klient členství ani rodinu zapsat nesmí (pravidla).
export const zalozitRodinu = (nazev) => volat('zalozitRodinu', { nazev })
export const vytvoritPozvanku = (rodinaId, role) => volat('vytvoritPozvanku', { rodinaId, role })
export const prijmoutPozvanku = (kod) => volat('prijmoutPozvanku', { kod })

// Rodiny, ve kterých uživatel je, s jeho rolí. Seznam rodin drží users/{uid}.mojeRodiny
// (píše server), název a roli si dočteme z rodiny.
export async function najitMojeRodiny(uid) {
  const profil = await getDoc(doc(db, 'users', uid))
  const ids = profil.exists() ? (profil.data().mojeRodiny ?? []) : []
  const rodiny = await Promise.all(
    ids.map(async (id) => {
      try {
        const [rodina, clen] = await Promise.all([
          getDoc(doc(db, 'families', id)),
          getDoc(doc(db, 'families', id, 'members', uid)),
        ])
        if (!rodina.exists() || !clen.exists()) return null
        return { id, nazev: rodina.data().nazev, role: clen.data().role }
      } catch {
        return null
      }
    }),
  )
  return rodiny.filter(Boolean)
}

export function sledovatClenyRodiny(rodinaId, zmena, chyba) {
  return onSnapshot(
    collection(db, 'families', rodinaId, 'members'),
    (s) => zmena(s.docs.map((d) => ({ uid: d.id, ...d.data() }))),
    chyba,
  )
}

export const zmenitRoli = (rodinaId, cilUid, role) => volat('zmenitRoli', { rodinaId, cilUid, role })
export const odebratClena = (rodinaId, cilUid) => volat('odebratClena', { rodinaId, cilUid })

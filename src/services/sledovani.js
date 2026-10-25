import { onSnapshot } from 'firebase/firestore'

// Společný tvar pro živé seznamy: dokumenty s id a časy bez čekání na server.
export function sledovat(dotaz, zmena, chyba) {
  return onSnapshot(
    dotaz,
    (s) => zmena(s.docs.map((d) => ({ id: d.id, ...d.data({ serverTimestamps: 'estimate' }) }))),
    chyba,
  )
}

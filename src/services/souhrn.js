import { collection, getDocs, orderBy, query, Timestamp, where } from 'firebase/firestore'
import { db } from '../firebase/config.js'
import { dnySouhrnu, spocitatSouhrn } from './souhrnLogika.js'
import { ucinneHodnoceni } from './notes.js'

const DEN = 24 * 3600 * 1000

// Souhrn se počítá při otevření záložky z dat za 14 dní (týden a předchozí týden).
export async function nacistSouhrn(rodinaId, osobaId, ted = new Date()) {
  const od = Timestamp.fromMillis(ted.getTime() - 14 * DEN)
  const osoba = (c) => collection(db, 'families', rodinaId, 'carePersons', osobaId, c)
  const [zapisy, leky, podani] = await Promise.all([
    getDocs(query(collection(db, 'families', rodinaId, 'notes'), where('osobaId', '==', osobaId), where('vytvoreno', '>', od), orderBy('vytvoreno'))),
    getDocs(osoba('leky')),
    getDocs(query(osoba('podani'), where('datum', '>=', dnySouhrnu(ted)[0]))),
  ])
  return spocitatSouhrn({
    zaznamy: zapisy.docs.map((d) => {
      const z = d.data()
      return { vytvoreno: z.vytvoreno.toDate(), autorUid: z.autorUid, hodnoceni: ucinneHodnoceni(z) }
    }),
    leky: leky.docs.map((d) => ({ id: d.id, ...d.data() })),
    podani: podani.docs.map((d) => d.data()),
    ted,
  })
}

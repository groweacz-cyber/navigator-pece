import { collection, orderBy, query } from 'firebase/firestore'
import { getBlob, ref } from 'firebase/storage'
import { httpsCallable } from 'firebase/functions'
import { db, functions, storage } from '../firebase/config.js'
import { sledovat } from './sledovani.js'

export const sledovatExporty = (rodinaId, zmena, chyba) =>
  sledovat(query(collection(db, 'families', rodinaId, 'exports'), orderBy('vytvoreno', 'desc')), zmena, chyba)

// PDF vzniká na serveru jako jednorázový snímek deníku.
export const vygenerovatPripravu = (rodinaId, osobaId) =>
  httpsCallable(functions, 'generovatPripravuNaSetreni')({ rodinaId, osobaId }).then((r) => r.data)

export async function stahnoutPdf(cesta, nazevSouboru) {
  const blob = await getBlob(ref(storage, cesta))
  const url = URL.createObjectURL(blob)
  const a = Object.assign(document.createElement('a'), { href: url, download: nazevSouboru })
  a.click()
  URL.revokeObjectURL(url)
}

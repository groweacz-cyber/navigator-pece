// Naplní lokální emulátory ukázkovými daty, ať je co si prohlédnout v appce.
// Spuštění (emulátory musí běžet): npm run seed
// Přihlášení: pecovatel@demo.cz a host@demo.cz, heslo demo1234. Jen pro emulátory.

import { deleteApp, initializeApp } from 'firebase/app'
import { connectAuthEmulator, createUserWithEmailAndPassword, getAuth, signOut } from 'firebase/auth'
import { addDoc, collection, connectFirestoreEmulator, doc, getFirestore, serverTimestamp, setDoc } from 'firebase/firestore'
import { connectFunctionsEmulator, getFunctions, httpsCallable } from 'firebase/functions'

const app = initializeApp({ projectId: 'navigator-pece', apiKey: 'test' })
const auth = getAuth(app)
const db = getFirestore(app)
const fn = getFunctions(app, 'europe-west1')
connectAuthEmulator(auth, 'http://127.0.0.1:9199', { disableWarnings: true })
connectFirestoreEmulator(db, '127.0.0.1', 8180)
connectFunctionsEmulator(fn, '127.0.0.1', 5101)
const volat = (jmeno, data) => httpsCallable(fn, jmeno)(data).then((r) => r.data)

async function registrovat(jmeno, email) {
  const { user } = await createUserWithEmailAndPassword(auth, email, 'demo1234')
  await setDoc(doc(db, `users/${user.uid}`), { jmeno, email })
  return user.uid
}

const pecovatelUid = await registrovat('Radka Nováková', 'pecovatel@demo.cz')
const { rodinaId } = await volat('zalozitRodinu', { nazev: 'Rodina Nováková' })
const osoba = await addDoc(collection(db, `families/${rodinaId}/carePersons`), {
  jmeno: 'Marie Nováková',
  biografie: {
    zvyky: 'Každé ráno si dává kávu s mlékem a poslouchá rádio. Odpoledne spí hodinu.',
    uklidni: 'Mluv pomalu a tiše. Pomáhá, když se dívá na staré fotografie nebo zpívá písničku Teče voda.',
    vyvarovat: 'Neptat se „Víš, kdo jsem?“. Nespěchat s oblékáním.',
  },
  vytvoreno: serverTimestamp(),
})
await addDoc(collection(db, `families/${rodinaId}/carePersons/${osoba.id}/krizovyPlan`), {
  situace: 'Ztratí se venku',
  postup: 'Zavolat sousedce Horákové, pak policii na 158. Obvykle míří k bývalému obchodu na rohu.',
  vytvoreno: serverTimestamp(),
})
await addDoc(collection(db, `families/${rodinaId}/carePersons/${osoba.id}/health`), {
  nadpis: 'Nové léky od neurologa', poznamka: 'Od října ráno půl tablety.', vytvoreno: serverTimestamp(),
})
for (const text of [
  'Dnes odmítla koupel, musela jsem ji umýt já.',
  'Odpoledne se ztratila venku, našla jsem ji u obchodu.',
  'Myla se jen s mým dohledem.',
  'Snědla oběd sama a dobře.',
]) {
  await addDoc(collection(db, `families/${rodinaId}/notes`), { osobaId: osoba.id, text, autorUid: pecovatelUid, vytvoreno: serverTimestamp() })
}
await addDoc(collection(db, `families/${rodinaId}/tasks`), { nazev: 'Objednat se k neurologovi', hotovo: false, vytvoril: pecovatelUid, vytvoreno: serverTimestamp() })
await addDoc(collection(db, `families/${rodinaId}/contacts`), { jmeno: 'MUDr. Novotná', role: 'neurolog', telefon: '+420 123 456 789', vytvoreno: serverTimestamp() })

const pozvanka = await volat('vytvoritPozvanku', { rodinaId, role: 'host' })
await signOut(auth)
await registrovat('Honza Novák', 'host@demo.cz')
await volat('prijmoutPozvanku', { kod: pozvanka.kod })
console.log('Hotovo. Přihlášení: pecovatel@demo.cz nebo host@demo.cz, heslo demo1234.')
await deleteApp(app)

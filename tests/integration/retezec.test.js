// Celý řetěz proti emulátorům (auth, functions, firestore, storage):
// registrace → založení rodiny → pozvánka → přijetí → deník → klasifikace → PDF.
// Klasifikaci dělá mock (KLASIFIKACE_MOCK), ostré volání Anthropic se tu neřeší.
// Spuštění: npm run test:retezec

import { describe, expect, test } from 'vitest'
import { initializeApp } from 'firebase/app'
import { connectAuthEmulator, createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { collection, connectFirestoreEmulator, doc, getDoc, getDocs, getFirestore, serverTimestamp, setDoc, addDoc, query, where } from 'firebase/firestore'
import { connectFunctionsEmulator, getFunctions, httpsCallable } from 'firebase/functions'
import { connectStorageEmulator, getBytes, getStorage, ref } from 'firebase/storage'

const app = initializeApp({ projectId: 'navigator-pece', apiKey: 'test', storageBucket: 'navigator-pece.firebasestorage.app' })
const auth = getAuth(app)
const db = getFirestore(app)
const fn = getFunctions(app, 'europe-west1')
const storage = getStorage(app)
connectAuthEmulator(auth, 'http://127.0.0.1:9199', { disableWarnings: true })
connectFirestoreEmulator(db, '127.0.0.1', 8180)
connectFunctionsEmulator(fn, '127.0.0.1', 5101)
connectStorageEmulator(storage, '127.0.0.1', 9499)

const volat = (jmeno, data) => httpsCallable(fn, jmeno)(data).then((r) => r.data)
const kod = (chyba) => chyba?.code?.replace('functions/', '')

async function registrovat(email) {
  const { user } = await createUserWithEmailAndPassword(auth, email, 'heslo1234')
  await setDoc(doc(db, `users/${user.uid}`), { jmeno: email.split('@')[0], email })
  return user.uid
}

async function cekat(podminka, ms = 30000) {
  const konec = Date.now() + ms
  while (Date.now() < konec) {
    const v = await podminka()
    if (v) return v
    await new Promise((r) => setTimeout(r, 500))
  }
  throw new Error('Vypršel čas čekání')
}

describe('řetěz od registrace po PDF', () => {
  test('celý průchod', async () => {
    const stamp = Date.now()

    // Nepřihlášený nic nezavolá.
    await signOut(auth)
    await expect(volat('zalozitRodinu', { nazev: 'X' })).rejects.toMatchObject({ code: 'functions/unauthenticated' })

    // Pečovatel zakládá rodinu přes funkci.
    const pecovatelUid = await registrovat(`pecovatel${stamp}@test.cz`)
    await expect(setDoc(doc(db, 'families/rucne'), { nazev: 'R' })).rejects.toThrow()
    await expect(volat('zalozitRodinu', { nazev: '' })).rejects.toMatchObject({ code: 'functions/invalid-argument' })
    const { rodinaId } = await volat('zalozitRodinu', { nazev: 'Rodina Nováková' })
    expect((await getDoc(doc(db, `families/${rodinaId}/members/${pecovatelUid}`))).data().role).toBe('pecovatel')
    expect((await getDoc(doc(db, `users/${pecovatelUid}`))).data().mojeRodiny).toEqual([rodinaId])

    // Opatrovaná osoba a záznamy v deníku.
    const osoba = await addDoc(collection(db, `families/${rodinaId}/carePersons`), { jmeno: 'Marie' })
    const zapis = (text) => addDoc(collection(db, `families/${rodinaId}/notes`), {
      osobaId: osoba.id, text, autorUid: pecovatelUid, vytvoreno: serverTimestamp(),
    })
    const n1 = await zapis('Dnes odmítla koupel, musela jsem ji umýt já.')
    await zapis('Myla se jen s mým dohledem.')
    await zapis('Odpoledne se ztratila venku.')

    // Klasifikace doplní server.
    const klasifikovano = await cekat(async () => {
      const d = (await getDoc(n1)).data()
      return d.aiStav ? d : null
    })
    expect(klasifikovano.aiStav).toBe('hotovo')
    expect(klasifikovano.aiKategorie).toEqual(['hygiena'])
    expect(klasifikovano.aiHodnoceni).toEqual({ hygiena: 's_pomoci' })
    await cekat(async () => {
      const vse = await getDocs(query(collection(db, `families/${rodinaId}/notes`), where('osobaId', '==', osoba.id)))
      return vse.docs.every((d) => d.data().aiStav)
    })

    // Pozvánka pro hosta.
    await expect(volat('vytvoritPozvanku', { rodinaId, role: 'pecovatel' })).rejects.toMatchObject({ code: 'functions/invalid-argument' })
    const pozvanka = await volat('vytvoritPozvanku', { rodinaId, role: 'host' })
    expect(pozvanka.kod).toMatch(/^[A-Za-z0-9]{20}\.[A-Za-z0-9]{20}$/)

    await signOut(auth)
    const hostUid = await registrovat(`host${stamp}@test.cz`)
    await expect(volat('prijmoutPozvanku', { kod: 'blbost' })).rejects.toMatchObject({ code: 'functions/invalid-argument' })
    const prijato = await volat('prijmoutPozvanku', { kod: pozvanka.kod })
    expect(prijato).toEqual({ rodinaId, role: 'host' })
    expect((await getDoc(doc(db, `users/${hostUid}`))).data().mojeRodiny).toEqual([rodinaId])
    expect((await getDoc(doc(db, `families/${rodinaId}/members/${hostUid}`))).data().role).toBe('host')

    // Host nevidí deník, nesmí zvát ani generovat podklady, PDF nestáhne.
    await expect(getDocs(collection(db, `families/${rodinaId}/notes`))).rejects.toThrow()
    await expect(volat('vytvoritPozvanku', { rodinaId, role: 'clen' })).rejects.toMatchObject({ code: 'functions/permission-denied' })
    await expect(volat('generovatPripravuNaSetreni', { rodinaId, osobaId: osoba.id })).rejects.toMatchObject({ code: 'functions/permission-denied' })
    // Pozvánka je jednorázová.
    await expect(volat('prijmoutPozvanku', { kod: pozvanka.kod })).rejects.toMatchObject({ code: 'functions/failed-precondition' })

    await signOut(auth)
    await registrovat(`cizi${stamp}@test.cz`)
    await expect(volat('prijmoutPozvanku', { kod: pozvanka.kod })).rejects.toMatchObject({ code: 'functions/failed-precondition' })
    await expect(volat('generovatPripravuNaSetreni', { rodinaId, osobaId: osoba.id })).rejects.toMatchObject({ code: 'functions/permission-denied' })

    // Pečovatel vygeneruje PDF a stáhne si ho.
    await signOut(auth)
    await signInWithEmailAndPassword(auth, `pecovatel${stamp}@test.cz`, 'heslo1234')
    const exp = await volat('generovatPripravuNaSetreni', { rodinaId, osobaId: osoba.id })
    const zaznamExportu = (await getDoc(doc(db, `families/${rodinaId}/exports/${exp.exportId}`))).data()
    expect(zaznamExportu.pocetZaznamu).toBe(3)
    const bytes = new Uint8Array(await getBytes(ref(storage, exp.cesta)))
    expect(new TextDecoder().decode(bytes.slice(0, 5))).toBe('%PDF-')

    // Audit čte pečovatel a obsahuje klíčové akce.
    const audit = (await getDocs(collection(db, `families/${rodinaId}/auditLog`))).docs.map((d) => d.data().akce)
    expect(audit).toEqual(expect.arrayContaining(['rodina_zalozena', 'pozvanka_vytvorena', 'pozvanka_prijata', 'export_vytvoren']))

    // Host PDF stáhnout nesmí.
    await signOut(auth)
    await signInWithEmailAndPassword(auth, `host${stamp}@test.cz`, 'heslo1234')
    await expect(getBytes(ref(storage, exp.cesta))).rejects.toThrow()
  }, 120000)
})

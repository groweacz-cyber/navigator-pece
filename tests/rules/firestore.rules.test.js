// Testy Firestore pravidel: každá role × každá kolekce, včetně negativních případů.
// Spouští se v emulátoru: npm run test:rules

import { readFileSync } from 'node:fs'
import { afterAll, beforeAll, beforeEach, describe, test } from 'vitest'
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing'
import { doc, getDoc, setDoc, updateDoc, deleteDoc, serverTimestamp, collection, getDocs } from 'firebase/firestore'

const RODINA = 'rodina1'
const OSOBA = 'osoba1'
const CIZI_RODINA = 'rodina2'

let env

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'navigator-pece-test',
    firestore: { rules: readFileSync('firestore.rules', 'utf8') },
  })
})

afterAll(async () => {
  await env.cleanup()
})

// Proč seed přes withSecurityRulesDisabled: členství klient zapsat nesmí,
// takže stav "uživatel je v rodině s rolí X" musí vzniknout mimo pravidla,
// stejně jako ho v ostré appce zapíše Cloud Function.
beforeEach(async () => {
  await env.clearFirestore()
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore()
    await setDoc(doc(db, `families/${RODINA}`), { nazev: 'Test' })
    await setDoc(doc(db, `families/${RODINA}/members/pecovatel1`), { role: 'pecovatel' })
    await setDoc(doc(db, `families/${RODINA}/members/clen1`), { role: 'clen' })
    await setDoc(doc(db, `families/${RODINA}/members/host1`), { role: 'host' })
    await setDoc(doc(db, `families/${CIZI_RODINA}`), { nazev: 'Cizí' })
    await setDoc(doc(db, `families/${CIZI_RODINA}/members/cizi1`), { role: 'pecovatel' })
    await setDoc(doc(db, `families/${RODINA}/carePersons/${OSOBA}`), { jmeno: 'Marie' })
    await setDoc(doc(db, `families/${RODINA}/carePersons/${OSOBA}/health/h1`), { poznamka: 'x' })
    await setDoc(doc(db, `families/${RODINA}/carePersons/${OSOBA}/krizovyPlan/k1`), { situace: 'ztratí se' })
    await setDoc(doc(db, `families/${RODINA}/notes/n1`), {
      osobaId: OSOBA, text: 'Dnes se zamotala', autorUid: 'clen1', aiKategorie: ['orientace'],
    })
    await setDoc(doc(db, `families/${RODINA}/tasks/t1`), { nazev: 'Objednat' })
    await setDoc(doc(db, `families/${RODINA}/documents/d1`), { nazev: 'Žádost' })
    await setDoc(doc(db, `families/${RODINA}/contacts/c1`), { jmeno: 'Dr. Novák' })
    await setDoc(doc(db, `families/${RODINA}/invites/i1`), { role: 'clen', pouzita: false })
    await setDoc(doc(db, `families/${RODINA}/exports/e1`), { vytvoreno: 1 })
    await setDoc(doc(db, `families/${RODINA}/auditLog/a1`), { akce: 'x' })
    await setDoc(doc(db, 'users/pecovatel1'), { jmeno: 'P', email: 'p@x.cz', mojeRodiny: [RODINA] })
  })
})

const jako = (uid) => env.authenticatedContext(uid).firestore()
const anonym = () => env.unauthenticatedContext().firestore()
const p = (cesta) => `families/${RODINA}/${cesta}`

describe('nepřihlášený a cizí uživatel', () => {
  test('nepřihlášený nic nečte', async () => {
    await assertFails(getDoc(doc(anonym(), `families/${RODINA}`)))
    await assertFails(getDoc(doc(anonym(), p('notes/n1'))))
  })

  test('člen jiné rodiny nevidí nic z této rodiny', async () => {
    const db = jako('cizi1')
    await assertFails(getDoc(doc(db, `families/${RODINA}`)))
    await assertFails(getDoc(doc(db, p('notes/n1'))))
    await assertFails(getDoc(doc(db, p('tasks/t1'))))
    await assertFails(getDoc(doc(db, p(`carePersons/${OSOBA}`))))
  })
})

describe('families a members', () => {
  test('klient nesmí založit rodinu (jen funkce zalozitRodinu)', async () => {
    await assertFails(setDoc(doc(jako('novy'), 'families/nova'), { nazev: 'Nová' }))
  })

  test('klient nesmí zapsat členství ani sám sobě', async () => {
    await assertFails(setDoc(doc(jako('novy'), p('members/novy')), { role: 'pecovatel' }))
    await assertFails(setDoc(doc(jako('pecovatel1'), p('members/novy')), { role: 'clen' }))
    await assertFails(updateDoc(doc(jako('host1'), p('members/host1')), { role: 'pecovatel' }))
  })

  test('všechny role čtou rodinu i členy', async () => {
    for (const uid of ['pecovatel1', 'clen1', 'host1']) {
      await assertSucceeds(getDoc(doc(jako(uid), `families/${RODINA}`)))
      await assertSucceeds(getDoc(doc(jako(uid), p('members/clen1'))))
    }
  })

  test('rodinu upravuje jen pečovatel, nikdo ji nesmaže', async () => {
    await assertSucceeds(updateDoc(doc(jako('pecovatel1'), `families/${RODINA}`), { nazev: 'Nový' }))
    await assertFails(updateDoc(doc(jako('clen1'), `families/${RODINA}`), { nazev: 'X' }))
    await assertFails(updateDoc(doc(jako('host1'), `families/${RODINA}`), { nazev: 'X' }))
    await assertFails(deleteDoc(doc(jako('pecovatel1'), `families/${RODINA}`)))
  })
})

describe('users', () => {
  test('uživatel si vytvoří a upraví jen jmeno a email', async () => {
    const db = jako('novy')
    await assertSucceeds(setDoc(doc(db, 'users/novy'), { jmeno: 'N', email: 'n@x.cz' }))
    await assertSucceeds(updateDoc(doc(db, 'users/novy'), { jmeno: 'Nový' }))
  })

  test('uživatel si nesmí zapsat mojeRodiny', async () => {
    const db = jako('novy')
    await assertFails(setDoc(doc(db, 'users/novy'), { jmeno: 'N', email: 'n@x.cz', mojeRodiny: [RODINA] }))
    await assertFails(updateDoc(doc(jako('pecovatel1'), 'users/pecovatel1'), { mojeRodiny: [RODINA, 'jina'] }))
  })

  test('cizí profil nejde číst ani psát, smazat nejde nikdo', async () => {
    await assertFails(getDoc(doc(jako('clen1'), 'users/pecovatel1')))
    await assertFails(updateDoc(doc(jako('clen1'), 'users/pecovatel1'), { jmeno: 'X' }))
    await assertFails(deleteDoc(doc(jako('pecovatel1'), 'users/pecovatel1')))
  })
})

describe('carePersons, health, krizovyPlan', () => {
  test('biografii čtou všechny role, píše jen pečovatel a člen', async () => {
    for (const uid of ['pecovatel1', 'clen1', 'host1']) {
      await assertSucceeds(getDoc(doc(jako(uid), p(`carePersons/${OSOBA}`))))
    }
    await assertSucceeds(updateDoc(doc(jako('clen1'), p(`carePersons/${OSOBA}`)), { jmeno: 'M' }))
    await assertFails(updateDoc(doc(jako('host1'), p(`carePersons/${OSOBA}`)), { jmeno: 'M' }))
  })

  test('zdravotní záznamy: host nesmí číst ani psát', async () => {
    const h = p(`carePersons/${OSOBA}/health/h1`)
    await assertSucceeds(getDoc(doc(jako('pecovatel1'), h)))
    await assertSucceeds(getDoc(doc(jako('clen1'), h)))
    await assertFails(getDoc(doc(jako('host1'), h)))
    await assertFails(setDoc(doc(jako('host1'), p(`carePersons/${OSOBA}/health/h2`)), { poznamka: 'y' }))
  })

  test('krizový plán: host čte, nepíše', async () => {
    const k = p(`carePersons/${OSOBA}/krizovyPlan/k1`)
    await assertSucceeds(getDoc(doc(jako('host1'), k)))
    await assertFails(updateDoc(doc(jako('host1'), k), { situace: 'jiná' }))
    await assertSucceeds(updateDoc(doc(jako('clen1'), k), { situace: 'jiná' }))
  })
})

describe('notes (deník)', () => {
  const nova = (uid, extra = {}) => ({
    osobaId: OSOBA, text: 'Nový zápis', autorUid: uid, vytvoreno: serverTimestamp(), ...extra,
  })

  test('host deník nečte ani nepíše', async () => {
    await assertFails(getDoc(doc(jako('host1'), p('notes/n1'))))
    await assertFails(setDoc(doc(jako('host1'), p('notes/n2')), nova('host1')))
  })

  test('člen i pečovatel zapíše záznam jako sám sebe', async () => {
    await assertSucceeds(setDoc(doc(jako('clen1'), p('notes/n2')), nova('clen1')))
    await assertSucceeds(setDoc(doc(jako('pecovatel1'), p('notes/n3')), nova('pecovatel1')))
    await assertSucceeds(getDoc(doc(jako('clen1'), p('notes/n1'))))
  })

  test('klient nesmí při vytvoření zapsat aiKategorie', async () => {
    await assertFails(setDoc(doc(jako('clen1'), p('notes/n2')), nova('clen1', { aiKategorie: ['hygiena'] })))
    await assertFails(setDoc(doc(jako('clen1'), p('notes/n2')), nova('clen1', { aiKategorie: [] })))
  })

  test('klient nesmí podvrhnout autora ani čas', async () => {
    await assertFails(setDoc(doc(jako('clen1'), p('notes/n2')), nova('pecovatel1')))
    await assertFails(setDoc(doc(jako('clen1'), p('notes/n2')), nova('clen1', { vytvoreno: new Date('2020-01-01') })))
  })

  test('klient nesmí změnit aiKategorie ani autora, text smí jen autor', async () => {
    await assertFails(updateDoc(doc(jako('clen1'), p('notes/n1')), { aiKategorie: ['hygiena'] }))
    await assertFails(updateDoc(doc(jako('clen1'), p('notes/n1')), { autorUid: 'pecovatel1' }))
    await assertFails(updateDoc(doc(jako('pecovatel1'), p('notes/n1')), { text: 'cizí zásah' }))
    await assertSucceeds(updateDoc(doc(jako('clen1'), p('notes/n1')), { text: 'opraveno' }))
  })

  test('smazat smí autor nebo pečovatel, ne jiný člen', async () => {
    await assertFails(deleteDoc(doc(jako('host1'), p('notes/n1'))))
    await assertSucceeds(deleteDoc(doc(jako('clen1'), p('notes/n1'))))
  })
})

describe('tasks a contacts', () => {
  test('všechny role včetně hosta čtou i píšou', async () => {
    for (const uid of ['pecovatel1', 'clen1', 'host1']) {
      await assertSucceeds(getDoc(doc(jako(uid), p('tasks/t1'))))
      await assertSucceeds(getDoc(doc(jako(uid), p('contacts/c1'))))
    }
    await assertSucceeds(setDoc(doc(jako('host1'), p('tasks/t2')), { nazev: 'Nákup' }))
    await assertSucceeds(setDoc(doc(jako('host1'), p('contacts/c2')), { jmeno: 'Úřad' }))
  })

  test('cizí uživatel nic', async () => {
    await assertFails(setDoc(doc(jako('cizi1'), p('tasks/t2')), { nazev: 'x' }))
  })
})

describe('documents', () => {
  test('host nesmí, člen smí', async () => {
    await assertFails(getDoc(doc(jako('host1'), p('documents/d1'))))
    await assertFails(setDoc(doc(jako('host1'), p('documents/d2')), { nazev: 'x' }))
    await assertSucceeds(getDoc(doc(jako('clen1'), p('documents/d1'))))
    await assertSucceeds(setDoc(doc(jako('clen1'), p('documents/d2')), { nazev: 'x' }))
  })
})

describe('invites', () => {
  const pozvanka = (extra = {}) => ({
    role: 'clen', pouzita: false, vytvoril: 'pecovatel1', vytvoreno: serverTimestamp(), ...extra,
  })

  test('pozvánky vytváří a čte jen pečovatel', async () => {
    await assertSucceeds(setDoc(doc(jako('pecovatel1'), p('invites/i2')), pozvanka()))
    await assertSucceeds(getDoc(doc(jako('pecovatel1'), p('invites/i1'))))
    await assertFails(setDoc(doc(jako('clen1'), p('invites/i3')), pozvanka({ vytvoril: 'clen1' })))
    await assertFails(getDoc(doc(jako('clen1'), p('invites/i1'))))
    await assertFails(getDoc(doc(jako('host1'), p('invites/i1'))))
  })

  test('pozvánka nesmí dát roli pečovatel ani být rovnou použitá', async () => {
    await assertFails(setDoc(doc(jako('pecovatel1'), p('invites/i2')), pozvanka({ role: 'pecovatel' })))
    await assertFails(setDoc(doc(jako('pecovatel1'), p('invites/i2')), pozvanka({ pouzita: true })))
    await assertFails(setDoc(doc(jako('pecovatel1'), p('invites/i2')), pozvanka({ nejakePole: 1 })))
  })

  test('klient pozvánku nemění ani nemaže', async () => {
    await assertFails(updateDoc(doc(jako('pecovatel1'), p('invites/i1')), { pouzita: true }))
    await assertFails(deleteDoc(doc(jako('pecovatel1'), p('invites/i1'))))
  })
})

describe('exports a auditLog (píše jen server)', () => {
  test('exporty čte plný přístup, host ne, nikdo nepíše', async () => {
    await assertSucceeds(getDoc(doc(jako('clen1'), p('exports/e1'))))
    await assertFails(getDoc(doc(jako('host1'), p('exports/e1'))))
    for (const uid of ['pecovatel1', 'clen1', 'host1']) {
      await assertFails(setDoc(doc(jako(uid), p('exports/e2')), { vytvoreno: 1 }))
      await assertFails(updateDoc(doc(jako(uid), p('exports/e1')), { vytvoreno: 2 }))
    }
  })

  test('auditLog čte jen pečovatel, nikdo nepíše', async () => {
    await assertSucceeds(getDoc(doc(jako('pecovatel1'), p('auditLog/a1'))))
    await assertFails(getDoc(doc(jako('clen1'), p('auditLog/a1'))))
    for (const uid of ['pecovatel1', 'clen1', 'host1']) {
      await assertFails(setDoc(doc(jako(uid), p('auditLog/a2')), { akce: 'y' }))
      await assertFails(deleteDoc(doc(jako(uid), p('auditLog/a1'))))
    }
  })
})

describe('výpis kolekcí', () => {
  test('host nevypíše deník ani dokumenty', async () => {
    await assertFails(getDocs(collection(jako('host1'), p('notes'))))
    await assertFails(getDocs(collection(jako('host1'), p('documents'))))
    await assertSucceeds(getDocs(collection(jako('host1'), p('tasks'))))
  })
})

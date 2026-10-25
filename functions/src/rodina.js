// Serverová logika rodin, pozvánek a exportů. Funkce dostávají db/bucket
// zvenku, aby šly zkoušet v emulátoru i v testech.
//
// Proč vše na serveru: pravidla Firestore klientovi zakazují zapsat členství,
// pozvánky i exporty. Kdo smí co, se tu ověřuje znovu z dat v databázi,
// nikdy z toho, co o sobě klient tvrdí.

import { HttpsError } from 'firebase-functions/v2/https'
import { FieldValue, Timestamp } from 'firebase-admin/firestore'
import { vytvoritPripravuPdf } from './pdf.js'

const ROLE_POZVANKY = ['clen', 'host']
const PLATNOST_POZVANKY_DNI = 7
const MAX_ZAZNAMU_V_EXPORTU = 1000
const KOD_POZVANKY = /^[A-Za-z0-9]{20}\.[A-Za-z0-9]{20}$/

function vyzadovatPrihlaseni(uid) {
  if (!uid) throw new HttpsError('unauthenticated', 'Nejdřív se přihlas.')
}

function zapsatAudit(zapis, db, rodinaId, uid, akce, detail = {}) {
  // Detail nikdy nenese osobní údaje, jen identifikátory.
  zapis.set(db.collection(`families/${rodinaId}/auditLog`).doc(), {
    akce, uid, detail, vytvoreno: FieldValue.serverTimestamp(),
  })
}

// Proč jméno v členství: users/{uid} smí číst jen jeho vlastník, takže ostatní
// členové rodiny by jinak viděli jen anonymní uid.
async function jmenoUzivatele(db, uid) {
  const doc = await db.doc(`users/${uid}`).get()
  return doc.exists ? (doc.data().jmeno ?? '') : ''
}

async function nacistRoli(db, rodinaId, uid) {
  const doc = await db.doc(`families/${rodinaId}/members/${uid}`).get()
  return doc.exists ? doc.data().role : null
}

export async function zalozitRodinu(db, uid, data) {
  vyzadovatPrihlaseni(uid)
  const nazev = typeof data?.nazev === 'string' ? data.nazev.trim() : ''
  if (nazev.length < 1 || nazev.length > 80) {
    throw new HttpsError('invalid-argument', 'Napiš název rodiny, nejvýš 80 znaků.')
  }

  const jmeno = await jmenoUzivatele(db, uid)
  const rodinaRef = db.collection('families').doc()
  const batch = db.batch()
  batch.set(rodinaRef, { nazev, zakladatelUid: uid, vytvoreno: FieldValue.serverTimestamp() })
  batch.set(rodinaRef.collection('members').doc(uid), { role: 'pecovatel', jmeno, pridano: FieldValue.serverTimestamp() })
  batch.set(db.doc(`users/${uid}`), { mojeRodiny: FieldValue.arrayUnion(rodinaRef.id) }, { merge: true })
  zapsatAudit(batch, db, rodinaRef.id, uid, 'rodina_zalozena')
  await batch.commit()
  return { rodinaId: rodinaRef.id }
}

export async function vytvoritPozvanku(db, uid, data) {
  vyzadovatPrihlaseni(uid)
  const { rodinaId, role } = data ?? {}
  if (typeof rodinaId !== 'string' || !rodinaId) throw new HttpsError('invalid-argument', 'Chybí rodina.')
  if (!ROLE_POZVANKY.includes(role)) throw new HttpsError('invalid-argument', 'Vyber roli člen nebo host.')
  if ((await nacistRoli(db, rodinaId, uid)) !== 'pecovatel') {
    throw new HttpsError('permission-denied', 'Pozvat nové členy může jen hlavní pečovatel.')
  }

  const ref = db.collection(`families/${rodinaId}/invites`).doc()
  const platnostDo = Timestamp.fromMillis(Date.now() + PLATNOST_POZVANKY_DNI * 24 * 3600 * 1000)
  const batch = db.batch()
  batch.set(ref, { role, pouzita: false, vytvoril: uid, vytvoreno: FieldValue.serverTimestamp(), platnostDo })
  zapsatAudit(batch, db, rodinaId, uid, 'pozvanka_vytvorena', { pozvankaId: ref.id, role })
  await batch.commit()
  return { kod: `${rodinaId}.${ref.id}`, platnostDo: platnostDo.toDate().toISOString() }
}

export async function acceptInvite(db, uid, data) {
  vyzadovatPrihlaseni(uid)
  const kod = typeof data?.kod === 'string' ? data.kod.trim() : ''
  if (!KOD_POZVANKY.test(kod)) throw new HttpsError('invalid-argument', 'Kód pozvánky nevypadá správně. Zkopíruj ho celý.')
  const [rodinaId, pozvankaId] = kod.split('.')

  return db.runTransaction(async (tx) => {
    const pozvankaRef = db.doc(`families/${rodinaId}/invites/${pozvankaId}`)
    const clenRef = db.doc(`families/${rodinaId}/members/${uid}`)
    const [pozvanka, clen, uzivatel] = await Promise.all([
      tx.get(pozvankaRef), tx.get(clenRef), tx.get(db.doc(`users/${uid}`)),
    ])

    if (!pozvanka.exists) throw new HttpsError('not-found', 'Pozvánku jsme nenašli. Požádej o novou.')
    const p = pozvanka.data()
    if (p.pouzita) throw new HttpsError('failed-precondition', 'Tahle pozvánka už byla použita. Požádej o novou.')
    if (p.platnostDo.toMillis() < Date.now()) {
      throw new HttpsError('failed-precondition', 'Platnost pozvánky vypršela. Požádej o novou.')
    }
    if (clen.exists) throw new HttpsError('already-exists', 'V téhle rodině už jsi.')

    tx.set(clenRef, { role: p.role, jmeno: uzivatel.data()?.jmeno ?? '', pridano: FieldValue.serverTimestamp(), pozvankaId })
    tx.update(pozvankaRef, { pouzita: true, pouzilUid: uid, pouzito: FieldValue.serverTimestamp() })
    tx.set(db.doc(`users/${uid}`), { mojeRodiny: FieldValue.arrayUnion(rodinaId) }, { merge: true })
    zapsatAudit(tx, db, rodinaId, uid, 'pozvanka_prijata', { pozvankaId, role: p.role })
    return { rodinaId, role: p.role }
  })
}

export async function generovatPripravuNaSetreni(db, bucket, uid, data) {
  vyzadovatPrihlaseni(uid)
  const { rodinaId, osobaId } = data ?? {}
  if (typeof rodinaId !== 'string' || typeof osobaId !== 'string' || !rodinaId || !osobaId) {
    throw new HttpsError('invalid-argument', 'Chybí rodina nebo osoba.')
  }
  const role = await nacistRoli(db, rodinaId, uid)
  if (!['pecovatel', 'clen'].includes(role)) {
    throw new HttpsError('permission-denied', 'K podkladům nemáš přístup.')
  }
  const osobaDoc = await db.doc(`families/${rodinaId}/carePersons/${osobaId}`).get()
  if (!osobaDoc.exists) throw new HttpsError('not-found', 'Osobu jsme nenašli.')

  const snimek = await db
    .collection(`families/${rodinaId}/notes`)
    .where('osobaId', '==', osobaId)
    .orderBy('vytvoreno', 'asc')
    .limit(MAX_ZAZNAMU_V_EXPORTU)
    .get()
  const zaznamy = snimek.docs.map((d) => {
    const z = d.data()
    return { text: z.text ?? '', vytvoreno: z.vytvoreno.toDate(), aiHodnoceni: z.aiHodnoceni ?? null }
  })

  const pdf = await vytvoritPripravuPdf({ osoba: osobaDoc.data(), zaznamy })

  const exportRef = db.collection(`families/${rodinaId}/exports`).doc()
  const cesta = `families/${rodinaId}/exports/${exportRef.id}.pdf`
  await bucket.file(cesta).save(Buffer.from(pdf), { contentType: 'application/pdf', resumable: false })

  const batch = db.batch()
  batch.set(exportRef, {
    typ: 'priprava_na_setreni',
    osobaId,
    vytvoril: uid,
    vytvoreno: FieldValue.serverTimestamp(),
    cesta,
    pocetZaznamu: zaznamy.length,
    pocetBezHodnoceni: zaznamy.filter((z) => !z.aiHodnoceni).length,
  })
  zapsatAudit(batch, db, rodinaId, uid, 'export_vytvoren', { exportId: exportRef.id, osobaId })
  await batch.commit()
  return { exportId: exportRef.id, cesta }
}

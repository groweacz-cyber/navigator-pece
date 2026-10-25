import { setGlobalOptions } from 'firebase-functions/v2'
import { onCall } from 'firebase-functions/v2/https'
import { onDocumentCreated } from 'firebase-functions/v2/firestore'
import { defineSecret } from 'firebase-functions/params'
import * as logger from 'firebase-functions/logger'
import { initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'
import Anthropic from '@anthropic-ai/sdk'
import { klasifikovat } from './klasifikace.js'
import { mockKlient } from './mock.js'
import * as rodina from './rodina.js'

initializeApp()
const db = getFirestore()

// Proč europe-west1: stejná oblast jako databáze (eur3) a klient volá tuhle oblast.
const REGION = 'europe-west1'
setGlobalOptions({ region: REGION, maxInstances: 10 })

const ANTHROPIC_API_KEY = defineSecret('ANTHROPIC_API_KEY')

// Callable funkce kontrolují přihlášení z ID tokenu (request.auth) a roli
// z databáze. Veřejné "invoker" oprávnění je u callable funkcí správně:
// bez něj by je prohlížeč vůbec nezavolal.
export const zalozitRodinu = onCall((request) => rodina.zalozitRodinu(db, request.auth?.uid, request.data))

export const vytvoritPozvanku = onCall((request) => rodina.vytvoritPozvanku(db, request.auth?.uid, request.data))

export const prijmoutPozvanku = onCall((request) => rodina.prijmoutPozvanku(db, request.auth?.uid, request.data))

export const generovatPripravuNaSetreni = onCall({ timeoutSeconds: 120, memory: '512MiB' }, (request) =>
  rodina.generovatPripravuNaSetreni(db, getStorage().bucket(), request.auth?.uid, request.data),
)

// Mock jen v emulátoru, aby šel zkoušet celý řetěz bez placeného volání.
const POUZIT_MOCK = process.env.FUNCTIONS_EMULATOR === 'true' && process.env.KLASIFIKACE_MOCK === '1'

function klientKlasifikace() {
  if (POUZIT_MOCK) return mockKlient
  return new Anthropic({ apiKey: ANTHROPIC_API_KEY.value() })
}

export const klasifikovatZaznam = onDocumentCreated(
  // Proč bez secretu v mocku: emulátor by se jinak snažil sáhnout na Secret Manager.
  { document: 'families/{rodinaId}/notes/{noteId}', secrets: POUZIT_MOCK ? [] : [ANTHROPIC_API_KEY] },
  async (event) => {
    const zaznam = event.data
    if (!zaznam || zaznam.data().aiStav) return
    try {
      const vysledek = await klasifikovat(klientKlasifikace(), zaznam.data().text)
      await zaznam.ref.update({ ...vysledek, aiStav: 'hotovo', aiCas: new Date() })
    } catch (chyba) {
      // Do logu jen druh chyby, nikdy text záznamu.
      logger.error('Klasifikace záznamu selhala', { druh: chyba?.name, stav: chyba?.status })
      await zaznam.ref.update({ aiStav: 'chyba' })
    }
  },
)

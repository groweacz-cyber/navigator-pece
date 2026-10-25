// Navigátor péče — připojení k Firebase
//
// Hodnoty níže jsou veřejné podle návrhu (bezpečnost zajišťují Firestore a
// Storage pravidla, ne skrytí tohoto souboru). Skutečné najdeš ve Firebase
// konzoli: Project settings → General → Your apps → SDK setup.

import { initializeApp } from 'firebase/app'
import { connectAuthEmulator, getAuth } from 'firebase/auth'
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore'
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions'
import { connectStorageEmulator, getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: 'AIzaSyBWUZbAtXC-cVrx6A_nC3KZUTnXD0-IZX0',
  authDomain: 'navigator-pece.firebaseapp.com',
  projectId: 'navigator-pece',
  storageBucket: 'navigator-pece.firebasestorage.app',
  messagingSenderId: '255389973654',
  appId: '1:255389973654:web:07e3bda1aa45c66f2416b7',
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
// Proč europe-west1: tam běží funkce (stejná oblast jako databáze eur3).
export const functions = getFunctions(app, 'europe-west1')

// Proč přepínač: lokální vývoj proti emulátorům (npm run emulators) nesmí
// sahat na ostrá data. Zapíná se jen VITE_USE_EMULATORS=true.
if (import.meta.env.VITE_USE_EMULATORS === 'true') {
  connectAuthEmulator(auth, 'http://127.0.0.1:9199', { disableWarnings: true })
  connectFirestoreEmulator(db, '127.0.0.1', 8180)
  connectFunctionsEmulator(functions, '127.0.0.1', 5101)
  connectStorageEmulator(storage, '127.0.0.1', 9499)
}

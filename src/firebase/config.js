// Navigátor péče — připojení k Firebase
//
// Hodnoty níže jsou zástupné. Skutečné najdeš ve Firebase konzoli:
// Project settings → General → Your apps → SDK setup and configuration.
// Proč to není v .env: appka běží jako statický build na Vercelu bez
// vlastního backendu, tenhle klíč je veřejný podle návrhu (bezpečnost
// zajišťují Firestore/Storage pravidla, ne skrytí tohoto souboru).

import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

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

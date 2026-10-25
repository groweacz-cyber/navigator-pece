import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { auth, db } from '../firebase/config.js'

export function sledovatPrihlaseni(zmena) {
  return onAuthStateChanged(auth, zmena)
}

export async function registrovat({ jmeno, email, heslo }) {
  const { user } = await createUserWithEmailAndPassword(auth, email.trim(), heslo)
  // Proč jen jmeno a email: pole mojeRodiny smí zapsat jen server (pravidla).
  await setDoc(doc(db, 'users', user.uid), { jmeno: jmeno.trim(), email: email.trim() })
  return user
}

export function prihlasit({ email, heslo }) {
  return signInWithEmailAndPassword(auth, email.trim(), heslo)
}

export function odhlasit() {
  return signOut(auth)
}

import { httpsCallable } from 'firebase/functions'
import { functions } from '../firebase/config.js'

// Srovnání posledního měsíce s předchozím počítá server z deníku (jedna logika
// pro appku i PDF). Výsledek se neukládá.
export const nacistVyvoj = (rodinaId, osobaId) =>
  httpsCallable(functions, 'vyhodnotitVyvoj')({ rodinaId, osobaId }).then((r) => r.data)

// Převod chyb Firebase na klidné české věty. Funkce posílají česká hlášení
// samy, tady se řeší hlavně přihlášení a sdílené případy.

const AUTH = {
  'auth/email-already-in-use': 'Tenhle e-mail už je zaregistrovaný. Zkus se přihlásit.',
  'auth/invalid-email': 'E-mail nevypadá správně. Zkontroluj ho prosím.',
  'auth/weak-password': 'Heslo je moc krátké. Použij aspoň 8 znaků.',
  'auth/invalid-credential': 'E-mail nebo heslo nesedí. Zkus to prosím znovu.',
  'auth/too-many-requests': 'Příliš mnoho pokusů. Chvíli počkej a zkus to znovu.',
  'auth/network-request-failed': 'Nepodařilo se připojit k internetu. Zkontroluj spojení.',
}

export function zpravaChyby(chyba) {
  if (AUTH[chyba?.code]) return AUTH[chyba.code]
  const kod = chyba?.code ?? ''
  if (kod.startsWith('functions/') && kod !== 'functions/internal' && kod !== 'functions/unavailable' && chyba.message) {
    return chyba.message
  }
  if (kod === 'permission-denied') return 'K tomu nemáš oprávnění.'
  if (kod === 'unavailable' || kod === 'functions/unavailable') return 'Spojení se nepovedlo. Zkus to za chvíli znovu.'
  return 'Něco se nepovedlo. Zkus to prosím znovu.'
}

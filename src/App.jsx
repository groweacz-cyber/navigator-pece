// Navigátor péče — dočasná úvodní obrazovka
//
// Slouží jen k ověření, že build, deploy na Vercel a spojení na Firebase
// projekt fungují. Přihlášení a založení rodiny (Blok 2) tuhle obrazovku
// nahradí skutečným řízením stavu appky.

import { useEffect, useState } from 'react'
import { auth } from './firebase/config.js'

export default function App() {
  const [stavSpojeni, setStavSpojeni] = useState('Ověřuji spojení na Firebase…')

  useEffect(() => {
    // Proč jen tohle: v Bloku 1 ještě není žádná obrazovka pro
    // přihlášení, jen kontrola, že projekt je správně nakonfigurovaný.
    try {
      if (auth.app.options.apiKey === 'DOPLNIT') {
        setStavSpojeni('Kostra běží. Chybí doplnit skutečné údaje ve firebase/config.js.')
      } else {
        setStavSpojeni('Kostra běží, Firebase konfigurace je vyplněná.')
      }
    } catch {
      setStavSpojeni('Kostra běží, Firebase spojení se nepodařilo ověřit.')
    }
  }, [])

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '24px',
      fontFamily: '-apple-system, "Segoe UI", Roboto, Arial, sans-serif',
    }}>
      <h1 style={{ fontSize: '1.6rem', marginBottom: '12px' }}>Navigátor péče</h1>
      <p style={{ color: '#555' }}>{stavSpojeni}</p>
    </div>
  )
}

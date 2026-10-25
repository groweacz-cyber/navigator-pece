import React from 'react'
import ReactDOM from 'react-dom/client'
// Proč samo-hostovaný font: načítání z Google Fontů by posílalo IP adresy uživatelů třetí straně.
import '@fontsource/work-sans/400.css'
import '@fontsource/work-sans/600.css'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

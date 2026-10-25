const ROLE = { pecovatel: 'hlavní pečovatel', clen: 'člen', host: 'host' }

export default function ChooseFamily({ rodiny, onVybrat, onPozvanka, onOdhlasit }) {
  return (
    <main className="stred">
      <h1>Kterou rodinu otevřít?</h1>
      <ul className="seznam velke">
        {rodiny.map((r) => (
          <li key={r.id}>
            <button className="radek-tlacitko" onClick={() => onVybrat(r.id)}>
              <strong>{r.nazev}</strong>
              <span>{ROLE[r.role] ?? r.role}</span>
            </button>
          </li>
        ))}
      </ul>
      <button className="odkaz" onClick={onPozvanka}>Dostal/a jsem pozvánku</button>
      <button className="odkaz" onClick={onOdhlasit}>Odhlásit se</button>
    </main>
  )
}

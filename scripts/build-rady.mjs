// Vygeneruje web/rady.html ze stejného zdroje jako záložka Rady v appce (src/data/rady.js).
// Spuštění: npm run web:rady
import { writeFile } from 'node:fs/promises'
import { KDY_PRESTAT, RADY, UPOZORNENI } from '../src/data/rady.js'

const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;')
const sekce = RADY.map((r) => `
      <section class="rada-blok" id="${r.id}">
        <h2>${r.ikona} ${esc(r.nazev)}</h2>
        <p class="podtitul">${esc(r.uvod)}</p>
        <ul class="odrazky">
${r.tipy.map((t) => `          <li>${esc(t)}</li>`).join('\n')}
        </ul>
      </section>`).join('\n')

const html = `<!doctype html>
<html lang="cs">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Rady pro seniory: pohyb doma při vaření a úklidu – Opatruj</title>
    <meta name="description" content="Praktické rady pro seniory a jejich blízké: jak se pohybovat při vaření, úklidu a v koupelně, aby byl pohyb efektivní a pohodlnější. Obecné zásady, ne lékařská rada." />
    <meta name="theme-color" content="#2C4A4E" />
    <meta name="robots" content="noindex" />
    <link rel="canonical" href="https://opatruj.cz/rady" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="stylesheet" href="/styles.css?v=20261123c" />
  </head>
  <body>
    <a class="preskocit" href="#obsah">Přeskočit na obsah</a>
    <header class="hlavicka svetla">
      <div class="obal">
        <a class="znacka" href="/" aria-label="Opatruj, úvodní strana"><img src="/favicon.svg" alt="" width="38" height="38" />Opatruj</a>
        <nav aria-label="Hlavní navigace"><ul>
          <li><a href="/#co-umi">Co umí</a></li>
          <li><a href="/rady">Rady</a></li>
          <li><a href="/#bezpecnost">Bezpečnost</a></li>
          <li><a href="/#otazky">Otázky</a></li>
        </ul></nav>
        <a class="tlacitko druhe" href="https://app.opatruj.cz">Otevřít appku</a>
      </div>
    </header>
    <main id="obsah" class="stranka"><div class="obal">
      <h1>Rady pro pohodlnější den doma</h1>
      <p class="podtitul">Jak se pohybovat při vaření, úklidu a v koupelně, aby byl pohyb efektivní a mobilita pohodlnější. Pro seniory i pro jejich blízké.</p>
      <p class="upozorneni">${esc(UPOZORNENI)}</p>
      <p class="upozorneni"><strong>${esc(KDY_PRESTAT.nadpis)}.</strong> ${esc(KDY_PRESTAT.text)}</p>
${sekce}
      <p class="podtitul">Tyhle rady najdeš i přímo v appce Opatruj. Je tam deník péče, léky a podklady pro úřady na jednom místě.</p>
      <p><a class="tlacitko tmave" href="https://app.opatruj.cz">Otevřít Opatruj</a></p>
    </div></main>
    <footer>
      <div class="obal">
        <ul><li><a href="/">Úvod</a></li><li><a href="/kontakt">Kontakt</a></li></ul>
        <p>© 2026 opatruj.cz – Všechna práva vyhrazena.</p>
        <p>Web vytvořila <a href="https://growea.eu" rel="noopener">GROWEA.eu</a></p>
        <p>Opatruj není zdravotnický prostředek a nenahrazuje lékařskou péči ani rozhodnutí úřadu.</p>
      </div>
    </footer>
  </body>
</html>
`
await writeFile(new URL('../web/rady.html', import.meta.url), html)
console.log('web/rady.html vygenerováno')

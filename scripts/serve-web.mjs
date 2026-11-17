// Jednoduchý lokální server pro náhled marketingového webu (složka web/): npm run web
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'

const koren = fileURLToPath(new URL('../web/', import.meta.url))
const typy = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain',
  '.xml': 'application/xml',
}

createServer(async (req, res) => {
  let cesta = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^([/\\])+/, '')
  if (cesta === '') cesta = 'index.html'
  // Proč .html: odpovídá "cleanUrls" na Firebase Hostingu.
  if (!extname(cesta)) cesta += '.html'
  try {
    const data = await readFile(join(koren, cesta))
    res.writeHead(200, { 'Content-Type': typy[extname(cesta)] ?? 'application/octet-stream' })
    res.end(data)
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end('Nenalezeno')
  }
}).listen(5190, () => console.log('Web: http://localhost:5190'))

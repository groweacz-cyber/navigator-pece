// Produkční nasazení webu. Proč potvrzení: omylem spuštěný příkaz nesmí přepsat ostrý web.
// Spuštění jen ručně: npm run deploy:prod
import { spawnSync } from 'node:child_process'
import { createInterface } from 'node:readline/promises'

const rl = createInterface({ input: process.stdin, output: process.stdout })
const odpoved = await rl.question('Opravdu nasadit web do PRODUKCE (navigator-pece)? Napiš "ano": ')
rl.close()
if (odpoved.trim().toLowerCase() !== 'ano') {
  console.log('Zrušeno, nic se nenasadilo.')
  process.exit(1)
}
const shell = process.platform === 'win32'
for (const [prikaz, args] of [['npm', ['run', 'build']], ['firebase', ['deploy', '--only', 'hosting', '--project', 'navigator-pece']]]) {
  const vysledek = spawnSync(prikaz, args, { stdio: 'inherit', shell })
  if (vysledek.status !== 0) process.exit(vysledek.status ?? 1)
}

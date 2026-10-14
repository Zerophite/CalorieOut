// Swap stored photo URLs for larger originals where the host has them:
// WordPress resized copies ("dish-300x240.jpg") → the uploaded original
// ("dish.jpg"), and Wendy's "_medium_" product shots → "_large_". Every
// replacement is fetched first, so a missing original keeps the old URL.
//
//   node scripts/menus/upgrade-images.cjs      then regenerate the menus
const fs = require('fs')
const path = require('path')

const dir = path.join(__dirname, 'images')
const files = [
  ...fs.readdirSync(dir).filter((f) => f.endsWith('.json') && f !== 'exclude.json').map((f) => path.join(dir, f)),
  ...fs.readdirSync(path.join(dir, 'local')).map((f) => path.join(dir, 'local', f)),
]

function bigger(u) {
  if (/\/wp-content\/uploads\/|\/uploads\/\d{4}\//.test(u) && /-\d+x\d+(\.\w+)(\?.*)?$/.test(u)) return u.replace(/-\d+x\d+(\.\w+)(\?.*)?$/, '$1')
  if (/app\.wendys\.com\/.*_medium_/.test(u)) return u.replace('_medium_', '_large_')
  return null
}

const ok = new Map()
async function exists(u) {
  if (ok.has(u)) return ok.get(u)
  const r = await fetch(u, { headers: { 'User-Agent': 'Mozilla/5.0' } }).catch(() => null)
  const good = !!r && r.ok && /^image\//.test(r.headers.get('content-type') || '')
  if (r && r.body) await r.body.cancel().catch(() => {})
  ok.set(u, good)
  return good
}

/** Upgrade one name → URL map in place; returns how many URLs changed. */
async function upgradeMap(map) {
  let n = 0
  await Promise.all(Object.entries(map).map(async ([k, u]) => {
    const b = typeof u === 'string' && bigger(u)
    if (b && (await exists(b))) { map[k] = b; n++ }
  }))
  return n
}
module.exports = { upgradeMap }

if (require.main === module) (async () => {
  let swapped = 0
  for (const f of files) {
    const map = JSON.parse(fs.readFileSync(f, 'utf8'))
    const n = await upgradeMap(map)
    if (n) fs.writeFileSync(f, JSON.stringify(map, null, 1))
    swapped += n
  }
  console.log(`upgraded ${swapped} photo URLs`)
})()

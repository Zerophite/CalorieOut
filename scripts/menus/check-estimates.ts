// How close are the estimates? For every local dish whose calories the spot
// posts (`@` in local/*.txt), compare the posted figure with what the reference
// recipe alone would have estimated, and report the error by recipe.
//   node scripts/menus/run.cjs check-estimates.ts
import fs from 'fs'
import path from 'path'
import { ARCHETYPES } from './estimate'

const DIR = 'scripts/menus/local'
type Row = { spot: string; name: string; key: string; posted: number; estimate: number }
const rows: Row[] = []

for (const f of fs.readdirSync(DIR).filter((f) => f.endsWith('.txt'))) {
  for (const raw of fs.readFileSync(path.join(DIR, f), 'utf8').split('\n')) {
    const line = raw.replace(/\s#[A-Z][\w &]+\s*$/, '').split('::')[0]
    const sizePart = line.includes(';') ? line.slice(line.indexOf(';') + 1) : ''
    const m = line.split(';')[0].match(/^(.+?)\s=\s([\w.-]+)(?:\s+x([\d.]+))?(?:\s+@\s*([\d.]+)(?:\s*-\s*([\d.]+))?(?:\/(\w+))?)?\s*$/)
    if (!m || m[4] === undefined) continue
    const [, name, key, x, lo, hi, per] = m
    const arch = ARCHETYPES[key]
    // Per-piece postings and near-zero drinks don't compare like for like.
    if (!arch || per || +lo < 20) continue
    const k = x ? +x : 1
    const sizes = sizePart.split(',').map((s) => s.trim().match(/^(.+?)=([\d.]+)$/)).filter(Boolean) as RegExpMatchArray[]
    // Compare at the default portion: the size with factor 1 (or the only one).
    const f1 = sizes.find((s) => +s[2] === 1) ?? sizes[0]
    const factor = f1 ? +f1[2] : 1
    const posted = per ? +lo * factor : hi !== undefined && !sizes.length ? (+lo + +hi) / 2 : +lo * (sizes.length && hi === undefined ? factor : 1)
    rows.push({ spot: f.replace('.txt', ''), name, key, posted, estimate: arch.n[0] * k * factor })
  }
}

const err = (r: Row) => (r.estimate - r.posted) / r.posted
const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b)
  return s.length ? s[Math.floor(s.length / 2)] : 0
}
const pct = (x: number) => `${x >= 0 ? '+' : ''}${Math.round(x * 100)}%`

const abs = rows.map((r) => Math.abs(err(r)))
console.log(`${rows.length} dishes with posted calories`)
console.log(`median error ${Math.round(median(abs) * 100)}%, within 20%: ${Math.round((100 * abs.filter((e) => e <= 0.2).length) / rows.length)}%, within 35%: ${Math.round((100 * abs.filter((e) => e <= 0.35).length) / rows.length)}%`)

const byKey: Record<string, Row[]> = {}
for (const r of rows) (byKey[r.key] ??= []).push(r)
console.log('\nby recipe (n, median signed error, median abs error):')
for (const [k, rs] of Object.entries(byKey).sort((a, b) => b[1].length - a[1].length)) {
  console.log(`  ${k.padEnd(22)} ${String(rs.length).padStart(3)}  ${pct(median(rs.map(err))).padStart(5)}  ${pct(median(rs.map((r) => Math.abs(err(r)))))}`)
}
console.log('\nlargest misses:')
for (const r of [...rows].sort((a, b) => Math.abs(err(b)) - Math.abs(err(a))).slice(0, 15)) {
  console.log(`  ${pct(err(r)).padStart(6)}  ${r.spot} / ${r.name} (${r.key}): estimate ${Math.round(r.estimate)} vs posted ${Math.round(r.posted)}`)
}

// Main dishes only (what most estimated orders are), and which recipes are
// off the same way at more than one restaurant.
const MAINS = new Set(['Mains', 'Burgers', 'Sandwiches', 'Wraps', 'Bowls & Burritos', 'Pizza', 'Chicken', 'Breakfast', 'Salads'])
const mains = rows.filter((r) => MAINS.has(ARCHETYPES[r.key].category) && !/per serving|share|platter|family/i.test(r.name))
const mAbs = mains.map((r) => Math.abs(err(r)))
console.log(`\nmain dishes: ${mains.length}, median error ${Math.round(median(mAbs) * 100)}%, within 20%: ${Math.round((100 * mAbs.filter((e) => e <= 0.2).length) / mains.length)}%, within 35%: ${Math.round((100 * mAbs.filter((e) => e <= 0.35).length) / mains.length)}%`)
console.log('recipes off the same way at 2+ restaurants (n, spots, median signed error):')
const mk: Record<string, Row[]> = {}
for (const r of mains) (mk[r.key] ??= []).push(r)
for (const [k, rs] of Object.entries(mk)) {
  const spots = new Set(rs.map((r) => r.spot)).size
  const e = median(rs.map(err))
  if (rs.length >= 3 && Math.abs(e) >= 0.15) console.log(`  ${k.padEnd(22)} ${String(rs.length).padStart(3)} ${spots}  ${pct(e)}  [${[...new Set(rs.map((r) => r.spot))].join(', ')}]`)
}

const show = process.argv.slice(2).filter((a) => ARCHETYPES[a])
for (const k of show) {
  console.log(`\n${k} (reference ${ARCHETYPES[k].n[0]} cal, ${ARCHETYPES[k].serving}):`)
  for (const r of rows.filter((r) => r.key === k)) console.log(`  ${pct(err(r)).padStart(6)}  ${r.spot} / ${r.name}: est ${Math.round(r.estimate)} vs posted ${Math.round(r.posted)}`)
}

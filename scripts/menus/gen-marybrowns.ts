// Generate Mary Brown's menu from its official nutrition guide
// (raw/marybrowns.tsv, see fetch-marybrowns.cjs).
//
// The guide lists values PER SERVING, with larger items split into several
// servings (a Large Fries is "2 servings" of 518 kcal); totals here are the
// whole item (per-serving value × servings). Sauces and gravy are add-ons with
// Mary Brown's own values.
//
//   run from the repo root: gen-marybrowns.ts
import * as fs from 'fs'
import { componentsFor } from '../../src/data/templates'
import type { FixedItem, IngredientComponent, MealCategory, Nutrition } from '../../src/types'
import { idMaker, slug, tagsFor, writeMenu } from './lib'

type Row = { section: string; name: string; servings: number; n: Nutrition }
const rows: Row[] = fs
  .readFileSync('scripts/menus/raw/marybrowns.tsv', 'utf8')
  .split(/\r?\n/)
  .filter(Boolean)
  .map((l) => {
    const [section, rawName, serving, cal, fat0, sodium, carbs, protein] = l.split('\t')
    let fat = +fat0
    // Source typo guard: fat can't supply far more energy than the item has
    // (Large Taters is printed as 437.0 g instead of 43.7 g).
    if (fat * 9 > +cal * 1.2) {
      console.warn(`correcting fat for ${rawName}: ${fat} → ${fat / 10}`)
      fat /= 10
    }
    const servings = /servings/.test(serving) ? parseInt(serving, 10) : 1
    const name = rawName.replace(/^B9rPeCas:t/, '9 PC Feast: ').replace(/, and Side$/, ', and Side Breast')
    const k = servings
    return {
      section,
      name,
      servings,
      n: {
        calories: Math.round(+cal * k),
        protein: Math.round(+protein * k),
        carbs: Math.round(+carbs * k),
        fat: Math.round(fat * k),
        sodium: Math.round(+sodium * k),
      },
    }
  })

// --- Add-ons --------------------------------------------------------------------------------
const SAUCES: IngredientComponent[] = rows
  .filter((r) => r.section === 'SAUCES' && r.n.calories + r.n.sodium > 0)
  .map((r) => ({ id: `x-${slug(r.name)}`, name: /sauce$|mayo$|^ketchup$|^vinegar$/i.test(r.name) ? r.name : `${r.name} sauce`, default: false, nutrition: r.n }))
const gravy = rows.find((r) => r.name === 'Gravy (Small)')!
const GRAVY: IngredientComponent = { id: 'x-gravy', name: 'Add gravy (small)', default: false, nutrition: gravy.n }
const CHICKEN_EXTRAS = [GRAVY, ...SAUCES]

// --- Products ---------------------------------------------------------------------------------
interface Product {
  name: string
  category: MealCategory
  title?: string
  hint?: string
  extras?: IngredientComponent[]
  versions: { label: string; r: Row }[]
}
const products = new Map<string, Product>()
function add(name: string, label: string, r: Row, opts: Omit<Product, 'name' | 'versions'>) {
  if (!products.has(name)) products.set(name, { name, ...opts, versions: [] })
  products.get(name)!.versions.push({ label, r })
}
const expand = (s: string) => s.replace(/\bDrum\b/g, 'Drumstick').replace(/(\d) Thigh\b/g, '$1 Thighs')

for (const r of rows) {
  const n = r.name
  let m: RegExpMatchArray | null
  if (r.section === 'SAUCES') {
    add(/sauce$|mayo$|^ketchup$|^vinegar$/i.test(n) ? n : `${n} Sauce`, '1 serving', r, { category: 'Sides' })
    continue
  }
  if (r.section === 'DESSERTS') { add(n.replace(/^Apple Pies$/, 'Apple Pie'), '1 serving', r, { category: 'Desserts' }); continue }
  if (r.section === 'CHICKEN') {
    if ((m = n.match(/^(?:Fan Favorite )?(\d+) ?PC(?: Feast)?: (.*)$/))) {
      add(`${m[1]} Piece Chicken`, expand(m[2]), r, { category: 'Chicken', title: 'Pieces', hint: 'fried chicken', extras: CHICKEN_EXTRAS })
    } else {
      add('Signature Chicken', n, r, { category: 'Chicken', title: 'Piece', hint: 'fried chicken', extras: CHICKEN_EXTRAS })
    }
    continue
  }
  if ((m = n.match(/^(Spicy )?Big Mary$/))) { add('Big Mary', m[1] ? 'Spicy' : 'Original', r, { category: 'Sandwiches', title: 'Options', hint: 'Big Mary chicken sandwich', extras: SAUCES }); continue }
  if ((m = n.match(/^(Spicy )?Mini Mary$/))) { add('Mini Mary', m[1] ? 'Spicy' : 'Original', r, { category: 'Sandwiches', title: 'Options', hint: 'Mini Mary chicken sandwich', extras: SAUCES }); continue }
  if (n === 'Buffalo Mary Sandwich') { add(n, '1 sandwich', r, { category: 'Sandwiches', hint: 'Buffalo chicken sandwich', extras: SAUCES }); continue }
  if ((m = n.match(/^(\d) PC: (Spicy |Buffalo )?Chicken Tenders$/))) {
    add('Chicken Tenders', `${m[1]} pc${m[2] ? ' · ' + m[2].trim() : ''}`, r, { category: 'Chicken', title: 'Options', hint: 'chicken tenders', extras: CHICKEN_EXTRAS })
    continue
  }
  if (n === 'Chicken Wings') { add(n, '1 order', r, { category: 'Chicken', hint: 'chicken wings', extras: SAUCES }); continue }
  if ((m = n.match(/^(Chicken (?:Thai )?Pop-ins) \((Kids|Regular|Large)\)$/))) {
    add(m[1], m[2] === 'Kids' ? "Kids'" : m[2], r, { category: 'Chicken', hint: 'popcorn chicken', extras: CHICKEN_EXTRAS })
    continue
  }
  if (r.section === 'SNACK MENU') { add(n, n === 'Crispy Chicken Twists' ? '2 pieces' : '1 serving', r, { category: n === 'Mash-up Bowl' ? 'Bowls & Burritos' : 'Chicken', hint: n, extras: [GRAVY, ...SAUCES] }); continue }
  // Sides
  if ((m = n.match(/^(.*) \((Small|Medium|Large|Individual)\)$/))) {
    add(m[1], m[2], r, { category: 'Sides', extras: /fries|taters/i.test(m[1]) ? [GRAVY, ...SAUCES.slice(0, 3)] : undefined })
    continue
  }
  add(n, '1 serving', r, { category: 'Sides', hint: `${n}`, extras: /poutine/i.test(n) ? [GRAVY] : undefined })
}

// Multi-piece boxes: cross-check against the sum of the official single pieces.
// The guide's Fan Favourite 6 PC row is inconsistent with its own piece values
// (≈2.5× the sum), so a box that disagrees by more than 15% uses the sum.
const PIECE: Record<string, Row> = Object.fromEntries(
  ['Thigh', 'Side Breast', 'Wing', 'Drumstick', 'Centre Breast'].map((k) => [k, rows.find((r) => r.section === 'CHICKEN' && r.name === k)!]),
)
function pieceSum(mix: string): Nutrition | null {
  const total: Nutrition = { calories: 0, protein: 0, carbs: 0, fat: 0, sodium: 0 }
  for (const part of mix.replace(/ and /g, ', ').split(/,\s*/).filter(Boolean)) {
    const m = part.trim().match(/^(\d+ )?(.*?)s?$/)!
    const key = { thigh: 'Thigh', 'side breast': 'Side Breast', side: 'Side Breast', wing: 'Wing', drumstick: 'Drumstick', drum: 'Drumstick', centre: 'Centre Breast', 'centre breast': 'Centre Breast' }[m[2].toLowerCase()]
    if (!key) return null
    const q = m[1] ? parseInt(m[1], 10) : 1
    for (const f of Object.keys(total) as (keyof Nutrition)[]) total[f] += PIECE[key].n[f] * q
  }
  return total
}
for (const p of products.values()) {
  if (!/^\d+ Piece Chicken$/.test(p.name)) continue
  for (const v of p.versions) {
    const sum = pieceSum(v.label)
    if (sum && Math.abs(sum.calories - v.r.n.calories) > sum.calories * 0.15) {
      console.warn(`${p.name} (${v.label}): published ${v.r.n.calories} kcal vs pieces ${sum.calories} — using the piece sum`)
      v.r = { ...v.r, n: sum }
    }
  }
}

// --- Build ----------------------------------------------------------------------------------------
const ORDER = ["Kids'", 'Individual', 'Small', 'Regular', 'Medium', 'Large']
const newId = idMaker('mb')
const items: any[] = []
for (const p of products.values()) {
  const versions = [...p.versions].sort((a, b) => {
    const ia = ORDER.indexOf(a.label)
    const ib = ORDER.indexOf(b.label)
    return ia >= 0 && ib >= 0 ? ia - ib : 0
  })
  const def = versions.find((v) => /^(Regular|Original|Small|Thigh|3 pc)$/.test(v.label)) ?? versions[0]
  const breakdown = (r: Row) => {
    if (!p.extras) return undefined
    const probe: FixedItem = { id: 'probe', name: p.hint ?? p.name, kind: 'fixed', category: p.category, nutrition: r.n }
    return [...componentsFor(probe).filter((c) => c.default !== false), ...p.extras]
  }
  const tags = tagsFor(p.name + ' ' + versions.map((v) => v.label).join(' '), def.r.n).filter((t) => t !== 'spicy' || /spicy|buffalo/i.test(p.name))
  const it: any = { id: newId(p.name), name: p.name, kind: 'fixed', category: p.category, ...(tags.length ? { tags } : {}), nutrition: def.r.n }
  if (versions.length > 1) {
    it.defaultSize = def.label
    if (p.title) it.sizeTitle = p.title
    it.sizes = versions.map((v) => {
      const comps = breakdown(v.r)
      return { label: v.label, nutrition: v.r.n, ...(comps ? { components: comps } : {}) }
    })
  } else {
    it.serving = def.label
    const comps = breakdown(def.r)
    if (comps) it.components = comps
  }
  items.push(it)
}

writeMenu({
  file: 'marybrowns',
  exportName: 'marybrowns',
  meta: { id: 'mary-browns', name: "Mary Brown's", cuisine: 'Fried chicken · Fast food', accent: '#166534', segment: 'Fast Food' },
  items,
  order: ['Chicken', 'Sandwiches', 'Bowls & Burritos', 'Sides', 'Desserts'],
  source: [
    "Mary Brown's — complete menu from Mary Brown's official nutrition guide (July",
    '2026, linked from marybrowns.com/menu; extracted by fetch-marybrowns.cjs).',
    'Totals are whole items (the guide lists per-serving values). Sauces and gravy',
    "are add-ons with Mary Brown's own values; the default split is apportioned by",
    "ingredient type. Generated by scripts/menus/gen-marybrowns.ts — regenerate, don't hand-edit.",
  ],
})

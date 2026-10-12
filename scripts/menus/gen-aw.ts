// Generate A&W Canada's menu from its crawled official data (raw/aw.json, see
// fetch-aw.cjs). Size options become size chips; other options (lettuce-wrapped,
// with cheese, English muffin, oat beverage…) become their own products.
//
//   run from the repo root: gen-aw.ts
import * as fs from 'fs'
import type { MealCategory, Nutrition } from '../../src/types'
import { clean, idMaker, tagsFor, writeMenu } from './lib'

type Raw = {
  slug: string
  name: string
  category: string
  servingsize: number
  calories: number
  fat: number
  carbohydrates: number
  protein: number
  sodium: number
  components: string[]
}
const data: { items: Record<string, Raw> } = JSON.parse(fs.readFileSync('scripts/menus/raw/aw.json', 'utf8'))

// --- Name parsing ---------------------------------------------------------------
const SIZE_LABEL: Record<string, string> = {
  small: 'Small',
  regular: 'Regular',
  large: 'Large',
  "kid's size": "Kids'",
  '12oz': '12 oz',
  '20oz': '20 oz',
  single: 'Single',
  double: 'Double',
  each: '1 pc',
  '3': '3 pc',
  '5': '5 pc',
}
const SIZE_ORDER = ["Kids'", 'Small', 'Regular', 'Large', '12 oz', '20 oz', 'Single', 'Double', '1 pc', '3 pc', '5 pc']
const KIDS_SIDES = /^(apple slices|madegood bar|milk2go)$/i

interface Parsed {
  product: string
  size: string | null
  /** Non-size versions, e.g. "With cheese", "Lettuce-wrapped". */
  mods?: string[]
  serving?: string
}

const MOD_LABEL: [RegExp, string][] = [
  [/^with cheese$/i, 'With cheese'],
  [/^lettuce[- ]wrapped$/i, 'Lettuce-wrapped'],
  [/^english muffin$/i, 'English muffin'],
  [/^oat beverage$/i, 'Oat beverage'],
  [/^quebec$/i, 'Quebec style'],
  [/^zero sugar$/i, 'Zero sugar'],
]

function parse(raw: string): Parsed | null {
  const full = clean(raw)
  const m = full.match(/^(.*?)\s*\((.+)\)$/)
  if (!m) return { product: full, size: null }
  const base = m[1].trim()
  const paren = m[2].trim()
  const parts = paren.split(/\s*(?:,| - )\s*/).filter(Boolean)
  let size: string | null = null
  const mods: string[] = []
  for (const p of parts) {
    const key = p.toLowerCase()
    if (SIZE_LABEL[key]) size = SIZE_LABEL[key]
    else if (/^\d+ ?ml$/i.test(p)) return { product: base, size: null, serving: p.replace(/\s/g, ' ') }
    else if (/^2% milk$/i.test(p) || /^english canada$/i.test(p)) continue
    else mods.push(p)
  }
  // Kids' Pack: the parenthetical names the meal component.
  if (/^kids'/i.test(base)) {
    const comp = mods.join(' ')
    if (KIDS_SIDES.test(comp)) return { product: comp, size: null }
    const strips = comp.match(/^chicken strips (\d+)$/i)
    if (strips) return { product: base, size: null, serving: `${strips[1]} pc` }
    return { product: base, size: null }
  }
  if (/^dipping sauce$/i.test(base)) return { product: `${mods.join(' ')} Dipping Sauce`, size }
  let product = base
  const labels: string[] = []
  for (const mod of mods) {
    const known = MOD_LABEL.find(([re]) => re.test(mod))
    if (known) labels.push(known[1])
    else if (/^\d+pc$/i.test(mod)) product += ` (${mod.replace(/pc$/i, ' pc')})`
    else product += ` (${mod})`
  }
  return { product, size, mods: labels }
}

/** Chip label for one version of a product. */
const versionLabel = (p: Parsed) => [p.size, ...(p.mods ?? [])].filter(Boolean).join(' · ') || 'Regular'

// --- Categories -------------------------------------------------------------------
function category(raw: Raw, product: string): MealCategory {
  const n = product.toLowerCase()
  const c = raw.category
  if (c === 'Breakfast') return 'Breakfast'
  if (c === 'Hot Drinks') return 'Coffee'
  if (c === 'Cold Drinks' || c === 'Featured')
    return /latte|espresso/.test(n) ? 'Coffee' : 'Drinks'
  if (/milk2go/.test(n)) return 'Drinks'
  if (/turnover|lollipop|madegood/.test(n)) return 'Desserts'
  if (c === 'Sides' || /apple slices/.test(n)) return 'Sides'
  if (/wrap$/.test(n)) return 'Wraps'
  if (/fish/.test(n)) return 'Sandwiches'
  if (/chicken|cruncher/.test(n)) return 'Chicken'
  return 'Burgers'
}

// --- Official deltas ------------------------------------------------------------
// When two versions of an item differ by exactly one non-vegetable ingredient
// (a burger and its lettuce-wrapped version, with/without cheese, a latte and a
// vanilla latte…), the difference in their published calories is that
// ingredient's calories.
const VEG = /lettuce|tomato|onion|pickle/i
const NOISE = /seasoning|pan coating|frying oil|^batter|breadcrumbs|^-$/i
const norm = (s: string) => clean(s).toLowerCase()
const keyIngs = (r: Raw) => new Set(r.components.map(norm).filter((x) => !VEG.test(x) && !NOISE.test(x)))

type Entry = { raw: Raw; p: Parsed }
const entries: Entry[] = []
const seenSlug = new Set<string>()
for (const raw of Object.values(data.items)) {
  if (seenSlug.has(raw.slug)) continue
  seenSlug.add(raw.slug)
  const name = clean(raw.name)
  if (/rooty$/i.test(name) && raw.calories === 0) continue // toys
  if (/^kraft table spreads$/i.test(name)) continue
  const p = parse(raw.name)
  if (!p) continue
  if (/^teas$/i.test(p.product)) p.product = 'Tea'
  entries.push({ raw, p })
}

const derived = new Map<string, Map<string, number>>() // slug -> ingredient -> cal
for (const a of entries) {
  const A = keyIngs(a.raw)
  for (const b of entries) {
    if (a === b || (a.p.size ?? '') !== (b.p.size ?? '') || a.raw.category !== b.raw.category) continue
    // A side-sauce cup is a different portion than the sauce on an item.
    if (/sauce|mayonnaise|gravy/i.test(b.p.product)) continue
    const B = keyIngs(b.raw)
    const extra = [...A].filter((x) => !B.has(x))
    const missing = [...B].filter((x) => !A.has(x))
    if (extra.length !== 1 || missing.length !== 0) continue
    const cal = a.raw.calories - b.raw.calories
    if (cal <= 0 || cal >= a.raw.calories) continue
    if (!derived.has(a.raw.slug)) derived.set(a.raw.slug, new Map())
    const m = derived.get(a.raw.slug)!
    // Several counterparts can match; the closest one is the like-for-like pair.
    if (!m.has(extra[0]) || cal < m.get(extra[0])!) m.set(extra[0], cal)
  }
}

function ingredientsFor(raw: Raw) {
  const d = derived.get(raw.slug)
  const list = raw.components.map((name) => {
    const nm = clean(name)
    const cal = d?.get(norm(name))
    return cal != null ? { name: nm, cal } : { name: nm }
  })
  // Breakfast platters list every toast / spread choice; keep one toast.
  const out: { name: string; cal?: number }[] = []
  for (const g of list) {
    if (/toast/i.test(g.name)) {
      if (!out.some((x) => x.name === 'Toast')) out.push({ name: 'Toast' })
      continue
    }
    out.push(g)
  }
  return out
}

const toNut = (r: Raw): Nutrition => ({
  calories: Math.round(r.calories),
  protein: Math.round(r.protein),
  carbs: Math.round(r.carbohydrates),
  fat: Math.round(r.fat),
  sodium: Math.round(r.sodium),
})

// --- Group into products --------------------------------------------------------
type Version = { label: string; p: Parsed; raw: Raw }
const products = new Map<string, { name: string; raw: Raw; serving?: string; versions: Map<string, Version> }>()
for (const { raw, p } of entries) {
  const key = p.product.toLowerCase()
  if (!products.has(key)) products.set(key, { name: p.product, raw, serving: p.serving, versions: new Map() })
  const prod = products.get(key)!
  const label = versionLabel(p)
  if (!prod.versions.has(label)) prod.versions.set(label, { label, p, raw })
}

const sizeRank = (v: Version) => (v.p.size ? SIZE_ORDER.indexOf(v.p.size) : SIZE_ORDER.indexOf('Regular'))
const newId = idMaker('aw')
const items: any[] = []
for (const prod of products.values()) {
  const versions = [...prod.versions.values()].sort(
    (a, b) => (a.p.mods?.length ?? 0) - (b.p.mods?.length ?? 0) || sizeRank(a) - sizeRank(b),
  )
  const plain = versions.filter((v) => !v.p.mods?.length)
  const def =
    plain.find((v) => v.p.size === 'Regular') ?? plain.find((v) => v.p.size === '3 pc') ?? plain[0] ?? versions[0]
  const n = toNut(def.raw)
  const tags = tagsFor(prod.name, n)
  const multi = versions.length > 1
  const it: any = {
    id: newId(prod.name),
    name: prod.name,
    kind: 'fixed',
    category: category(prod.raw, prod.name),
    ...(multi ? {} : { serving: prod.serving ?? (def.p.size ?? `1 serving (${def.raw.servingsize} g)`) }),
    ...(tags.length ? { tags } : {}),
    nutrition: n,
  }
  if (multi) {
    it.defaultSize = def.label
    if (versions.some((v) => v.p.mods?.length)) it.sizeTitle = 'Options'
    it.sizes = versions.map((v) => ({ label: v.label, nutrition: toNut(v.raw), ingredients: ingredientsFor(v.raw) }))
  } else {
    it.ingredients = ingredientsFor(def.raw)
  }
  items.push(it)
}

writeMenu({
  file: 'aw',
  exportName: 'aw',
  meta: { id: 'aw', name: 'A&W', cuisine: 'Burgers · Fast food', accent: '#f97316', segment: 'Fast Food' },
  items,
  order: ['Burgers', 'Chicken', 'Sandwiches', 'Wraps', 'Breakfast', 'Sides', 'Desserts', 'Drinks', 'Coffee'],
  source: [
    "A&W Canada — complete menu from A&W's official menu data (public menu API,",
    'crawled by fetch-aw.cjs). Totals are the published values; ingredient names',
    "are A&W's own. Where two versions of an item differ by one ingredient (e.g.",
    'lettuce-wrapped, with cheese) that ingredient carries the official calorie',
    'difference; the rest of the split is apportioned by ingredient type.',
    "Generated by scripts/menus/gen-aw.ts — regenerate, don't hand-edit.",
  ],
})

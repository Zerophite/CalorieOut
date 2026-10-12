// Generate src/data/timhortons.ts from Tim Hortons Canada official menu data (tims.json).
import * as fs from 'fs'
import { buildComponents, type PartSpec } from '../../src/data/components'
import type { IngredientComponent, MealCategory, Nutrition } from '../../src/types'

const S = 'scripts/menus/raw'
const OUT = 'src/data/timhortons.ts'
const data = JSON.parse(fs.readFileSync(`${S}/tims.json`, 'utf8'))

type RawNut = { calories?: number; fat?: number; proteins?: number; carbohydrates?: number; sodium?: number; fiber?: number; sugar?: number } | null
const clean = (s: string) => s.replace(/[\u200b\u00ae\u2122]/g, '').replace(/\s+/g, ' ').trim()
const slug = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-|-$/g, '')
const toNut = (n: RawNut): Nutrition => ({
  calories: Math.round(n?.calories ?? 0),
  protein: Math.round(n?.proteins ?? 0),
  carbs: Math.round(n?.carbohydrates ?? 0),
  fat: Math.round(n?.fat ?? 0),
  sodium: Math.round(n?.sodium ?? 0),
})
const sub = (a: Nutrition, b: Nutrition): Nutrition => ({
  calories: Math.max(0, a.calories - b.calories),
  protein: Math.max(0, a.protein - b.protein),
  carbs: Math.max(0, a.carbs - b.carbs),
  fat: Math.max(0, a.fat - b.fat),
  sodium: Math.max(0, a.sodium - b.sodium),
})

const SIZE_RE = /^(Extra Large|X-Large|Small|Medium|Large|Kids|Mini)\s+/i
const SIZE_ORDER = ['Kids', 'Mini', 'Small', 'Medium', 'Large', 'Extra Large']
const DRINK_RE = /coffee|latte|capp|cappuccino|americano|espresso|mocha|macchiato|matcha|tea|chai|hot chocolate|cold brew|steeped|frappe|shake|lemonade|refresher|smoothie|juice|quencher|water|milk|cooler|frozen/i
const COFFEE_RE = /coffee|latte|capp|cappuccino|americano|espresso|mocha|macchiato|matcha|tea|chai|hot chocolate|cold brew|steeped/i

function category(path: string[], name: string): MealCategory {
  const top = path[0] ?? ''
  const sec = (path[1] ?? '').toLowerCase()
  const n = name.toLowerCase()
  if (/hot drinks|cold drinks/i.test(top) || (top === 'New & Seasonal' && DRINK_RE.test(n)))
    return COFFEE_RE.test(n) ? 'Coffee' : 'Drinks'
  if (top === 'Breakfast') return 'Breakfast'
  if (top === 'Baked Goods') return 'Bakery'
  if (top === 'Condiments') return 'Sides'
  const s = `${sec} ${n}`
  if (/pizza|flatbread/.test(s)) return 'Pizza'
  if (/wrap/.test(s)) return 'Wraps'
  if (/bowl/.test(s)) return 'Bowls & Burritos'
  if (/soup|chili|stew/.test(s)) return 'Mains'
  if (/wedge|potato|side|hash/.test(s)) return 'Sides'
  if (/donut|timbit|muffin|cookie|croissant|pastry|bagel|loaf|tea biscuit|danish|fritter|dutchie|cake/.test(s)) return 'Bakery'
  if (/breakfast|egg|bacon & egg|farmer/.test(s)) return 'Breakfast'
  return 'Sandwiches'
}

const LOCK_RE = /bread|bagel|wrap|tortilla|bun|croissant|biscuit|english muffin|flatbread|crust/i
const SKIP_GROUP_RE = /^(toasted|black|ice|no ice|light ice|extra ice|lid|cup|size)$/i

function groupLabel(g: string) {
  return clean(g)
    .replace(/\s+for (small|medium|large|extra large)( \w+)*$/i, '')
    .replace(/^dairy & alternatives$/i, 'Milk')
}

type Opt = { default?: boolean; modifierMultiplier?: { multiplier?: number; prefix?: { en?: string } }; nutrition: RawNut }
type Group = { name?: { en?: string }; options?: Opt[] }

function buildForVariant(item: any): { nutrition: Nutrition; components: IngredientComponent[] } {
  const served = toNut(item.nutritionWithModifiers ?? item.nutrition)
  const groups: Group[] = item.options ?? []
  const defaults: PartSpec[] = []
  const extras: IngredientComponent[] = []
  let gi = 0
  for (const g of groups) {
    gi++
    const label = groupLabel(g.name?.en ?? '')
    if (!label || SKIP_GROUP_RE.test(label)) continue
    const opts = (g.options ?? []).filter((o) => o.nutrition)
    const di = opts.findIndex((o) => o.default)
    const def = di >= 0 ? opts[di] : undefined
    const defN = def ? toNut(def.nutrition) : undefined
    if (def && defN && defN.calories >= 1) {
      const mult = def.modifierMultiplier?.multiplier ?? 1
      defaults.push({
        id: `d${gi}`,
        name: mult > 1 ? `${label} (×${mult})` : label,
        n: defN,
        removable: LOCK_RE.test(label) ? false : undefined,
      })
      // "Extra" = the next quantity up, priced as the difference.
      const next = opts[di + 1]
      if (next) {
        const delta = sub(toNut(next.nutrition), defN)
        if (delta.calories >= 1) extras.push({ id: `x${gi}`, name: `Extra ${label.toLowerCase()}`, default: false, nutrition: delta })
      }
    } else {
      const first = opts.find((o) => toNut(o.nutrition).calories >= 1)
      if (first) extras.push({ id: `x${gi}`, name: `Add ${label.toLowerCase()}`, default: false, nutrition: toNut(first.nutrition) })
    }
  }
  const core: PartSpec = { id: 'base', name: defaults.length ? 'Base' : 'Item', core: true }
  const comps = buildComponents(served, [core, ...defaults])
  return { nutrition: served, components: [...comps, ...extras.slice(0, 10)] }
}

// --- Group placements into products ---------------------------------------
type Variant = { size: string | null; item: any }
const products = new Map<string, { name: string; path: string[]; variants: Map<string, Variant> }>()
for (const p of data.placements) {
  const item = data.items[p.itemId]
  if (!item || !(item.nutritionWithModifiers ?? item.nutrition)?.calories && (item.nutritionWithModifiers ?? item.nutrition)?.calories !== 0) continue
  const full = clean(item.name?.en ?? '')
  if (!full || /reusable cup/i.test(full) || /^filler$/i.test(full)) continue
  const m = full.match(SIZE_RE)
  const size = m ? m[1].replace(/^x-large$/i, 'Extra Large') : null
  const prodName = m ? full.slice(m[0].length) : full
  const key = prodName.toLowerCase()
  if (!products.has(key)) products.set(key, { name: prodName, path: p.path, variants: new Map() })
  const prod = products.get(key)!
  // Prefer a permanent-menu placement over "New & Seasonal" for categorising.
  if (prod.path[0] === 'New & Seasonal' && p.path[0] !== 'New & Seasonal') prod.path = p.path
  const vkey = size ?? 'One size'
  if (!prod.variants.has(vkey)) prod.variants.set(vkey, { size, item })
}

const items: any[] = []
const usedIds = new Set<string>()
for (const prod of products.values()) {
  const variants = [...prod.variants.values()].sort(
    (a, b) => SIZE_ORDER.indexOf(a.size ?? '') - SIZE_ORDER.indexOf(b.size ?? ''),
  )
  const built = variants.map((v) => ({ label: v.size ?? 'Regular', ...buildForVariant(v.item) }))
  const def = built.find((b) => b.label === 'Medium') ?? built[0]
  const cat = category(prod.path, prod.name)
  let id = 'th-' + slug(prod.name)
  while (usedIds.has(id)) id += '-x'
  usedIds.add(id)
  const n = def.nutrition
  const tags: string[] = []
  if (n.protein >= 25) tags.push('high-protein')
  if (/spicy|habanero|jalape/i.test(prod.name)) tags.push('spicy')
  const it: any = {
    id,
    name: prod.name,
    kind: 'fixed',
    category: cat,
    ...(built.length > 1 ? {} : { serving: def.label === 'Regular' ? '1 serving' : def.label }),
    ...(tags.length ? { tags } : {}),
    nutrition: n,
  }
  if (built.length > 1) {
    it.defaultSize = def.label
    it.sizes = built.map((b) => ({ label: b.label, nutrition: b.nutrition, components: b.components }))
  } else {
    it.components = def.components
  }
  items.push(it)
}

const order: MealCategory[] = ['Coffee', 'Drinks', 'Breakfast', 'Sandwiches', 'Wraps', 'Bowls & Burritos', 'Pizza', 'Mains', 'Sides', 'Bakery']
items.sort((a, b) => order.indexOf(a.category) - order.indexOf(b.category) || a.name.localeCompare(b.name))

const body = items.map((it) => '    ' + JSON.stringify(it).replace(/"(\w+)":/g, '$1: ')).join(',\n')
const ITEMS_OUT = 'src/data/menus/timhortons.items.ts'
fs.mkdirSync('src/data/menus', { recursive: true })
fs.writeFileSync(
  ITEMS_OUT,
  `import { type MenuItem } from '../../types'

// Tim Hortons Canada — complete menu from Tim Hortons' official menu data
// (public menu API), retrieved 2026-10-11. Totals are the published "as served"
// values; default add-ins (cream, syrups, sauces, cheese…) are removable
// ingredients and optional add-ins are add-ons, all with official nutrition.
// Generated file: regenerate rather than hand-editing.
export const items: MenuItem[] = [
${body.replace(/^ {4}/gm, '  ')},
]
`,
)
fs.writeFileSync(
  OUT,
  `import { type Restaurant } from '../types'

// Tim Hortons Canada — ${items.length} products, loaded on demand from ./menus.
export const timhortons: Restaurant = {
  id: 'tim-hortons',
  name: 'Tim Hortons',
  cuisine: 'Coffee · Bakery',
  accent: '#dc2626',
  segment: 'Coffee & Bakery',
  dataSource: 'official',
  items: [],
  itemCount: ${items.length},
  hasBuilder: false,
  loadItems: () => import('./menus/timhortons.items').then((m) => m.items),
}
`,
)
const byCat: Record<string, number> = {}
items.forEach((i) => (byCat[i.category] = (byCat[i.category] ?? 0) + 1))
console.log(`Wrote ${items.length} products (${items.filter((i) => i.sizes).length} with sizes)`, byCat)
console.log('Items file size:', (fs.statSync(ITEMS_OUT).size / 1024).toFixed(0), 'KB')

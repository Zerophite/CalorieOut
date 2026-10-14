// Generate a Restaurant Brands International chain's menu (Tim Hortons, Burger
// King…) from its crawled official data (raw/<brand>.json, see fetch-rbi.cjs).
//
//   run from the repo root: gen-rbi.ts <brand>
import * as fs from 'fs'
import { buildComponents, type PartSpec } from '../../src/data/components'
import type { IngredientComponent, MealCategory, Nutrition } from '../../src/types'
import { clean, idMaker, tagsFor, writeMenu, type RestaurantMeta } from './lib'

// --- Brand configuration ----------------------------------------------------
const COFFEE_RE = /coffee|latte|capp|cappuccino|americano|espresso|mocha|macchiato|matcha|tea|chai|hot chocolate|cold brew|steeped/i
const DRINK_RE = /coffee|latte|capp|cappuccino|americano|espresso|mocha|macchiato|matcha|tea|chai|hot chocolate|cold brew|steeped|frappe|shake|lemonade|refresher|smoothie|juice|quencher|water|milk|cooler|frozen/i

interface Brand {
  file: string // src/data/<file>.ts and src/data/menus/<file>.items.ts
  exportName: string
  idPrefix: string
  meta: RestaurantMeta
  sourceNote: string
  category: (path: string[], name: string) => MealCategory
  order: MealCategory[]
}

const BRANDS: Record<string, Brand> = {
  timhortons: {
    file: 'timhortons',
    exportName: 'timhortons',
    idPrefix: 'th',
    meta: { id: 'tim-hortons', name: 'Tim Hortons', cuisine: 'Coffee · Bakery', accent: '#dc2626', segment: 'Coffee & Bakery' },
    sourceNote: "Tim Hortons Canada — complete menu from Tim Hortons' official menu data",
    order: ['Coffee', 'Drinks', 'Breakfast', 'Sandwiches', 'Wraps', 'Bowls & Burritos', 'Pizza', 'Mains', 'Sides', 'Bakery'],
    category(path, name) {
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
    },
  },
  burgerking: {
    file: 'burgerking',
    exportName: 'burgerking',
    idPrefix: 'bk',
    meta: { id: 'burger-king', name: 'Burger King', cuisine: 'Burgers · Fast food', accent: '#d97706', segment: 'Fast Food' },
    sourceNote: "Burger King Canada — complete menu from Burger King's official menu data",
    order: ['Burgers', 'Chicken', 'Sandwiches', 'Breakfast', 'Sides', 'Desserts', 'Drinks', 'Coffee'],
    category(path, name) {
      const top = (path[0] ?? '').toLowerCase()
      const n = name.toLowerCase()
      if (/condiment/.test(top) || /sauce|dip cup/.test(n)) return 'Sides'
      if (/drinks|coffee/.test(top)) return COFFEE_RE.test(n) ? 'Coffee' : 'Drinks'
      if (/shake|sweets/.test(top) || /shake|sundae|blast|pie|turnover|cookie|brownie/.test(n)) return 'Desserts'
      if (/breakfast/.test(top) || /croissan|french toast|hash brown|english muffin|biscuit|pancake|breakfast|burrito/.test(n)) return 'Breakfast'
      if (/fish/.test(n)) return 'Sandwiches'
      if (/chicken|nugget/.test(n)) return 'Chicken'
      if (/fries|onion ring|bites|snack box|poutine/.test(n)) return 'Sides'
      if (/lemonade|coke|cola|sprite|fanta|juice|water|drink|milk|slush|frozen/.test(n)) return 'Drinks'
      return 'Burgers'
    },
  },
}

BRANDS.firehouse = {
  file: 'firehousesubs',
  exportName: 'firehousesubs',
  idPrefix: 'fh',
  meta: { id: 'firehouse-subs', name: 'Firehouse Subs', cuisine: 'Subs · Fast food', accent: '#b91c1c', segment: 'Fast Food' },
  sourceNote: "Firehouse Subs Canada — complete menu from Firehouse Subs' official menu data",
  order: ['Breakfast', 'Sandwiches', 'Wraps', 'Salads', 'Sides', 'Desserts', 'Drinks'],
  category(path, name) {
    const top = (path[0] ?? '').toLowerCase()
    const n = name.toLowerCase()
    if (/breakfast/.test(top)) return 'Breakfast'
    if (/beverage/.test(top)) return 'Drinks'
    if (/salad/.test(n) && !/tuna salad/.test(n)) return n === 'side salad' ? 'Sides' : 'Salads'
    if (/wrap/.test(n)) return 'Wraps'
    if (/cookie|brownie|dessert|pie bar/.test(n)) return 'Desserts'
    if (/sides|fries|chips/.test(top) || /fries|chips|lay's|doritos|ruffles|vickie|soup|chili|bread/.test(n)) return 'Sides'
    return 'Sandwiches'
  },
}

BRANDS.popeyes = {
  file: 'popeyes',
  exportName: 'popeyes',
  idPrefix: 'plk',
  meta: { id: 'popeyes', name: 'Popeyes', cuisine: 'Fried chicken · Fast food', accent: '#f97316', segment: 'Fast Food' },
  sourceNote: "Popeyes Canada — complete menu from Popeyes' official menu data",
  order: ['Chicken', 'Sandwiches', 'Wraps', 'Sides', 'Desserts', 'Drinks'],
  category(path, name) {
    const top = (path[0] ?? '').toLowerCase()
    const n = name.toLowerCase()
    if (/beverage/.test(top)) return 'Drinks'
    if (/dessert/.test(top) || /pie|cookie|beignet|brownie/.test(n)) return 'Desserts'
    if (/sauce/.test(top) || /sauce|dip|gravy/.test(n)) return 'Sides'
    if (/wrap/.test(top) || /wrap/.test(n)) return 'Wraps'
    if (/sandwich/.test(top) || /sandwich|burger/.test(n)) return 'Sandwiches'
    if (/sides/.test(top) || /fries|biscuit|coleslaw|rice|mac|mashed|corn|beans|cheese curds|poutine/.test(n)) return 'Sides'
    return 'Chicken'
  },
}

const brandKey = process.argv[2]
const B = BRANDS[brandKey]
if (!B) {
  console.error(`Unknown brand "${brandKey}". Use one of: ${Object.keys(BRANDS).join(', ')}`)
  process.exit(1)
}
const data = JSON.parse(fs.readFileSync(`scripts/menus/raw/${brandKey}.json`, 'utf8'))

// --- Helpers -------------------------------------------------------------------
type RawNut = { calories?: number; fat?: number; proteins?: number; carbohydrates?: number; sodium?: number; fiber?: number; sugar?: number } | null
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

const SIZE_RE = /^(Extra Large|X-Large|Small|Regular|Medium|Large|Value|Kids|Mini)\s+/i
const SIZE_SUFFIX_RE = /\s+(Small|Medium|Large)$/i
const SIZE_ORDER = ['Kids', 'Mini', 'Value', 'Small', 'Regular', 'Medium', 'Large', 'Extra Large']
const LOCK_RE = /bread|bagel|wrap|tortilla|bun|croissant|biscuit|english muffin|flatbread|crust/i
const SKIP_GROUP_RE = /^(toasted|black|ice|no ice|light ice|extra ice|lid|cup|size)$/i

function groupLabel(g: string) {
  return clean(g)
    .replace(/\s+for (small|medium|large|extra large)( \w+)*$/i, '')
    .replace(/^dairy & alternatives$/i, 'Milk')
    .replace(/^bread choice$/i, 'Bread')
}

type Opt = { default?: boolean; modifierMultiplier?: { multiplier?: number }; nutrition: RawNut }
type Group = { name?: { en?: string }; options?: Opt[] }

/**
 * The item as served (with its default toppings). Some feeds (Firehouse Subs)
 * give only calories for the served version; then the base recipe's macros
 * are scaled to the served calories.
 */
function servedNutrition(item: any): Nutrition {
  const wm = item.nutritionWithModifiers
  const base = item.nutrition
  const hasMacros = (n: RawNut) => !!n && (n.proteins != null || n.fat != null || n.carbohydrates != null)
  if (wm?.calories != null && !hasMacros(wm) && hasMacros(base) && base.calories > 0) {
    const k = wm.calories / base.calories
    const b = toNut(base)
    return {
      calories: Math.round(wm.calories),
      protein: Math.round(b.protein * k),
      carbs: Math.round(b.carbs * k),
      fat: Math.round(b.fat * k),
      sodium: Math.round(wm.sodium ?? b.sodium * k),
    }
  }
  return toNut(wm ?? base)
}

function buildForVariant(item: any): { nutrition: Nutrition; components: IngredientComponent[] } {
  const served = servedNutrition(item)
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
  // With no listed ingredients the whole item is one part, named after the item.
  const core: PartSpec = { id: 'base', name: defaults.length ? 'Base' : clean(item?.name?.en ?? 'Item').replace(SIZE_RE, ''), core: true }
  const comps = buildComponents(served, [core, ...defaults]).filter(
    // Drop an empty base when the listed ingredients already make up the whole item.
    (c) => !(c.id === 'base' && defaults.length > 0 && Object.values(c.nutrition).every((v) => v === 0)),
  )
  return { nutrition: served, components: [...comps, ...extras.slice(0, 10)] }
}

// --- Group placements into products -------------------------------------------
type Variant = { size: string | null; item: any }
const products = new Map<string, { name: string; path: string[]; variants: Map<string, Variant> }>()
const promoSection = /new & seasonal|featured|limited time/i
for (const p of data.placements) {
  const item = data.items[p.itemId]
  const n = item && (item.nutritionWithModifiers ?? item.nutrition)
  if (!item || !n || n.calories == null) continue
  const full = clean(item.name?.en ?? '')
  if (!full || /reusable cup/i.test(full) || /^filler$/i.test(full)) continue
  const m = full.match(SIZE_RE)
  const tail = m ? null : full.match(SIZE_SUFFIX_RE) // "The 6ix Sub Medium"
  const size = m ? m[1].replace(/^x-large$/i, 'Extra Large') : tail ? tail[1] : null
  const prodName = m ? full.slice(m[0].length) : tail ? full.slice(0, tail.index) : full
  const key = prodName.toLowerCase()
  if (!products.has(key)) products.set(key, { name: prodName, path: p.path, variants: new Map() })
  const prod = products.get(key)!
  // Prefer a permanent-menu placement over a promo section for categorising.
  if (promoSection.test(prod.path[0] ?? '') && !promoSection.test(p.path[0] ?? '')) prod.path = p.path
  const vkey = size ?? 'One size'
  if (!prod.variants.has(vkey)) prod.variants.set(vkey, { size, item })
}

const items: any[] = []
const newId = idMaker(B.idPrefix)
for (const prod of products.values()) {
  const variants = [...prod.variants.values()].sort(
    (a, b) => SIZE_ORDER.indexOf(a.size ?? '') - SIZE_ORDER.indexOf(b.size ?? ''),
  )
  const built = variants.map((v) => ({ label: v.size ?? 'Regular', ...buildForVariant(v.item) }))
  const def = built.find((b) => b.label === 'Medium') ?? built[0]
  const n = def.nutrition
  const tags = tagsFor(prod.name, n)
  const it: any = {
    id: newId(prod.name),
    name: prod.name,
    kind: 'fixed',
    category: B.category(prod.path, prod.name),
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

writeMenu({
  file: B.file,
  exportName: B.exportName,
  meta: B.meta,
  items,
  order: B.order,
  source: [
    B.sourceNote,
    '(public menu API, crawled by fetch-rbi.cjs). Totals are the published',
    '"as served" values; default add-ins (sauces, cheese, cream, syrups…) are',
    'removable ingredients and optional add-ins are add-ons, all with official',
    "nutrition. Generated by scripts/menus/gen-rbi.ts — regenerate, don't hand-edit.",
  ],
})

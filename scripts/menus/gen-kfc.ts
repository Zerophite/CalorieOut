// Generate KFC Canada's menu from its official nutrition guides (raw/kfc.tsv,
// see fetch-kfc.cjs).
//
// KFC publishes item totals plus a few add-ons (cheese slice, "Deluxe it up",
// gravy, dips, cold foam). Totals are official; the default-ingredient split
// comes from the recipe templates, and the add-ons carry KFC's own numbers.
//
//   run from the repo root: gen-kfc.ts
import * as fs from 'fs'
import { componentsFor } from '../../src/data/templates'
import type { FixedItem, IngredientComponent, MealCategory, Nutrition } from '../../src/types'
import { clean, idMaker, tagsFor, writeMenu } from './lib'

type Row = { src: string; section: string; name: string; serving: string; n: Nutrition }
const rows: Row[] = fs
  .readFileSync('scripts/menus/raw/kfc.tsv', 'utf8')
  .replace(/\r/g, '')
  .split('\n')
  .filter(Boolean)
  .map((l) => {
    const [src, section, name, serving, cal, fat, sodium, carbs, protein] = l.split('\t')
    return {
      src,
      section,
      name: clean(name).replace(/\*$/, ''),
      serving,
      n: { calories: Math.round(+cal), protein: Math.round(+protein), carbs: Math.round(+carbs), fat: Math.round(+fat), sodium: Math.round(+sodium) },
    }
  })
const row = (name: string, serving?: string) => {
  const r = rows.find((x) => x.name === name && (serving == null || x.serving === serving))
  if (!r) throw new Error(`missing ${name} ${serving ?? ''}`)
  return r
}

// --- Official add-ons ----------------------------------------------------------------
const addOn = (id: string, name: string, r: Row): IngredientComponent => ({ id, name, default: false, nutrition: r.n })
const DIPS = [
  addOn('x-ranch', 'Buttermilk ranch dip', row('Buttermilk Ranch Dipping Sauce')),
  addOn('x-bbq', 'Sweet & smokey BBQ dip', row('Sweet and Smokey BBQ Dipping Sauce')),
  addOn('x-honey-mustard', 'Carolina honey mustard dip', row('Carolina Honey Mustard Dipping Sauce')),
  addOn('x-plum', 'Southern plum dip', row('Southern Plum Dipping Sauce')),
  addOn('x-hot-sauce', 'Kentucky hot sauce', row('Kentucky Hot Sauce')),
]
const GRAVY = addOn('x-gravy', 'Add gravy (individual)', row('Gravy', 'Individual size'))
const CHEESE = addOn('x-cheese', 'Add cheese slice', row('Cheese'))
const DELUXE = addOn('x-deluxe', 'Deluxe it up', row('Deluxe It Up'))
const COLD_FOAM = addOn('x-cold-foam', 'Add cold foam', row('Cold Foam'))

// --- Products ---------------------------------------------------------------------------
interface Product {
  name: string
  category: MealCategory
  title?: string
  /** Name used only to pick the ingredient template (e.g. "Big Crunch" → chicken sandwich). */
  hint?: string
  extras: IngredientComponent[]
  versions: { label: string; r: Row }[]
}
const products = new Map<string, Product>()
function add(name: string, label: string, r: Row, opts: Omit<Product, 'name' | 'versions'>) {
  if (!products.has(name)) products.set(name, { name, ...opts, versions: [] })
  products.get(name)!.versions.push({ label, r })
}

const SANDWICH_EXTRAS = [CHEESE, DELUXE, DIPS[4]]
const sizeOf = (s: string) => s.replace(/ size$/i, '').replace(/^(\d+) (wings|strips)$/i, '$1 $2').replace(/^\w/, (c) => c.toUpperCase())

for (const r of rows) {
  const n = r.name
  const s = r.section
  if (/^(Cheese|Deluxe It Up|Cold Foam)$/.test(n)) continue // add-ons only
  if (/CHICKEN$/.test(s) && n !== 'OR Tender') {
    const style = s.replace(' CHICKEN', '').toLowerCase().replace(/(^|\s)\w/g, (c) => c.toUpperCase())
    add(`${style.replace('Original Recipe', 'Original Recipe')} Chicken`, n, r, {
      category: 'Chicken', title: 'Piece', extras: [GRAVY, ...DIPS],
    })
    continue
  }
  if (n === 'OR Tender') { add('Original Recipe Tender', '1 piece', r, { category: 'Chicken', extras: [GRAVY, ...DIPS] }); continue }
  if (s === 'SANDWICHES & WRAPS') {
    let m
    if ((m = n.match(/^(Spicy )?Twister( \(with Crispy Strips\))?$/))) {
      const label = [m[1] ? 'Spicy' : '', m[2] ? 'Crispy strips' : ''].filter(Boolean).join(' · ') || 'Regular'
      add('Twister', label, r, { category: 'Wraps', title: 'Options', hint: 'Chicken Twister wrap', extras: SANDWICH_EXTRAS })
    } else if ((m = n.match(/^(Spicy )?(Deluxe )?(Famous Chicken Sandwich|Big Crunch)$/))) {
      const label = [m[1] ? 'Spicy' : '', m[2] ? 'Deluxe' : ''].filter(Boolean).join(' · ') || 'Regular'
      add(m[3], label, r, { category: 'Sandwiches', title: 'Options', hint: 'Chicken sandwich', extras: m[2] ? [CHEESE, DIPS[4]] : SANDWICH_EXTRAS })
    } else if ((m = n.match(/^(Deluxe )?Zinger( Sandwich)?$/))) {
      add('Zinger Sandwich', m[1] ? 'Deluxe' : 'Regular', r, { category: 'Sandwiches', title: 'Options', hint: 'Spicy chicken sandwich', extras: SANDWICH_EXTRAS })
    } else if (n === 'Zinger Twister') {
      add('Zinger Twister', 'Regular', r, { category: 'Wraps', hint: 'Spicy chicken Twister wrap', extras: SANDWICH_EXTRAS })
    } else if ((m = n.match(/^(Spicy )?(Original Recipe|Crispy Strip) Slider$/))) {
      add(`${m[2]} Slider`, m[1] ? 'Spicy' : 'Regular', r, { category: 'Sandwiches', title: 'Options', hint: 'Chicken slider sandwich', extras: SANDWICH_EXTRAS })
    } else if ((m = n.match(/^(Original Recipe ?Tender|Original Reciper|Crispy Strip) Snacker Wrap, (Classic|Spicy)$/))) {
      const filling = /crispy/i.test(m[1]) ? 'Crispy strip' : 'Original Recipe tender'
      add('Snacker Wrap', `${filling} · ${m[2]}`, r, { category: 'Wraps', title: 'Options', hint: 'Chicken snacker wrap', extras: SANDWICH_EXTRAS })
    }
    continue
  }
  if (s === 'SNACKABLES & SIDES') {
    if (/^Hot Wings|^Crispy Strips|^Popcorn Chicken$/.test(n))
      add(n, sizeOf(r.serving), r, { category: 'Chicken', extras: [GRAVY, ...DIPS] })
    else if (/^Go Bucket - /.test(n))
      add(n.replace(/^Go Bucket - (.*)$/, 'Go Bucket: $1').replace('1 Crispy Strips', '1 Crispy Strip'), '1 Go Bucket', r, { category: 'Chicken', hint: 'chicken & fries', extras: [GRAVY, ...DIPS] })
    else if (/Poutine$/.test(n) && n !== 'Popcorn Chicken Poutine')
      add('Poutine', n === 'Snack Sized Poutine' ? 'Snack size' : 'Regular', r, { category: 'Sides', title: 'Size', extras: [GRAVY, ...DIPS.slice(0, 1)] })
    else
      add(n, r.serving.startsWith('1 ') ? '1 serving' : sizeOf(r.serving), r, {
        category: 'Sides',
        extras: /fries|onion|poutine/i.test(n) ? [GRAVY, ...DIPS] : /gravy/i.test(n) ? [] : [DIPS[4]],
      })
    continue
  }
  if (s === 'SALADS') { add(n, sizeOf(r.serving), r, { category: 'Sides', extras: [] }); continue }
  if (s === 'DIPS') { add(n, r.serving, r, { category: 'Sides', extras: [] }); continue }
  if (s === 'DESSERTS') { add(n, r.serving, r, { category: 'Desserts', extras: [] }); continue }
  if (s === 'ICED LATTES') {
    const m = n.match(/^(.*), (2% Milk|Oat Milk)$/)!
    add(m[1], m[2], r, { category: 'Coffee', title: 'Milk', extras: [COLD_FOAM] })
    continue
  }
  if (s === 'KRUNCH SHAKES' || s === 'SPARKLING LEMONADE' || s === 'BOBA REFRESHERS') {
    add(n, 'Regular', r, { category: 'Drinks', extras: [] })
    continue
  }
  add(n, r.serving || 'Regular', r, { category: 'Drinks', extras: [] })
}

// --- Ingredient breakdowns ----------------------------------------------------------------
/** Template defaults for the split, with KFC's official add-ons instead of generic ones. */
function breakdown(p: Product, n: Nutrition): IngredientComponent[] | undefined {
  if (!p.extras.length) return undefined // drinks, dips, desserts: template only
  const probe: FixedItem = { id: 'probe', name: p.hint ?? p.name, kind: 'fixed', category: p.category, nutrition: n }
  const defaults = componentsFor(probe).filter((c) => c.default !== false)
  return [...defaults, ...p.extras]
}

const SIZE_ORDER = ['Individual', 'Snack size', 'Regular', 'Small', 'Mega', 'Medium', 'Large']
const newId = idMaker('kfc')
const items: any[] = []
for (const p of products.values()) {
  const versions = [...p.versions]
  if (versions.every((v) => SIZE_ORDER.includes(v.label)))
    versions.sort((a, b) => a.r.n.calories - b.r.n.calories)
  const def = versions.find((v) => v.label === 'Regular') ?? versions[0]
  const tags = tagsFor(p.name + ' ' + versions.map((v) => v.label).join(' '), def.r.n).filter(
    (t) => t !== 'spicy' || /hot|zinger|spicy/i.test(p.name),
  )
  const it: any = {
    id: newId(p.name),
    name: p.name,
    kind: 'fixed',
    category: p.category,
    ...(versions.length > 1 ? {} : { serving: def.label === 'Regular' ? '1 serving' : def.label }),
    ...(tags.length ? { tags } : {}),
    nutrition: def.r.n,
  }
  if (versions.length > 1) {
    it.defaultSize = def.label
    if (p.title && p.title !== 'Size') it.sizeTitle = p.title
    it.sizes = versions.map((v) => {
      const comps = breakdown(p, v.r.n)
      return { label: v.label, nutrition: v.r.n, ...(comps ? { components: comps } : {}) }
    })
  } else {
    const comps = breakdown(p, def.r.n)
    if (comps) it.components = comps
  }
  items.push(it)
}

writeMenu({
  file: 'kfc',
  exportName: 'kfc',
  meta: { id: 'kfc', name: 'KFC', cuisine: 'Fried chicken · Fast food', accent: '#dc2626', segment: 'Fast Food' },
  items,
  order: ['Chicken', 'Sandwiches', 'Wraps', 'Sides', 'Desserts', 'Drinks', 'Coffee'],
  source: [
    "KFC Canada — complete menu from KFC's official nutrition guides (linked",
    'from kfc.ca; extracted into raw/kfc.tsv by fetch-kfc.cjs). Totals and the',
    'add-ons (cheese, Deluxe it up, gravy, dips, cold foam) are official; the',
    'default-ingredient split is apportioned by ingredient type.',
    "Generated by scripts/menus/gen-kfc.ts — regenerate, don't hand-edit.",
  ],
})

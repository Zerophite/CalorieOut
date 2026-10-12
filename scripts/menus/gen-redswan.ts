// Generate Red Swan Pizza's menu from its official menu nutritional guide
// (raw/redswan.tsv, see fetch-redswan.cjs).
//
// Pizzas come as a whole Personal 8" and a slice of Small 10" … X Large 16".
// The guide has a number of broken rows (macros that can't add up to the
// calories, a "personal pizza" of 2 kcal, slices of 1,000+ kcal, an X Large
// slice bigger than a Large one); those sizes are left out. Shared orders
// (salads, nachos, wedges, bread sticks, loaded bites) are published per
// fraction of the order and are listed here per whole order. Dips are add-ons.
//
//   run from the repo root: gen-redswan.ts
import * as fs from 'fs'
import { componentsFor } from '../../src/data/templates'
import type { FixedItem, IngredientComponent, MealCategory, Nutrition } from '../../src/types'
import { idMaker, slug, tagsFor, writeMenu } from './lib'

type Row = { section: string; item: string; size: string; serving: string; n: Nutrition }
const rows: Row[] = fs
  .readFileSync('scripts/menus/raw/redswan.tsv', 'utf8')
  .replace(/\r/g, '')
  .split('\n')
  .filter(Boolean)
  .map((l) => {
    const [section, item, size, serving, cal, fat, sodium, carbs, protein, fibre] = l.split('\t')
    const n: Nutrition = { calories: Math.round(+cal), protein: Math.round(+protein), carbs: Math.round(+carbs), fat: Math.round(+fat), sodium: Math.round(+sodium) }
    if (+fibre) n.fiber = Math.round(+fibre)
    return { section, item, size, serving, n }
  })

const sane = (n: Nutrition) => {
  const est = 4 * n.carbs + 4 * n.protein + 9 * n.fat
  return Math.abs(est - n.calories) <= Math.max(30, n.calories * 0.25)
}
const times = (n: Nutrition, k: number): Nutrition => ({
  calories: Math.round(n.calories * k), protein: Math.round(n.protein * k), carbs: Math.round(n.carbs * k), fat: Math.round(n.fat * k), sodium: Math.round(n.sodium * k),
  ...(n.fiber ? { fiber: Math.round(n.fiber * k) } : {}),
})
let dropped = 0

// --- Dips (add-ons) -----------------------------------------------------------------------------------
const DIPS: IngredientComponent[] = rows
  .filter((r) => r.section === 'DIPS')
  .map((r) => ({ id: `x-${slug(r.item)}`, name: `Add ${r.item.toLowerCase()} (${r.size})`, default: false, nutrition: r.n }))

// --- Products ------------------------------------------------------------------------------------------
interface Product { name: string; category: MealCategory; hint: string; extras: IngredientComponent[]; title?: string; versions: { label: string; n: Nutrition }[] }
const products = new Map<string, Product>()
const product = (name: string, category: MealCategory, extras: IngredientComponent[], hint = name, title?: string) => {
  if (!products.has(name)) products.set(name, { name, category, hint, extras, title, versions: [] })
  return products.get(name)!
}

const PIZZA = /PIZZAS|ALTERNATIVE/
const pizzaRows = new Map<string, Row[]>()
for (const r of rows.filter((x) => PIZZA.test(x.section))) {
  if (/Crust Only/.test(r.item)) continue
  const list = pizzaRows.get(r.item) ?? []
  list.push(r)
  pizzaRows.set(r.item, list)
}
for (const [item, list] of pizzaRows) {
  const name = item === 'Vegan Pizza Crust' ? 'Vegan Cheese Pizza' : /Pizza$/.test(item) ? item : `${item} Pizza`
  const p = product(name, 'Pizza', DIPS.slice(0, 4), `${name}`, 'Size')
  let prevSlice = 0
  let large = Infinity
  for (const r of list) {
    const personal = /Personal|Entire/.test(r.serving)
    const ok =
      sane(r.n) &&
      (personal ? r.n.calories >= 400 && r.n.calories <= 1400 : r.n.calories >= 80 && r.n.calories <= 450) &&
      (personal || !prevSlice || r.n.calories <= prevSlice * 2) &&
      (!/X Large/.test(r.size) || (r.n.calories <= large && r.n.calories >= prevSlice * 0.5))
    if (!ok) {
      dropped++
      continue
    }
    if (!personal) prevSlice = r.n.calories
    if (/^Large/.test(r.size)) large = r.n.calories
    p.versions.push({ label: personal ? `${r.size.replace(/\s+/g, ' ')} (whole)` : `${r.size} · slice`, n: r.n })
  }
}

for (const r of rows.filter((x) => !PIZZA.test(x.section))) {
  if (!sane(r.n) && r.n.calories > 0) {
    dropped++
    continue
  }
  const frac = (r.serving || r.size).match(/1\/(\d+)\s+(?:of\s+Order|Pie)/i)
  const whole = frac ? times(r.n, +frac[1]) : r.n
  switch (r.section) {
    case 'CHEESECAKES':
      product(/Cheesecake$/.test(r.item) ? r.item : `${r.item} Cheesecake`, 'Desserts', []).versions.push({ label: '1 slice', n: r.n })
      break
    case 'LOADED CHICKEN BITES':
      product(r.item, 'Chicken', DIPS.slice(0, 4), 'chicken bites').versions.push({ label: '1 order', n: whole })
      break
    case 'SALADS':
      product(r.item, 'Salads', [], r.item, 'Size').versions.push({ label: `${r.size} (whole order)`, n: whole })
      break
    case 'SIDES': {
      if (/Wings/.test(r.serving)) {
        product('Chicken Wings', 'Chicken', DIPS.slice(0, 4), 'chicken wings', 'Style').versions.push({ label: `${r.size} · 3 wings`, n: r.n })
        break
      }
      const cat: MealCategory = /Bites|Ribs/.test(r.item) ? 'Chicken' : 'Sides'
      const label = frac ? `${r.size} (whole order)` : `${r.size} · ${r.serving}`.replace(/^Regular · /, '')
      product(r.item, cat, DIPS.slice(0, 4), r.item, 'Size').versions.push({ label, n: whole })
      break
    }
    case 'BEVERAGES': {
      const name = r.item.replace(/^Coke$/, 'Coca-Cola')
      product(name, 'Drinks', [], name).versions.push({ label: r.size.replace(/\.0 ml$/, ' mL'), n: r.n })
      break
    }
    case 'DIPS':
      product(r.item, 'Sides', [], r.item).versions.push({ label: r.size.replace(/ ml$/, ' mL'), n: r.n })
      break
  }
}
if (dropped) console.warn(`dropped ${dropped} row(s) with inconsistent values`)

const newId = idMaker('rs')
const items: any[] = []
for (const p of products.values()) {
  if (!p.versions.length) continue
  const comps = (n: Nutrition) => {
    const probe: FixedItem = { id: 'probe', name: p.hint, kind: 'fixed', category: p.category, nutrition: n }
    const base = componentsFor(probe)
    const c = p.extras.length ? [...base.filter((x) => x.default !== false), ...p.extras] : base
    return c.length ? c : undefined
  }
  const def = p.versions.find((v) => /Medium/.test(v.label)) ?? p.versions[0]
  const tags = tagsFor(p.name, def.n)
  if (/cheese pizza|veggie|paneer|vegan|mushroom melt|greek feta/i.test(p.name) && !/chicken|beef|pepperoni|bacon|meat|donair/i.test(p.name) && !tags.includes('vegetarian')) tags.push('vegetarian')
  const it: any = { id: newId(p.name), name: p.name, kind: 'fixed', category: p.category, ...(tags.length ? { tags } : {}), nutrition: def.n }
  if (p.versions.length > 1) {
    it.defaultSize = def.label
    if (p.title && p.title !== 'Size') it.sizeTitle = p.title
    it.sizes = p.versions.map((v) => {
      const c = comps(v.n)
      return { label: v.label, nutrition: v.n, ...(c ? { components: c } : {}) }
    })
  } else {
    it.serving = def.label
    const c = comps(def.n)
    if (c) it.components = c
  }
  items.push(it)
}

writeMenu({
  file: 'redswan',
  exportName: 'redswan',
  meta: { id: 'red-swan-pizza', name: 'Red Swan Pizza', cuisine: 'Pizza', accent: '#b91c1c', segment: 'Fast Food' },
  items,
  order: ['Pizza', 'Chicken', 'Salads', 'Sides', 'Desserts', 'Drinks'],
  source: [
    "Red Swan Pizza — menu from Red Swan's official menu nutritional guide (July 2026,",
    'redswanpizza.ca/files/nutrition-guide.pdf, fetched by fetch-redswan.cjs). Sizes whose',
    "published values are inconsistent are left out. Generated by scripts/menus/gen-redswan.ts.",
  ],
})

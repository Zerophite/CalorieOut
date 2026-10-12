// Generate Starbucks Canada's menu from the ordering menu behind starbucks.ca/menu
// (raw/starbucks.json, see fetch-starbucks.cjs).
//
// Every handcrafted drink is listed in each size Starbucks offers (Short → Trenta,
// Solo → Quad) with the official per-size values; food, snacks and bottled drinks
// use their published serving. Items shown in several menu sections are listed once.
//
//   run from the repo root: gen-starbucks.ts
import * as fs from 'fs'
import { componentsFor } from '../../src/data/templates'
import type { FixedItem, IngredientComponent, MealCategory, Nutrition } from '../../src/types'
import { idMaker, tagsFor, writeMenu } from './lib'

interface Size { name: string; default: boolean; serving: string; calories: number; fat: number | null; carbs: number | null; protein: number | null; sodium: number | null }
interface Product { name: string; formCode: string; productType: string; path: string[]; sizes: Size[] }
const raw: Product[] = JSON.parse(fs.readFileSync('scripts/menus/raw/starbucks.json', 'utf8'))

const clean = (s: string) =>
  s
    .replace(/[®™]/g, '')
    .replace(/ Blended Beverage$/, '')
    .replace(/–\s*/g, '– ')
    .replace(/\s+/g, ' ')
    .trim()
const nut = (s: Size): Nutrition => ({
  calories: Math.round(s.calories),
  protein: Math.round(s.protein ?? 0),
  carbs: Math.round(s.carbs ?? 0),
  fat: Math.round(s.fat ?? 0),
  sodium: Math.round(s.sodium ?? 0),
})
/** Drop values whose macros can't belong to their calories (broken source data). */
const sane = (n: Nutrition) => {
  const est = 4 * n.carbs + 4 * n.protein + 9 * n.fat
  return Math.abs(est - n.calories) <= Math.max(25, n.calories * 0.25)
}

function categoryFor(p: Product, name: string): MealCategory {
  const path = p.path.join(' / ')
  if (/^Food/.test(path)) {
    if (/Breakfast/.test(path)) return 'Breakfast'
    if (/Lunch/.test(path)) return 'Sandwiches'
    if (/Treats|Sweet Snacks|Mini Pies/.test(path)) return 'Desserts'
    if (/Bakery/.test(path)) return 'Bakery'
    return 'Sides'
  }
  if (p.productType === 'food' || /muffin|pie$|loaf|cookie|croissant/i.test(name)) return /pie$|cookie/i.test(name) ? 'Desserts' : 'Bakery'
  if (/Coffee|Espresso|Frappuccino|Chai|Matcha|Tea Latte|Latte|Protein/.test(path) || /latte|espresso|cold brew|americano|mocha|macchiato|cortado|frappuccino|aerocano|chai|matcha|coffee/i.test(name)) return 'Coffee'
  return 'Drinks'
}

const SIZE_ORDER = ['Kids', 'Short', 'Tall', 'Grande', 'Venti', 'Trenta', 'Solo', 'Doppio', 'Triple', 'Quad']
const AVOCADO = raw.find((p) => p.name === 'Avocado Spread')?.sizes[0]
const extrasFor = (category: MealCategory): IngredientComponent[] =>
  category === 'Breakfast' && AVOCADO ? [{ id: 'x-avocado-spread', name: 'Add avocado spread', default: false, nutrition: nut(AVOCADO) }] : []

const newId = idMaker('sb')
const seen = new Set<string>()
const items: any[] = []
let skipped = 0
for (const p of raw) {
  const name = clean(p.name)
  if (seen.has(name) || name === 'Avocado Spread') continue
  const sizes = p.sizes.filter((s) => {
    const ok = sane(nut(s))
    if (!ok) skipped++
    return ok
  })
  if (!sizes.length) continue
  seen.add(name)
  sizes.sort((a, b) => SIZE_ORDER.indexOf(a.name) - SIZE_ORDER.indexOf(b.name))
  const category = categoryFor(p, name)
  const extras = extrasFor(category)
  const comps = (n: Nutrition) => {
    const probe: FixedItem = { id: 'probe', name, kind: 'fixed', category, nutrition: n }
    // Real sizes replace the template's generic "upsize" add-on.
    const all = componentsFor(probe)
    const included = all.filter((x) => x.default !== false).map((x) => x.name.toLowerCase())
    const c = all.filter(
      (x) =>
        !(sizes.length > 1 && x.id === 'x-upsize') &&
        // Skip an "Add whipped cream" extra when the drink already comes with it.
        !(x.id === 'x-whip' && included.includes('whipped cream')),
    )
    return c.length || extras.length ? [...c, ...extras] : undefined
  }
  const label = (s: Size) => (/^\d+ (Serving|Piece)$/i.test(s.name) ? '1 item' : s.serving && !/^\d/.test(s.name) && sizes.length > 1 ? `${s.name} (${s.serving})` : s.name)
  const def = sizes.find((s) => s.default) ?? sizes[0]
  const tags = tagsFor(name, nut(def))
  const it: any = { id: newId(name), name, kind: 'fixed', category, ...(tags.length ? { tags } : {}), nutrition: nut(def) }
  if (sizes.length > 1) {
    it.defaultSize = label(def)
    it.sizes = sizes.map((s) => {
      const c = comps(nut(s))
      return { label: label(s), nutrition: nut(s), ...(c ? { components: c } : {}) }
    })
  } else {
    it.serving = label(def) === '1 item' ? '1 item' : def.serving || def.name
    const c = comps(nut(def))
    if (c) it.components = c
  }
  items.push(it)
}
if (skipped) console.warn(`skipped ${skipped} size(s) with inconsistent values`)

writeMenu({
  file: 'starbucks',
  exportName: 'starbucks',
  meta: { id: 'starbucks', name: 'Starbucks', cuisine: 'Coffee · Bakery', accent: '#15803d', segment: 'Coffee & Bakery' },
  items,
  order: ['Coffee', 'Drinks', 'Breakfast', 'Bakery', 'Sandwiches', 'Desserts', 'Sides'],
  source: [
    "Starbucks — complete menu from the ordering menu behind starbucks.ca/menu",
    '(fetched by fetch-starbucks.cjs). Every drink size uses its official values.',
    'Generated by scripts/menus/gen-starbucks.ts.',
  ],
})

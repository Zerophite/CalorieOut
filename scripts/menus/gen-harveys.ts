// Generate Harvey's menu from its official nutrition page (raw/harveys.tsv).
//
// Harvey's lists every bun, patty, cheese slice and garnish separately, and its
// burgers / sandwiches are exactly bun + protein (+ cheese / bacon): toppings
// are chosen at the garnish counter. So those items are built entirely from
// official parts, and the whole garnish bar is offered as add-ons.
//
// raw/harveys.tsv is extracted from https://www.harveys.ca/en/nutrition.html
// (the site blocks scripted requests; see README.md for the browser snippet).
// Columns: section, code, name, serving g, calories, fat, sodium, carbs, protein.
//
//   run from the repo root: gen-harveys.ts
import * as fs from 'fs'
import { buildComponents, type PartSpec } from '../../src/data/components'
import type { IngredientComponent, MealCategory, Nutrition } from '../../src/types'
import { clean, idMaker, tagsFor, writeMenu } from './lib'

type Row = { section: string; code: string; name: string; grams: number; n: Nutrition }
const rows: Row[] = fs
  .readFileSync('scripts/menus/raw/harveys.tsv', 'utf8')
  .replace(/\r/g, '')
  .split('\n')
  .filter(Boolean)
  .map((l) => {
    const [section, code, name, g, cal, fat, na, carbs, protein] = l.split('\t')
    return {
      section,
      code,
      name: clean(name),
      grams: +g,
      n: { calories: Math.round(+cal), protein: Math.round(+protein), carbs: Math.round(+carbs), fat: Math.round(+fat), sodium: Math.round(+na) },
    }
  })

const part = (name: string): Nutrition => {
  const r = rows.find((x) => x.name.toLowerCase() === name.toLowerCase())
  if (!r) throw new Error(`missing part ${name}`)
  return r.n
}

// --- The garnish counter (add-ons, all official) -------------------------------
const GARNISHES = [
  'Lettuce', 'Tomatoes', 'Onions', 'Pickles', 'Cucumbers', 'Hot Peppers', 'Jalapeños', 'Black Olives',
  'Ketchup', 'Mustard', 'Relish', 'Harv Sauce', 'Garlic Mayo', 'Light Mayo', 'Chipotle Sauce', 'Ranch',
  'BBQ Sauce', 'Buffalo Sauce', 'Hot Sauce', 'Ghost Pepper Sauce',
]
function garnishExtras(has: { cheese: boolean; bacon: boolean; patty?: string }): IngredientComponent[] {
  const out: IngredientComponent[] = GARNISHES.map((g) => ({
    id: `g-${g.toLowerCase().replace(/\W+/g, '-')}`,
    name: g,
    default: false,
    nutrition: part(g),
  }))
  out.push({ id: 'g-onion-ring', name: 'Onion ring', default: false, nutrition: part('Onion Ring') })
  out.push({ id: 'g-cheese', name: has.cheese ? 'Extra cheese slice' : 'Add cheese slice', default: false, nutrition: part('Processed Cheese Slice') })
  if (!has.bacon) out.push({ id: 'g-bacon', name: 'Add bacon', default: false, nutrition: part('Bacon') })
  if (has.patty) out.push({ id: 'g-patty', name: `Extra ${has.patty.toLowerCase()}`, default: false, nutrition: part(has.patty) })
  return out
}

// --- Official-part recipes ------------------------------------------------------
interface Recipe {
  bread?: string
  protein: { name: string; part?: string; count?: number }
  cheese: boolean
  bacon: boolean
  extraPatty?: string
}

function recipe(name: string): Recipe | null {
  const n = name.toLowerCase()
  const cheese = /cheese/.test(n)
  const bacon = /bacon/.test(n)
  if (/^big harv/.test(n)) {
    const angus = /angus/.test(n)
    const p = angus ? 'Angus Beef Patty' : 'Original Patty'
    return { bread: 'Burger Bun', protein: { name: `${angus ? 'Angus beef' : 'Original'} patties (2)` }, cheese: true, bacon: true, extraPatty: p }
  }
  if (/burger/.test(n)) {
    if (/angus/.test(n)) return { bread: 'Burger Bun', protein: { name: 'Angus beef patty', part: 'Angus Beef Patty' }, cheese, bacon, extraPatty: 'Angus Beef Patty' }
    if (/original/.test(n)) return { bread: 'Burger Bun', protein: { name: 'Original patty', part: 'Original Patty' }, cheese, bacon, extraPatty: 'Original Patty' }
    if (/junior/.test(n)) return { bread: 'Junior Bun', protein: { name: 'Junior patty', part: 'Junior Patty' }, cheese, bacon, extraPatty: 'Junior Patty' }
    if (/veggie/.test(n)) return { bread: 'Burger Bun', protein: { name: 'Veggie patty', part: 'Veggie Patty' }, cheese, bacon }
  }
  if (/^hot dog/.test(n)) return { bread: 'Hot Dog Bun', protein: { name: 'Hot dog wiener', part: 'Hot Dog (weiner only)' }, cheese, bacon }
  if (/^junior (crispy|buffalo) chicken/.test(n))
    return { bread: 'Junior Bun', protein: { name: /buffalo/.test(n) ? 'Buffalo chicken' : 'Crispy chicken' }, cheese, bacon }
  if (/chicken (sandwich|wrap)/.test(n)) {
    const bread = /wrap/.test(n) ? 'Tortilla Wrap' : /grilled/.test(n) ? 'Multigrain Burger Bun' : 'Burger Bun'
    const p = /buffalo/.test(n) ? 'Buffalo Chicken Patty' : /grilled/.test(n) ? 'Grilled Chicken' : 'Crispy Chicken Patty'
    return { bread, protein: { name: p, part: p }, cheese, bacon, extraPatty: p }
  }
  return null
}

function componentsFromRecipe(total: Nutrition, r: Recipe): IngredientComponent[] {
  const specs: PartSpec[] = []
  if (r.bread) specs.push({ id: 'bread', name: r.bread, n: part(r.bread), removable: false })
  specs.push({ id: 'protein', name: r.protein.name, core: true })
  if (r.cheese) specs.push({ id: 'cheese', name: 'Processed cheese slice', n: part('Processed Cheese Slice') })
  if (r.bacon) specs.push({ id: 'bacon', name: 'Bacon', n: part('Bacon') })
  return [
    ...buildComponents(total, specs),
    ...garnishExtras({ cheese: r.cheese, bacon: r.bacon, patty: r.extraPatty }),
  ]
}

// Breakfast sandwiches / wraps / platters are also built from official parts.
function breakfastComponents(name: string, total: Nutrition): IngredientComponent[] | null {
  const n = name.toLowerCase()
  const specs: PartSpec[] = []
  if (/english muffin with/.test(n)) specs.push({ id: 'bread', name: 'English muffin', n: part('English Muffin'), removable: false })
  else if (/breakfast wrap/.test(n)) specs.push({ id: 'bread', name: 'Tortilla wrap', n: part('Tortilla Wrap'), removable: false })
  else if (/homestyle/.test(n)) specs.push({ id: 'toast', name: 'Toast', n: part('Toast') })
  else return null
  const meat = /bacon/.test(n) ? 'Bacon' : /sausage/.test(n) ? 'Sausage patty' : /chicken/.test(n) ? 'Chicken' : null
  if (meat === 'Bacon') specs.push({ id: 'bacon', name: 'Bacon', n: part('Bacon') })
  if (meat === 'Sausage patty') specs.push({ id: 'sausage', name: 'Sausage patty', n: part('Sausage Patty') })
  const platter = /homestyle/.test(n)
  if (/egg/.test(n) || (platter && meat === 'Chicken')) specs.push({ id: 'egg', name: 'Fried egg', n: part('Fried Egg') })
  if (/cheese/.test(n)) specs.push({ id: 'cheese', name: 'Processed cheese slice', n: part('Processed Cheese Slice') })
  if (/tater tots/.test(n) || platter) specs.push({ id: 'tots', name: 'Tater tots', n: part('Tater Tots') })
  // The core absorbs the remainder: the chicken if any, the platter's eggs, else the main protein.
  const coreName = meat === 'Chicken' ? 'Chicken' : platter ? 'Fried eggs' : null
  if (coreName) specs.push({ id: 'core', name: coreName, core: true })
  else {
    const i = specs.findIndex((s) => s.id === 'sausage' || s.id === 'egg' || s.id === 'bacon')
    specs[i] = { id: specs[i].id, name: specs[i].name, core: true }
  }
  const extras: IngredientComponent[] = []
  if (!/cheese/.test(n)) extras.push({ id: 'x-cheese', name: 'Add cheese slice', default: false, nutrition: part('Processed Cheese Slice') })
  extras.push({ id: 'x-egg', name: /egg/.test(n) ? 'Extra fried egg' : 'Add fried egg', default: false, nutrition: part('Fried Egg') })
  if (meat !== 'Bacon') extras.push({ id: 'x-bacon', name: 'Add bacon', default: false, nutrition: part('Bacon') })
  if (meat !== 'Sausage patty') extras.push({ id: 'x-sausage', name: 'Add sausage patty', default: false, nutrition: part('Sausage Patty') })
  extras.push({ id: 'x-ketchup', name: 'Ketchup', default: false, nutrition: part('Ketchup') })
  extras.push({ id: 'x-hot-sauce', name: 'Hot sauce', default: false, nutrition: part('Hot Sauce') })
  return [...buildComponents(total, specs), ...extras]
}

function saladComponents(name: string, total: Nutrition): IngredientComponent[] | null {
  const n = name.toLowerCase()
  if (!/salad/.test(n) || /side/.test(n)) return null
  const p = /buffalo/.test(n) ? 'Buffalo Chicken Patty' : /crispy/.test(n) ? 'Crispy Chicken Patty' : /grilled/.test(n) ? 'Grilled Chicken' : null
  const specs: PartSpec[] = [{ id: 'greens', name: 'Salad greens & vegetables', core: true }]
  if (p) specs.push({ id: 'protein', name: p, n: part(p) })
  const extras: IngredientComponent[] = ['Ranch', 'Garlic Mayo', 'Black Olives', 'Hot Peppers', 'Cucumbers'].map((g) => ({
    id: `g-${g.toLowerCase().replace(/\W+/g, '-')}`,
    name: g,
    default: false,
    nutrition: part(g),
  }))
  if (!p) extras.unshift({ id: 'x-grilled', name: 'Add grilled chicken', default: false, nutrition: part('Grilled Chicken') })
  extras.push({ id: 'x-bacon', name: 'Add bacon', default: false, nutrition: part('Bacon') })
  return [...buildComponents(total, specs), ...extras]
}

// --- Products & versions -----------------------------------------------------------
const SIZE_ORDER = ['Kids', 'Small', 'Regular', 'Large', '2 pc', '4 pc', '5 pc', '8 pc', '12 pc']

function split(row: Row): { product: string; label: string | null; title?: string } | null {
  const nm = row.name
  if (row.section.startsWith('GARNISHES')) {
    if (/dipping sauce$/i.test(nm)) return { product: nm, label: null }
    if (/^gravy$/i.test(nm)) return { product: 'Gravy', label: null }
    return null // garnishes, patties and buns are add-ons, not menu items
  }
  let m = nm.match(/^(.*) \((Kids|Small|Regular|Large)\)$/)
  if (m) return { product: m[1], label: m[2] }
  m = nm.match(/^(.*), (\d+) piece$/) ?? nm.match(/^(.*) \((\d+)-Piece\)$/)
  if (m) return { product: m[1], label: `${m[2]} pc` }
  m = nm.match(/^(\d+)-Piece (.*)$/)
  if (m) return { product: m[2], label: `${m[1]} pc` }
  m = nm.match(/^Big Harv \((Angus|Original)\)$/)
  if (m) return { product: 'Big Harv', label: m[1], title: 'Options' }
  m = nm.match(/^Frozen Red Bull - (.*)$/)
  if (m) return { product: 'Frozen Red Bull', label: m[1], title: 'Flavour' }
  m = nm.match(/^(.*?) with (Cheese(?: and Bacon)?)$/)
  if (m && !/^English Muffin|^Breakfast Wrap/.test(nm)) return { product: m[1], label: `With ${m[2].toLowerCase().replace(' and ', ' & ')}`, title: 'Options' }
  m = nm.match(/^Entrée Salad with (.*)$/)
  if (m) return { product: 'Entrée Salad', label: `With ${m[1].toLowerCase()}`, title: 'Options' }
  m = nm.match(/^Homestyle Breakfast with (.*)$/)
  if (m) return { product: 'Homestyle Breakfast', label: m[1], title: 'Options' }
  return { product: nm, label: null }
}

function category(row: Row, product: string): MealCategory {
  const s = row.section
  const n = product.toLowerCase()
  if (s === 'BURGERS') return 'Burgers'
  if (s.startsWith('CHICKEN')) {
    if (/salad/.test(n)) return 'Salads'
    if (/wrap/.test(n)) return 'Wraps'
    if (/hot dog/.test(n)) return 'Sandwiches'
    return 'Chicken'
  }
  if (s === 'POUTINES' || s === 'SIDES' || s.startsWith('GARNISHES')) return /salad/.test(n) ? 'Salads' : 'Sides'
  if (s.startsWith('SOFT') || s.startsWith('SHAKES')) return 'Drinks'
  if (s === 'DESSERTS') return 'Desserts'
  return 'Breakfast'
}

const products = new Map<string, { name: string; row: Row; title?: string; versions: { label: string; row: Row }[] }>()
for (const row of rows) {
  const s = split(row)
  if (!s) continue
  const key = s.product.toLowerCase()
  if (!products.has(key)) products.set(key, { name: s.product, row, title: s.title, versions: [] })
  const p = products.get(key)!
  p.versions.push({ label: s.label ?? 'Regular', row })
}

function componentsFor(name: string, n: Nutrition): IngredientComponent[] | undefined {
  const r = recipe(name)
  if (r) return componentsFromRecipe(n, r)
  return breakfastComponents(name, n) ?? saladComponents(name, n) ?? undefined
}

const newId = idMaker('hv')
const items: any[] = []
for (const p of products.values()) {
  const versions = p.versions.sort((a, b) => {
    const ia = SIZE_ORDER.indexOf(a.label)
    const ib = SIZE_ORDER.indexOf(b.label)
    if (ia >= 0 && ib >= 0) return ia - ib
    return 0 // keep source order (Regular, With cheese, With cheese & bacon…)
  })
  const def = versions.find((v) => v.label === 'Regular') ?? versions.find((v) => v.label === '8 pc') ?? versions[0]
  const n = def.row.n
  const tags = tagsFor(p.name, n)
  const it: any = {
    id: newId(p.name),
    name: p.name,
    kind: 'fixed',
    category: category(p.row, p.name),
    ...(versions.length > 1 ? {} : { serving: `1 serving (${def.row.grams} g)` }),
    ...(tags.length ? { tags } : {}),
    nutrition: n,
  }
  if (versions.length > 1) {
    it.defaultSize = def.label
    if (p.title) it.sizeTitle = p.title
    it.sizes = versions.map((v) => {
      const comps = componentsFor(v.row.name, v.row.n)
      return { label: v.label, nutrition: v.row.n, ...(comps ? { components: comps } : {}) }
    })
  } else {
    const comps = componentsFor(def.row.name, n)
    if (comps) it.components = comps
  }
  items.push(it)
}

writeMenu({
  file: 'harveys',
  exportName: 'harveys',
  meta: { id: 'harveys', name: "Harvey's", cuisine: 'Burgers · Fast food', accent: '#dc2626', segment: 'Fast Food' },
  items,
  order: ['Burgers', 'Chicken', 'Sandwiches', 'Wraps', 'Salads', 'Breakfast', 'Sides', 'Desserts', 'Drinks'],
  source: [
    "Harvey's — complete menu from Harvey's official nutrition & allergen page",
    '(harveys.ca/en/nutrition.html, captured in raw/harveys.tsv). Burgers and',
    'sandwiches are built from the official bun / patty / cheese / bacon values',
    "and every garnish-counter topping is an add-on with Harvey's own numbers.",
    "Generated by scripts/menus/gen-harveys.ts — regenerate, don't hand-edit.",
  ],
})

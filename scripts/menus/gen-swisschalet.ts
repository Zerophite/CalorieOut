// Generate Swiss Chalet's menu from its official nutrition page
// (raw/swisschalet.tsv, captured from swisschalet.com/en/nutritional.html —
// the site blocks scripted requests; see README.md).
// Columns: section, name, serving g, calories, fat, sodium, carbs, protein.
//
// Chicken dinners are offered by cut (quarter dark / white, double leg, half)
// with Swiss Chalet's own per-cut glaze values as add-ons; ribs by rack size
// with the matching BBQ sauce; other add-ons and sauces use official values.
//
//   run from the repo root: gen-swisschalet.ts
import * as fs from 'fs'
import { componentsFor } from '../../src/data/templates'
import type { FixedItem, IngredientComponent, MealCategory, Nutrition } from '../../src/types'
import { clean, idMaker, slug, tagsFor, writeMenu } from './lib'

type Row = { section: string; name: string; grams: number; n: Nutrition }
const rows: Row[] = fs
  .readFileSync('scripts/menus/raw/swisschalet.tsv', 'utf8')
  .replace(/\r/g, '')
  .split('\n')
  .filter(Boolean)
  .map((l) => {
    const [section, name, g, cal, fat, sodium, carbs, protein] = l.split('\t')
    return {
      section,
      name: clean(name).replace(/\)$/, (m) => (/\(/.test(name) ? m : '')).replace(/\s+/g, ' ').trim(),
      grams: +g,
      n: { calories: Math.round(+cal), protein: Math.round(+protein), carbs: Math.round(+carbs), fat: Math.round(+fat), sodium: Math.round(+sodium) },
    }
  })
const addOnRow = (name: string) => rows.find((r) => r.section === 'ADD-ONS & SAUCES' && r.name === name)
const addOn = (label: string, source: string): IngredientComponent[] => {
  const r = addOnRow(source)
  return r ? [{ id: `x-${slug(label)}`, name: label, default: false, nutrition: r.n }] : []
}

// --- Add-on sets ------------------------------------------------------------------------------
type Cut = 'dark' | 'white' | 'double' | 'half'
const GLAZE_ROW: Record<string, Record<Cut, string>> = {
  'Sweet Thai glaze': { dark: 'Sweet Thai Chicken Glaze (Dark Meat)', white: 'Sweet Thai Chicken Glaze (White Meat)', double: 'Sweet Thai Chicken Glaze (Double Leg)', half: 'Sweet Thai Chicken Glaze (Half Chicken)' },
  'Honey garlic glaze': { dark: 'Honey Garlic Glaze (dark meat)', white: 'Honey Garlic Glaze (white meat)', double: 'Honey Garlic Glaze (double leg)', half: 'Honey Garlic Glaze (half chicken)' },
  'Buffalo glaze': { dark: 'Buffalo Glaze - Dark Meat', white: 'Buffalo Glaze - White Meat', double: 'Buffalo Glaze - Double Leg', half: 'Buffalo Glaze - Half Chicken' },
  'Smoky BBQ glaze': { dark: 'Smoky BBQ Glaze -Dark Meat', white: 'Smoky BBQ Glaze - White Meat', double: 'Smoky BBQ Glaze -Double Leg', half: 'Smoky BBQ Glaze -Half Chicken' },
}
const COMMON = [
  ...addOn('Extra Chalet sauce (4 oz)', 'Chalet Sauce - 4 oz'),
  ...addOn('Add homestyle gravy (4 oz)', 'Homestyle Gravy - 4 fl oz'),
  ...addOn('Add a dinner roll', 'White Dinner Roll'),
  ...addOn('Add Chalet mayo', 'Chalet Mayo'),
  ...addOn('Make it loaded', 'Make it Loaded'),
  ...addOn('Add 2 spring rolls', 'Add 2 Spring Rolls'),
]
const glazes = (cut: Cut) => Object.entries(GLAZE_ROW).flatMap(([label, m]) => addOn(`Add ${label.toLowerCase()}`, m[cut]))
const RIB_SAUCE = (full: boolean) => addOn('Add apple butter mesquite BBQ sauce', full ? 'Apple Butter Mesquite BBQ Sauce (Full Rack)' : 'Apple Butter Mesquite BBQ Sauce (3rd Rack & Half Rack)')
const BURGER_EXTRAS = [...addOn('Add cheddar slice', 'Cheddar Cheese Slice'), ...addOn('Add Swiss slice', 'Swiss Cheese Slice'), ...addOn('Add bacon strips', 'Bacon Strips'), ...addOn('Add Chalet mayo', 'Chalet Mayo'), ...addOn('Add mayo', 'Mayo')]
const WING_SAUCES = [
  ...addOn('Add mild wing sauce', 'Wing Sauce - Mild'),
  ...addOn('Add medium wing sauce', 'Wing Sauce - Medium'),
  ...addOn('Add hot wing sauce', 'Wing Sauce - Hot'),
  ...addOn('Add honey garlic sauce', 'Honey Garlic Sauce'),
  ...addOn('Add honey buffalo sauce', 'Honey Buffalo Sauce'),
  ...addOn('Add sweet & spicy Thai sauce', 'Sweet & Spicy Thai Sauce'),
  ...addOn('Add Chalet BBQ sauce', 'Chalet BBQ Sauce'),
  ...addOn('Add plum sauce', 'Plum Sauce'),
]
const DRESSINGS = [
  ...addOn('Add Caesar dressing', 'Caesar Dressing'),
  ...addOn('Add Chalet house dressing', 'Chalet House Dressing'),
  ...addOn('Add Calorie-Wise Italian', 'Calorie-Wise Zesty Italian Dressing'),
  ...addOn('Add Calorie-Wise ranch', 'Calorie Wise Ranch Dressing'),
  ...addOn('Add balsamic dressing', 'Balsamic Dressing'),
  ...addOn('Add creamy Greek dressing', 'Creamy Greek Dressing'),
  ...addOn('Add southwest ranch', 'Southwest Ranch Dressing'),
]

// --- Products -------------------------------------------------------------------------------------
interface Product { name: string; category: MealCategory; title?: string; hint?: string; versions: { label: string; r: Row; extras: IngredientComponent[] }[] }
const products = new Map<string, Product>()
function add(name: string, label: string, r: Row, category: MealCategory, extras: IngredientComponent[], title?: string, hint?: string) {
  if (!products.has(name)) products.set(name, { name, category, title, hint, versions: [] })
  const p = products.get(name)!
  if (!p.versions.some((v) => v.label === label)) p.versions.push({ label, r, extras })
}
const cutOf = (s: string): Cut => (/white/i.test(s) ? 'white' : /double/i.test(s) ? 'double' : /half chicken/i.test(s) ? 'half' : 'dark')

for (const r of rows) {
  const n = r.name
  const s = r.section
  let m: RegExpMatchArray | null
  if (s === 'ADD-ONS & SAUCES') continue
  if (s === 'ROTISSERIE CHICKEN') {
    const label = /quarter/i.test(n) ? (/white/i.test(n) ? 'Quarter · white meat' : 'Quarter · dark meat') : /double leg/i.test(n) ? 'Double leg' : 'Half chicken'
    add('Rotisserie Chicken Dinner', label, r, 'Chicken', [...glazes(cutOf(n)), ...COMMON], 'Cut', 'rotisserie chicken dinner')
    continue
  }
  if (s === 'BBQ RIBS') {
    if ((m = n.match(/^(Third|Half|Full) Rack BBQ Back Ribs$/))) add('BBQ Back Ribs', `${m[1]} rack`, r, 'Mains', [...RIB_SAUCE(m[1] === 'Full'), ...COMMON], 'Size', 'bbq pork ribs dinner')
    else if ((m = n.match(/^Chicken & (Third|Half) Rack(?: Ribs| Combo)? - (Dark|White) Meat\)?$/))) add('Chicken & Ribs Combo', `${m[1]} rack · ${m[2].toLowerCase()} meat`, r, 'Mains', [...glazes(m[2] === 'White' ? 'white' : 'dark'), ...RIB_SAUCE(false), ...COMMON], 'Options', 'chicken and ribs dinner')
    else if ((m = n.match(/^5 Wings & (Third|Half) Rack Combo$/))) add('Wings & Ribs Combo', `${m[1]} rack`, r, 'Mains', [...WING_SAUCES, ...RIB_SAUCE(false)], 'Size', 'wings and ribs dinner')
    continue
  }
  if (s === 'WINGS & TENDERS') {
    if ((m = n.match(/^Wings (\d+) pieces$/i))) add('Wings', `${m[1]} pc`, r, 'Chicken', WING_SAUCES, 'Size', 'chicken wings')
    else if ((m = n.match(/^Wings Dinner - (\d+) pieces$/i))) add('Wings Dinner', `${m[1]} pc`, r, 'Chicken', [...WING_SAUCES, ...COMMON.slice(0, 3)], 'Size', 'chicken wings dinner')
    else add(n.replace(/ - (\d+) pieces$/, ' ($1 pc)'), '1 order', r, 'Chicken', WING_SAUCES, undefined, 'chicken tenders')
    continue
  }
  if (s === 'HANDHELDS') {
    if ((m = n.match(/^(.*?) - (Dark|White) Meat$/))) add(m[1], `${m[2]} meat`, r, /wrap/i.test(n) ? 'Wraps' : 'Sandwiches', BURGER_EXTRAS, 'Chicken', `${m[1]} chicken sandwich`)
    else if ((m = n.match(/^Chicken Caesar Wrap - (.*)$/))) add('Chicken Caesar Wrap', m[1].replace('Rotisserie Chicken ', 'Rotisserie · ').replace('Dark Meat', 'dark').replace('White Meat', 'white'), r, 'Wraps', BURGER_EXTRAS, 'Chicken', 'chicken caesar wrap')
    else if (n === 'Rotisserie Chicken Club Wrap') add(n, 'Dark meat', r, 'Wraps', BURGER_EXTRAS, 'Chicken', 'chicken club wrap')
    else add(n, '1 sandwich', r, /burger/i.test(n) ? 'Burgers' : 'Sandwiches', BURGER_EXTRAS, undefined, n)
    continue
  }
  if (s === 'BOWLS & MORE' && (m = n.match(/^(Caesar|Greek|Fiesta) Salad(?: with (Rotisserie|Crispy) Chicken)?$/))) {
    add(`${m[1]} Salad (entrée)`, m[2] ? `With ${m[2].toLowerCase()} chicken` : 'No chicken', r, 'Salads', DRESSINGS, 'Options', `${m[1]} salad`)
    continue
  }
  if (/THANKSGIVING/.test(s) && /add stuffing|add cranberry|make it a/i.test(n)) continue
  if (s === 'KIDS' && /topping$/i.test(n)) continue // offered as ice-cream add-ons below
  // Side Caesar (starters/sides) and the kids' Caesar Pleaser come with or without bacon.
  if ((m = n.match(/^Caesar Salad(?: \((with|no) bacon\))?$/)) && s !== 'BOWLS & MORE') {
    add('Side Caesar Salad', m[1] === 'no' ? 'No bacon' : 'With bacon', r, 'Salads', DRESSINGS, 'Options', 'caesar salad')
    continue
  }
  if ((m = n.match(/Caesar Pleaser \((with|no) bacon\)$/))) {
    add("Kids' Caesar Pleaser", m[1] === 'no' ? 'No bacon' : 'With bacon', r, 'Salads', [], 'Options')
    continue
  }
  const cat: MealCategory =
    s === 'DESSERTS' || /ice cream|donuts|m&m|(apple|pumpkin|cream|meringue) pie$/i.test(n) ? 'Desserts'
    : s === 'KIDS' && /punch|drink|shirley/i.test(n) ? 'Drinks'
    : /pizza/i.test(n) ? 'Pizza'
    : /burger/i.test(n) ? 'Burgers'
    : s === 'KIDS' && /chicken|tender/i.test(n) ? 'Chicken'
    : /soup|pot pie/i.test(n) ? 'Mains'
    : /salad|greens/i.test(n) ? 'Salads'
    : s === 'SIDES' || s === 'STARTERS' || (s === 'KIDS' && /fries|mash|trees|applesauce/i.test(n)) ? 'Sides'
    : 'Mains'
  let name = n.replace(/ \(Select Locations\)$/, '').replace(/®/g, '').replace(/ \(exludes choice of Appetizer\)/, '')
  if (s === 'KIDS') name = `Kids' ${name.replace(/^Kids /, '')}`
  const extras = /ice cream/i.test(n)
    ? rows.filter((x) => x.section === 'KIDS' && /topping$/i.test(x.name)).map((t) => ({ id: `x-${slug(t.name)}`, name: `Add ${t.name.toLowerCase()}`, default: false, nutrition: t.n }))
    : /salad|greens|pleaser/i.test(n)
      ? DRESSINGS
      : /fries|poutine|potato|perogies|mash/i.test(n)
        ? [...COMMON.slice(0, 2), ...addOn('Add cheese sauce (2 oz)', 'Add 2 oz Cheese Sauce'), ...addOn('Add bacon bits', 'Add Bacon Bits'), ...addOn('Add sour cream with chives', 'Sour Cream with Chives')]
        : cat === 'Mains' && s !== 'KIDS' && !/soup|pie$/i.test(n) ? COMMON : []
  add(name, `1 serving (${r.grams} g)`, r, cat, extras, undefined, name)
}

// --- Build ------------------------------------------------------------------------------------------
const newId = idMaker('sc')
const items: any[] = []
for (const p of products.values()) {
  const comps = (v: Product['versions'][number]) => {
    if (!v.extras.length) return undefined
    const probe: FixedItem = { id: 'probe', name: p.hint ?? p.name, kind: 'fixed', category: p.category, nutrition: v.r.n }
    return [...componentsFor(probe).filter((c) => c.default !== false), ...v.extras]
  }
  const def = p.versions[0]
  const tags = tagsFor(p.name, def.r.n)
  if (/veggie|vegetable|perogies|mac/i.test(p.name) && !/chicken/i.test(p.name) && !tags.includes('vegetarian')) tags.push('vegetarian')
  const it: any = { id: newId(p.name), name: p.name, kind: 'fixed', category: p.category, ...(tags.length ? { tags } : {}), nutrition: def.r.n }
  if (p.versions.length > 1) {
    it.defaultSize = def.label
    if (p.title && p.title !== 'Size') it.sizeTitle = p.title
    it.sizes = p.versions.map((v) => {
      const c = comps(v)
      return { label: v.label, nutrition: v.r.n, ...(c ? { components: c } : {}) }
    })
  } else {
    it.serving = def.label
    const c = comps(def)
    if (c) it.components = c
  }
  items.push(it)
}

writeMenu({
  file: 'swisschalet',
  exportName: 'swisschalet',
  meta: { id: 'swiss-chalet', name: 'Swiss Chalet', cuisine: 'Rotisserie · Sit-down', accent: '#b45309', segment: 'Sit-Down' },
  items,
  order: ['Chicken', 'Mains', 'Burgers', 'Pizza', 'Sandwiches', 'Wraps', 'Salads', 'Sides', 'Desserts', 'Drinks'],
  source: [
    "Swiss Chalet — complete menu from Swiss Chalet's official nutrition & allergen",
    'page (swisschalet.com/en/nutritional.html, captured in raw/swisschalet.tsv).',
    "Glazes are add-ons with Swiss Chalet's per-cut values; ribs, wings, sauces,",
    "dressings and toppings use official values. Generated by scripts/menus/gen-swisschalet.ts.",
  ],
})

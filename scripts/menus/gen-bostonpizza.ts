// Generate Boston Pizza's menu from its official nutrition page
// (raw/bostonpizza.json, produced by fetch-bostonpizza.cjs).
//
// Pizzas carry every official size (Indy, and Small / Medium / Large per
// slice) plus the 8" cauliflower crust where offered. GlutenWise versions with
// different values become a "GlutenWise" option on the matching item. Sides,
// dips, sauces and proteins from the page's add-on table are offered as add-ons.
//
// The page leaves some option labels blank; those are named from the order
// given in Boston Pizza's menu descriptions (see LABELS). Hungry Kids' Pizza
// variants are named by matching them to the Indy pizza with identical values.
//
//   run from the repo root: gen-bostonpizza.ts
import * as fs from 'fs'
import { componentsFor } from '../../src/data/templates'
import type { FixedItem, IngredientComponent, MealCategory, Nutrition } from '../../src/types'
import { idMaker, slug, tagsFor, writeMenu } from './lib'

type Variant = { label: string; calories: number; protein: number; carbs: number; fat: number; sodium: number }
type Raw = { category: string; name: string; variants: Variant[] }
const raw: Raw[] = JSON.parse(fs.readFileSync('scripts/menus/raw/bostonpizza.json', 'utf8'))
const nut = (v: Variant): Nutrition => ({ calories: v.calories, protein: Math.round(v.protein), carbs: Math.round(v.carbs), fat: Math.round(v.fat), sodium: Math.round(v.sodium) })
const fixName = (s: string) =>
  s
    .replace(/&#34;/g, '"')
    .replace(/''/g, '"')
    .replace(/(Cheese)\d$/, '$1') // footnote marker
    .replace(/ - Starter size$/i, ' (starter)')
    .replace(/\s+/g, ' ')
    .trim()
const norm = (s: string) => fixName(s).toLowerCase().replace(/ and /g, ' & ').replace(/[^a-z0-9&]+/g, ' ').trim()

// Labels for variants the page leaves blank, in the order Boston Pizza's menu lists them.
// `null` drops a variant that cannot be identified.
const LABELS: Record<string, (string | null)[]> = {
  Wings: ['Oven-baked · starter', 'Oven-baked · double order', 'Fried · starter', 'Fried · double order'],
  'Wings Combo': ['Oven-baked · starter', 'Oven-baked · double order', 'Fried · starter', 'Fried · double order'],
  Quesadillas: ['Grilled chicken', 'Barbacoa beef'],
  'Honey Dill Fried Chicken Sandwich': ['Crispy chicken', 'Grilled chicken', null],
  'Chocolate Brownie Addiction': ['With ice cream', 'Without ice cream', 'Half · with ice cream', 'Half · without ice cream'],
  'GlutenWise Chocolate Brownie Addiction': ['With ice cream', 'Without ice cream', 'Half · without ice cream', 'Half · with ice cream'],
  'Bandera Pizza Bread': ['Indy', 'Medium'],
  'Sweet & Savoury Italian Pizza': ['Large (per slice)', 'Medium (per slice)', 'Small (per slice)', 'Indy'],
  // Three tacos with a choice of protein — the page does not say which value is which, so keep the first.
  Tacos: ['3 tacos', null, null, null],
  'Loaded Pepperoni & Bacon Pizza': ['1 serving', null],
  'Create Your Own Glutenwise Pasta': ['GlutenWise fusilli base', null, null, null],
  Guacamole: ['Side', null],
}

// --- Add-ons (from the page's sides / dips / sauces table) ----------------------------------------
const extrasTable = raw.filter((r) => /fragment2/.test(r.category))
const extraRow = (name: string) => extrasTable.find((r) => r.name === name)?.variants[0]
const addOn = (label: string, source: string): IngredientComponent[] => {
  const v = extraRow(source)
  return v ? [{ id: `x-${slug(label)}`, name: label, default: false, nutrition: nut(v) }] : []
}
const DIPS = [
  ...addOn('Add ranch dip', 'Ranch Dressing'),
  ...addOn('Add blue cheese dip', 'Blue Cheese Dip'),
  ...addOn('Add honey dill dip', 'Honey Dill Dip'),
  ...addOn('Add sriracha ranch dip', 'Sriracha Ranch Dip'),
  ...addOn('Add Santa Fe ranch dip', 'Sante Fe Ranch Dip'),
]
const WING_SAUCES = [
  ...addOn('Mild sauce', 'Mild Sauce'),
  ...addOn('Hot sauce', 'Hot Sauce'),
  ...addOn('Memphis hot sauce', 'Memphis Hot Sauce'),
  ...addOn('Hot honey sauce', 'Hot Honey Sauce'),
  ...addOn('Honey garlic sauce', 'Honey Garlic Sauce'),
  ...addOn('Thai chili sauce', 'Thai Chili Sauce'),
  ...addOn('BBQ sauce', 'BBQ Sauce'),
]
const PROTEINS = [
  ...addOn('Add grilled chicken breast', 'Chicken Breast'),
  ...addOn('Add Cajun chicken', 'Cajun Chicken'),
  ...addOn('Add baked salmon', 'Baked Salmon'),
  ...addOn('Add bacon', 'Add Bacon'),
]
const PASTA_EXTRAS = [...addOn('Add three meatballs', 'Three Meatballs'), ...PROTEINS, ...addOn('Add garlic toast (1 slice)', 'Garlic Toast (1 slice)'), ...addOn('Three-cheese toast instead', 'Substitute Three-Cheese Toast')]
const MAIN_SIDES = [
  ...addOn('Add fries', 'Fries'),
  ...addOn('Add garlic mashed potatoes', 'Garlic Mashed Potatoes'),
  ...addOn('Add roasted carrots', 'Roasted Carrots'),
  ...addOn('Add side garden salad', 'Garden Salad'),
  ...addOn('Add side Caesar salad', 'Caesar Salad'),
  ...addOn('Add garlic toast (1 slice)', 'Garlic Toast (1 slice)'),
]
const SANDWICH_EXTRAS = [
  ...addOn('Add bacon', 'Add Bacon'),
  ...addOn('Sweet potato fries instead', 'Substitute Sweet Potato Fries'),
  ...addOn('Onion rings instead', 'Substitute Onion Rings'),
  ...addOn('Cactus cut potatoes instead', 'Substitute Cactus Cuts Potatoes'),
  ...DIPS.slice(0, 2),
]
const DRESSINGS = [...addOn('Extra Caesar dressing', 'Caesar Dressing'), ...addOn('Extra ranch dressing', 'Ranch Dressing')]
const TEXMEX = [...addOn('Add sour cream', 'Sour Cream'), ...addOn('Add salsa', 'Salsa'), ...addOn('Add guacamole', 'Guacamole'), ...addOn('Add cactus dip', 'Cactus Dip')]

// --- Products -------------------------------------------------------------------------------------
interface Version { label: string; n: Nutrition }
interface Product { name: string; category: MealCategory; hint: string; title?: string; extras: IngredientComponent[]; versions: Version[] }
const products = new Map<string, Product>()
function product(name: string, category: MealCategory, extras: IngredientComponent[], title?: string, hint = name) {
  const key = norm(name)
  if (!products.has(key)) products.set(key, { name, category, hint, title, extras, versions: [] })
  return products.get(key)!
}
function addVersion(p: Product, label: string, n: Nutrition) {
  if (p.versions.some((v) => v.label === label || (v.n.calories === n.calories && v.n.protein === n.protein && v.n.fat === n.fat))) return
  p.versions.push({ label, n })
}
const labelled = (r: Raw) => {
  const name = fixName(r.name)
  const fixed = LABELS[name]
  return r.variants
    .map((v, i) => ({ v, label: fixed ? fixed[i] : v.label.replace(/\s+/g, ' ').trim() }))
    .filter((x): x is { v: Variant; label: string } => x.label !== null && x.label !== undefined)
}

function categoryFor(section: string, name: string): MealCategory {
  if (/pizza|squarefooter|meateor|pepperoni|deluxe|hawaiian|great white north|quebecoise|québécoise|mediterranean|perogy|carbonara|royal|vegetarian$/i.test(name) && !/bread|pizzaghetti|kids/i.test(name)) return 'Pizza'
  if (section === 'Pizza') return 'Pizza'
  if (section === 'Desserts' || /brownie|cheesecake|pudding|explosion/i.test(name)) return 'Desserts'
  if (/wings|chicken fingers|thai bites/i.test(name)) return 'Chicken'
  if (/bowl/i.test(name)) return 'Bowls & Burritos'
  if (/salad/i.test(name)) return 'Salads'
  if (/soup|tacos|pasta|bake|fettuccini|ravioli|lasagna|mac & cheese|spaghetti|carnivore|bugs/i.test(name)) return 'Mains'
  if (/burger/i.test(name)) return 'Burgers'
  if (/wrap/i.test(name)) return 'Wraps'
  if (section === 'Sandwiches') return 'Sandwiches'
  if (section === 'Mains' || section === 'Pasta' || section === 'Kids') return 'Mains'
  return 'Sides'
}
function extrasFor(cat: MealCategory, name: string): IngredientComponent[] {
  if (cat === 'Chicken') return [...WING_SAUCES, ...DIPS]
  if (cat === 'Pizza') return [...addOn('Add bacon', 'Add Bacon'), ...DIPS.slice(0, 3)]
  if (/nachos|quesadilla|tacos|barbacoa/i.test(name)) return TEXMEX
  if (/fries|poutine|potatoes|pickle|fingers|bread|triple play|dip$/i.test(name)) return DIPS.slice(0, 3)
  if (cat === 'Salads' || cat === 'Bowls & Burritos') return [...PROTEINS, ...DRESSINGS]
  if (/pasta|bake|fettuccini|ravioli|lasagna|mac & cheese|spaghetti|carnivore|alfredo|pizzaghetti/i.test(name)) return PASTA_EXTRAS
  if (cat === 'Burgers' || cat === 'Sandwiches' || cat === 'Wraps') return SANDWICH_EXTRAS
  if (/steak|ribs|parmesan/i.test(name)) return [...MAIN_SIDES, ...addOn('Add peppercorn sauce', 'Peppercorn Sauce')]
  return []
}

const SIZE_ORDER = ['Indy', 'Small (per slice)', 'Medium (per slice)', 'Large (per slice)', 'Cauliflower crust 8"']
const sizeLabel = (l: string) => l.replace(/^Indy$/, 'Indy').replace(/ \(per slice\)$/, ' · per slice')

// 1) Regular menu sections.
const indyByValue = new Map<string, string>()
for (const r of raw) {
  if (/fragment/.test(r.category) || r.category === 'Kids') continue
  const name = fixName(r.name)
  if (/Cauliflower Crust/i.test(name)) continue // folded into the matching pizzas below
  const cat = categoryFor(r.category, name)
  const p = product(name, cat, extrasFor(cat, name), cat === 'Pizza' ? 'Size' : 'Options', cat === 'Pizza' ? `${name} pizza` : name)
  const vs = labelled(r)
  if (cat === 'Pizza') vs.sort((a, b) => SIZE_ORDER.indexOf(a.label) - SIZE_ORDER.indexOf(b.label))
  for (const { v, label } of vs) {
    addVersion(p, label || (vs.length === 1 ? '' : label), nut(v))
    if (cat === 'Pizza' && label === 'Indy') indyByValue.set(`${v.calories}/${v.protein}/${v.fat}`, name)
  }
}

// 2) Cauliflower crust pizzas → a size on the matching specialty pizza.
for (const r of raw.filter((x) => /Cauliflower Crust/i.test(x.name))) {
  for (const v of r.variants) {
    const m = fixName(v.label).match(/^Cauliflower Crust Pizza\s*[-–]\s*(.+)$/i)
    const target = m ? products.get(norm(m[1])) : /^Cauliflower crust/i.test(v.label) ? products.get(norm('Create Your Own Pizza')) : undefined
    if (target) addVersion(target, 'Cauliflower crust 8"', nut(v))
  }
}

// 3) Kids' menu: Hungry Kids' Pizza variants are the Indy pizzas — name them by value.
for (const r of raw.filter((x) => x.category === 'Kids')) {
  const name = fixName(r.name)
  if (/Hungry Kids/.test(name)) {
    const p = product(name, 'Pizza', extrasFor('Pizza', name), 'Pizza', 'kids cheese pizza')
    for (const v of r.variants) {
      const match = v.label === 'Indy' && indyByValue.get(`${v.calories}/${v.protein}/${v.fat}`)
      if (match) addVersion(p, match, nut(v))
    }
    continue
  }
  const kidsName = /kids/i.test(name) ? name : `Kids' ${name}`
  const cat: MealCategory = /pizza/i.test(name) ? 'Pizza' : /fingers/i.test(name) ? 'Chicken' : 'Mains'
  const kidsExtras = cat === 'Chicken' ? DIPS.slice(0, 3) : []
  for (const { v, label } of labelled(r)) addVersion(product(kidsName, cat, kidsExtras, undefined, name), label, nut(v))
}

// 4) GlutenWise versions → a "GlutenWise" option when the values differ.
for (const r of raw.filter((x) => /fragment1/.test(x.category))) {
  const name = fixName(r.name)
  if (/Cauliflower Crust/i.test(name)) continue
  const starter = r.variants.length === 1 && /^Starter size$/i.test(r.variants[0].label)
  const base = products.get(norm(starter ? `${name} (starter)` : name)) ?? products.get(norm(name.replace(/^Oven-Roasted /, '')))
  if (!base) {
    const cat = categoryFor('', name)
    const p = product(name.replace(/Glutenwise/i, 'GlutenWise'), cat, extrasFor(cat, name), 'Options', name.replace(/glutenwise/i, ''))
    for (const { v, label } of labelled(r)) addVersion(p, label, nut(v))
    continue
  }
  for (const { v, label } of labelled(r)) {
    const tag = (/glutenwise/i.test(label) ? label.replace(/\s*\(GlutenWise\)/i, '') : label).replace(/^Starter size$/i, '')
    addVersion(base, tag ? `GlutenWise · ${tag.toLowerCase()}` : 'GlutenWise', nut(v))
  }
}

// 5) Sides from the add-on table (kids' portions become a size).
const SIDE_NAMES = ['Fries', 'Garlic Mashed Potatoes', 'Quinoa and Rice Blend', 'Tossed Garden Greens', 'Garden Salad', 'Caesar Salad', 'Garlic Toast (1 slice)', 'Roasted Carrots', 'Substitute Sweet Potato Fries', 'Substitute Onion Rings', 'Substitute Cactus Cuts Potatoes', 'Substitute Three-Cheese Toast']
for (const s of SIDE_NAMES) {
  const v = extraRow(s)
  if (!v) continue
  const name = `Side ${s.replace(/^Substitute /, '').replace('Cactus Cuts', 'Cactus Cut')}`
  const p = product(name, 'Sides', /salad|greens/i.test(s) ? DRESSINGS : /fries|potatoes|rings/i.test(s) ? DIPS.slice(0, 3) : [], 'Size', s)
  addVersion(p, 'Regular', nut(v))
  const kids = extraRow(`${s} - Kids`)
  if (kids) addVersion(p, 'Kids', nut(kids))
}

// --- Build ------------------------------------------------------------------------------------------
const newId = idMaker('bp')
const items: any[] = []
for (const p of products.values()) {
  if (!p.versions.length) continue
  const comps = (n: Nutrition) => {
    if (!p.extras.length) return undefined
    const probe: FixedItem = { id: 'probe', name: p.hint, kind: 'fixed', category: p.category, nutrition: n }
    return [...componentsFor(probe).filter((c) => c.default !== false), ...p.extras]
  }
  const def = p.versions[0]
  const tags = tagsFor(p.name, def.n)
  if (/vegetarian|veggie|cheese ravioli|mushroom & spinach/i.test(p.name) && !tags.includes('vegetarian')) tags.push('vegetarian')
  const name = p.category === 'Pizza' && !/pizza|squarefooter/i.test(p.name) ? `${p.name} Pizza` : p.name
  const it: any = { id: newId(name), name, kind: 'fixed', category: p.category, ...(tags.length ? { tags } : {}), nutrition: def.n }
  // A lone unlabeled GlutenWise version still needs a name for the regular one.
  if (p.versions.length > 1 && !def.label) def.label = 'Regular'
  if (p.versions.length > 1) {
    it.defaultSize = sizeLabel(def.label)
    if (p.title && p.title !== 'Size') it.sizeTitle = p.title
    it.sizes = p.versions.map((v) => {
      const c = comps(v.n)
      return { label: sizeLabel(v.label), nutrition: v.n, ...(c ? { components: c } : {}) }
    })
  } else {
    it.serving = def.label ? sizeLabel(def.label) : '1 serving'
    const c = comps(def.n)
    if (c) it.components = c
  }
  items.push(it)
}

writeMenu({
  file: 'bostonpizza',
  exportName: 'bostonpizza',
  meta: { id: 'boston-pizza', name: 'Boston Pizza', cuisine: 'Pizza & Pasta · Sit-down', accent: '#1d4ed8', segment: 'Sit-Down' },
  items,
  order: ['Pizza', 'Mains', 'Chicken', 'Burgers', 'Sandwiches', 'Wraps', 'Bowls & Burritos', 'Salads', 'Sides', 'Desserts'],
  source: [
    "Boston Pizza — complete menu from Boston Pizza Canada's official nutrition page",
    '(bostonpizza.com/en/nutritional-information.html, fetched by fetch-bostonpizza.cjs).',
    'Pizzas include every size and the cauliflower crust; GlutenWise versions are an',
    'option where their values differ. Generated by scripts/menus/gen-bostonpizza.ts.',
  ],
})

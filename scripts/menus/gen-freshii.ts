// Generate Freshii's menu from its official nutritionals & allergens guide
// (raw/freshii.tsv, see fetch-freshii.cjs).
//
// Every signature bowl, burrito, wrap, pocket, poke bowl, soup and smoothie is
// listed with official values (smoothies in 12 / 16 / 24 oz). The guide also
// publishes each protein, sauce and add-on portion, so those become add-ons and
// the "Build Your Bowl" builder uses only official values.
//
//   run from the repo root: gen-freshii.ts
import * as fs from 'fs'
import { componentsFor } from '../../src/data/templates'
import type { BuilderGroup, BuilderOption, FixedItem, IngredientComponent, MealCategory, Nutrition } from '../../src/types'
import { idMaker, slug, tagsFor, writeMenu } from './lib'

type Row = { section: string; name: string; n: Nutrition }
const rows: Row[] = fs
  .readFileSync('scripts/menus/raw/freshii.tsv', 'utf8')
  .replace(/\r/g, '')
  .split('\n')
  .filter(Boolean)
  .map((l) => {
    const [section, name, cal, fat, sodium, carbs, protein, fibre] = l.split('\t')
    const n: Nutrition = { calories: Math.round(+cal), protein: Math.round(+protein), carbs: Math.round(+carbs), fat: Math.round(+fat), sodium: Math.round(+sodium) }
    if (+fibre) n.fiber = Math.round(+fibre)
    return { section, name, n }
  })
  // Sweet Potato Bites list 0 g carbs at 470 kcal — a broken row in the guide.
  .filter((r) => !/^Sweet Potato Bites/.test(r.name))
const row = (name: string) => rows.find((r) => r.name === name)
const addOn = (label: string, source: string): IngredientComponent[] => {
  const r = row(source)
  return r ? [{ id: `x-${slug(label)}`, name: label, default: false, nutrition: r.n }] : []
}

// --- Add-on sets -----------------------------------------------------------------------------------
const PROTEINS = [
  ...addOn('Add chicken', 'Chicken Breast Oven Roast'),
  ...addOn('Add steak', 'Beef Strip Steakette'),
  ...addOn('Add marinated tofu', 'Marinated Tofu'),
  ...addOn('Add falafel (3)', 'Vegetarian Falafel (3 EA)'),
  ...addOn('Add egg', 'Egg (Hardboiled / Soft-boiled)'),
  ...addOn('Add bacon', 'Bacon Chip'),
]
const POKE_PROTEINS = [
  ...addOn('Add ponzu ahi tuna', 'Ponzu Ahi Tuna'),
  ...addOn('Add spicy tuna', 'Spicy Tuna Poke'),
  ...addOn('Add spicy salmon', 'Spicy Salmon Poke'),
  ...addOn('Add teriyaki salmon', 'Teriyaki Salmon'),
  ...addOn('Add ponzu prawns', 'Ponzu Prawns'),
  ...addOn('Add teriyaki tofu', 'Teriyaki Tofu'),
]
const EXTRAS = [
  ...addOn('Add avocado', 'Avocado'),
  ...addOn('Add edamame', 'Edamame'),
  ...addOn('Add crispy wontons', 'Crispy Wontons'),
  ...addOn('Add crispy fried onions', 'Crispy Fried Onions'),
  ...addOn('Add pickled red onion', 'Pickled Red Onion'),
  ...addOn('Add lemon herb quinoa', 'Lemon Herb Quinoa'),
  ...addOn('Add brown rice', 'Brown Rice'),
]
const SAUCE_ROWS = rows.filter((r) => r.section === 'Sauces & Dressings' && !/Lemon Juice|Olive Oil|Broth/.test(r.name))
const sauceName = (s: string) => s.replace(/^Sauce Ponzu Lime$/, 'Ponzu Lime Sauce')
const DRESSINGS: IngredientComponent[] = SAUCE_ROWS.map((r) => ({ id: `x-${slug(r.name)}`, name: `Extra ${sauceName(r.name).toLowerCase()}`, default: false, nutrition: r.n }))
const extrasFor = (section: string, name: string): IngredientComponent[] => {
  if (section === 'Poke Bowls') return [...POKE_PROTEINS, ...addOn('Add avocado', 'Avocado'), ...addOn('Add edamame', 'Edamame'), ...addOn('Add crispy wontons', 'Crispy Wontons'), ...addOn('Extra sriracha mayo', 'Sriracha Mayo'), ...addOn('Extra ponzu lime sauce', 'Sauce Ponzu Lime')]
  if (/Smoothie|Soup/.test(section)) return []
  if (section === 'Breakfast' || section === 'Pockets' || section === 'Kids Menu') return [...addOn('Add egg', 'Egg (Hardboiled / Soft-boiled)'), ...addOn('Add bacon', 'Bacon Chip'), ...addOn('Add avocado', 'Avocado'), ...addOn('Add chicken', 'Chicken Breast Oven Roast')]
  if (section === 'Sides') return addOn('Extra green goddess ranch', 'Green Goddess Ranch Dressing')
  return [...PROTEINS, ...EXTRAS, ...DRESSINGS.slice(0, 8)]
}
const categoryFor = (section: string, name: string): MealCategory =>
  section === 'Breakfast' ? 'Breakfast'
  : section === 'Smoothies' ? 'Drinks'
  : section === 'Smoothie Bowls' ? 'Breakfast'
  : section === 'Burritos' || /burrito/i.test(name) ? 'Bowls & Burritos'
  : section === 'Wraps' ? 'Wraps'
  : section === 'Pockets' || /pocket/i.test(name) ? 'Sandwiches'
  : section === 'Sides' ? 'Sides'
  : section === 'Soup' ? 'Mains'
  : /salad/i.test(name) ? 'Salads'
  : 'Bowls & Burritos'
const display = (s: string) =>
  s
    .replace(/^Updated /, '')
    .replace(/ w\/ /, ' with ')
    .replace(/^Creamy roasted tomato soup \(12 oz\)$/, 'Creamy Roasted Tomato Soup (12 oz)')
    .replace(/ \(With Green Goddess ranch Dip\)$/, ' with Green Goddess Ranch')
    .replace(/^Power Bowl$/, "Kids' Power Bowl")
    .replace(/^Kids /, "Kids' ")

// --- Builder ----------------------------------------------------------------------------------------
const opt = (r: Row | undefined, name?: string, extra: Partial<BuilderOption> = {}): BuilderOption[] =>
  r ? [{ id: slug(name ?? r.name), name: name ?? r.name, nutrition: r.n, ...extra }] : []
const builderGroups: BuilderGroup[] = [
  {
    id: 'base', name: 'Base', min: 1, max: 2,
    options: [
      ...opt(row('Field Greens'), 'Field Greens', { recommended: true, tags: ['vegan'] }),
      ...opt(row('Brown Rice'), 'Brown Rice', { tags: ['vegan'] }),
      ...opt(row('Lemon Herb Quinoa'), 'Lemon Herb Quinoa', { tags: ['vegan'] }),
      ...opt(row('Rice Noodles, Cooked'), 'Rice Noodles', { tags: ['vegan'] }),
    ],
  },
  {
    id: 'protein', name: 'Protein', min: 0, max: 2,
    options: [
      ...opt(row('Chicken Breast Oven Roast'), 'Oven-Roasted Chicken', { recommended: true, tags: ['high-protein'] }),
      ...opt(row('Beef Strip Steakette'), 'Steak'),
      ...opt(row('Marinated Tofu'), 'Marinated Tofu', { tags: ['vegan'] }),
      ...opt(row('Teriyaki Tofu'), 'Teriyaki Tofu', { tags: ['vegan'] }),
      ...opt(row('Vegetarian Falafel (3 EA)'), 'Falafel (3)', { tags: ['vegetarian'] }),
      ...opt(row('Egg (Hardboiled / Soft-boiled)'), 'Egg', { tags: ['vegetarian'] }),
      ...opt(row('Bacon Chip'), 'Bacon'),
      ...opt(row('Teriyaki Salmon'), 'Teriyaki Salmon'),
      ...opt(row('Ponzu Ahi Tuna'), 'Ponzu Ahi Tuna'),
      ...opt(row('Spicy Tuna Poke'), 'Spicy Tuna'),
      ...opt(row('Spicy Salmon Poke'), 'Spicy Salmon'),
      ...opt(row('Ponzu Prawns'), 'Ponzu Prawns'),
    ],
  },
  {
    id: 'toppings', name: 'Toppings', min: 0,
    options: rows
      .filter((r) => r.section === 'Add-Ons' && !/Brown Rice|Field Greens|Quinoa|Rice Noodles|^Egg/.test(r.name))
      .flatMap((r) => opt(r, r.name.replace(/ bites$/, ' Bites').replace(/ \(Gluten Free\)$/, ''))),
  },
  {
    id: 'dressing', name: 'Dressing / sauce', min: 0, max: 2,
    options: SAUCE_ROWS.flatMap((r) => opt(r, sauceName(r.name), /Green Goddess|Greek Yogurt Ranch/.test(r.name) ? { recommended: true } : {})),
  },
]
const items: any[] = [
  {
    id: 'fr-bowl',
    name: 'Build Your Bowl',
    kind: 'builder',
    category: 'Bowls & Burritos',
    description: "Pick a base, protein, toppings and a dressing. Every option is one portion from Freshii's official nutrition guide.",
    groups: builderGroups,
  },
]

// --- Fixed items ------------------------------------------------------------------------------------
const MENU_SECTIONS = new Set(['Breakfast', 'Pockets', 'Poke Bowls', 'Energy Bowls', 'Lifestyle Bowls', 'Heartii Bowls', 'Salad Bowls', 'Burritos', 'Wraps', 'Sides', 'Soup', 'Kids Menu', 'Smoothies', 'Smoothie Bowls'])
const newId = idMaker('fr')
interface Product { name: string; section: string; versions: { label: string; n: Nutrition }[] }
const products = new Map<string, Product>()
for (const r of rows.filter((x) => MENU_SECTIONS.has(x.section))) {
  let name = display(r.name)
  let label = '1 serving'
  let m: RegExpMatchArray | null
  if ((m = name.match(/^(.*) \((\d+ oz)\)$/)) && r.section === 'Smoothies') [name, label] = [`${m[1]} Smoothie`, m[2]]
  else if ((m = name.match(/^(Small|Large) (Spicy Lemongrass Soup)$/))) [name, label] = [m[2], m[1]]
  if (!products.has(name)) products.set(name, { name, section: r.section, versions: [] })
  products.get(name)!.versions.push({ label, n: r.n })
}
for (const p of products.values()) {
  const category = categoryFor(p.section, p.name)
  const extras = extrasFor(p.section, p.name)
  const comps = (n: Nutrition) => {
    if (!extras.length) return undefined
    const probe: FixedItem = { id: 'probe', name: p.name, kind: 'fixed', category, nutrition: n }
    return [...componentsFor(probe).filter((c) => c.default !== false), ...extras]
  }
  const def = p.versions[0]
  const tags = tagsFor(p.name, def.n)
  if (/tofu|falafel|veggii|oaxaca|habibi|buddha|teriyaki twist|smoothie|berry|green|elixir|peanut butter/i.test(p.name) && !/chicken|steak|bacon|tuna|salmon|shrimp/i.test(p.name) && !tags.includes('vegetarian')) tags.push('vegetarian')
  const it: any = { id: newId(p.name), name: p.name, kind: 'fixed', category, ...(tags.length ? { tags } : {}), nutrition: def.n }
  if (p.versions.length > 1) {
    it.defaultSize = def.label
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
  file: 'freshii',
  exportName: 'freshii',
  meta: { id: 'freshii', name: 'Freshii', cuisine: 'Bowls & Salads · Build-your-own', accent: '#0d9488', segment: 'Build-Your-Own' },
  items,
  hasBuilder: true,
  order: ['Bowls & Burritos', 'Salads', 'Wraps', 'Sandwiches', 'Breakfast', 'Mains', 'Sides', 'Drinks'],
  source: [
    "Freshii — complete menu from Freshii's official nutritionals & allergens guide",
    '(revision 27/08/2026, fetched by fetch-freshii.cjs). Proteins, sauces and add-ons',
    'use the guide\'s per-portion values. Generated by scripts/menus/gen-freshii.ts.',
  ],
})

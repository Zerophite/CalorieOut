// Generate Taco Bell Canada's menu from its official interactive nutrition menu
// (the Nutritionix data linked from tacobell.ca; raw/tacobell.json, see
// fetch-tacobell.cjs).
//
// Every item lists its default ingredients with weights; ingredient values are
// published per 100 g, so each item's breakdown is built from official parts.
// Add-ons are the extra ingredients Taco Bell offers for that item's type
// (proteins, beans, rice, cheese, sauces, toppings) at Taco Bell's own portions.
// Protein versions of the same item become options; drinks come by size.
//
//   run from the repo root: gen-tacobell.ts
import * as fs from 'fs'
import { buildComponents, type PartSpec } from '../../src/data/components'
import { componentsFor } from '../../src/data/templates'
import type { FixedItem, IngredientComponent, MealCategory, Nutrition } from '../../src/types'
import { idMaker, slug, tagsFor, writeMenu } from './lib'

type RawNut = Record<string, number>
interface Mod { id: number; name: string; isActive: number; nutrition: RawNut }
interface Item { id: number; name: string; templateId: number; categoryId: number; defaultModifiers?: { id: number; servingWeightGrams: number }[]; nutrition: RawNut }
const data: {
  categories: { id: number; name: string; items: number[] }[]
  templates: { id: number; name: string; groups: { id: number }[] }[]
  groups: { id: number; name: string; modifiers: { id: number; multiplier: number }[] }[]
  items: Item[]
  modifiers: Mod[]
} = JSON.parse(fs.readFileSync('scripts/menus/raw/tacobell.json', 'utf8'))

const decode = (s: string) =>
  s
    .replace(/&reg;|&trade;|®|™/g, '')
    .replace(/&ntilde;/g, 'ñ')
    .replace(/&amp;/g, '&')
    .replace(/Cheesey/g, 'Cheesy')
    .replace(/\s+/g, ' ')
    .trim()
const MODS = new Map(data.modifiers.map((m) => [m.id, m]))
const CATS = new Map(data.categories.map((c) => [c.id, c.name]))
const GROUPS = new Map(data.groups.map((g) => [g.id, g]))
const TEMPLATES = new Map(data.templates.map((t) => [t.id, t]))

/** An item's published total (falls back to Nutritionix's calculated value). */
const total = (n: RawNut): Nutrition => {
  const v = (k: string) => (n[k] || n[`calculated${k[0].toUpperCase()}${k.slice(1)}`] || 0) as number
  const out: Nutrition = { calories: Math.round(v('calories')), protein: Math.round(v('protein')), carbs: Math.round(v('totalCarb')), fat: Math.round(v('totalFat')), sodium: Math.round(v('sodium')) }
  const fibre = Math.round(v('fiber'))
  if (fibre) out.fiber = fibre
  return out
}
/** Ingredient values are per 100 g. */
const per = (m: Mod, grams: number): Nutrition => {
  const k = grams / 100
  return {
    calories: Math.round(m.nutrition.calories * k),
    protein: Math.round(m.nutrition.protein * k),
    carbs: Math.round(m.nutrition.totalCarb * k),
    fat: Math.round(m.nutrition.totalFat * k),
    sodium: Math.round(m.nutrition.sodium * k),
  }
}

// --- Ingredients & add-ons ----------------------------------------------------------------------------
const SHELL = /tortilla|shell|flatbread|chips|fries/i
const ADDON_GROUPS = ['Protein', 'Beans', 'Rice', 'Cheese', 'Salsa and Sauces', 'Signature Sauces', 'Toppings']
const ADDON_EXTRA = new Set(['Black Beans', 'Bacon'])
const ADDON_SKIP = /THEORETICAL|Duolingo|Slow Roasted Chicken|Shredded Lettuce|Diced Onions/i
function addOnsFor(it: Item): IngredientComponent[] {
  const tpl = TEMPLATES.get(it.templateId)
  if (!tpl) return []
  const defaults = new Set((it.defaultModifiers ?? []).map((d) => d.id))
  const out: IngredientComponent[] = []
  const seen = new Set<string>()
  for (const name of ADDON_GROUPS.concat('LTO')) {
    const g = tpl.groups.map((x) => GROUPS.get(x.id)).find((x) => x?.name === name || x?.name.startsWith(`${name} -`))
    if (!g) continue
    for (const gm of g.modifiers) {
      const m = MODS.get(gm.id)
      if (!m || !m.isActive || defaults.has(m.id) || ADDON_SKIP.test(m.name)) continue
      if (name === 'LTO' && !ADDON_EXTRA.has(decode(m.name))) continue
      const label = decode(m.name).replace(/^Premium /, '')
      if (seen.has(label)) continue
      seen.add(label)
      const n = per(m, gm.multiplier * 100)
      if (n.calories <= 0) continue
      out.push({ id: `x-${slug(label)}`, name: `Add ${label.toLowerCase()}`, default: false, nutrition: n })
    }
  }
  return out.slice(0, 16)
}

function componentsOf(it: Item, n: Nutrition, category: MealCategory, name: string): IngredientComponent[] | undefined {
  const extras = addOnsFor(it)
  const defs = (it.defaultModifiers ?? []).map((d) => ({ m: MODS.get(d.id), g: d.servingWeightGrams })).filter((x): x is { m: Mod; g: number } => !!x.m)
  const parts = defs.map((x) => ({ name: decode(x.m.name), n: per(x.m, x.g) }))
  const sum = parts.reduce((s, p) => s + p.n.calories, 0)
  // Build from official parts when they account for the published total.
  if (parts.length >= 2 && Math.abs(sum - n.calories) <= Math.max(5, n.calories * 0.03)) {
    const merged = new Map<string, { name: string; n: Nutrition }>()
    for (const p of parts) {
      const cur = merged.get(p.name)
      if (cur) for (const k of ['calories', 'protein', 'carbs', 'fat', 'sodium'] as const) cur.n[k] += p.n[k]
      else merged.set(p.name, { name: p.name, n: { ...p.n } })
    }
    const list = [...merged.values()]
    // The shell / tortilla absorbs rounding (it is never removable); otherwise the largest part.
    const shell = list.findIndex((p) => SHELL.test(p.name))
    const core = shell >= 0 ? shell : list.reduce((m, p, i) => (p.n.calories > list[m].n.calories ? i : m), 0)
    const specs: PartSpec[] = list.map((p, i) =>
      i === core
        ? { id: slug(p.name), name: p.name, core: true, removable: SHELL.test(p.name) ? false : undefined }
        : { id: slug(p.name), name: p.name, n: p.n, removable: SHELL.test(p.name) ? false : undefined },
    )
    return [...buildComponents(n, specs), ...extras]
  }
  if (category === 'Drinks') return undefined
  const probe: FixedItem = { id: 'probe', name, kind: 'fixed', category, nutrition: n }
  return [...componentsFor(probe).filter((c) => c.default !== false), ...extras]
}

// --- Products -------------------------------------------------------------------------------------------
const PROTEIN = '(Double Beef|Black Bean|Beef|Chicken|Steak|Bean|Veggie)'
function split(name: string): { base: string; label: string; title?: string } {
  let m: RegExpMatchArray | null
  if ((m = name.match(/^(.*) \((\d+ oz)\)$/))) return { base: m[1], label: m[2], title: 'Size' }
  if ((m = name.match(/^(.*) \((\d) Pack\)$/))) return { base: m[1], label: `${m[2]} pack`, title: 'Size' }
  if ((m = name.match(new RegExp(`^(.*) - ${PROTEIN}$`)))) return { base: m[1], label: m[2], title: 'Protein' }
  if ((m = name.match(/^Soft Taco - (\w+)$/))) return { base: 'Soft Taco', label: m[1], title: 'Protein' }
  if ((m = name.match(new RegExp(`^${PROTEIN} (.*(?:Taco|Supreme|Crunchwrap Supreme|Chalupa Supreme|Gordita Crunch|Quesadilla|Nachos Supreme|Nacho Fries Supreme|Grilled Cheesy Burrito|5-Layer Burrito|7-Layer Burrito).*)$`)))) {
    return { base: m[2], label: m[1], title: 'Protein' }
  }
  return { base: name, label: '' }
}
const categoryFor = (cat: string, name: string): MealCategory =>
  cat === 'Beverages' || /freeze|baja blast|lemonade/i.test(name) ? 'Drinks'
  : cat === 'Desserts' || /cinnabon|twists|empanada/i.test(name) ? 'Desserts'
  : cat === 'Sides' || cat === 'Add-Ons' || /nachos|fries|chips/i.test(name) ? 'Sides'
  : 'Bowls & Burritos'

interface Version { label: string; it: Item; n: Nutrition; original: string }
interface Product { name: string; category: MealCategory; title?: string; versions: Version[] }
const products = new Map<string, Product>()
const names = new Set(data.items.map((i) => decode(i.name)))
for (const it of data.items) {
  const cat = CATS.get(it.categoryId) ?? ''
  if (!cat || cat === 'Test') continue
  const name = decode(it.name)
  const { base, label, title } = split(name)
  const n = total(it.nutrition)
  if (n.calories === 0 && !/diet/i.test(name)) continue
  const category = categoryFor(cat, base)
  if (!products.has(base)) products.set(base, { name: base, category, title, versions: [] })
  const p = products.get(base)!
  if (title && !p.title) p.title = title
  // An unprefixed item next to protein versions ("Burrito Supreme") is the beef one.
  const lbl = label || (p.title === 'Protein' || [...names].some((x) => x !== name && split(x).base === base && split(x).title === 'Protein') ? 'Beef' : '1 item')
  if (p.versions.some((v) => v.label === lbl)) continue
  p.versions.push({ label: lbl, it, n, original: name })
}

const PROTEIN_ORDER = ['Beef', 'Double Beef', 'Chicken', 'Steak', 'Bean', 'Black Bean', 'Veggie']
const newId = idMaker('tb')
const items: any[] = []
for (const p of products.values()) {
  if (p.title === 'Protein') p.versions.sort((a, b) => PROTEIN_ORDER.indexOf(a.label) - PROTEIN_ORDER.indexOf(b.label))
  if (p.title === 'Size') p.versions.sort((a, b) => parseInt(a.label) - parseInt(b.label))
  // A protein version with no siblings keeps its full name ("Black Bean 5-Layer Burrito").
  const name = p.versions.length === 1 && p.title === 'Protein' ? p.versions[0].original : p.name
  const def = p.versions[0]
  const tags = tagsFor(name, def.n)
  if (p.versions.every((v) => /bean|veggie/i.test(v.label)) || /^(Bean|Black Bean|Veggie|Cheese)\b|Cheese Quesadilla|Cinnamon|Cinnabon|Chips and Cheese|Nacho Fries$/i.test(name)) {
    if (!tags.includes('vegetarian') && p.category !== 'Drinks') tags.push('vegetarian')
  }
  const it: any = { id: newId(name), name, kind: 'fixed', category: p.category, ...(tags.length ? { tags } : {}), nutrition: def.n }
  if (p.versions.length > 1) {
    it.defaultSize = def.label
    if (p.title && p.title !== 'Size') it.sizeTitle = p.title
    it.sizes = p.versions.map((v) => {
      const c = componentsOf(v.it, v.n, p.category, name)
      return { label: v.label, nutrition: v.n, ...(c ? { components: c } : {}) }
    })
  } else {
    it.serving = def.label === 'Beef' ? 'Beef' : '1 item'
    const c = componentsOf(def.it, def.n, p.category, name)
    if (c) it.components = c
  }
  items.push(it)
}

writeMenu({
  file: 'tacobell',
  exportName: 'tacobell',
  meta: { id: 'taco-bell', name: 'Taco Bell', cuisine: 'Mexican · Fast food', accent: '#7c3aed', segment: 'Fast Food' },
  items,
  order: ['Bowls & Burritos', 'Sides', 'Desserts', 'Drinks'],
  source: [
    "Taco Bell — complete menu from Taco Bell Canada's official interactive nutrition",
    'menu (Nutritionix data linked from tacobell.ca, fetched by fetch-tacobell.cjs).',
    'Ingredients and add-ons use the published per-100 g values and portions.',
    'Generated by scripts/menus/gen-tacobell.ts.',
  ],
})

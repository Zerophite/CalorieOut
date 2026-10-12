// Generate Osmow's menu from its official nutrition-calculator dataset
// (raw/osmows.json, see fetch-osmows.cjs).
//
// Most items list every component (pita / rice / STIX base, protein, tahini,
// garlic sauce, sumac…) with full nutrition, so they are built entirely from
// official parts; items published as a single total use the recipe templates
// for the split. Add-ons (extra protein, sauces, sides) use official values.
//
//   run from the repo root: gen-osmows.ts
import * as fs from 'fs'
import { buildComponents, type PartSpec } from '../../src/data/components'
import { componentsFor } from '../../src/data/templates'
import type { FixedItem, IngredientComponent, MealCategory, Nutrition } from '../../src/types'
import { clean, idMaker, tagsFor, writeMenu } from './lib'

type RawNut = { title: string; calories: string; total_fat: string; sodium: string; carbohydrates: string; protein: string }
const data: { category: string; products: { title: string; nutritions: RawNut[] }[] }[] = JSON.parse(
  fs.readFileSync('scripts/menus/raw/osmows.json', 'utf8'),
)

const decode = (s: string) =>
  clean(
    s
      .replace(/<\/?sup>/gi, '')
      .replace(/&reg;|®/g, '')
      .replace(/&#x2122;|™/g, '')
      .replace(/&amp;/g, '&')
      .replace(/Phillly/g, 'Philly')
      .replace(/\s+/g, ' ')
      .trim(),
  )
const toNut = (r: RawNut): Nutrition => {
  const n = { calories: Math.round(+r.calories), protein: Math.round(+r.protein), carbs: Math.round(+r.carbohydrates), fat: Math.round(+r.total_fat), sodium: Math.round(+r.sodium) }
  // Source glitch guard: protein that would add far more energy than the item has.
  if (4 * (n.protein + n.carbs) + 9 * n.fat > n.calories * 1.5 + 20) {
    const p = Math.max(0, Math.round((n.calories - 4 * n.carbs - 9 * n.fat) / 4))
    console.warn(`correcting protein for "${decode(r.title)}": ${n.protein} → ${p}`)
    n.protein = p
  }
  return n
}
const add = (a: Nutrition, b: Nutrition): Nutrition => ({
  calories: a.calories + b.calories, protein: a.protein + b.protein, carbs: a.carbs + b.carbs, fat: a.fat + b.fat, sodium: a.sodium + b.sodium,
})
const ZERO: Nutrition = { calories: 0, protein: 0, carbs: 0, fat: 0, sodium: 0 }

// --- Official add-ons ------------------------------------------------------------------
const allProducts = data.flatMap((c) => c.products)
const one = (title: RegExp) => {
  const p = allProducts.find((x) => title.test(decode(x.title)))
  return p ? toNut(p.nutritions[0]) : null
}
const partFrom = (title: RegExp, part: RegExp) => {
  for (const p of allProducts) {
    if (!title.test(decode(p.title))) continue
    const r = p.nutritions.find((n) => part.test(n.title.trim()))
    if (r) return toNut(r)
  }
  return null
}
const EXTRA_MEAT: Record<string, Nutrition | null> = {
  Chicken: one(/^Just Chicken \(Small\)$/),
  Beef: one(/^Just Beef \(Small\)$/),
  Lamb: one(/^Just Lamb \(Small\)$/),
}
const GARLIC = partFrom(/^Chicken Shawarma Wrap \(Regular\)$/, /^Garlic Sauce$/)!
const TAHINI = partFrom(/^Chicken Shawarma Wrap \(Regular\)$/, /^Tahini$/)!
const HUMMUS = partFrom(/OzBox/, /^Hummus$/)
const FATTOUSH = partFrom(/OzBox/, /^Salad - Fattoush$/)
const STIX = one(/^STIX \(Fries\)$/)
const ROCKS = one(/^ROCKS \(Rice\)$/)
const addOn = (id: string, name: string, n: Nutrition | null): IngredientComponent[] => (n && n.calories > 0 ? [{ id, name, default: false, nutrition: n }] : [])
function extrasFor(protein: string | null): IngredientComponent[] {
  return [
    ...(protein && EXTRA_MEAT[protein] ? addOn('x-meat', `Extra ${protein.toLowerCase()} (100 g)`, EXTRA_MEAT[protein]) : []),
    ...addOn('x-garlic', 'Extra garlic sauce', GARLIC),
    ...addOn('x-tahini', 'Extra tahini', TAHINI),
    ...addOn('x-hummus', 'Add hummus', HUMMUS),
    ...addOn('x-fattoush', 'Add fattoush salad', FATTOUSH),
    ...addOn('x-stix', 'Add STIX (fries)', STIX),
    ...addOn('x-rocks', 'Add ROCKS (rice)', ROCKS),
  ]
}

// --- Component cleanup ------------------------------------------------------------------
type Part = { name: string; n: Nutrition }
function cleanParts(product: string, rows: RawNut[]): Part[] {
  let parts: Part[] = rows
    .map((r) => ({ name: decode(r.title).replace(/^Side: /, 'Side: ').replace(/^Toppings:.*$|^Toppings$/, 'Onions, turnips & pickles'), n: toNut(r) }))
    .filter((p) => p.n.calories > 0 || p.n.sodium > 0)
  // Data fix: "Falafel On The Salad (Large)" lists the large STIX value as its
  // salad and has tahini / garlic sauce swapped; use the other large salads' values.
  if (/^Falafel On The Salad \(Large\)$/.test(product)) {
    const largeSalad = partFrom(/^Chicken On The Salad \(Large\)$/, /^Salad$/)
    const largeTahini = partFrom(/^Chicken On The Salad \(Large\)$/, /^Tahini$/)
    const largeGarlic = partFrom(/^Chicken On The Salad \(Large\)$/, /^Garlic Sauce$/)
    parts = parts.map((p) =>
      p.name === 'Salad' && largeSalad ? { ...p, n: largeSalad }
      : p.name === 'Tahini' && largeTahini ? { ...p, n: largeTahini }
      : p.name === 'Garlic Sauce' && largeGarlic ? { ...p, n: largeGarlic }
      : p,
    )
    console.warn('corrected salad / tahini / garlic values for Falafel On The Salad (Large)')
  }
  return parts
}

const PROTEIN_RE = /^(Chicken|Beef|Lamb|Falafel)$/i
const BASE_RE = /^(Base|Bread|Rice|Stix|Salad)$/i
function category(cat: string, name: string): MealCategory {
  if (/ on the |ozbox|saj box|wrapbox/i.test(name)) return 'Bowls & Burritos'
  if (/salad/i.test(name)) return 'Salads'
  if (/poutine/i.test(name)) return 'Sides'
  if (/wrap|saj|jr\./i.test(name) && !/box/i.test(name)) return 'Wraps'
  if (/dessert|cheesecake|baklava|dubai/i.test(name)) return 'Desserts'
  if (/^just |stix|rocks \(rice\)|bites|hummus/i.test(name)) return 'Sides'
  return 'Bowls & Burritos'
}

// --- Products ------------------------------------------------------------------------------
type Version = { label: string; n: Nutrition; comps: IngredientComponent[] }
const products = new Map<string, { name: string; category: MealCategory; versions: Version[]; title?: string }>()
function addVersion(name: string, cat: MealCategory, v: Version, title?: string) {
  const key = name.toLowerCase()
  if (!products.has(key)) products.set(key, { name, category: cat, versions: [], title })
  const p = products.get(key)!
  if (!p.versions.some((x) => x.label === v.label)) p.versions.push(v)
}

for (const cat of data) {
  if (/daily specials/i.test(cat.category)) continue // the same items, sold on set days
  for (const p of cat.products) {
    const title = decode(p.title)
    if (!p.nutritions.length) continue
    let name = title
    let label = 'Regular'
    let optTitle: string | undefined
    let m: RegExpMatchArray | null
    if ((m = name.match(/^(.*?) \((Regular|Large|Super|Small|Medium)\)$/))) [name, label] = [m[1], m[2]]
    if ((m = name.match(/^(.*?) (?:w\/?|with) (STIX|STICKS|ROCKS|Salad|Fattoush)$/i))) {
      ;[name, label] = [m[1], `With ${m[2].toUpperCase() === 'STICKS' ? 'STIX' : /salad|fattoush/i.test(m[2]) ? 'fattoush' : m[2].toUpperCase()}`]
      optTitle = 'Side'
    }
    if (/^Osmow's Kid's Meal$/.test(name)) optTitle = 'Meal'
    name = name.replace(/^Lamb Shawarma$/, 'Lamb Shawarma Wrap').replace(/ On The  /, ' On The ').replace(/ On the /, ' On The ')
    if (/Baklava Cheesecake/.test(name) && p.nutritions[0].title === 'Base') continue // duplicate listing
    const c = category(cat.category, name)

    // Kid's meal: each row is a different meal choice.
    if (optTitle === 'Meal') {
      for (const r of p.nutritions) {
        const n = toNut(r)
        const probe: FixedItem = { id: 'probe', name: `${decode(r.title)} shawarma wrap`, kind: 'fixed', category: 'Wraps', nutrition: n }
        addVersion("Kid's Meal", 'Wraps', { label: decode(r.title).replace(/^Kid's JR\. /, 'Jr. '), n, comps: componentsFor(probe) }, 'Meal')
      }
      continue
    }

    const parts = cleanParts(title, p.nutritions)
    const protein = parts.find((x) => PROTEIN_RE.test(x.name))?.name.replace(/^\w/, (s) => s.toUpperCase()) ?? null
    let n: Nutrition
    let comps: IngredientComponent[]
    if (parts.length >= 2) {
      n = parts.reduce((s, x) => add(s, x.n), ZERO)
      const coreIdx = Math.max(0, parts.findIndex((x) => PROTEIN_RE.test(x.name)))
      const specs: PartSpec[] = parts.map((x, i) =>
        i === coreIdx
          ? { id: `p${i}`, name: x.name, core: true }
          : { id: `p${i}`, name: x.name.replace(/^Base$/, /poutine/i.test(title) ? 'Fries, gravy & cheese curds' : /half and half/i.test(title) ? 'Rice & STIX' : 'Pita'), n: x.n, removable: BASE_RE.test(x.name) ? false : undefined },
      )
      comps = [...buildComponents(n, specs), ...extrasFor(protein)]
    } else {
      n = parts[0]?.n ?? toNut(p.nutritions[0])
      if (n.calories === 0) continue
      const probe: FixedItem = { id: 'probe', name: /philly/i.test(name) ? `${name} sandwich` : name, kind: 'fixed', category: c, nutrition: n }
      const guessed = (/chicken/i.test(name) ? 'Chicken' : /beef|philly/i.test(name) ? 'Beef' : /lamb/i.test(name) ? 'Lamb' : null) as string | null
      comps = [...componentsFor(probe).filter((x) => x.default !== false), ...extrasFor(guessed)]
    }
    addVersion(name, c, { label, n, comps }, optTitle ?? (label === 'Regular' ? undefined : 'Size'))
  }
}

const ORDER = ['Small', 'Regular', 'Medium', 'Large', 'Super']
const newId = idMaker('os')
const items: any[] = []
for (const p of products.values()) {
  const versions = [...p.versions].sort((a, b) => {
    const ia = ORDER.indexOf(a.label)
    const ib = ORDER.indexOf(b.label)
    return ia >= 0 && ib >= 0 ? ia - ib : 0
  })
  const def = versions.find((v) => v.label === 'Regular') ?? versions[0]
  const tags = tagsFor(p.name, def.n)
  if (/falafel/i.test(p.name) && !tags.includes('vegetarian')) tags.push('vegetarian')
  const it: any = { id: newId(p.name), name: p.name, kind: 'fixed', category: p.category, ...(tags.length ? { tags } : {}), nutrition: def.n }
  if (versions.length > 1) {
    it.defaultSize = def.label
    if (p.title && p.title !== 'Size') it.sizeTitle = p.title
    it.sizes = versions.map((v) => ({ label: v.label, nutrition: v.n, components: v.comps }))
  } else {
    it.serving = def.label === 'Regular' ? '1 serving' : def.label
    it.components = def.comps
  }
  items.push(it)
}

writeMenu({
  file: 'osmows',
  exportName: 'osmows',
  meta: { id: 'osmows', name: "Osmow's Shawarma", cuisine: 'Shawarma · Mediterranean', accent: '#0f766e', segment: 'Fast Food' },
  items,
  order: ['Wraps', 'Bowls & Burritos', 'Salads', 'Sides', 'Desserts'],
  source: [
    "Osmow's — complete menu from Osmow's official nutrition-calculator dataset",
    '(fetched by fetch-osmows.cjs). Items that list their components (base,',
    'protein, tahini, garlic sauce, sumac, sides) are built entirely from those',
    "official parts; add-ons use Osmow's own values. Generated by",
    "scripts/menus/gen-osmows.ts — regenerate, don't hand-edit.",
  ],
})

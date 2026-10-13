// Generate the menus of local / independent spots that publish no nutrition
// data, from the menu files in scripts/menus/local/*.txt.
//
// Each file holds the spot's real menu (item names taken from its own website
// or ordering page) and, for every item, a reference recipe from estimate.ts:
//
//   id: shawarma-prince
//   name: Shawarma Prince
//   cuisine: Shawarma · Mediterranean
//   accent: #7c3aed
//   segment: Fast Food
//   source: https://shawarmaprince.com/shawarma-menu/
//
//   [Sandwiches]
//   Chicken Shawarma Sandwich = wrap.chicken ; Small=0.8, Large=1.2
//   Pork Original Ramen = ramen.tonkotsu @ 583-983 :: sea salt, pork, nori
//
//   Name = archetype [xK] [@ calories] [; Size=factor, …] [:: ingredient, …] [#Category]
//
// `xK` scales the reference portion. `@` gives calories the spot posts on its
// menu (Ontario's menu-labelling law): a fixed number, a range (spread across
// the sizes, or offered as low / high ends), or a per-piece figure ("70/wing",
// multiplied by each size's count). Macros then keep the reference recipe's
// balance. `::` lists the dish's ingredients as the menu describes them; they
// become the removable parts. Everything here is an estimate and is labelled so.
//
//   run from the repo root: gen-local.ts
import * as fs from 'fs'
import * as path from 'path'
import { componentsFor } from '../../src/data/templates'
import type { FixedItem, MealCategory, Nutrition } from '../../src/types'
import { ARCHETYPES, atCalories, scaled } from './estimate'
import { componentsFromNames } from './ingredients'
import { idMaker, tagsFor } from './lib'
import { attachImages } from './attach-images.mjs'

const DIR = 'scripts/menus/local'
const OUT = 'src/data/menus/local'
const CATEGORY_ORDER: MealCategory[] = ['Bowls & Burritos', 'Wraps', 'Mains', 'Pizza', 'Burgers', 'Sandwiches', 'Chicken', 'Salads', 'Breakfast', 'Bakery', 'Sides', 'Desserts', 'Coffee', 'Drinks']
const CATEGORIES = new Set<string>(CATEGORY_ORDER)

interface Spot { id: string; name: string; cuisine: string; accent: string; segment: string; source: string; items: any[] }

function parseLine(line: string, spot: Spot, newId: (s: string) => string, file: string) {
  let rest = line
  let category: MealCategory | undefined
  const catMatch = rest.match(/\s#([A-Z][\w &]+)\s*$/)
  if (catMatch) {
    if (!CATEGORIES.has(catMatch[1])) throw new Error(`${file}: unknown category "${catMatch[1]}"`)
    category = catMatch[1] as MealCategory
    rest = rest.slice(0, catMatch.index)
  }
  let ingredients: string[] | undefined
  const ingIdx = rest.indexOf('::')
  if (ingIdx >= 0) {
    ingredients = rest.slice(ingIdx + 2).split(',').map((s) => s.trim()).filter(Boolean)
    rest = rest.slice(0, ingIdx)
  }
  let sizes: [string, number][] = []
  const sizeIdx = rest.indexOf(';')
  if (sizeIdx >= 0) {
    sizes = rest
      .slice(sizeIdx + 1)
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => {
        const m = s.match(/^(.+?)=([\d.]+)$/)
        if (!m) throw new Error(`${file}: bad size "${s}" in "${line}"`)
        return [m[1].trim(), +m[2]] as [string, number]
      })
    rest = rest.slice(0, sizeIdx)
  }
  const m = rest.match(/^(.+?)\s=\s([\w.-]+)(?:\s+x([\d.]+))?(?:\s+@\s*([\d.]+)(?:\s*-\s*([\d.]+))?(?:\/(\w+))?)?\s*$/)
  if (!m) throw new Error(`${file}: cannot parse "${line}"`)
  const [, name, key, x, lo, hi, per] = m
  const arch = ARCHETYPES[key]
  if (!arch) throw new Error(`${file}: unknown archetype "${key}" in "${line}"`)
  const k = x ? +x : 1
  const cat = category ?? arch.category

  const versions: { label: string; n: Nutrition }[] = []
  const posted = lo !== undefined
  if (sizes.length) {
    sizes.forEach(([label, f], i) => {
      let n: Nutrition
      if (!posted) n = scaled(arch, k * f)
      else if (per) n = atCalories(arch, +lo * f)
      else if (hi !== undefined) n = atCalories(arch, sizes.length > 1 ? +lo + ((+hi - +lo) * i) / (sizes.length - 1) : +lo)
      else n = atCalories(arch, +lo * f)
      versions.push({ label, n })
    })
  } else if (posted && hi !== undefined && !per) {
    versions.push({ label: 'Low end', n: atCalories(arch, +lo) }, { label: 'High end', n: atCalories(arch, +hi) })
  } else {
    versions.push({ label: arch.serving, n: posted ? atCalories(arch, +lo) : scaled(arch, k) })
  }

  const hint = arch.hint ?? name
  const comps = (n: Nutrition) => {
    const probe: FixedItem = { id: 'probe', name: hint, kind: 'fixed', category: cat, nutrition: n }
    const recipe = componentsFor(probe)
    // Menu-listed ingredients become the removable parts; the recipe template supplies add-ons.
    const named = ingredients ? componentsFromNames(n, ingredients) : null
    if (named) {
      const have = named.map((x) => x.name.toLowerCase())
      // Drop "Add X" when X is already in the dish (keep "Extra X").
      const extras = recipe.filter((x) => {
        if (x.default !== false) return false
        const m = x.name.toLowerCase().match(/^add (?:a |an )?(\w+)/)
        return !m || !have.some((h) => h.includes(m[1]))
      })
      return [...named, ...extras]
    }
    return recipe.length ? recipe : undefined
  }
  const def = versions.find((v, i) => (sizes[i]?.[1] ?? 1) === 1) ?? versions[0]
  const tags = tagsFor(name, def.n)
  if (/\b(veggie|vegetarian|vegan|falafel|tofu|paneer|cheese pizza|margherita|halloumi|avocado roll|cucumber)\b/i.test(name) && !/chicken|beef|pork|bacon|shrimp/i.test(name) && !tags.includes('vegetarian')) tags.push('vegetarian')
  const it: any = {
    id: newId(name),
    name,
    kind: 'fixed',
    category: cat,
    description: posted ? `Calories as posted by ${spot.name}; macros estimated from a typical recipe.` : 'Estimated from a typical recipe for this dish.',
    ...(tags.length ? { tags } : {}),
    nutrition: def.n,
  }
  if (versions.length > 1) {
    it.defaultSize = def.label
    if (posted && hi !== undefined && !sizes.length) it.sizeTitle = 'Posted range'
    else if (!versions.every((v) => /small|medium|large|regular|personal|indy|\bpc\b|pcs|oz|ml|slice|half|full|rack|lb|dozen|each|kids|single|double|leg|thigh|una|dos|grande|tall|venti|piece|serving|pack|burger|sandwich|trio/i.test(v.label))) it.sizeTitle = 'Options'
    it.sizes = versions.map((v) => {
      const c = comps(v.n)
      return { label: v.label, nutrition: v.n, ...(c ? { components: c } : {}) }
    })
  } else {
    it.serving = per ? `${def.label}` : def.label
    const c = comps(def.n)
    if (c) it.components = c
  }
  spot.items.push(it)
}

function parseFile(file: string): Spot {
  const spot: Spot = { id: '', name: '', cuisine: '', accent: '', segment: '', source: '', items: [] }
  const lines = fs.readFileSync(file, 'utf8').replace(/\r/g, '').split('\n')
  let newId: ((s: string) => string) | null = null
  for (const raw of lines) {
    const line = raw.trim()
    if (!line || line.startsWith('//') || /^\[.*\]$/.test(line)) continue
    const meta = line.match(/^(id|name|cuisine|accent|segment|source):\s*(.+)$/)
    if (meta) {
      ;(spot as any)[meta[1]] = meta[2].trim()
      if (meta[1] === 'id') newId = idMaker(spot.id.split('-').map((w) => w[0]).join('').slice(0, 4))
      continue
    }
    if (!newId) throw new Error(`${file}: "id:" must come first`)
    parseLine(line, spot, newId, file)
  }
  for (const k of ['id', 'name', 'cuisine', 'accent', 'segment', 'source'] as const) if (!spot[k]) throw new Error(`${file}: missing ${k}`)
  return spot
}

// Spot order on the home page follows ORDER (the files' groups); unknown files go last.
const ORDER = fs.readFileSync(path.join(DIR, 'ORDER'), 'utf8').split(/\s+/).filter(Boolean)
const files = fs.readdirSync(DIR).filter((f) => f.endsWith('.txt'))
const spots = files.map((f) => parseFile(path.join(DIR, f))).sort((a, b) => (ORDER.indexOf(a.id) + 1 || 999) - (ORDER.indexOf(b.id) + 1 || 999))

fs.mkdirSync(OUT, { recursive: true })
for (const f of fs.readdirSync(OUT)) if (f.endsWith('.items.ts')) fs.unlinkSync(path.join(OUT, f))
const q = (s: string) => (s.includes("'") ? JSON.stringify(s) : `'${s}'`)
for (const s of spots) {
  // Categories follow the order they first appear on the spot's own menu.
  const first = new Map<string, number>()
  s.items.forEach((it, i) => first.has(it.category) || first.set(it.category, i))
  const items = [...s.items].sort((a, b) => first.get(a.category)! - first.get(b.category)!)
  s.items = items
  // Photos from the spot's own website, where it shows them (images/local/<id>.json).
  attachImages(`local/${s.id}`, items)
  const body = items.map((it) => '  ' + JSON.stringify(it).replace(/"(\w+)":/g, '$1: ')).join(',\n')
  fs.writeFileSync(
    path.join(OUT, `${s.id}.items.ts`),
    `import { type MenuItem } from '../../../types'

// ${s.name} — ESTIMATED values (the spot publishes no nutrition data).
// Menu from ${s.source}; generated by scripts/menus/gen-local.ts from scripts/menus/local/${s.id}.txt.
export const items: MenuItem[] = [
${body},
]
`,
  )
}
fs.writeFileSync(
  'src/data/local.ts',
  `import { type Restaurant } from '../types'

// Local / independent spots that publish no nutrition data. Their full menus
// (from each spot's own site) are ESTIMATED from typical recipes — or use the
// calories they post on their menus — and load on demand from ./menus/local.
// Generated by scripts/menus/gen-local.ts; edit scripts/menus/local/*.txt instead.
export const localSpots: Restaurant[] = [
${spots
  .map(
    (s) => `  {
    id: ${q(s.id)},
    name: ${q(s.name)},
    cuisine: ${q(s.cuisine)},
    accent: ${q(s.accent)},
    segment: ${q(s.segment)},
    dataSource: 'estimated',
    items: [],
    itemCount: ${s.items.length},
    hasBuilder: false,
    loadItems: () => import('./menus/local/${s.id}.items').then((m) => m.items),
  },`,
  )
  .join('\n')}
]
`,
)
console.log(`local spots: ${spots.length}, items: ${spots.reduce((a, s) => a + s.items.length, 0)}`)
for (const s of spots) console.log(`  ${s.name}: ${s.items.length}`)

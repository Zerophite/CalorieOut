// Generate Wendy's Canada's menu from its crawled official data
// (raw/wendys.json, see fetch-wendys.cjs).
//
// Each item's default ingredients (bun, patty, cheese, toppings, sauces…) come
// with Wendy's own nutrition per ingredient, and every other option the
// restaurant offers for that item becomes an add-on.
//
//   run from the repo root: gen-wendys.ts
import * as fs from 'fs'
import { buildComponents, type PartSpec } from '../../src/data/components'
import type { IngredientComponent, MealCategory, Nutrition } from '../../src/types'
import { clean, idMaker, tagsFor, writeMenu } from './lib'

type RawNut = { calories?: number; totalFat?: number; carbohydrates?: number; protein?: number; sodium?: number }
interface Raw {
  site: { id: number; address: string }
  subMenus: { id: number; name: string; menuItems: number[] }[]
  menuItems: { id: number; name: string; defaultItemId: number; salesItemIds: number[] }[]
  salesItems: {
    id: number
    name: string
    size: string | null
    modifierGroups: number[]
    defaultOptions: { group: number; modifier: number; quantity: number }[]
    nutrition: RawNut
  }[]
  modifierGroups: { id: number; name: string; isBun: boolean; isMeat: boolean; max: number; modifiers: number[] }[]
  modifiers: { id: number; name: string; internalName?: string; componentId: string }[]
  components: Record<string, RawNut>
}
const data: Raw = JSON.parse(fs.readFileSync('scripts/menus/raw/wendys.json', 'utf8'))
const sales = new Map(data.salesItems.map((s) => [s.id, s]))
const groups = new Map(data.modifierGroups.map((g) => [g.id, g]))
const mods = new Map(data.modifiers.map((m) => [m.id, m]))

const toNut = (n: RawNut | undefined, q = 1): Nutrition => ({
  calories: Math.round((n?.calories ?? 0) * q),
  protein: Math.round((n?.protein ?? 0) * q),
  carbs: Math.round((n?.carbohydrates ?? 0) * q),
  fat: Math.round((n?.totalFat ?? 0) * q),
  sodium: Math.round((n?.sodium ?? 0) * q),
})
const compNut = (modifierId: number, q = 1) => toNut(data.components[mods.get(modifierId)?.componentId ?? ''], q)
const isEmpty = (n: Nutrition) => n.calories < 1 && n.sodium < 5

// --- Which menu entries are products ---------------------------------------------
// Sections are visited in this order so an item listed in several places is
// categorised by its main section. Combo / meal / promo sections only bundle
// items that are listed elsewhere.
const SECTION_ORDER = [
  'Cheeseburgers', 'Chicken, Wraps & More', 'Fresh-Made Salads', 'Fries & Sides', 'Frosty®', 'Beverages',
  'Coffee', 'Croissants', 'Classics', 'Breakfast Wraps', 'Sides & Sweets', 'Everyday Value', "Wendy's Kids' Meals",
]
const SKIP_NAME = /\$\.01|test|lids|km base|2 for \$|boo! books|duo (box|meal)|combo$/i
const KIDS = "Wendy's Kids' Meals"

const SIZE_LABEL: Record<string, string> = { KIDS: "Kids'", JUNIOR: 'Junior', SMALL: 'Small', MEDIUM: 'Medium', LARGE: 'Large' }
const SIZE_ORDER = ["Kids'", 'Junior', 'Small', 'Medium', 'Large']
function sizeLabel(s: Raw['salesItems'][number]): string | null {
  const first = (s.name.split(/\s+/)[0] ?? '').toUpperCase().replace(/[^A-Z]/g, '')
  if (SIZE_LABEL[first]) return SIZE_LABEL[first]
  const short = (s.size ?? '').toUpperCase()
  return SIZE_LABEL[short] ?? null
}

function category(section: string, name: string): MealCategory {
  const n = name.toLowerCase()
  if (/cold brew|coffee|hot tea/.test(n)) return 'Coffee'
  if (/frosty fizz|refresher|lemonade|coca|coke|sprite|fanta|barq|fruitopia|fuze|water|milk|simply/.test(n)) return 'Drinks'
  if (/frosty|cinnabon/.test(n)) return 'Desserts'
  if (['Croissants', 'Classics', 'Breakfast Wraps'].includes(section) || /breakfast|french toast|croissant|egg blt|sausage bacon deluxe/.test(n))
    return 'Breakfast'
  if (/salad/.test(n)) return 'Salads'
  if (/wrap/.test(n)) return 'Wraps'
  if (/chicken|nugget/.test(n)) return 'Chicken'
  if (/fries|poutine|potato|chili|nachos/.test(n)) return 'Sides'
  return 'Burgers'
}

// --- Ingredient breakdowns ----------------------------------------------------------
const DISPOSABLE = /disposable|utensil|napkin|straw|lid|bag|cutlery|condiment cup/i
const MEAT = /patty|patties|chicken|fillet|filet|nugget|strip|sausage|egg|beef|chili/i

// Wendy's reuses display names for different portions (both the 1- and
// 2-slice cheese show as "Processed cheese slice"); for those, the portion is
// read from the internal name ("2 Slices Regular Cheese", "Bacon 3pc"…).
const byDisplay = new Map<string, Set<number>>()
for (const m of data.modifiers) {
  const cal = data.components[m.componentId]?.calories ?? 0
  if (!byDisplay.has(m.name)) byDisplay.set(m.name, new Set())
  byDisplay.get(m.name)!.add(cal)
}
function modName(id: number): string {
  const m = mods.get(id)!
  const base = clean(m.name)
  if ((byDisplay.get(m.name)?.size ?? 0) < 2 || !m.internalName) return base
  const k = m.internalName.trim()
  let x: RegExpMatchArray | null
  if ((x = k.match(/^(\d+)\s/)) && x[1] !== '1') return `${base} (×${x[1]})`
  if ((x = k.match(/(\d+)\s*pc\b/i))) return `${base} (${x[1]} pc)`
  if (/^1\/2|half/i.test(k)) return `${base} (half)`
  if (/^duo/i.test(k)) return `${base} (×2)`
  if (/\b(small|jr)\b/i.test(k)) return `${base} (junior)`
  return base
}

/** The part of an item that isn't a listed ingredient (fries under a poutine…). */
function baseName(item: string): string {
  const n = item.toLowerCase()
  if (/fries|poutine/.test(n)) return 'Fries'
  if (/potato/.test(n)) return 'Baked potato'
  if (/nachos/.test(n)) return 'Tortilla chips'
  if (/salad/.test(n)) return 'Greens & vegetables'
  if (/frosty/.test(n)) return 'Frosty'
  return 'Base'
}

function componentsFor(item: string, si: Raw['salesItems'][number]): IngredientComponent[] | undefined {
  const total = toNut(si.nutrition)
  const defaults = si.defaultOptions
    .map((o) => ({ ...o, mod: mods.get(o.modifier), grp: groups.get(o.group) }))
    .filter((o) => o.mod && o.grp && !DISPOSABLE.test(o.grp.name) && !DISPOSABLE.test(o.mod.name))
    .map((o) => ({ ...o, n: compNut(o.modifier, o.quantity) }))
    .filter((o) => !isEmpty(o.n))
  if (defaults.length < 2) return undefined // single-ingredient items use the generic recipe

  const label = (id: number, q: number) => (q > 1 ? `${modName(id)} (×${q})` : modName(id))
  // When the listed ingredients cover well under the total, the item itself
  // (fries, potato, Frosty…) is the unlisted base and absorbs the remainder.
  const listed = defaults.reduce((sum, d) => sum + d.n.calories, 0)
  const needsBase = listed < total.calories * 0.7
  const coreIdx = needsBase
    ? -1
    : (() => {
        const meat = defaults.findIndex((d) => d.grp!.isMeat || MEAT.test(d.mod!.name))
        if (meat >= 0) return meat
        return defaults.reduce((m, d, i) => (d.n.calories > defaults[m].n.calories ? i : m), 0)
      })()
  const specs: PartSpec[] = defaults.map((d, i) =>
    i === coreIdx
      ? { id: `d${d.modifier}`, name: label(d.modifier, d.quantity), core: true }
      : {
          id: `d${d.modifier}`,
          name: label(d.modifier, d.quantity),
          n: d.n,
          removable: d.grp!.isBun || /bun|croissant|tortilla|biscuit/i.test(d.mod!.name) ? false : undefined,
        },
  )
  if (needsBase) specs.unshift({ id: 'base', name: baseName(item), core: true })

  // Add-ons: one more of a default ingredient, or any other option in the item's groups.
  const extras: IngredientComponent[] = []
  const defaultIds = new Set(defaults.map((d) => d.modifier))
  for (const gid of si.modifierGroups) {
    const g = groups.get(gid)
    if (!g || DISPOSABLE.test(g.name) || g.isBun || g.max === 1) continue
    for (const mid of g.modifiers) {
      const m = mods.get(mid)
      if (!m || DISPOSABLE.test(m.name)) continue
      const n = compNut(mid)
      if (isEmpty(n) || n.calories < 1) continue
      const nm = modName(mid).toLowerCase()
      const again = defaultIds.has(mid)
      extras.push({ id: `${again ? 'x' : 'a'}${mid}`, name: `${again ? 'Extra' : 'Add'} ${nm}`, default: false, nutrition: n })
    }
  }
  const seen = new Set<string>()
  const uniqueExtras = extras.filter((x) => (seen.has(x.name) ? false : (seen.add(x.name), true)))
  return [...buildComponents(total, specs), ...uniqueExtras.slice(0, 16)]
}

// --- Build products -------------------------------------------------------------------
const sectionOf = new Map<number, string>()
for (const name of SECTION_ORDER) {
  const s = data.subMenus.find((x) => x.name === name)
  for (const id of s?.menuItems ?? []) if (!sectionOf.has(id)) sectionOf.set(id, name)
}

const FRACTION: Record<string, string> = { '1/4': '¼', '1/2': '½', '3/4': '¾' }
/** "Bacon Deluxe 3/4lb.* Triple" → "Bacon Deluxe ¾ lb. Triple", etc. */
function tidyName(raw: string): string {
  return clean(raw)
    .replace(/\s+,/g, ',')
    .replace(/\*/g, '')
    .replace(/(\d\/\d)\s*lb\./, (_, f: string) => `${FRACTION[f] ?? f} lb.`)
    .replace(/([¼½¾])\s*lb\./, '$1 lb.')
    .replace(/^French Toast Sticks Kids[’'] Meal, (\d) PC$/i, "Kids' French Toast Sticks, $1 PC")
}

const newId = idMaker('we')
const items: any[] = []
const seenNames = new Set<string>()
for (const mi of data.menuItems) {
  const section = sectionOf.get(mi.id)
  if (!section) continue
  const name = tidyName(mi.name)
  if (SKIP_NAME.test(name) || seenNames.has(name.toLowerCase())) continue
  // Kids' meals list their sides and drinks too; keep the main item only.
  const ids = section === KIDS || /kids.? meal/i.test(mi.name) ? [mi.defaultItemId] : mi.salesItemIds
  const variants = ids
    .map((id) => sales.get(id))
    .filter((s): s is Raw['salesItems'][number] => !!s && s.nutrition?.calories != null)
  if (!variants.length) continue
  if (variants.every((v) => (v.nutrition.calories ?? 0) === 0) && !/water|tea|coffee/i.test(name)) continue
  seenNames.add(name.toLowerCase())

  const sized = variants.length > 1
    ? variants
        .map((v) => ({ v, label: sizeLabel(v) }))
        .filter((x, i, arr) => x.label && arr.findIndex((y) => y.label === x.label) === i)
        .sort((a, b) => SIZE_ORDER.indexOf(a.label!) - SIZE_ORDER.indexOf(b.label!))
    : []
  const def = sized.length > 1
    ? sized.find((x) => x.label === 'Medium') ?? sized.find((x) => x.label === 'Small') ?? sized[0]
    : { v: sales.get(mi.defaultItemId) ?? variants[0], label: null }
  const n = toNut(def.v.nutrition)
  const tags = tagsFor(name, n)
  const it: any = {
    id: newId(name),
    name,
    kind: 'fixed',
    category: category(section, name),
    ...(sized.length > 1 ? {} : { serving: def.label ?? '1 serving' }),
    ...(tags.length ? { tags } : {}),
    nutrition: n,
  }
  if (sized.length > 1) {
    it.defaultSize = def.label
    it.sizes = sized.map(({ v, label }) => {
      const comps = componentsFor(name, v)
      return { label, nutrition: toNut(v.nutrition), ...(comps ? { components: comps } : {}) }
    })
  } else {
    const comps = componentsFor(name, def.v)
    if (comps) it.components = comps
  }
  items.push(it)
}

writeMenu({
  file: 'wendys',
  exportName: 'wendys',
  meta: { id: 'wendys', name: "Wendy's", cuisine: 'Burgers · Fast food', accent: '#b91c1c', segment: 'Fast Food' },
  items,
  order: ['Burgers', 'Chicken', 'Wraps', 'Salads', 'Breakfast', 'Sides', 'Desserts', 'Drinks', 'Coffee'],
  source: [
    "Wendy's Canada — complete menu from Wendy's official menu and nutrition",
    `services (menu of the ${data.site.address} restaurant, crawled by`,
    'fetch-wendys.cjs). Totals are the published values; default ingredients',
    "carry Wendy's own per-ingredient nutrition and every other option offered for",
    "the item is an add-on. Generated by scripts/menus/gen-wendys.ts — regenerate,",
    "don't hand-edit.",
  ],
})

// Plausibility audit of every menu: catches numbers that can't be right even
// when they match a source document (misprints, wrong units, swapped columns).
//
//   run from the repo root: node scripts/menus/run.cjs audit.ts
//
// Checks
//   energy    calories far from 4·protein + 4·carbs + 9·fat
//   sauce     a sauce / dressing / syrup / creamer portion over 450 cal
//   veg       a plain vegetable topping over 120 cal
//   huge      a single (non-sharing) item over 3,000 cal
//   sizes     a bigger size with clearly fewer calories than a smaller one
//   outlier   a builder option over 3× its group's median (and over 600 cal)
//   dupe      the same option name twice in one builder group
//   sodium    over 8,000 mg in one item
import { restaurants } from '../../src/data/index'
import type { Nutrition } from '../../src/types'

const SHARE = /family|platter|party|pack|bucket|feast|tray|box|bundle|for \d|whole|sharing|combo|catering|dozen|\d+ ?pc|\d+ pieces|pizza|cake|pie\b/i
const SAUCE = /sauce|dressing|\bdip\b|mayo|aioli|syrup|vinaigrette|ketchup|mustard|creamer|\bcream\b|gravy|salsa|seasoning|drizzle|glaze/i
const VEG = /^(add )?(extra )?(lettuce|tomato(es)?|onions?|red onions?|cucumbers?|peppers?|green peppers?|spinach|pickles?|olives?|jalape[nñ]os?|mushrooms?|carrots?|cabbage|banana peppers?|sprouts|kale|arugula)$/i
const ALCOHOL = /beer|wine|sake|cocktail|margarita|mojito|cider|lager|pale ale|\bipa\b|stout|pilsner|draught|draft|sangria|vodka|\brum\b|whisk|tequila|spritz|mimosa|caesar \(|martini|whiske?y sour/i

const flags: string[] = []
const flag = (where: string, kind: string, msg: string) => flags.push(`${kind.padEnd(8)} ${where}: ${msg}`)

function energy(where: string, name: string, n: Nutrition) {
  if (n.calories < 60 || ALCOHOL.test(name)) return
  const est = n.protein * 4 + n.carbs * 4 + n.fat * 9
  const r = n.calories / Math.max(1, est)
  if (r < 0.7 || r > 1.4) flag(where, 'energy', `${n.calories} cal but macros give ${Math.round(est)} (P${n.protein} C${n.carbs} F${n.fat})`)
}

const SIZE_ORDER = ['kids', 'mini', 'x-small', 'extra small', 'small', 'regular', 'medium', 'large', 'x-large', 'extra large', 'xl']
const rank = (l: string) => SIZE_ORDER.indexOf(l.toLowerCase().replace(/\s*\(.*\)$/, ''))

for (const r of restaurants) {
  const menu = r.loadItems ? await r.loadItems() : r.items
  for (const it of menu) {
    const where = `${r.name} / ${it.name}`
    if (it.kind === 'builder') {
      for (const g of it.groups) {
        const cals = g.options.map((o) => o.nutrition.calories).sort((a, b) => a - b)
        const median = cals[Math.floor(cals.length / 2)] || 0
        const seen = new Set<string>()
        for (const o of g.options) {
          const w = `${where} › ${g.name} › ${o.name}`
          energy(w, o.name, o.nutrition)
          if (SAUCE.test(o.name) && o.nutrition.calories > 450) flag(w, 'sauce', `${o.nutrition.calories} cal`)
          if (VEG.test(o.name) && o.nutrition.calories > 120) flag(w, 'veg', `${o.nutrition.calories} cal`)
          if (g.options.length >= 4 && o.nutrition.calories > 600 && o.nutrition.calories > median * 3) flag(w, 'outlier', `${o.nutrition.calories} cal vs group median ${median}`)
          const key = o.name.toLowerCase()
          if (seen.has(key)) flag(w, 'dupe', 'listed twice in this group')
          seen.add(key)
        }
      }
      continue
    }
    const versions = it.sizes && it.sizes.length > 1 ? it.sizes.map((s) => ({ label: s.label, n: s.nutrition, comps: s.components })) : [{ label: '', n: it.nutrition, comps: it.components }]
    for (const v of versions) {
      const w = v.label ? `${where} [${v.label}]` : where
      energy(w, it.name, v.n)
      if (v.n.calories > 3000 && !SHARE.test(it.name)) flag(w, 'huge', `${v.n.calories} cal`)
      if (v.n.sodium > 8000) flag(w, 'sodium', `${v.n.sodium} mg`)
      if (v.n.calories === 0 && v.n.protein + v.n.carbs + v.n.fat > 2) flag(w, 'energy', '0 cal but has macros')
      for (const c of v.comps ?? []) {
        if (SAUCE.test(c.name) && c.nutrition.calories > 450) flag(`${w} › ${c.name}`, 'sauce', `${c.nutrition.calories} cal`)
        if (VEG.test(c.name) && c.nutrition.calories > 120) flag(`${w} › ${c.name}`, 'veg', `${c.nutrition.calories} cal`)
        if (c.default === false) energy(`${w} › ${c.name}`, c.name, c.nutrition)
      }
    }
    if (it.sizes && it.sizes.length > 1) {
      const ranked = it.sizes.filter((s) => rank(s.label) >= 0).sort((a, b) => rank(a.label) - rank(b.label))
      for (let i = 1; i < ranked.length; i++)
        if (ranked[i].nutrition.calories < ranked[i - 1].nutrition.calories * 0.8)
          flag(where, 'sizes', `${ranked[i].label} ${ranked[i].nutrition.calories} cal < ${ranked[i - 1].label} ${ranked[i - 1].nutrition.calories} cal`)
    }
  }
}

const byKind: Record<string, number> = {}
for (const f of flags) byKind[f.split(' ')[0]] = (byKind[f.split(' ')[0]] ?? 0) + 1
console.log(`Audit: ${flags.length} flags`, byKind)
for (const f of flags) console.log(f)

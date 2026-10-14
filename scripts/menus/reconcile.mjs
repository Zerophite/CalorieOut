// Make every nutrition panel internally consistent before it is written.
//
// Sources sometimes omit or misprint macros (Wendy's Canada's feed has no
// carbohydrates; Firehouse Subs gives some items calories only; Osmow's lists
// a tahini at "601225" g of fat). The published calories are the number a
// chain must post, so they are kept, and the macros are repaired around them:
//
//   1. a macro whose energy alone is far above the calories is recomputed
//      from the calories left after the other two;
//   2. calories with no macros at all get the macro split typical of the item
//      type (a soft drink is all sugar, a sauce mostly fat …);
//   3. a missing carb (or protein) value is filled from the leftover calories;
//   4. macros grossly inconsistent with the calories are scaled to match.
//
// Fixed items keep their ingredient breakdowns summing to the total: default
// ingredients are rebalanced in proportion to their calories.

const KCAL = { protein: 4, carbs: 4, fat: 9 }
const MACROS = ['protein', 'carbs', 'fat']
const ALCOHOL = /beer|wine|sake|cocktail|margarita|mojito|cider|lager|pale ale|\bipa\b|stout|pilsner|draught|draft|sangria|vodka|\brum\b|whisk|tequila|spritz|mimosa|caesar \(|martini|whiske?y sour/i

// Share of calories from protein / carbs / fat, by item type (first match wins).
const PROFILES = [
  [/water|diet|zero|sugar[- ]free|black coffee|americano|espresso|tea$/i, [0, 1, 0]],
  [/coke|cola|pepsi|sprite|fanta|ale\b|soda|pop\b|juice|lemonade|lime-?aid|punch|mello|crush|dew|gatorade|powerade|vitamin ?water|fuze|brisk|iced tea|slush|refresher|ramune/i, [0, 1, 0]],
  [/mayo|aioli|butter|oil|dressing|ranch|caesar|vinaigrette|tahini|garlic sauce|cream cheese|pesto/i, [0.01, 0.06, 0.93]],
  [/sauce|dip|salsa|ketchup|bbq|honey|syrup|glaze|jam|relish/i, [0.02, 0.8, 0.18]],
  [/cheese/i, [0.26, 0.03, 0.71]],
  [/bacon|sausage|pepperoni|salami/i, [0.25, 0.02, 0.73]],
  [/meat|beef|steak|brisket|pastrami|chicken|turkey|ham|tuna|salmon|shrimp|pork|lamb|egg/i, [0.5, 0.02, 0.48]],
  [/fries|chips|potato|tots|rings|wedges|lay'?s|ruffles|doritos|vickie/i, [0.05, 0.5, 0.45]],
  [/cookie|brownie|cake|pie|donut|muffin|bar\b|dessert|churro|pudding|cheesecake|cinnamon/i, [0.05, 0.55, 0.4]],
  [/shake|frapp|latte|mocha|milk|smoothie|blizzard|sundae|cone|ice cream/i, [0.1, 0.6, 0.3]],
  [/salad/i, [0.25, 0.25, 0.5]],
  [/soup|chili/i, [0.2, 0.45, 0.35]],
  [/.*/, [0.2, 0.45, 0.35]],
]

const energy = (n) => n.protein * 4 + n.carbs * 4 + n.fat * 9

/** Return repaired macros for one nutrition panel (calories never change). */
export function repair(n, name = '') {
  const cal = n.calories
  if (!cal || cal < 20 || ALCOHOL.test(name)) return n
  const out = { ...n }
  // 1. One absurd field (e.g. a misplaced decimal).
  for (const f of MACROS) {
    if (out[f] * KCAL[f] > cal * 2 + 40) {
      const others = MACROS.filter((g) => g !== f).reduce((s, g) => s + out[g] * KCAL[g], 0)
      out[f] = Math.max(0, Math.round((cal - others) / KCAL[f]))
    }
  }
  // 2. No macros at all.
  if (out.protein + out.carbs + out.fat === 0) {
    const [p, c, fat] = PROFILES.find(([re]) => re.test(name))[1]
    return { ...out, protein: Math.round((cal * p) / 4), carbs: Math.round((cal * c) / 4), fat: Math.round((cal * fat) / 9) }
  }
  // 3. Missing carbs (Wendy's) or protein: fill from the leftover calories.
  const left = cal - energy(out)
  if (left > Math.max(25, cal * 0.15)) {
    if (out.carbs === 0) out.carbs = Math.round(left / 4)
    else if (out.protein === 0 && out.fat > 0 && !/sauce|syrup|drink|soda|juice/i.test(name)) out.protein = Math.round(left / 4)
  }
  // 4. Grossly inconsistent: scale the macros to the calories.
  const e = energy(out)
  if (e > 0 && (cal / e < 0.6 || cal / e > 1.7)) {
    const k = cal / e
    for (const f of MACROS) out[f] = Math.round(out[f] * k)
  }
  return out
}

const same = (a, b) => MACROS.every((f) => a[f] === b[f])

/** Rebalance default-on components so each macro sums to the item's total. */
function rebalance(components, total) {
  const on = components.filter((c) => c.default !== false)
  if (on.length === 0) return
  const calSum = on.reduce((s, c) => s + c.nutrition.calories, 0)
  for (const f of MACROS) {
    const sum = on.reduce((s, c) => s + c.nutrition[f], 0)
    if (sum === total[f]) continue
    let given = 0
    on.forEach((c) => {
      const share = calSum > 0 ? c.nutrition.calories / calSum : 1 / on.length
      c.nutrition = { ...c.nutrition, [f]: Math.max(0, Math.round(total[f] * share)) }
      given += c.nutrition[f]
    })
    // Rounding remainder goes to the largest ingredient.
    const big = on.reduce((a, b) => (b.nutrition.calories > a.nutrition.calories ? b : a))
    big.nutrition = { ...big.nutrition, [f]: Math.max(0, big.nutrition[f] + total[f] - given) }
  }
}

function fixPanel(holder, name) {
  const fixed = repair(holder.nutrition, name)
  const changed = !same(fixed, holder.nutrition)
  if (changed) holder.nutrition = fixed
  for (const c of holder.components ?? []) if (c.default === false) c.nutrition = repair(c.nutrition, c.name)
  if (changed && holder.components) rebalance(holder.components, fixed)
  return changed ? 1 : 0
}

/** Repair every item in a menu in place; returns how many panels changed. */
export function reconcileMenu(items) {
  let changed = 0
  for (const it of items) {
    if (it.kind === 'builder') {
      for (const g of it.groups) for (const o of g.options) {
        const r = repair(o.nutrition, `${o.name} ${g.name}`)
        if (!same(r, o.nutrition)) { o.nutrition = r; changed++ }
      }
      continue
    }
    changed += fixPanel(it, it.name)
    for (const s of it.sizes ?? []) changed += fixPanel(s, it.name)
    // Keep the item's headline nutrition equal to its default size.
    if (it.sizes && it.defaultSize) {
      const d = it.sizes.find((s) => s.label === it.defaultSize)
      if (d) { it.nutrition = d.nutrition; if (d.components && it.components) it.components = d.components }
    }
  }
  return changed
}

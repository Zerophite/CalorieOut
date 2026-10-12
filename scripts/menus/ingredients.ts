// Typical per-dish portions of common restaurant ingredients, by name, for the
// estimated local menus (gen-local.ts). Given the ingredients a menu lists for
// a dish and the dish's total, the parts keep these relative sizes and are
// reconciled so the default ingredients sum exactly to the total.
import { buildComponents, type PartSpec } from '../../src/data/components'
import type { IngredientComponent, Nutrition } from '../../src/types'
import { slug } from './lib'

type Row = [RegExp, number, number, number, number, number, boolean?] // cal, protein, carbs, fat, sodium, locked
// First match wins, so specific names come before general ones.
const TABLE: Row[] = [
  [/broth|soup base/, 150, 6, 7, 11, 1500, true],
  [/rice noodle|vermicelli|glass noodle/, 280, 4, 62, 1, 50],
  [/noodle|udon|ramen|spaghetti|pasta|fettuccine|linguine|penne/, 300, 10, 58, 3, 300],
  [/fried rice/, 400, 9, 60, 13, 800],
  [/rice/, 300, 6, 64, 1, 10],
  [/seasoned ground pork|ground pork/, 180, 12, 2, 14, 350],
  [/chashu|pork belly|pork/, 160, 12, 1, 12, 320],
  [/brisket/, 300, 25, 0, 22, 700],
  [/steak|sirloin|beef strip|shaved steak|ground beef|taco seasoned beef|beef/, 170, 18, 1, 10, 300],
  [/breaded chicken|chicken bites|crispy chicken|chicken strips|fried chicken|karaage|tenders/, 280, 18, 18, 15, 700],
  [/chicken & beef shawarma|mixed shawarma/, 300, 28, 4, 19, 650],
  [/beef shawarma/, 320, 26, 4, 22, 650],
  [/shawarma|shish taouk|chicken/, 260, 30, 3, 14, 600],
  [/donair/, 350, 20, 6, 27, 800],
  [/kafta|kofta/, 330, 20, 4, 26, 600],
  [/soujuk|sausage/, 250, 11, 2, 22, 700],
  [/meatball/, 250, 14, 8, 18, 600],
  [/pepperoni|roni/, 120, 5, 0, 11, 450],
  [/bacon/, 90, 6, 0, 7, 350],
  [/ham|smoked meat|pastrami|turkey/, 120, 16, 2, 5, 900],
  [/salmon/, 200, 20, 0, 13, 60],
  [/tuna/, 120, 26, 0, 1, 40],
  [/shrimp|prawn|crab|octopus/, 90, 16, 2, 1, 450],
  [/fish|halibut|haddock|cod/, 300, 25, 15, 15, 500],
  [/falafel/, 250, 9, 25, 13, 400],
  [/halloumi/, 250, 16, 2, 20, 800],
  [/paneer/, 200, 12, 3, 16, 20],
  [/inari|tofu/, 120, 8, 8, 7, 200],
  [/seasoned egg|egg/, 75, 6, 1, 5, 120],
  [/cheese curds|curds/, 180, 11, 1, 14, 300],
  [/cream cheese/, 100, 2, 2, 10, 100],
  [/parmesan|asiago|feta/, 50, 4, 0, 4, 200],
  [/mozza|cheddar|cheese/, 110, 7, 1, 9, 180],
  [/garlic sauce|toum|spicy garlic/, 150, 0, 2, 16, 120],
  [/tahini|sesame paste/, 90, 3, 3, 8, 20],
  [/hummus/, 100, 3, 8, 6, 200],
  [/baba/, 80, 2, 5, 6, 180],
  [/gravy/, 80, 2, 8, 4, 600],
  [/mayo|aioli|house sauce|house dip|special sauce|ranch|caesar|chipotle|creamy/, 120, 0, 2, 12, 220],
  [/vinaigrette|dressing/, 110, 0, 4, 10, 250],
  [/bbq|teriyaki|honey garlic|sweet chili|sweet & spicy|thai sauce|tonkatsu|kinton sauce|shoyu sauce|tandoori sauce|curry/, 60, 1, 13, 1, 450],
  [/wing sauce|buffalo|hot sauce|chili sauce/, 25, 0, 2, 2, 600],
  [/chili oil|garlic oil|olive oil/, 80, 0, 0, 9, 0],
  [/garlic butter|butter/, 70, 0, 0, 8, 60],
  [/honey|syrup|sugar|caramel|chocolate|nutella|biscoff|icing/, 90, 1, 18, 2, 20],
  [/marinara|tomato sauce|pizza sauce|salsa|tomato dip/, 30, 1, 6, 0, 280],
  [/sour cream/, 60, 1, 1, 6, 15],
  [/guacamole|avocado/, 90, 1, 5, 8, 100],
  [/ketchup|mustard/, 20, 0, 5, 0, 170],
  [/soy sauce|ponzu/, 10, 1, 1, 0, 600],
  [/pita|saj|lavash|naan|flatbread/, 170, 6, 34, 1, 320, true],
  [/sub bun|baguette|ciabatta|sub roll/, 280, 10, 52, 4, 520, true],
  [/bun|brioche|bread|toast|bagel/, 200, 7, 36, 3, 380, true],
  [/tortilla|wrap/, 220, 6, 36, 6, 450, true],
  [/thin crust/, 150, 5, 27, 3, 300, true],
  [/crust|dough|shell/, 220, 8, 38, 4, 420, true],
  [/croutons|crispy onions|fried onions|tortilla strips|wonton/, 40, 1, 5, 2, 80],
  [/fries|potato wedges/, 320, 4, 42, 16, 300],
  [/potato skins|garlic potatoes|potatoes|potato/, 220, 4, 30, 10, 350],
  [/chips/, 300, 4, 36, 16, 300],
  [/coleslaw|slaw/, 100, 1, 6, 8, 150],
  [/beans|chickpeas|edamame/, 120, 7, 18, 2, 250],
  [/sweet corn|corn/, 40, 1, 9, 0.5, 5],
  [/pineapple|fruit|mango|strawberr|banana|apple|berries/, 40, 0, 10, 0, 2],
  [/olives/, 25, 0, 1, 2.5, 200],
  [/kimchi|pickled|pickles|turnips|red ginger/, 10, 0, 2, 0, 250],
  [/bonito|nori|seaweed|sesame seeds|scallion|green onion|cilantro|herbs|basil|seasoning|spice/, 5, 0, 1, 0, 30],
  [/lettuce|romaine|greens|spinach|kale|salad|cabbage|sprouts|cucumber|tomato|onion|pepper|mushroom|bamboo|wood ear|jalape|zucchini|carrot|broccoli|veg/, 15, 1, 3, 0, 20],
  [/pearls|tapioca|boba/, 150, 0, 37, 0, 10],
  [/jelly|pudding/, 90, 1, 20, 1, 40],
  [/cheese foam|cream foam|whipped cream|cream/, 110, 1, 6, 9, 80],
  [/milk/, 120, 6, 10, 6, 100],
  [/tea|coffee|espresso|water/, 5, 0, 1, 0, 5],
  [/lemon|lime/, 2, 0, 1, 0, 0],
]
const DEFAULT: Row = [/./, 50, 2, 5, 2, 100]

const PROTEIN = /pork|beef|steak|brisket|chicken|shawarma|donair|kafta|sausage|soujuk|meatball|salmon|tuna|shrimp|prawn|fish|halibut|haddock|cod|falafel|halloumi|paneer|tofu|inari|smoked meat|ham|turkey/

export function lookup(name: string): Row {
  const n = name.toLowerCase()
  return TABLE.find(([re]) => re.test(n)) ?? DEFAULT
}

/**
 * Default ingredients for a dish from its menu-listed ingredient names, summing
 * exactly to `total`. Returns null when fewer than two ingredients are given.
 */
export function componentsFromNames(total: Nutrition, names: string[]): IngredientComponent[] | null {
  const list = [...new Set(names.map((s) => s.trim()).filter(Boolean))]
  if (list.length < 2 || total.calories <= 0) return null
  const rows = list.map((name) => ({ name, row: lookup(name) }))
  const typical = rows.reduce((s, r) => s + r.row[1], 0)
  const k = typical > 0 ? total.calories / typical : 1
  // The main protein absorbs rounding (else the largest part).
  let core = rows.findIndex((r) => PROTEIN.test(r.name.toLowerCase()))
  if (core < 0) core = rows.reduce((m, r, i) => (r.row[1] > rows[m].row[1] ? i : m), 0)
  const specs: PartSpec[] = rows.map((r, i) => {
    const [, cal, p, c, f, na, locked] = r.row
    const label = r.name.replace(/^\w/, (ch) => ch.toUpperCase())
    if (i === core) return { id: slug(r.name) || `p${i}`, name: label, core: true }
    return {
      id: slug(r.name) || `p${i}`,
      name: label,
      n: { calories: Math.round(cal * k), protein: Math.round(p * k), carbs: Math.round(c * k), fat: Math.round(f * k), sodium: Math.round(na * k) },
      removable: locked ? false : undefined,
    }
  })
  return buildComponents(total, specs)
}

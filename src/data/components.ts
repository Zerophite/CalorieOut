import { type IngredientComponent, type Nutrition } from '../types'

// ---------------------------------------------------------------------------
// Helpers for building ingredient breakdowns on fixed items.
//
// Restaurants publish an item's TOTAL but almost never a per-ingredient split.
// So we model the split: fixed, reference-based values for the recognisable
// parts (bun, cheese, sauce, veg…) and let one "core" part absorb whatever is
// left, which guarantees the breakdown sums EXACTLY to the published total in
// every field. Per-ingredient numbers are therefore approximate; the total is
// exact. This is surfaced in the UI as "approximate splits".
// ---------------------------------------------------------------------------

const Z: Nutrition = { calories: 0, protein: 0, carbs: 0, fat: 0, sodium: 0 }

/** Build a Nutrition from a partial (missing fields = 0). */
function n(p: Partial<Nutrition>): Nutrition {
  return { ...Z, ...p }
}

function add(a: Nutrition, b: Nutrition): Nutrition {
  return {
    calories: a.calories + b.calories,
    protein: a.protein + b.protein,
    carbs: a.carbs + b.carbs,
    fat: a.fat + b.fat,
    sodium: a.sodium + b.sodium,
  }
}

/** a − b, clamped at 0 per field so a modelled core never goes negative. */
function subClamp(a: Nutrition, b: Nutrition): Nutrition {
  return {
    calories: Math.max(0, Math.round(a.calories - b.calories)),
    protein: Math.max(0, Math.round(a.protein - b.protein)),
    carbs: Math.max(0, Math.round(a.carbs - b.carbs)),
    fat: Math.max(0, Math.round(a.fat - b.fat)),
    sodium: Math.max(0, Math.round(a.sodium - b.sodium)),
  }
}

/** Reference ingredient values (generic, approximate — USDA-style). */
export const REF = {
  // Breads
  bunPlain: n({ calories: 150, protein: 5, carbs: 27, fat: 2, sodium: 250 }),
  bunMedium: n({ calories: 200, protein: 7, carbs: 34, fat: 3, sodium: 420 }),
  bunSesame: n({ calories: 250, protein: 8, carbs: 44, fat: 4, sodium: 460 }),
  bunBrioche: n({ calories: 230, protein: 7, carbs: 38, fat: 6, sodium: 380 }),
  hotdogBun: n({ calories: 110, protein: 4, carbs: 21, fat: 1, sodium: 200 }),
  subRoll6: n({ calories: 200, protein: 8, carbs: 38, fat: 2, sodium: 400 }),
  pita: n({ calories: 170, protein: 6, carbs: 34, fat: 1, sodium: 350 }),
  tortillaLarge: n({ calories: 300, protein: 8, carbs: 50, fat: 8, sodium: 700 }),
  englishMuffin: n({ calories: 130, protein: 5, carbs: 25, fat: 1, sodium: 230 }),
  biscuit: n({ calories: 240, protein: 4, carbs: 28, fat: 13, sodium: 640 }),
  bagel: n({ calories: 280, protein: 10, carbs: 55, fat: 2, sodium: 450 }),
  naan: n({ calories: 260, protein: 8, carbs: 45, fat: 5, sodium: 480 }),
  riceCup: n({ calories: 210, protein: 4, carbs: 45, fat: 2, sodium: 5 }),
  // Cheese
  cheeseSlice: n({ calories: 50, protein: 3, carbs: 1, fat: 4, sodium: 230 }),
  cheeseShred: n({ calories: 90, protein: 6, carbs: 1, fat: 7, sodium: 180 }),
  feta: n({ calories: 60, protein: 3, carbs: 1, fat: 5, sodium: 240 }),
  // Add-on proteins / toppings
  bacon2: n({ calories: 70, protein: 5, carbs: 0, fat: 6, sodium: 200 }),
  eggFried: n({ calories: 90, protein: 6, carbs: 1, fat: 7, sodium: 90 }),
  avocado: n({ calories: 60, protein: 1, carbs: 3, fat: 6, sodium: 0 }),
  // Sauces
  mayo: n({ calories: 90, protein: 0, carbs: 0, fat: 10, sodium: 90 }),
  ketchup: n({ calories: 20, protein: 0, carbs: 5, fat: 0, sodium: 130 }),
  specialSauce: n({ calories: 90, protein: 0, carbs: 4, fat: 9, sodium: 160 }),
  ranch: n({ calories: 110, protein: 1, carbs: 2, fat: 11, sodium: 200 }),
  bbq: n({ calories: 45, protein: 0, carbs: 11, fat: 0, sodium: 300 }),
  tzatziki: n({ calories: 45, protein: 1, carbs: 2, fat: 4, sodium: 120 }),
  garlicSauce: n({ calories: 120, protein: 0, carbs: 1, fat: 13, sodium: 110 }),
  buffalo: n({ calories: 15, protein: 0, carbs: 1, fat: 1, sodium: 300 }),
  honeyMustard: n({ calories: 90, protein: 0, carbs: 6, fat: 7, sodium: 160 }),
  gravy: n({ calories: 30, protein: 1, carbs: 4, fat: 1, sodium: 350 }),
  // Veg bundles
  vegBurger: n({ calories: 15, protein: 0, carbs: 3, fat: 0, sodium: 90 }),
  lettuce: n({ calories: 5, protein: 0, carbs: 1, fat: 0, sodium: 5 }),
  tomato: n({ calories: 10, protein: 0, carbs: 2, fat: 0, sodium: 0 }),
  onion: n({ calories: 10, protein: 0, carbs: 2, fat: 0, sodium: 0 }),
  pickles: n({ calories: 5, protein: 0, carbs: 1, fat: 0, sodium: 110 }),
  vegShawarma: n({ calories: 25, protein: 1, carbs: 5, fat: 0, sodium: 120 }),
}

/** A part spec: either fixed nutrition, or `core: true` to absorb the remainder. */
export interface PartSpec {
  id: string
  name: string
  /** Fixed reference nutrition (ignored when `core` is true). */
  n?: Nutrition
  /** This part absorbs whatever is left so the set sums to the total. */
  core?: boolean
  /** Can the user toggle it off? Default true (false implied for core). */
  removable?: boolean
  /** Included by default (true) vs optional add-on (false). */
  default?: boolean
}

const FIELDS = ['calories', 'protein', 'carbs', 'fat', 'sodium'] as const

/**
 * Build an exact-summing ingredient breakdown. Exactly one part must be `core`.
 * Default-on, non-core parts use their reference values; the core gets the
 * remainder. Each field is then reconciled so the default-on parts sum EXACTLY
 * to the total: any small residual (from a reference value overshooting a tight
 * field) is absorbed by the largest contributor in that field.
 */
export function buildComponents(
  total: Nutrition,
  parts: PartSpec[],
): IngredientComponent[] {
  const used = parts
    .filter((p) => !p.core && p.default !== false)
    .reduce((acc, p) => add(acc, p.n ?? Z), Z)
  const coreN = subClamp(total, used)

  const built = parts.map((p) => ({
    p,
    nut: { ...(p.core ? coreN : (p.n ?? Z)) } as Nutrition,
  }))

  // Reconcile each field so the default-on parts sum exactly to the total.
  const onParts = built.filter((b) => b.p.default !== false)
  for (const f of FIELDS) {
    if (!onParts.length) break
    let diff =
      Math.round(total[f]) - onParts.reduce((s, b) => s + Math.round(b.nut[f]), 0)
    if (diff > 0) {
      // Undershoot: give it to the largest contributor.
      const target = onParts.reduce((m, b) => (b.nut[f] > m.nut[f] ? b : m), onParts[0])
      target.nut[f] = Math.round(target.nut[f]) + diff
    }
    // Overshoot: take it from the largest contributors in turn until resolved,
    // never pushing any ingredient below zero.
    while (diff < 0) {
      const target = onParts.reduce((m, b) => (b.nut[f] > m.nut[f] ? b : m), onParts[0])
      if (target.nut[f] <= 0) break
      const take = Math.min(target.nut[f], -diff)
      target.nut[f] = Math.round(target.nut[f] - take)
      diff += take
    }
  }

  return built.map((b) => ({
    id: b.p.id,
    name: b.p.name,
    nutrition: b.nut,
    removable: b.p.core ? false : b.p.removable,
    default: b.p.default,
  }))
}

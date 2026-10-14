import {
  type BuilderGroup,
  type BuilderItem,
  type BuilderOption,
  type FixedItem,
  type IngredientComponent,
  type MenuItem,
  type Nutrition,
  ZERO_NUTRITION,
} from '../types'

/**
 * A map of groupId -> selected optionIds for a builder in progress. An id can
 * appear more than once: each repeat is another portion (double chicken).
 */
export type BuilderSelection = Record<string, string[]>

/** A map of componentId -> how many portions are included (0 = left out). */
export type ComponentSelection = Record<string, number>

/** Most portions of a single ingredient or option the customizers allow. */
export const MAX_QUANTITY = 10

/** Is a component included to start with? (default-on unless marked otherwise). */
export function isComponentDefaultOn(c: IngredientComponent): boolean {
  return c.default !== false
}

/** The initial on/off state for a customizable item's ingredients. */
export function defaultComponentSelection(
  components: IngredientComponent[],
): ComponentSelection {
  const sel: ComponentSelection = {}
  for (const c of components) sel[c.id] = isComponentDefaultOn(c) ? 1 : 0
  return sel
}

/** Sum the nutrition of the included ingredients, times their quantities. */
export function totalForComponents(
  components: IngredientComponent[],
  selection: ComponentSelection,
): Nutrition {
  return components.reduce(
    (acc, c) => ((selection[c.id] ?? 0) > 0 ? addNutrition(acc, scaleNutrition(c.nutrition, selection[c.id])) : acc),
    ZERO_NUTRITION,
  )
}

/** Nutrition multiplied by a quantity (two creams = twice one cream). */
export function scaleNutrition(n: Nutrition, k: number): Nutrition {
  return {
    calories: n.calories * k,
    protein: n.protein * k,
    carbs: n.carbs * k,
    fat: n.fat * k,
    sodium: n.sodium * k,
    fiber: (n.fiber ?? 0) * k,
    sugar: (n.sugar ?? 0) * k,
  }
}

/** How many times each option id appears in a builder group's selection. */
export function countSelected(ids: string[]): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const id of ids) counts[id] = (counts[id] ?? 0) + 1
  return counts
}

/**
 * Every item is customizable: builders via their option groups, fixed items
 * via an ingredient breakdown (explicit or generated from a recipe template).
 */
export function isCustomizable(item: MenuItem): item is FixedItem | BuilderItem {
  return item.kind === 'fixed' || item.kind === 'builder'
}

/** Add two nutrition objects field by field. */
export function addNutrition(a: Nutrition, b: Nutrition): Nutrition {
  return {
    calories: a.calories + b.calories,
    protein: a.protein + b.protein,
    carbs: a.carbs + b.carbs,
    fat: a.fat + b.fat,
    sodium: a.sodium + b.sodium,
    fiber: (a.fiber ?? 0) + (b.fiber ?? 0),
    sugar: (a.sugar ?? 0) + (b.sugar ?? 0),
  }
}

/** Look up an option inside a group by id. */
export function findOption(
  group: BuilderGroup,
  optionId: string,
): BuilderOption | undefined {
  return group.options.find((o) => o.id === optionId)
}

/** Sum the nutrition of everything currently selected in a builder. */
export function totalForSelection(
  item: BuilderItem,
  selection: BuilderSelection,
): Nutrition {
  return item.groups.reduce((running, group) => {
    const chosen = selection[group.id] ?? []
    const groupTotal = chosen.reduce((acc, optId) => {
      const opt = findOption(group, optId)
      return opt ? addNutrition(acc, opt.nutrition) : acc
    }, ZERO_NUTRITION)
    return addNutrition(running, groupTotal)
  }, ZERO_NUTRITION)
}

/** Nutrition for any menu item — the fixed profile, or an empty builder sum. */
export function baseNutrition(item: MenuItem): Nutrition {
  if (item.kind === 'fixed') return item.nutrition
  return totalForSelection(item, {})
}

/**
 * The lowest-calorie way to complete a builder: pick the cheapest option in
 * every required group and nothing optional. Useful as a "starting floor".
 */
export function minimalNutrition(item: BuilderItem): Nutrition {
  return item.groups.reduce((running, group) => {
    if (group.min <= 0 || group.options.length === 0) return running
    const cheapest = group.options.reduce((lo, o) =>
      o.nutrition.calories < lo.nutrition.calories ? o : lo,
    )
    return addNutrition(running, cheapest.nutrition)
  }, ZERO_NUTRITION)
}

/** A default selection that satisfies each group's `min` using recommended/first options. */
export function defaultSelection(item: BuilderItem): BuilderSelection {
  const selection: BuilderSelection = {}
  for (const group of item.groups) {
    if (group.min > 0 && group.options.length > 0) {
      const pick =
        group.options.find((o) => o.recommended) ?? group.options[0]
      selection[group.id] = [pick.id]
    } else {
      selection[group.id] = []
    }
  }
  return selection
}

export interface MacroSplit {
  proteinPct: number
  carbsPct: number
  fatPct: number
}

/** Percentage of calories from each macro (4/4/9 kcal per gram). */
export function macroSplit(n: Nutrition): MacroSplit {
  const pCal = n.protein * 4
  const cCal = n.carbs * 4
  const fCal = n.fat * 9
  const total = pCal + cCal + fCal
  if (total <= 0) return { proteinPct: 0, carbsPct: 0, fatPct: 0 }
  return {
    proteinPct: Math.round((pCal / total) * 100),
    carbsPct: Math.round((cCal / total) * 100),
    fatPct: Math.round((fCal / total) * 100),
  }
}

export function formatNumber(n: number): string {
  return Math.round(n).toLocaleString('en-CA')
}

/** Rough per-meal reference used for the "% of a 2,000 cal day" style hints. */
export const DAILY_REFERENCE = {
  calories: 2000,
  sodium: 2300, // mg, Health Canada tolerable upper intake
}

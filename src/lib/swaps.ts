import { type BuilderItem, type BuilderOption } from '../types'
import { type BuilderSelection, findOption } from './nutrition'

export interface SwapSuggestion {
  groupId: string
  groupName: string
  /** The option currently selected that could be swapped out. */
  from: BuilderOption
  /** A lower-calorie option in the same group. */
  to: BuilderOption
  /** Calories saved by making the swap (positive number). */
  caloriesSaved: number
}

/**
 * Scan a builder-in-progress and suggest lower-calorie swaps within each group.
 * For every selected option, we look for the cheapest alternative in the same
 * group and, if it saves a meaningful amount, propose it. Sorted by biggest
 * saving first so the highest-impact change is on top.
 */
export function suggestSwaps(
  item: BuilderItem,
  selection: BuilderSelection,
  minSaving = 40,
): SwapSuggestion[] {
  const suggestions: SwapSuggestion[] = []

  for (const group of item.groups) {
    const chosenIds = selection[group.id] ?? []
    for (const chosenId of chosenIds) {
      const from = findOption(group, chosenId)
      if (!from) continue

      // Cheapest alternative that isn't the current pick.
      const alternatives = group.options.filter((o) => o.id !== from.id)
      if (alternatives.length === 0) continue
      const to = alternatives.reduce((lo, o) =>
        o.nutrition.calories < lo.nutrition.calories ? o : lo,
      )

      const caloriesSaved = from.nutrition.calories - to.nutrition.calories
      if (caloriesSaved >= minSaving) {
        suggestions.push({
          groupId: group.id,
          groupName: group.name,
          from,
          to,
          caloriesSaved,
        })
      }
    }
  }

  return suggestions.sort((a, b) => b.caloriesSaved - a.caloriesSaved)
}

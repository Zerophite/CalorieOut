import { useLocalStorage } from './useLocalStorage'

/** A per-meal target the user sets to filter and flag items. */
export interface Goal {
  maxCalories: number | null
  minProtein: number | null
  /** Whether goal-based highlighting/flagging is active. */
  enabled: boolean
}

const DEFAULT_GOAL: Goal = {
  maxCalories: 700,
  minProtein: 25,
  enabled: false,
}

export function useGoal() {
  return useLocalStorage<Goal>('calorieout:goal', DEFAULT_GOAL)
}

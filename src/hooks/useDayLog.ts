import { useCallback } from 'react'
import { type Nutrition } from '../types'
import { addNutrition } from '../lib/nutrition'
import { ZERO_NUTRITION } from '../types'
import { useLocalStorage } from './useLocalStorage'

/** One item the user has added to their running day total. */
export interface LoggedMeal {
  /** Unique per log entry (so duplicates of the same item can coexist). */
  key: string
  restaurantId: string
  restaurantName: string
  restaurantAccent: string
  itemName: string
  /** e.g. "no bun, extra cheese" or a build summary. */
  detail?: string
  nutrition: Nutrition
}

export interface DayState {
  meals: LoggedMeal[]
  /** The user's daily calorie target (null = not set). */
  calorieGoal: number | null
}

const DEFAULT_DAY: DayState = { meals: [], calorieGoal: 2000 }

export function useDayLog() {
  const [day, setDay] = useLocalStorage<DayState>('calorieout:day', DEFAULT_DAY)

  const addMeal = useCallback(
    (meal: Omit<LoggedMeal, 'key'>) => {
      const entry: LoggedMeal = {
        ...meal,
        key: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      }
      setDay((d) => ({ ...d, meals: [...d.meals, entry] }))
    },
    [setDay],
  )

  const removeMeal = useCallback(
    (key: string) =>
      setDay((d) => ({ ...d, meals: d.meals.filter((m) => m.key !== key) })),
    [setDay],
  )

  const clearDay = useCallback(
    () => setDay((d) => ({ ...d, meals: [] })),
    [setDay],
  )

  const setCalorieGoal = useCallback(
    (goal: number | null) => setDay((d) => ({ ...d, calorieGoal: goal })),
    [setDay],
  )

  const total = day.meals.reduce(
    (acc, m) => addNutrition(acc, m.nutrition),
    ZERO_NUTRITION,
  )

  return { day, total, addMeal, removeMeal, clearDay, setCalorieGoal }
}

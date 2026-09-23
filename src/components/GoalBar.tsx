import { type Goal } from '../hooks/useGoal'

interface Props {
  goal: Goal
  setGoal: (next: Goal | ((prev: Goal) => Goal)) => void
}

/** Compact control for the per-meal goal (max calories, min protein). */
export function GoalBar({ goal, setGoal }: Props) {
  return (
    <div className="rounded-2xl border border-app bg-surface p-3">
      <div className="flex flex-wrap items-center gap-3">
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold">
          <input
            type="checkbox"
            checked={goal.enabled}
            onChange={(e) =>
              setGoal((g) => ({ ...g, enabled: e.target.checked }))
            }
            className="h-4 w-4 accent-[var(--brand)]"
          />
          Meal goal
        </label>

        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted">≤</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            step={50}
            value={goal.maxCalories ?? ''}
            onChange={(e) =>
              setGoal((g) => ({
                ...g,
                maxCalories: e.target.value === '' ? null : Number(e.target.value),
              }))
            }
            className="w-20 rounded-lg border border-app bg-surface-2 px-2 py-1 text-body"
            placeholder="cal"
          />
          <span className="text-muted">cal</span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted">≥</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            step={5}
            value={goal.minProtein ?? ''}
            onChange={(e) =>
              setGoal((g) => ({
                ...g,
                minProtein: e.target.value === '' ? null : Number(e.target.value),
              }))
            }
            className="w-20 rounded-lg border border-app bg-surface-2 px-2 py-1 text-body"
            placeholder="protein"
          />
          <span className="text-muted">g protein</span>
        </div>
      </div>
      {goal.enabled && (
        <p className="mt-2 text-xs text-muted">
          Items that fit get a ✓; ones that miss are flagged. Builder totals
          update live against this goal.
        </p>
      )}
    </div>
  )
}

import { type DayState, type LoggedMeal } from '../hooks/useDayLog'
import { type Nutrition } from '../types'
import { formatNumber } from '../lib/nutrition'
import { MacroBar, MacroLegend } from '../components/MacroBar'
import { BrandTile } from '../components/ui'
import { IconFlame, IconPlus, IconTrash } from '../components/icons'

interface Props {
  day: DayState
  total: Nutrition
  onRemove: (key: string) => void
  onClear: () => void
  onSetGoal: (goal: number | null) => void
  onBrowse: () => void
}

export function DayView({
  day,
  total,
  onRemove,
  onClear,
  onSetGoal,
  onBrowse,
}: Props) {
  const goal = day.calorieGoal
  const pct = goal ? Math.min(100, Math.round((total.calories / goal) * 100)) : 0
  const remaining = goal ? goal - total.calories : null
  const over = remaining !== null && remaining < 0

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="mb-1 text-2xl font-black text-body">My Day</h1>
      <p className="mb-5 text-sm text-muted">
        Everything you add here stays until you clear it — your running total for
        the day.
      </p>

      {/* Summary card */}
      <div className="rounded-2xl border border-app bg-surface p-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-sm font-semibold text-muted">
              <IconFlame size={16} /> Calories today
            </div>
            <div className="mt-1 text-4xl font-black text-body">
              {formatNumber(total.calories)}
              {goal && (
                <span className="ml-1 text-lg font-medium text-muted">
                  / {formatNumber(goal)}
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <label className="block text-xs font-medium text-muted">
              Daily goal
            </label>
            <input
              type="number"
              inputMode="numeric"
              step={50}
              value={goal ?? ''}
              onChange={(e) =>
                onSetGoal(e.target.value === '' ? null : Number(e.target.value))
              }
              className="mt-1 w-24 rounded-lg border border-app bg-surface-2 px-2 py-1 text-right text-body"
              placeholder="cal"
            />
          </div>
        </div>

        {goal !== null && (
          <>
            <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-surface-2">
              <div
                className="h-full rounded-full transition-[width]"
                style={{
                  width: `${pct}%`,
                  background: over ? 'var(--fat)' : 'var(--brand)',
                }}
              />
            </div>
            <div className="mt-1.5 text-sm font-medium">
              {over ? (
                <span className="text-red-500">
                  {formatNumber(Math.abs(remaining!))} cal over your goal
                </span>
              ) : (
                <span className="text-muted">
                  {formatNumber(remaining!)} cal remaining
                </span>
              )}
            </div>
          </>
        )}

        <div className="mt-4">
          <MacroBar nutrition={total} />
          <div className="mt-2 flex items-center justify-between">
            <MacroLegend />
            <div className="text-xs text-muted">
              P {formatNumber(total.protein)}g · C {formatNumber(total.carbs)}g ·
              F {formatNumber(total.fat)}g · {formatNumber(total.sodium)}mg Na
            </div>
          </div>
        </div>
      </div>

      {/* Meal list */}
      {day.meals.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-app bg-surface p-10 text-center">
          <p className="text-muted">
            Nothing logged yet. Open any item and tap “Add to my day.”
          </p>
          <button
            onClick={onBrowse}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[var(--brand)] px-4 py-2 font-semibold text-white"
          >
            <IconPlus size={16} /> Browse restaurants
          </button>
        </div>
      ) : (
        <>
          <div className="mt-6 mb-2 flex items-center justify-between">
            <h2 className="font-bold text-body">
              {day.meals.length} item{day.meals.length === 1 ? '' : 's'}
            </h2>
            <button
              onClick={onClear}
              className="inline-flex items-center gap-1.5 rounded-lg border border-app bg-surface px-3 py-1.5 text-sm font-semibold text-muted hover:bg-surface-2"
            >
              <IconTrash size={15} /> Clear day
            </button>
          </div>
          <ul className="space-y-2">
            {day.meals.map((m) => (
              <MealRow key={m.key} meal={m} onRemove={() => onRemove(m.key)} />
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

function MealRow({
  meal,
  onRemove,
}: {
  meal: LoggedMeal
  onRemove: () => void
}) {
  return (
    <li className="flex items-center gap-3 rounded-xl border border-app bg-surface p-3">
      <BrandTile name={meal.restaurantName} accent={meal.restaurantAccent} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="truncate font-semibold text-body">{meal.itemName}</div>
        <div className="truncate text-xs text-muted">
          {meal.restaurantName}
          {meal.detail ? ` · ${meal.detail}` : ''}
        </div>
      </div>
      <div className="shrink-0 text-right">
        <div className="font-bold text-body">
          {formatNumber(meal.nutrition.calories)}
          <span className="text-xs font-normal text-muted"> cal</span>
        </div>
        <div className="text-[11px] text-muted">
          P {formatNumber(meal.nutrition.protein)} · C{' '}
          {formatNumber(meal.nutrition.carbs)} · F {formatNumber(meal.nutrition.fat)}
        </div>
      </div>
      <button
        onClick={onRemove}
        aria-label="Remove"
        className="shrink-0 rounded-lg p-1.5 text-muted hover:bg-surface-2 hover:text-red-500"
      >
        <IconTrash size={16} />
      </button>
    </li>
  )
}

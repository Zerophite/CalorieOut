import { useMemo, useState } from 'react'
import { type FixedItem, type IngredientComponent, type Nutrition } from '../types'
import {
  type ComponentSelection,
  defaultComponentSelection,
  formatNumber,
  isComponentDefaultOn,
  totalForComponents,
} from '../lib/nutrition'
import { type Goal } from '../hooks/useGoal'
import { componentsFor } from '../data/templates'
import { NutritionFacts } from './NutritionFacts'
import { GoalFitBadge, evaluateGoal } from './ui'
import { IconCheck, IconPlus } from './icons'

interface Props {
  item: FixedItem
  goal: Goal
  onAddToDay: (nutrition: Nutrition, detail: string) => void
  onAddToCompare: (nutrition: Nutrition, detail: string) => void
}

/**
 * Size-aware wrapper: when an item comes in sizes, show size chips and run the
 * ingredient customizer for the chosen size (selection resets per size).
 */
export function FixedCustomizer(props: Props) {
  const { item } = props
  const sizes = item.sizes && item.sizes.length > 1 ? item.sizes : null
  const initial = sizes ? Math.max(0, sizes.findIndex((s) => s.label === item.defaultSize)) : 0
  const [sizeIdx, setSizeIdx] = useState(initial)

  if (!sizes) return <SizedCustomizer {...props} sizeLabel={null} />

  const size = sizes[sizeIdx]
  const sizedItem: FixedItem = {
    ...item,
    nutrition: size.nutrition,
    components: size.components,
    sizes: undefined,
  }
  return (
    <div className="space-y-4">
      <section>
        <h3 className="mb-2 font-bold text-body">Size</h3>
        <div className="flex flex-wrap gap-2">
          {sizes.map((s, i) => (
            <button
              key={s.label}
              onClick={() => setSizeIdx(i)}
              className={
                'rounded-xl border px-3 py-2 text-left text-sm transition-colors ' +
                (i === sizeIdx
                  ? 'border-[var(--brand)] bg-emerald-500/10 font-semibold text-body'
                  : 'border-app bg-surface text-muted hover:bg-surface-2')
              }
            >
              {s.label}
              <span className="ml-1.5 text-xs text-muted">{formatNumber(s.nutrition.calories)} cal</span>
            </button>
          ))}
        </div>
      </section>
      <SizedCustomizer key={size.label} {...props} item={sizedItem} sizeLabel={size.label} />
    </div>
  )
}

function SizedCustomizer({
  item,
  goal,
  onAddToDay,
  onAddToCompare,
  sizeLabel,
}: Props & { sizeLabel: string | null }) {
  const components = useMemo(() => componentsFor(item), [item])
  const [selection, setSelection] = useState<ComponentSelection>(() =>
    defaultComponentSelection(components),
  )
  const [added, setAdded] = useState(false)

  const total = useMemo(
    () => totalForComponents(components, selection),
    [components, selection],
  )
  const fit = evaluateGoal(total, goal)

  const included = components.filter((c) => isComponentDefaultOn(c))
  const extras = components.filter((c) => !isComponentDefaultOn(c))

  function toggle(c: IngredientComponent) {
    if (c.removable === false) return
    setSelection((s) => ({ ...s, [c.id]: !s[c.id] }))
  }

  const detail = useMemo(() => {
    const removed = included
      .filter((c) => !selection[c.id])
      .map((c) => `no ${c.name.toLowerCase()}`)
    const addedExtras = extras
      .filter((c) => selection[c.id])
      .map((c) => `+${c.name.toLowerCase()}`)
    return [...(sizeLabel ? [sizeLabel] : []), ...removed, ...addedExtras].join(', ')
  }, [included, extras, selection, sizeLabel])

  function handleAddToDay() {
    onAddToDay(total, detail)
    setAdded(true)
    setTimeout(() => setAdded(false), 1600)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="space-y-5 pb-4">
        <section>
          <h3 className="mb-1 font-bold text-body">Customize ingredients</h3>
          <p className="mb-3 text-sm text-muted">
            Tap to remove what you don't want — the total updates instantly.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {included.map((c) => {
              const on = selection[c.id]
              const locked = c.removable === false
              return (
                <button
                  key={c.id}
                  onClick={() => toggle(c)}
                  disabled={locked}
                  className={
                    'flex items-center justify-between rounded-xl border p-3 text-left transition-colors ' +
                    (locked
                      ? 'cursor-default border-app bg-surface-2 opacity-70'
                      : on
                        ? 'border-[var(--brand)] bg-emerald-500/10'
                        : 'border-app bg-surface opacity-60 hover:opacity-100')
                  }
                >
                  <span className="flex items-center gap-2">
                    <span
                      className={
                        'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ' +
                        (on
                          ? 'border-[var(--brand)] bg-[var(--brand)] text-white'
                          : 'border-app text-transparent')
                      }
                    >
                      <IconCheck size={13} />
                    </span>
                    <span
                      className={
                        'font-medium ' + (on ? 'text-body' : 'text-muted line-through')
                      }
                    >
                      {c.name}
                    </span>
                    {locked && (
                      <span className="text-[10px] uppercase tracking-wide text-muted">
                        core
                      </span>
                    )}
                  </span>
                  <span className="shrink-0 pl-2 text-sm text-muted">
                    {on ? '' : '−'}
                    {formatNumber(c.nutrition.calories)}
                    <span className="text-[10px]"> cal</span>
                  </span>
                </button>
              )
            })}
          </div>
        </section>

        {extras.length > 0 && (
          <section>
            <h3 className="mb-2 font-bold text-body">Add extras</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {extras.map((c) => {
                const on = selection[c.id]
                return (
                  <button
                    key={c.id}
                    onClick={() => toggle(c)}
                    className={
                      'flex items-center justify-between rounded-xl border p-3 text-left transition-colors ' +
                      (on
                        ? 'border-[var(--brand)] bg-emerald-500/10'
                        : 'border-app bg-surface hover:bg-surface-2')
                    }
                  >
                    <span className="flex items-center gap-2 font-medium text-body">
                      <span className="text-[var(--brand)]">
                        {on ? <IconCheck size={16} /> : <IconPlus size={16} />}
                      </span>
                      {c.name}
                    </span>
                    <span className="shrink-0 pl-2 text-sm text-muted">
                      +{formatNumber(c.nutrition.calories)}
                      <span className="text-[10px]"> cal</span>
                    </span>
                  </button>
                )
              })}
            </div>
          </section>
        )}

        <p className="text-xs text-muted">
          Ingredient-level values are approximate splits of the published total.
        </p>
      </div>

      {/* Live total */}
      <div className="lg:sticky lg:top-20 lg:self-start">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-semibold text-muted">Your order</span>
          <GoalFitBadge fit={fit} />
        </div>
        <NutritionFacts nutrition={total} showDailyHints />
        <button
          onClick={handleAddToDay}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--brand)] px-3 py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-brand-dark)]"
        >
          {added ? <IconCheck size={16} /> : <IconPlus size={16} />}
          {added ? 'Added to your day' : 'Add to my day'}
        </button>
        <button
          onClick={() => onAddToCompare(total, detail)}
          className="mt-2 w-full rounded-xl border border-app bg-surface px-3 py-2.5 text-sm font-semibold text-body hover:bg-surface-2"
        >
          Add to compare
        </button>
      </div>
    </div>
  )
}

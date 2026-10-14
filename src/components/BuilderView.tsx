import { useMemo, useState } from 'react'
import { type BuilderItem, type Nutrition } from '../types'
import {
  type BuilderSelection,
  MAX_QUANTITY,
  countSelected,
  defaultSelection,
  formatNumber,
  totalForSelection,
} from '../lib/nutrition'
import { suggestSwaps } from '../lib/swaps'
import { type Goal } from '../hooks/useGoal'
import { NutritionFacts } from './NutritionFacts'
import { GoalFitBadge, QuantityStepper, TagChip, evaluateGoal } from './ui'
import { IconCheck, IconLeaf, IconPlus } from './icons'

interface Props {
  item: BuilderItem
  goal: Goal
  onAddToCompare: (nutrition: Nutrition, detail: string) => void
  onAddToDay: (nutrition: Nutrition, detail: string) => void
}

export function BuilderView({ item, goal, onAddToCompare, onAddToDay }: Props) {
  const [selection, setSelection] = useState<BuilderSelection>(() =>
    defaultSelection(item),
  )
  const [added, setAdded] = useState(false)

  const total = useMemo(
    () => totalForSelection(item, selection),
    [item, selection],
  )
  const swaps = useMemo(
    () => suggestSwaps(item, selection),
    [item, selection],
  )
  const fit = evaluateGoal(total, goal)

  /** Set how many portions of an option are in a group (single-choice groups replace the pick). */
  function setCount(groupId: string, optionId: string, n: number, single: boolean) {
    setSelection((prev) => {
      const current = prev[groupId] ?? []
      const others = single ? [] : current.filter((id) => id !== optionId)
      const k = Math.max(0, Math.min(MAX_QUANTITY, n))
      return { ...prev, [groupId]: [...others, ...Array(k).fill(optionId)] }
    })
  }

  function applySwap(groupId: string, fromId: string, toId: string) {
    setSelection((prev) => {
      const current = prev[groupId] ?? []
      return {
        ...prev,
        [groupId]: current.map((id) => (id === fromId ? toId : id)),
      }
    })
  }

  const detailLabel = item.groups
    .flatMap((g) =>
      Object.entries(countSelected(selection[g.id] ?? [])).map(([id, n]) => {
        const name = g.options.find((o) => o.id === id)?.name
        return name && (n > 1 ? `${name} ×${n}` : name)
      }),
    )
    .filter(Boolean)
    .join(', ')

  function handleAddToDay() {
    onAddToDay(total, detailLabel)
    setAdded(true)
    setTimeout(() => setAdded(false), 1600)
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      {/* Option groups */}
      <div className="space-y-6 pb-40 lg:pb-6">
        {item.groups.map((group) => {
          const counts = countSelected(selection[group.id] ?? [])
          const single = group.max === 1
          return (
            <section key={group.id}>
              <div className="mb-2 flex items-baseline justify-between gap-2">
                <h3 className="font-bold text-body">{group.name}</h3>
                <span className="text-right text-xs text-muted">
                  {group.min > 0 ? 'Pick · tap again to skip' : 'Optional'}
                  {single ? ' · choose one' : ' · add as many as you like'}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {group.options.map((opt) => {
                  const n = counts[opt.id] ?? 0
                  const active = n > 0
                  return (
                    <div
                      key={opt.id}
                      className={
                        'flex items-center justify-between gap-2 rounded-xl border p-2 pl-3 transition-colors ' +
                        (active ? 'border-[var(--brand)] bg-emerald-500/10' : 'border-app bg-surface hover:bg-surface-2')
                      }
                    >
                      <button
                        type="button"
                        onClick={() => setCount(group.id, opt.id, active ? 0 : 1, single)}
                        className="min-w-0 flex-1 py-1 text-left"
                      >
                        <span className="flex items-center gap-2">
                          <span
                            className={
                              'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[10px] ' +
                              (active ? 'border-[var(--brand)] bg-[var(--brand)] text-white' : 'border-app')
                            }
                          >
                            {active ? '✓' : ''}
                          </span>
                          <span className="truncate font-medium text-body">{opt.name}</span>
                          {opt.recommended && (
                            <span className="shrink-0 rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                              light pick
                            </span>
                          )}
                        </span>
                        <span className="mt-0.5 block pl-6 text-xs text-muted">
                          {opt.nutrition.calories > 0 ? `+${formatNumber(opt.nutrition.calories)}` : '0'} cal
                          {n > 1 && <span className="font-semibold text-body"> · ×{n} = {formatNumber(opt.nutrition.calories * n)} cal</span>}
                        </span>
                        {opt.tags && opt.tags.length > 0 && (
                          <span className="mt-1 flex flex-wrap gap-1 pl-6">
                            {opt.tags.map((t) => (
                              <TagChip key={t} tag={t} />
                            ))}
                          </span>
                        )}
                      </button>
                      {(active || !single) && (
                        <QuantityStepper
                          value={n}
                          max={MAX_QUANTITY}
                          label={opt.name}
                          onChange={(v) => setCount(group.id, opt.id, v, single)}
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            </section>
          )
        })}

        {/* Smart swaps */}
        {swaps.length > 0 && (
          <section className="rounded-2xl border border-app bg-surface-2 p-4">
            <h3 className="mb-1 flex items-center gap-1.5 font-bold text-body">
              <IconLeaf className="h-4 w-4 text-[var(--brand)]" />
              Smart swaps
            </h3>
            <p className="mb-3 text-sm text-muted">
              Small changes to trim calories from your current build:
            </p>
            <div className="space-y-2">
              {swaps.slice(0, 4).map((s) => (
                <div
                  key={`${s.groupId}-${s.from.id}`}
                  className="flex items-center justify-between gap-3 rounded-xl bg-surface p-3"
                >
                  <div className="min-w-0 text-sm">
                    <span className="text-muted">{s.from.name}</span>
                    <span className="mx-1.5 text-muted">→</span>
                    <span className="font-semibold text-body">{s.to.name}</span>
                    <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      saves {formatNumber(s.caloriesSaved)} cal
                    </div>
                  </div>
                  <button
                    onClick={() => applySwap(s.groupId, s.from.id, s.to.id)}
                    className="shrink-0 rounded-lg border border-app bg-surface px-3 py-1.5 text-sm font-semibold text-body hover:bg-surface-2"
                  >
                    Swap
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Live total — sticky on desktop, fixed bottom bar on mobile */}
      <div className="lg:sticky lg:top-20 lg:self-start">
        <div className="hidden lg:block">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-muted">
              Your build
            </span>
            <GoalFitBadge fit={fit} />
          </div>
          <NutritionFacts nutrition={total} showDailyHints />
          <button
            onClick={handleAddToDay}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--brand)] px-3 py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-brand-dark)]"
          >
            {added ? <IconCheck size={16} /> : <IconPlus size={16} />}
            {added ? 'Added to your day' : 'Add this build to my day'}
          </button>
          <button
            onClick={() => onAddToCompare(total, detailLabel)}
            className="mt-2 w-full rounded-xl border border-app bg-surface px-3 py-2.5 text-sm font-semibold text-body hover:bg-surface-2"
          >
            Add to compare
          </button>
        </div>
      </div>

      {/* Mobile sticky total */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-app bg-surface p-4 lg:hidden">
        <div className="mb-2 flex items-center justify-between">
          <div>
            <div className="text-2xl font-black text-body">
              {formatNumber(total.calories)}{' '}
              <span className="text-sm font-medium text-muted">cal</span>
            </div>
            <div className="text-xs text-muted">
              P {formatNumber(total.protein)}g · C {formatNumber(total.carbs)}g ·
              F {formatNumber(total.fat)}g
            </div>
          </div>
          <GoalFitBadge fit={fit} />
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleAddToDay}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--brand)] px-3 py-2.5 text-sm font-semibold text-white"
          >
            {added ? <IconCheck size={16} /> : <IconPlus size={16} />}
            {added ? 'Added' : 'Add to my day'}
          </button>
          <button
            onClick={() => onAddToCompare(total, detailLabel)}
            className="rounded-xl border border-app bg-surface px-3 py-2.5 text-sm font-semibold text-body"
          >
            Compare
          </button>
        </div>
      </div>
    </div>
  )
}

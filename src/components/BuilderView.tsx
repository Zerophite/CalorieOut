import { useMemo, useState } from 'react'
import { type BuilderItem, type Nutrition } from '../types'
import {
  type BuilderSelection,
  defaultSelection,
  formatNumber,
  totalForSelection,
} from '../lib/nutrition'
import { suggestSwaps } from '../lib/swaps'
import { type Goal } from '../hooks/useGoal'
import { NutritionFacts } from './NutritionFacts'
import { GoalFitBadge, TagChip, evaluateGoal } from './ui'
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

  function toggle(groupId: string, optionId: string, max?: number) {
    setSelection((prev) => {
      const current = prev[groupId] ?? []
      const has = current.includes(optionId)
      let next: string[]
      if (has) {
        next = current.filter((id) => id !== optionId)
      } else if (max === 1) {
        next = [optionId]
      } else if (max !== undefined && current.length >= max) {
        // At capacity for a multi-select: replace the oldest pick.
        next = [...current.slice(1), optionId]
      } else {
        next = [...current, optionId]
      }
      return { ...prev, [groupId]: next }
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
    .flatMap((g) => (selection[g.id] ?? []).map((id) => g.options.find((o) => o.id === id)?.name))
    .filter(Boolean)
    .join(', ')

  function handleAddToDay() {
    onAddToDay(total, detailLabel)
    setAdded(true)
    setTimeout(() => setAdded(false), 1600)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      {/* Option groups */}
      <div className="space-y-6 pb-40 lg:pb-6">
        {item.groups.map((group) => {
          const chosen = selection[group.id] ?? []
          return (
            <section key={group.id}>
              <div className="mb-2 flex items-baseline justify-between">
                <h3 className="font-bold text-body">{group.name}</h3>
                <span className="text-xs text-muted">
                  {group.min > 0 ? 'Required' : 'Optional'}
                  {group.max ? ` · up to ${group.max}` : ''}
                </span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {group.options.map((opt) => {
                  const active = chosen.includes(opt.id)
                  return (
                    <button
                      key={opt.id}
                      onClick={() => toggle(group.id, opt.id, group.max)}
                      className={
                        'flex items-center justify-between rounded-xl border p-3 text-left transition-colors ' +
                        (active
                          ? 'border-[var(--brand)] bg-emerald-500/10'
                          : 'border-app bg-surface hover:bg-surface-2')
                      }
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={
                              'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[10px] ' +
                              (active
                                ? 'border-[var(--brand)] bg-[var(--brand)] text-white'
                                : 'border-app')
                            }
                          >
                            {active ? '✓' : ''}
                          </span>
                          <span className="truncate font-medium text-body">
                            {opt.name}
                          </span>
                          {opt.recommended && (
                            <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                              light pick
                            </span>
                          )}
                        </div>
                        {opt.tags && opt.tags.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1 pl-6">
                            {opt.tags.map((t) => (
                              <TagChip key={t} tag={t} />
                            ))}
                          </div>
                        )}
                      </div>
                      <span className="shrink-0 pl-2 text-right text-sm text-muted">
                        {opt.nutrition.calories > 0
                          ? `+${formatNumber(opt.nutrition.calories)}`
                          : '0'}
                        <span className="block text-[10px]">cal</span>
                      </span>
                    </button>
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

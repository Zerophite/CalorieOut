import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { getRestaurant } from './data'
import { type MenuItem, type Nutrition, type Restaurant } from './types'
import { type CompareEntry, type View } from './app-types'
import { useGoal } from './hooks/useGoal'
import { useLocalStorage } from './hooks/useLocalStorage'
import { useDayLog } from './hooks/useDayLog'
import { useSwipeBack } from './hooks/useSwipeBack'
import { useMenu } from './hooks/useMenu'
import { MenuLoading } from './components/ui'
import { formatNumber } from './lib/nutrition'
import { Home } from './views/Home'
import { RestaurantView } from './views/RestaurantView'
import { ItemView } from './views/ItemView'
import { SearchView } from './views/SearchView'
import { CompareView } from './views/CompareView'
import { DayView } from './views/DayView'
import {
  IconBack,
  IconCompare,
  IconDay,
  IconFlame,
  IconSearch,
} from './components/icons'

export default function App() {
  const [history, setHistory] = useState<View[]>([{ name: 'home' }])
  const view = history[history.length - 1]
  const [goal, setGoal] = useGoal()
  const [compare, setCompare] = useLocalStorage<CompareEntry[]>(
    'calorieout:compare',
    [],
  )
  const { day, total: dayTotal, addMeal, removeMeal, clearDay, setCalorieGoal } =
    useDayLog()

  // Scroll position of every screen in the history, so Back returns to the
  // same spot (e.g. halfway down the restaurant list) instead of the top.
  const scrollStack = useRef<number[]>([])
  const pendingScroll = useRef<number | null>(null)

  const navigate = useCallback((next: View) => {
    setHistory((h) => {
      scrollStack.current[h.length - 1] = window.scrollY
      return [...h, next]
    })
    pendingScroll.current = 0
  }, [])

  const back = useCallback(() => {
    setHistory((h) => {
      if (h.length <= 1) return h
      pendingScroll.current = scrollStack.current[h.length - 2] ?? 0
      scrollStack.current.length = h.length - 1
      return h.slice(0, -1)
    })
  }, [])

  const goHome = useCallback(() => {
    setHistory([{ name: 'home' }])
    scrollStack.current = []
    pendingScroll.current = 0
  }, [])

  // Restore (or reset) the scroll position after the new screen renders. Lazy
  // menus may still be growing the page, so keep trying briefly until it fits.
  useLayoutEffect(() => {
    const target = pendingScroll.current
    if (target === null) return
    pendingScroll.current = null
    let tries = 0
    const apply = () => {
      window.scrollTo(0, target)
      if (Math.abs(window.scrollY - target) > 2 && tries++ < 30) requestAnimationFrame(apply)
    }
    apply()
  }, [history])

  // Drag the screen down (at the top of the page) or press Escape to go back.
  const screenRef = useRef<HTMLElement>(null)
  useSwipeBack(back, history.length > 1, screenRef)

  const isInCompare = useCallback(
    (key: string) => compare.some((e) => e.key === key),
    [compare],
  )

  const toggleCompare = useCallback(
    (
      restaurant: Restaurant,
      item: MenuItem,
      nutrition: Nutrition,
      detail?: string,
    ) => {
      // Builders / customized items get a unique key so variants can coexist.
      const key =
        item.kind === 'builder' || detail
          ? `${restaurant.id}:${item.id}:${Date.now()}`
          : `${restaurant.id}:${item.id}`
      setCompare((prev) => {
        if (item.kind === 'fixed' && !detail && prev.some((e) => e.key === key)) {
          return prev.filter((e) => e.key !== key)
        }
        const entry: CompareEntry = {
          key,
          restaurantName: restaurant.name,
          restaurantAccent: restaurant.accent,
          itemName: item.name,
          detail: detail ?? (item.kind === 'fixed' ? item.serving : undefined),
          nutrition,
        }
        return [...prev, entry].slice(-4) // cap at 4 for a readable table
      })
    },
    [setCompare],
  )

  const removeCompare = useCallback(
    (key: string) => setCompare((prev) => prev.filter((e) => e.key !== key)),
    [setCompare],
  )

  const addToDay = useCallback(
    (
      restaurant: Restaurant,
      item: MenuItem,
      nutrition: Nutrition,
      detail?: string,
    ) => {
      addMeal({
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        restaurantAccent: restaurant.accent,
        itemName: item.name,
        detail: detail || (item.kind === 'fixed' ? item.serving : undefined),
        nutrition,
      })
    },
    [addMeal],
  )

  const restaurant =
    view.name === 'restaurant' || view.name === 'item'
      ? getRestaurant(view.restaurantId)
      : undefined
  const menu = useMenu(view.name === 'item' ? restaurant : undefined)
  const item =
    view.name === 'item' && menu ? menu.find((i) => i.id === view.itemId) : undefined
  const itemLoading = view.name === 'item' && !!restaurant && !menu

  return (
    <div className="min-h-full bg-app">
      <Header
        canGoBack={history.length > 1}
        onBack={back}
        onHome={goHome}
        onSearch={() => navigate({ name: 'search' })}
        onCompare={() => navigate({ name: 'compare' })}
        onDay={() => navigate({ name: 'day' })}
        compareCount={compare.length}
        dayCalories={dayTotal.calories}
        dayCount={day.meals.length}
      />

      <main ref={screenRef} key={history.length} className="animate-screen-in">
        {history.length > 1 && (
          <div className="flex flex-col items-center pt-2 sm:hidden">
            <div className="h-1 w-10 rounded-full bg-[var(--border)]" />
            <span className="mt-1 text-[11px] text-muted">
              Pull down to go back
            </span>
          </div>
        )}

        {view.name === 'home' && (
          <Home
            onOpenRestaurant={(id) =>
              navigate({ name: 'restaurant', restaurantId: id })
            }
            onOpenSearch={() => navigate({ name: 'search' })}
            onOpenDay={() => navigate({ name: 'day' })}
            dayCalories={dayTotal.calories}
            dayGoal={day.calorieGoal}
          />
        )}

        {view.name === 'restaurant' &&
          (restaurant ? (
            <RestaurantView
              restaurant={restaurant}
              goal={goal}
              setGoal={setGoal}
              onOpenItem={(itemId) =>
                navigate({
                  name: 'item',
                  restaurantId: restaurant.id,
                  itemId,
                })
              }
              isInCompare={isInCompare}
              toggleCompare={toggleCompare}
              addToDay={addToDay}
            />
          ) : (
            <NotFound onHome={goHome} />
          ))}

        {view.name === 'item' &&
          (restaurant && item ? (
            <ItemView
              restaurant={restaurant}
              item={item}
              goal={goal}
              isInCompare={isInCompare}
              toggleCompare={toggleCompare}
              addToDay={addToDay}
            />
          ) : itemLoading ? (
            <MenuLoading />
          ) : (
            <NotFound onHome={goHome} />
          ))}

        {view.name === 'search' && (
          <SearchView
            goal={goal}
            onOpenItem={(restaurantId, itemId) =>
              navigate({ name: 'item', restaurantId, itemId })
            }
            isInCompare={isInCompare}
            toggleCompare={toggleCompare}
            addToDay={addToDay}
          />
        )}

        {view.name === 'compare' && (
          <CompareView
            entries={compare}
            onRemove={removeCompare}
            onClear={() => setCompare([])}
            onBrowse={goHome}
          />
        )}

        {view.name === 'day' && (
          <DayView
            day={day}
            total={dayTotal}
            onRemove={removeMeal}
            onClear={clearDay}
            onSetGoal={setCalorieGoal}
            onBrowse={goHome}
          />
        )}
      </main>
    </div>
  )
}

function HeaderButton({
  onClick,
  icon,
  label,
  badge,
}: {
  onClick: () => void
  icon: React.ReactNode
  label: string
  badge?: number
}) {
  return (
    <button
      onClick={onClick}
      className="relative flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-body hover:bg-surface-2"
    >
      {icon}
      <span className="hidden text-sm font-medium sm:inline">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--brand)] px-1 text-[10px] font-bold text-white">
          {badge}
        </span>
      )}
    </button>
  )
}

function Header({
  canGoBack,
  onBack,
  onHome,
  onSearch,
  onCompare,
  onDay,
  compareCount,
  dayCalories,
  dayCount,
}: {
  canGoBack: boolean
  onBack: () => void
  onHome: () => void
  onSearch: () => void
  onCompare: () => void
  onDay: () => void
  compareCount: number
  dayCalories: number
  dayCount: number
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-app bg-surface/85 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center gap-1 px-3 py-2.5 sm:px-4">
        {canGoBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-body hover:bg-surface-2"
            aria-label="Back"
          >
            <IconBack size={18} />
          </button>
        )}
        <button
          onClick={onHome}
          className="mr-auto flex items-center gap-2 font-black text-body"
        >
          <span
            className="flex h-8 w-8 items-center justify-center rounded-xl text-white"
            style={{ background: 'var(--brand)' }}
          >
            <IconFlame size={18} />
          </span>
          <span className="text-lg tracking-tight">CalorieOut</span>
        </button>

        {/* Day total pill */}
        <button
          onClick={onDay}
          className="mr-1 flex items-center gap-1.5 rounded-full border border-app bg-surface-2 px-2.5 py-1 text-sm font-semibold text-body hover:bg-surface"
          title="My Day"
        >
          <IconFlame size={15} />
          {formatNumber(dayCalories)}
          <span className="hidden text-xs font-normal text-muted sm:inline">
            cal today
          </span>
        </button>

        <HeaderButton onClick={onSearch} icon={<IconSearch size={18} />} label="Search dishes" />
        <HeaderButton
          onClick={onCompare}
          icon={<IconCompare size={18} />}
          label="Compare"
          badge={compareCount}
        />
        <HeaderButton
          onClick={onDay}
          icon={<IconDay size={18} />}
          label="My Day"
          badge={dayCount}
        />
      </div>
    </header>
  )
}

function NotFound({ onHome }: { onHome: () => void }) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 text-center">
      <p className="text-muted">That page could not be found.</p>
      <button
        onClick={onHome}
        className="mt-4 rounded-xl bg-[var(--brand)] px-4 py-2 font-semibold text-white"
      >
        Go home
      </button>
    </div>
  )
}

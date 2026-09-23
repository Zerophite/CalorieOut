import { useCallback, useState } from 'react'
import { getRestaurant } from './data'
import { type MenuItem, type Nutrition, type Restaurant } from './types'
import { type CompareEntry, type View } from './app-types'
import { useGoal } from './hooks/useGoal'
import { useLocalStorage } from './hooks/useLocalStorage'
import { Home } from './views/Home'
import { RestaurantView } from './views/RestaurantView'
import { ItemView } from './views/ItemView'
import { SearchView } from './views/SearchView'
import { CompareView } from './views/CompareView'

export default function App() {
  const [history, setHistory] = useState<View[]>([{ name: 'home' }])
  const view = history[history.length - 1]
  const [goal, setGoal] = useGoal()
  const [compare, setCompare] = useLocalStorage<CompareEntry[]>(
    'calorieout:compare',
    [],
  )

  const navigate = useCallback((next: View) => {
    setHistory((h) => [...h, next])
    window.scrollTo(0, 0)
  }, [])

  const back = useCallback(() => {
    setHistory((h) => (h.length > 1 ? h.slice(0, -1) : h))
    window.scrollTo(0, 0)
  }, [])

  const goHome = useCallback(() => {
    setHistory([{ name: 'home' }])
    window.scrollTo(0, 0)
  }, [])

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
      // Builders get a unique key per build so several builds can coexist.
      const key =
        item.kind === 'builder'
          ? `${restaurant.id}:${item.id}:${Date.now()}`
          : `${restaurant.id}:${item.id}`
      setCompare((prev) => {
        if (item.kind === 'fixed' && prev.some((e) => e.key === key)) {
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

  const restaurant =
    view.name === 'restaurant' || view.name === 'item'
      ? getRestaurant(view.restaurantId)
      : undefined
  const item =
    view.name === 'item' && restaurant
      ? restaurant.items.find((i) => i.id === view.itemId)
      : undefined

  return (
    <div className="min-h-full bg-app">
      <Header
        canGoBack={history.length > 1}
        onBack={back}
        onHome={goHome}
        onSearch={() => navigate({ name: 'search' })}
        onCompare={() => navigate({ name: 'compare' })}
        compareCount={compare.length}
      />

      <main>
        {view.name === 'home' && (
          <Home
            onOpenRestaurant={(id) =>
              navigate({ name: 'restaurant', restaurantId: id })
            }
            onOpenSearch={() => navigate({ name: 'search' })}
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
            />
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
      </main>
    </div>
  )
}

function Header({
  canGoBack,
  onBack,
  onHome,
  onSearch,
  onCompare,
  compareCount,
}: {
  canGoBack: boolean
  onBack: () => void
  onHome: () => void
  onSearch: () => void
  onCompare: () => void
  compareCount: number
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-app bg-surface/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center gap-2 px-4 py-3">
        {canGoBack ? (
          <button
            onClick={onBack}
            className="rounded-lg px-2 py-1.5 text-body hover:bg-surface-2"
            aria-label="Back"
          >
            ← Back
          </button>
        ) : null}
        <button
          onClick={onHome}
          className="mr-auto flex items-center gap-2 font-black text-body"
        >
          <span
            className="flex h-7 w-7 items-center justify-center rounded-lg text-white"
            style={{ background: 'var(--brand)' }}
          >
            🍽️
          </span>
          CalorieOut
        </button>
        <button
          onClick={onSearch}
          className="rounded-lg px-3 py-1.5 text-body hover:bg-surface-2"
        >
          🔍<span className="ml-1 hidden sm:inline">Search</span>
        </button>
        <button
          onClick={onCompare}
          className="relative rounded-lg px-3 py-1.5 text-body hover:bg-surface-2"
        >
          ⚖️<span className="ml-1 hidden sm:inline">Compare</span>
          {compareCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--brand)] px-1 text-xs font-bold text-white">
              {compareCount}
            </span>
          )}
        </button>
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

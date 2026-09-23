# CalorieOut 🍽️🇨🇦

Eat out smarter in Canada. Browse calories & macros for restaurant menus, build
custom bowls/burritos/subs with live nutrition totals, set a meal goal, get
smart lower-calorie swaps, search every menu at once, and compare items side by
side.

## Run it

```bash
npm install
npm run dev
```

Then open the URL Vite prints (default http://localhost:5173).

Other scripts:

```bash
npm run build     # type-check + production build into dist/
npm run preview   # preview the production build
```

## How it works

- **Two menu types.** Fixed items (e.g. a Big Mac) carry one nutrition profile.
  "Builder" items (Bar Burrito, Subway, Freshii, Mucho Burrito, Pita Pit) are
  assembled from option groups and the nutrition sums live as you tap.
- **Smart features.** Per-meal goal (max calories / min protein) highlights or
  flags items; builders suggest lower-calorie swaps; global search filters by
  calories, protein and diet tags; compare pins up to 4 items in a table.

## Data & accuracy

All numbers are **approximate** and compiled per restaurant in `src/data/`.

- `dataSource: 'official'` — figures from the chain's published Canadian
  nutrition guide.
- `dataSource: 'estimated'` — the spot publishes no nutrition data, so items are
  modelled from typical recipes for the dish type. These are **clearly flagged**
  in the UI ("~ Estimate" badge and a banner) and are ballpark guidance only.

Always verify with the restaurant before relying on a number.

## Add or fix a restaurant

1. Create `src/data/<name>.ts` exporting a `Restaurant` (copy an existing file
   as a template — `mcdonalds.ts` for a fixed menu, `barburrito.ts` for a
   builder).
2. Import and add it to the `restaurants` array in `src/data/index.ts`.
3. Set `dataSource: 'estimated'` if the figures aren't officially published.

## Stack

React 18 · TypeScript · Vite 6 · Tailwind CSS v4. Fully client-side — no backend.

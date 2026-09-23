# CalorieOut

A web application for browsing calorie and nutrition information for restaurants
across Canada. It covers both fixed-menu items and build-your-own meals (bowls,
burritos, subs, pitas), with live nutrition totals, goal-based filtering, and
side-by-side comparison.

## Features

- Menu browser spanning 50+ restaurants, grouped by type (fast food, coffee &
  bakery, build-your-own, and sit-down).
- Interactive meal builder that totals calories and macros as options are
  selected.
- Per-meal goals: set a calorie ceiling and protein floor to highlight items
  that fit.
- Lower-calorie swap suggestions within the meal builder.
- Global search with calorie, protein, and dietary filters.
- Compare view for up to four items at a time.

## Tech stack

React 18, TypeScript, Vite, and Tailwind CSS. The app is entirely client-side
and requires no backend.

## Getting started

Requirements: Node.js 20 or later.

```bash
npm install
npm run dev
```

Create a production build:

```bash
npm run build
npm run preview
```

## Deployment

The repository includes a GitHub Actions workflow
(`.github/workflows/deploy.yml`) that builds the application and publishes it to
GitHub Pages on every push to `main`. To enable it, set
**Settings → Pages → Source** to **GitHub Actions**.

## Data and accuracy

Nutrition data lives in `src/data`, one file per restaurant. Each restaurant is
tagged with a data source:

- **official** — figures published by the restaurant.
- **estimated** — modelled from typical recipes for restaurants that do not
  publish nutrition information. These are labelled in the interface and should
  be treated as approximate.

All values are approximate and may vary by location and preparation. Verify with
the restaurant before relying on them.

## Project structure

```
src/
  data/        restaurant and menu data
  components/  reusable UI components
  views/       top-level screens
  lib/         nutrition calculations, search, and swap logic
  hooks/       local state helpers
```

## Contributing

To add or correct a restaurant, create or edit its file in `src/data`, then add
it to the list in `src/data/index.ts`. Use `official` as the data source only
when the figures come from the restaurant's published nutrition information.

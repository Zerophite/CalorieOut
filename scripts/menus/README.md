# Menu data pipeline

Full restaurant menus are generated from each chain's own published nutrition
data rather than typed by hand. Generated files live in `src/data/` (a small
restaurant record) and `src/data/menus/` (the item list, loaded on demand).

```bash
npm run menus:validate     # check every item and size
npm run menus:timhortons   # re-crawl Tim Hortons and regenerate
npm run menus:mcdonalds    # regenerate McDonald's from raw/mcd.json
```

`menus:validate` confirms, for every item and every size, that the default
ingredients sum exactly to the published total, that no value is negative, and
that every item offers add-ons.

## Sources

| Restaurant | Source | Notes |
|---|---|---|
| Tim Hortons | Public menu API (Sanity GraphQL, dataset `prod_th_ca`) | Fetched by `fetch-timhortons.cjs`. Totals use the "as served" values; default add-ins become removable ingredients and optional add-ins become add-ons, each with official nutrition. |
| McDonald's | Product pages and the `/dnaapp/itemDetails` nutrition API on mcdonalds.com | The site blocks scripted requests, so `raw/mcd.json` was captured in a browser (see below). Includes McDonald's published per-ingredient calories. |

### Refreshing McDonald's data

1. Open `https://www.mcdonalds.com/dnaapp/itemDetails?country=CA&language=en&showLiveData=true&item=200944` in a browser.
2. In the developer console, collect the product links from `/ca/en-ca/full-menu.html`,
   read each product page's `data-product-id`, and fetch
   `/dnaapp/itemDetails?country=CA&language=en&showLiveData=true&item=<id>`.
3. Save the result as `raw/mcd.json` in the compact format the generator reads:
   `[category, name, calories, fat, carbs, protein, sodium, fibre, sugar, servingSize, [[ingredient, isDefault, calories], ...]]`.
4. Run `npm run menus:mcdonalds`.

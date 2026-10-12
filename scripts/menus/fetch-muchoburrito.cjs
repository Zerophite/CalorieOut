// Fetch the data behind MUCHO Burrito's calorie calculator
// (muchoburrito.com/nutrition loads it from a published spreadsheet) into
// raw/muchoburrito.csv.
//
//   node scripts/menus/fetch-muchoburrito.cjs
const fs = require('fs')
const path = require('path')

const CSV =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vRv0u-O9JAgBHKb6cF8GIIIgQByMQXXVgeJx0_STaKXnjiaMBa6oBno-qI7a2WvrfWfuiWiozp07PzR/pub?output=csv'

;(async () => {
  const res = await fetch(CSV)
  if (!res.ok) throw new Error(`request failed: ${CSV}`)
  const text = await res.text()
  fs.writeFileSync(path.join(__dirname, 'raw', 'muchoburrito.csv'), text)
  console.log(`muchoburrito: ${text.trim().split(/\r?\n/).length - 1} rows`)
})().catch((e) => {
  console.error(e)
  process.exit(1)
})

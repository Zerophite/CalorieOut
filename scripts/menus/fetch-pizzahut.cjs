// Download Pizza Hut Canada's nutrition PDF (linked from pizzahut.ca/nutrition)
// and extract every row into raw/pizzahut.tsv. Requires `pdftotext` (xpdf or
// poppler) on the PATH.
//
//   node scripts/menus/fetch-pizzahut.cjs
// Columns: section, group, label, serving, calories, fat, sodium, carbs, protein.
// `group` is the most recent heading line (e.g. the pizza name above its
// per-crust rows); `section` the most recent all-caps heading.
const fs = require('fs')
const os = require('os')
const path = require('path')
const { execFileSync } = require('child_process')

const PDF = 'https://assets.ctfassets.net/foi9ggpj1j8o/7rP6F2kWHOSs5DTlolMoeM/1473cdd8784a6ff7ae8eccf56fe52e04/nutritionals.14841ea6d15764c94dd896afffdb2452.pdf'
const NUM = /^-?\d+(\.\d+)?$/

;(async () => {
  const res = await fetch(PDF)
  if (!res.ok) throw new Error(`download failed: ${PDF}`)
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ph-'))
  const pdf = path.join(tmp, 'ph.pdf')
  fs.writeFileSync(pdf, Buffer.from(await res.arrayBuffer()))
  execFileSync('pdftotext', ['-table', '-enc', 'UTF-8', pdf, `${pdf}.txt`])

  const rows = []
  let section = ''
  let group = ''
  for (const raw of fs.readFileSync(`${pdf}.txt`, 'utf8').split(/\r?\n/)) {
    let cols = raw.trim().split(/\s{2,}/).filter(Boolean)
    if (!cols.length) continue
    // Vertical page labels ("PIZZAS", "Toppings", "DRESSINGS AND DIPS") sit in the left margin.
    while (cols.length > 1 && /^[A-Z][A-Za-z ]+$/.test(cols[0]) && /^(PIZZAS|PASTAS|APPETIZERS|DESSERTS|BEVERAGES|DRESSINGS AND DIPS|Toppings|SAUCES|SALADS|WINGS|SIDES)$/.test(cols[0]))
      cols = cols.slice(1)
    // Split a trailing run of numbers out of the text columns.
    const flat = cols.join('  ').split(/\s+/)
    let i = flat.length
    while (i > 0 && NUM.test(flat[i - 1])) i--
    const nums = flat.slice(i)
    if (nums.length < 15) {
      const text = cols.join(' ').trim()
      if (!/\d/.test(text) && text.length < 60 && !/nutrition|serving|calories|daily|^%/i.test(text)) {
        if (/^[A-Z][A-Z &]+$/.test(text)) section = text
        else group = text
      }
      continue
    }
    const v = nums.slice(-15) // weight, cal, fat, sat, trans, chol, sodium, carbs, fibre, sugars, protein, A, C, Ca, Fe
    const head = raw.trim().replace(/(\s+-?\d+(\.\d+)?){15}\s*$/, '')
    const parts = head.split(/\s{2,}/).filter(Boolean)
    while (parts.length > 1 && /^(PIZZAS|PASTAS|APPETIZERS|DESSERTS|BEVERAGES|DRESSINGS AND DIPS|Toppings|SAUCES|SALADS|WINGS|SIDES)$/.test(parts[0])) parts.shift()
    const label = parts[0]
    const serving = parts.slice(1).join(' ')
    rows.push([section, group, label, serving, v[1], v[2], v[6], v[7], v[10]].join('\t'))
  }
  fs.writeFileSync(path.join(__dirname, 'raw', 'pizzahut.tsv'), rows.join('\n') + '\n')
  console.log(`pizzahut: ${rows.length} rows`)
})().catch((e) => {
  console.error(e)
  process.exit(1)
})

// Download Red Swan Pizza's menu nutritional guide (redswanpizza.ca/allergen →
// "Nutrition Info") and extract it into raw/redswan.tsv. Requires `pdftotext`.
//
//   node scripts/menus/fetch-redswan.cjs
// Columns: section, item, size, serving, calories, fat, sodium, carbs, protein, fibre.
// The guide's own ingredient tables (crusts, sauces, toppings) are not menu
// items and are left out.
const fs = require('fs')
const os = require('os')
const path = require('path')
const { execFileSync } = require('child_process')

const PDF = 'https://redswanpizza.ca/files/nutrition-guide.pdf'
const MENU_SECTIONS = /^(CLASSIC PIZZAS|TRADITIONAL PIZZAS|GOURMET PIZZAS|ALTERNATIVE CHOICES|CHEESECAKES|LOADED CHICKEN BITES|SALADS|SIDES|DIPS|BEVERAGES)/
const STOP = /^(PIZZA CRUST|BASE SAUCES|MEAT TOPPINGS|VEGGIE TOPPINGS|CHEESE TOPPINGS|PANEER|CONDIMENT|DIPPING SAUCES)/

;(async () => {
  const res = await fetch(PDF, { headers: { 'User-Agent': 'Mozilla/5.0' } })
  if (!res.ok) throw new Error(`download failed: ${PDF}`)
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'rs-'))
  const pdf = path.join(tmp, 'rs.pdf')
  fs.writeFileSync(pdf, Buffer.from(await res.arrayBuffer()))
  execFileSync('pdftotext', ['-table', '-enc', 'UTF-8', pdf, `${pdf}.txt`])

  const out = []
  let section = ''
  let active = false
  let item = ''
  for (const raw of fs.readFileSync(`${pdf}.txt`, 'utf8').split(/\r?\n/)) {
    const line = raw.replace(/\s+/g, ' ').trim()
    if (!line) continue
    const heading = line.replace(/\s*\(CONT\.\)\s*$/, '').replace(/\s*\/\s*PIZZAS$/, '')
    if (/^[A-Z][A-Z &/().-]+$/.test(line) && line.length > 3) {
      if (STOP.test(heading)) { active = false; continue }
      if (MENU_SECTIONS.test(heading)) { active = true; section = heading.replace(/ CRUSTS?$/, ''); continue }
    }
    if (!active) continue
    const tokens = line.split(' ')
    let i = tokens.length
    while (i > 0 && /^-?\d+(\.\d+)?$/.test(tokens[i - 1])) i--
    const nums = tokens.slice(i).map(Number)
    if (nums.length < 14) {
      // A header line: "12 Pepperoni Pizza", "Caesar Salad", or a wrapped name ("Cheesecake").
      if (/^(No\.|Item|W |C |D |Ch|eight|alories|Allergen|Please contact|NUTRITION)/.test(line)) continue
      const name = line.replace(/^\d+\s+/, '').replace(/\s*-\s*Includes.*$/, '').trim()
      if (/^[A-Z]/.test(name) && !/\d{2,}/.test(name)) {
        // "Strawberries and Cream" + "Cheesecake": the second line completes the previous row.
        const prev = out[out.length - 1]
        if (prev && prev[1] && /^(Cheesecake)$/.test(name) && !/Cheesecake$/.test(prev[1])) prev[1] = `${prev[1]} ${name}`
        else item = name
      }
      continue
    }
    const v = nums.slice(-14) // weight, kcal, fat, sat, trans, carbs, fibre, sugar, protein, chol, sodium, potassium, calcium, iron
    const label = tokens.slice(0, i).join(' ')
    let size = label.replace(/\s*Personal P\s*izza$/, ' Personal Pizza')
    let name = item
    // Single-line rows (cheesecakes, dips, drinks) carry their own name.
    if (/^(CHEESECAKES|DIPS|BEVERAGES)/.test(section) || /Bites$/.test(label.replace(/\s+\S+\s+of\s+Order$/i, ''))) {
      const m = label.match(/^(.*?)\s+((?:\d+\/\d+|\d+)\s+(?:of\s+Order|Slice|ml)|\d+\s*$|\d+\s+ml)$/i)
      name = m ? m[1] : label
      size = m ? m[2] : ''
    }
    const sm = size.match(/^(.*?)\s+((?:Entire Pizza|Personal Pizza|Slice|\d+\/\d+\s+(?:of\s+Order|Pie)|\d+\s+(?:Pieces|Wings)|1\s+Lb|\d+\s+ml))$/i)
    const serving = sm ? sm[2] : ''
    if (sm) size = sm[1]
    if (/^BEVERAGES/.test(section)) size = `${v[0]} ml`
    out.push([section, name.replace(/\s+/g, ' '), size.trim(), serving, v[1], v[2], v[10], v[5], v[8], v[6]])
  }
  fs.writeFileSync(path.join(__dirname, 'raw', 'redswan.tsv'), out.map((r) => r.join('\t')).join('\n') + '\n')
  console.log(`redswan: ${out.length} rows`)
})().catch((e) => {
  console.error(e)
  process.exit(1)
})

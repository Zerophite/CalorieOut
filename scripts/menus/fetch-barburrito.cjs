// Fetch BarBurrito's nutrition calculator (barburrito.ca/nutrition-information)
// and extract every option's official values into raw/barburrito.json.
//
//   node scripts/menus/fetch-barburrito.cjs
// Output: [{ form, group, label, size, n: { calories, protein, carbs, fat, sodium } }]
// `form` is burritos / quesadillas / tacos, `group` the input name
// (select_protein, select_base_toppings…), `size` the tortilla-size fieldset
// an option belongs to (small / regular / large / bowl / 3tacos), if any.
const fs = require('fs')
const path = require('path')

const URL = 'https://www.barburrito.ca/nutrition-information/'
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&#8217;/g, "'").replace(/\s+/g, ' ').trim()

;(async () => {
  const res = await fetch(URL, { headers: { 'User-Agent': 'Mozilla/5.0' } })
  if (!res.ok) throw new Error(`download failed: ${URL} (${res.status})`)
  const html = await res.text()

  const out = []
  let form = ''
  let size = ''
  const re = /data-item-fieldset="([^"]+)"|data-item-tortilla-size="([^"]+)"|<\/fieldset>|<input([^>]*)>\s*<label[^>]*>([^<]*)<\/label>/g
  let m
  while ((m = re.exec(html))) {
    if (m[1]) form = m[1]
    else if (m[2]) size = m[2]
    else if (m[0] === '</fieldset>') size = ''
    else {
      const attr = (k) => (m[3].match(new RegExp(`${k}="([^"]*)"`)) || [])[1]
      if (attr('data-calories') === undefined) continue
      const name = attr('name')
      out.push({
        form,
        group: name,
        label: decode(m[4]),
        size: /^select_tortilla_/.test(name) ? size : '',
        n: {
          calories: +attr('data-calories'),
          protein: +attr('data-protein'),
          carbs: +attr('data-carbs'),
          fat: +attr('data-fat'),
          sodium: +attr('data-sodium'),
          fiber: +attr('data-fibre'),
        },
      })
    }
  }
  fs.mkdirSync(path.join(__dirname, 'raw'), { recursive: true })
  fs.writeFileSync(path.join(__dirname, 'raw', 'barburrito.json'), JSON.stringify(out, null, 1))
  console.log(`barburrito: ${out.length} options`)
})().catch((e) => {
  console.error(e)
  process.exit(1)
})

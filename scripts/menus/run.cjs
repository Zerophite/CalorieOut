// Bundle and run one of the TypeScript menu scripts.
//
//   node scripts/menus/run.cjs <script.ts> [args…]     e.g. run.cjs gen-aw.ts
const path = require('path')
const { spawnSync } = require('child_process')
const esbuild = require('esbuild')

const [script, ...args] = process.argv.slice(2)
if (!script) {
  console.error('Usage: node scripts/menus/run.cjs <script.ts> [args…]')
  process.exit(1)
}
const outfile = path.join('node_modules', '.cache', 'menus', script.replace(/\.ts$/, '.mjs'))
esbuild.buildSync({
  entryPoints: [path.join(__dirname, script)],
  bundle: true,
  platform: 'node',
  format: 'esm',
  outfile,
  logLevel: 'error',
})
const r = spawnSync(process.execPath, [outfile, ...args], { stdio: 'inherit' })
process.exit(r.status ?? 1)

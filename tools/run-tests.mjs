/**
 * Runner dos testes do jogo (sem framework): bundla cada teste com esbuild e o
 * importa. Cobre o motor de carreira (zerar), o fluxo manual da UI e a
 * renderização das telas React. Uso: `npm test`.
 */
import { build } from 'esbuild'
import { pathToFileURL } from 'node:url'
import { mkdirSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'

const TESTS = [
  { entry: 'src/game/selftest.ts', jsx: false },
  { entry: 'src/game/flowtest.ts', jsx: false },
  { entry: 'src/career/ssrtest.tsx', jsx: true },
]

const outDir = resolve('.test-build')
mkdirSync(outDir, { recursive: true })

let failed = false
for (const t of TESTS) {
  const outfile = resolve(outDir, t.entry.replace(/[\\/]/g, '_') + '.mjs')
  await build({
    entryPoints: [t.entry],
    bundle: true,
    platform: 'node',
    format: 'esm',
    packages: 'external',
    jsx: t.jsx ? 'automatic' : undefined,
    outfile,
    logLevel: 'error',
  })
  console.log(`\n=== ${t.entry} ===`)
  try {
    await import(pathToFileURL(outfile).href)
  } catch (err) {
    failed = true
    console.error(err instanceof Error ? err.message : err)
  }
}

rmSync(outDir, { recursive: true, force: true })
if (failed) {
  console.error('\n❌ Alguns testes falharam.')
  process.exit(1)
}
console.log('\n✅ Todos os testes passaram.')

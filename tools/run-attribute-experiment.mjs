/**
 * Bundla e roda o experimento de isolamento de atributo (esbuild → import, mesmo
 * padrão do tools/run-tests.mjs). Uso: `node tools/run-attribute-experiment.mjs <atributo> <trials> <seed>`
 */
import { build } from 'esbuild'
import { pathToFileURL } from 'node:url'
import { mkdirSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'

const outDir = resolve('.test-build')
mkdirSync(outDir, { recursive: true })
const outfile = resolve(outDir, 'attribute-experiment.mjs')

await build({
  entryPoints: ['tools/attribute-experiment-entry.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  packages: 'external',
  outfile,
  logLevel: 'error',
})

await import(pathToFileURL(outfile).href)
rmSync(outDir, { recursive: true, force: true })

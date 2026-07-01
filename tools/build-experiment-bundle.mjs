/** Bundla o entry do experimento UMA vez, para os N processos paralelos só executarem (sem rebundlar). */
import { build } from 'esbuild'

await build({
  entryPoints: ['tools/attribute-experiment-entry.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  packages: 'external',
  outfile: '.experiment-build/entry.mjs',
  logLevel: 'error',
})
console.log('bundle ok')

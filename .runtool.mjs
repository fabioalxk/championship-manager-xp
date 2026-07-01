import { build } from 'esbuild'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'
const entry = process.argv[2]
const outfile = resolve('.test-build', entry.replace(/[\\/]/g,'_')+'.mjs')
await build({ entryPoints:[entry], bundle:true, platform:'node', format:'esm', packages:'external', outfile })
await import(pathToFileURL(outfile).href)

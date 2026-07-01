import { generateSquad } from '../src/game/generate'
import { overallOf } from '../src/game/overall'
import { makeRng } from '../src/game/random'
import type { Division } from '../src/game/types'
import type { Attrs } from '../src/sim/types'

const GK_ONLY = ['goalkeeping', 'handling', 'aerialReach', 'oneOnOne', 'kicking', 'throwing', 'communication']

const stdOf = (attrs: Attrs): number => {
  const vals = Object.entries(attrs).filter(([k]) => !GK_ONLY.includes(k)).map(([, v]) => v)
  const m = vals.reduce((a, b) => a + b, 0) / vals.length
  return Math.sqrt(vals.reduce((a, b) => a + (b - m) ** 2, 0) / vals.length)
}

for (const div of ['A', 'B', 'C', 'D'] as Division[]) {
  let ovSum = 0, stdSum = 0, n = 0, minAttr = 99, maxAttr = 0
  for (let s = 0; s < 40; s++) {
    const squad = generateSquad(div, makeRng(1000 + s))
    for (const p of squad) {
      if (p.role === 'GK') continue
      ovSum += overallOf(p.role, p.attrs)
      stdSum += stdOf(p.attrs)
      const vals = Object.entries(p.attrs).filter(([k]) => !GK_ONLY.includes(k)).map(([, v]) => v as number)
      minAttr = Math.min(minAttr, ...vals)
      maxAttr = Math.max(maxAttr, ...vals)
      n++
    }
  }
  console.log(`${div}: overall médio=${(ovSum / n).toFixed(1)}  std intra-jogador=${(stdSum / n).toFixed(1)}  attr range visto=[${minAttr}..${maxAttr}]`)
}

// mostra um jogador de linha da Série D como exemplo do contraste
const squadD = generateSquad('D', makeRng(7))
const ex = squadD.find((p) => p.role === 'FWD')!
console.log(`\nExemplo FWD Série D (overall ${ex.overall}):`)
console.log(`  pace=${ex.attrs.pace} firstTouch=${ex.attrs.firstTouch} strength=${ex.attrs.strength} finishing=${ex.attrs.finishing} decisions=${ex.attrs.decisions} composure=${ex.attrs.composure} vision=${ex.attrs.vision}`)

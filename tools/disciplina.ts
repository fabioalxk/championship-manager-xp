/**
 * DISCIPLINA — faltas e cartões por jogo (elencos reais, tempo real). Valida se
 * os jogadores AGRESSIVOS (Otamendi/Cuti/Casemiro) são os que mais cartonam e se
 * as contagens batem com o real (~10-14 faltas, ~4 amarelos, ~0.2 vermelhos/jogo).
 */
import { createMatch, step, stepCelebration } from '../src/sim/engine'
import { MATCH } from '../src/sim/constants'

MATCH.clockRate = 1
const N = 6

let fouls = 0, yellows = 0, reds = 0
const yellowOf: Record<string, number> = {}
const redOf: Record<string, number> = {}

for (let i = 0; i < N; i++) {
  const s = createMatch()
  const names = new Map<number, string>(s.players.map((p) => [p.id, p.name]))
  const present = new Set<number>(s.players.map((p) => p.id))
  const hadYellow = new Set<number>()
  let guard = 0
  while (s.status !== 'over' && guard++ < 300_000) {
    if (s.celebration) stepCelebration(s, 1 / 30)
    else step(s, 1 / 30)
    // amarelo: flag virou true
    for (const p of s.players) if (p.yellow && !hadYellow.has(p.id)) { hadYellow.add(p.id); yellowOf[names.get(p.id)!] = (yellowOf[names.get(p.id)!] ?? 0) + 1 }
    // vermelho: jogador sumiu do campo (expulso)
    const now = new Set(s.players.map((p) => p.id))
    for (const id of present) if (!now.has(id)) { redOf[names.get(id)!] = (redOf[names.get(id)!] ?? 0) + 1; present.delete(id) }
  }
  fouls += s.stats.home.fouls + s.stats.away.fouls
  yellows += s.stats.home.yellows + s.stats.away.yellows
  reds += s.stats.home.reds + s.stats.away.reds
}

console.log('================================================================')
console.log(` DISCIPLINA — ${N} jogos reais (tempo real)`)
console.log('================================================================')
console.log(`\n  Faltas/jogo:   ${(fouls / N).toFixed(1)}   (real ~10-14)`)
console.log(`  Amarelos/jogo: ${(yellows / N).toFixed(1)}   (real ~3-5)`)
console.log(`  Vermelhos/jogo:${(reds / N).toFixed(2)}   (real ~0.2)`)
console.log(`  % das faltas que viram cartão: ${(((yellows + reds) / fouls) * 100).toFixed(0)}%   (real ~25-35%)`)

console.log('\n  Mais cartonados (amarelos no total dos ' + N + ' jogos):')
Object.entries(yellowOf).sort((a, b) => b[1] - a[1]).slice(0, 8)
  .forEach(([name, n]) => console.log(`    ${name.padEnd(14)} ${n} amarelos${redOf[name] ? ` · ${redOf[name]} vermelhos` : ''}`))
console.log('\n  ➤ Esperado: zagueiros/volantes agressivos (Otamendi, Cuti, Casemiro) no topo.')

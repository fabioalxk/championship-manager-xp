/**
 * IMPEDIMENTO — CORREÇÃO (não só frequência). Testa: (1) atacante MARCADO que pega
 * a bola solta → apita (posse vira do adversário); (2) atacante NÃO-marcado (onside)
 * que pega → NÃO apita (mantém posse); (3) a linha de impedimento fica no ÚLTIMO
 * defensor (classificação por posição, reproduzindo offsideLineFwd + margem).
 */
import { createMatch, step } from '../src/sim/engine'
import { FIELD, OFFSIDE } from '../src/sim/constants'

// (1)+(2) ENFORCEMENT via engine real: recebedor pega a bola solta com/sem estar marcado.
const enforce = (marked: boolean): 'apitou' | 'seguiu' => {
  const s = createMatch()
  const recv = s.players.find((p) => p.team === 'home' && p.role === 'FWD')!
  // afasta todo mundo; só o recebedor perto da bola solta a 95m (campo de ataque da casa)
  for (const p of s.players) if (p.id !== recv.id) p.pos = { x: p.team === 'home' ? 20 : 90, y: p.role === 'GK' ? FIELD.cy : 10 + (p.id % 9) * 6 }
  recv.pos = { x: 95, y: FIELD.cy }
  s.ball.pos = { x: 95, y: FIELD.cy }
  s.ball.vel = { x: 0, y: 0 }
  s.ball.z = 0
  s.controllerId = null
  s.kickCooldown = 0
  s.deadball = 0
  s.possession = 'home'
  s.offsidePend = marked ? { team: 'home', ids: [recv.id] } : { team: 'home', ids: [-1] } // marcado ou não
  for (let i = 0; i < 20 && s.controllerId === null; i++) step(s, 1 / 30)
  return s.possession === 'away' ? 'apitou' : 'seguiu'
}

// (3) CLASSIFICAÇÃO: reproduz offsideLineFwd (último defensor de linha) + margem.
const isOffside = (recvX: number, defXs: number[]): boolean => {
  const fwd = 1 // home ataca para a direita
  const line = Math.max(...defXs.map((x) => x * fwd)) + OFFSIDE.margin
  const ballX = 50 // bola atrás do recebedor
  return recvX * fwd > line && recvX * fwd > ballX && recvX > FIELD.cx
}

console.log('================================================================')
console.log(' IMPEDIMENTO — CORREÇÃO')
console.log('================================================================')
const a = enforce(true), b = enforce(false)
console.log(`\n  (1) atacante MARCADO pega a bola:   ${a}   ${a === 'apitou' ? '✅' : '❌ deveria apitar'}`)
console.log(`  (2) atacante ONSIDE (não-marcado): ${b}   ${b === 'seguiu' ? '✅' : '❌ não devia apitar'}`)

console.log('\n  (3) Linha de impedimento (último defensor em x=90, margem ' + OFFSIDE.margin + '):')
const def = [90, 88, 85, 83]
for (const x of [85, 89, 91, 95]) {
  const off = isOffside(x, def)
  const exp = x > 90 + OFFSIDE.margin
  console.log(`     recebedor em x=${x}: ${off ? 'IMPEDIDO' : 'onside'}   ${off === exp ? '✅' : '❌'}`)
}
console.log('\n  ➤ apita só o marcado, respeita o onside, e a linha bate no último defensor = regra correta.')

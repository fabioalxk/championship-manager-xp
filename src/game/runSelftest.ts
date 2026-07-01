/**
 * Teste headless do modo roguelike "Slay of the CM": roda um bot BURRO (auto-play
 * guloso, sem ver as estatísticas antes de escolher) por muitas corridas e confirma
 * que dá para VENCER (bater o chefão da fase 7) partindo de um elenco cru de 11.
 *
 * É um roguelike de propósito: não deve ser um passeio garantido (senão não tem
 * tensão), mas também não pode ser quase impossível. Um bot burro vencendo uma
 * fração saudável das corridas prova que um jogador de verdade — que vê as cartas
 * antes de escolher, escala o time manualmente e joga a partida animada de verdade —
 * consegue vencer com folga.
 *
 * Execução: via `node tools/run-tests.mjs` (`npm test`).
 */
import { newRun, autoPlayRun } from './run'
import { ALL_CLUBS } from './worldcup'

const runs = 60
let wins = 0
let totalNodes = 0
let maxStage = 0
const t0 = Date.now()

const clubIds = Object.keys(ALL_CLUBS)

for (let i = 0; i < runs; i++) {
  const clubId = clubIds[i % clubIds.length]
  const state = newRun(`Técnico ${i}`, clubId, 5000 + i * 13)
  const result = autoPlayRun(state)
  if (result.won) wins++
  totalNodes += result.nodesVisited
  maxStage = Math.max(maxStage, result.stageReached)
}

const ms = Date.now() - t0
const rate = wins / runs
console.log(`Vitórias (venceu o chefão) do bot burro: ${wins}/${runs} (${(rate * 100).toFixed(0)}%)`)
console.log(`Nós visitados em média: ${(totalNodes / runs).toFixed(1)}`)
console.log(`Fase máxima alcançada: ${maxStage}`)
console.log(`Tempo total de ${runs} corridas: ${ms} ms (${(ms / runs).toFixed(1)} ms/corrida)`)

if (maxStage < 7) {
  throw new Error('FALHA: nenhuma corrida sequer alcançou o chefão (fase 7) — o mapa está travado.')
}
// bot burro precisa vencer uma fração saudável (prova que dá pra vencer de verdade,
// mas sem tornar a run um passeio) — nem 0% (impossível) nem 100% (sem desafio).
if (rate < 0.15) {
  throw new Error(`FALHA: taxa de vitória baixa demais (${(rate * 100).toFixed(0)}%) — a run está difícil demais.`)
}
if (rate > 0.85) {
  throw new Error(`FALHA: taxa de vitória alta demais (${(rate * 100).toFixed(0)}%) — a run está fácil demais.`)
}
console.log('OK: a run é vencível de ponta a ponta, com desafio real.')
